import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from app.core.database import get_database
from app.core.logging import get_logger
from app.core.config import get_settings

settings = get_settings()
logger = get_logger(__name__)


class AnalyticsService:
    """Service for handling analytics and statistics for the chat application"""
    
    def __init__(self):
        self.db = None
    
    async def _get_db(self) -> AsyncIOMotorDatabase:
        """Get database connection"""
        if not self.db:
            self.db = await get_database()
        return self.db
    
    async def get_session_analytics(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get analytics for a specific session
        
        Args:
            session_id: ID of the session
            user_id: ID of the user requesting analytics
            
        Returns:
            Dictionary containing session analytics or None if not found
        """
        try:
            db = await self._get_db()
            
            # Verify session ownership
            session = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session:
                return None
            
            session_info = {
                "id": str(session["_id"]),
                "title": session.get("title", ""),
                "created_at": session.get("created_at")
            }
            
            # Get message statistics using aggregation pipeline
            message_pipeline = [
                {"$match": {"session_id": ObjectId(session_id)}},
                {"$group": {
                    "_id": None,
                    "total_messages": {"$sum": 1},
                    "user_messages": {"$sum": {"$cond": [{"$eq": ["$role", "user"]}, 1, 0]}},
                    "assistant_messages": {"$sum": {"$cond": [{"$eq": ["$role", "assistant"]}, 1, 0]}},
                    "avg_message_length": {"$avg": {"$strLenCP": "$content"}},
                    "total_characters": {"$sum": {"$strLenCP": "$content"}},
                    "first_message": {"$min": "$created_at"},
                    "last_message": {"$max": "$created_at"},
                    "completed_messages": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
                    "regenerated_messages": {"$sum": {"$cond": [{"$ne": ["$regenerated_at", None]}, 1, 0]}}
                }}
            ]
            
            message_stats_cursor = db.messages.aggregate(message_pipeline)
            message_stats_list = await message_stats_cursor.to_list(length=1)
            stats = message_stats_list[0] if message_stats_list else {}
            
            # Calculate session duration
            if stats.get("first_message") and stats.get("last_message"):
                first_msg = stats["first_message"]
                last_msg = stats["last_message"]
                duration_seconds = (last_msg - first_msg).total_seconds()
                stats["duration_seconds"] = duration_seconds
                stats["duration_minutes"] = round(duration_seconds / 60, 2)
            else:
                stats["duration_seconds"] = 0
                stats["duration_minutes"] = 0
            
            # Get attachment statistics
            attachment_pipeline = [
                {"$match": {"session_id": ObjectId(session_id)}},
                {"$unwind": {"path": "$attachments", "preserveNullAndEmptyArrays": True}},
                {"$lookup": {
                    "from": "attachments",
                    "localField": "attachments",
                    "foreignField": "_id",
                    "as": "attachment_data"
                }},
                {"$unwind": {"path": "$attachment_data", "preserveNullAndEmptyArrays": True}},
                {"$group": {
                    "_id": None,
                    "attachment_count": {"$sum": {"$cond": [{"$ne": ["$attachment_data", None]}, 1, 0]}},
                    "total_attachment_size": {"$sum": {"$ifNull": ["$attachment_data.file_size", 0]}},
                    "image_count": {"$sum": {"$cond": [{"$eq": ["$attachment_data.category", "image"]}, 1, 0]}},
                    "document_count": {"$sum": {"$cond": [{"$eq": ["$attachment_data.category", "document"]}, 1, 0]}}
                }}
            ]
            
            attachment_stats_cursor = db.messages.aggregate(attachment_pipeline)
            attachment_stats_list = await attachment_stats_cursor.to_list(length=1)
            attachment_data = attachment_stats_list[0] if attachment_stats_list else {}
            
            # Get feedback statistics
            feedback_pipeline = [
                {"$lookup": {
                    "from": "messages",
                    "localField": "message_id",
                    "foreignField": "_id",
                    "as": "message"
                }},
                {"$unwind": "$message"},
                {"$match": {"message.session_id": ObjectId(session_id)}},
                {"$group": {
                    "_id": None,
                    "feedback_count": {"$sum": 1},
                    "avg_rating": {"$avg": "$rating"},
                    "positive_feedback": {"$sum": {"$cond": [{"$gte": ["$rating", 4]}, 1, 0]}},
                    "negative_feedback": {"$sum": {"$cond": [{"$lte": ["$rating", 2]}, 1, 0]}}
                }}
            ]
            
            feedback_stats_cursor = db.message_feedback.aggregate(feedback_pipeline)
            feedback_stats_list = await feedback_stats_cursor.to_list(length=1)
            feedback_data = feedback_stats_list[0] if feedback_stats_list else {}
            
            # Get hourly message distribution
            hourly_distribution = await self._get_session_hourly_distribution(session_id)
            
            return {
                "session_info": session_info,
                "message_stats": stats,
                "attachment_stats": attachment_data,
                "feedback_stats": feedback_data,
                "hourly_distribution": hourly_distribution,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting session analytics for {session_id}, user {user_id}: {str(e)}")
            raise
    
    async def get_user_stats(self, user_id: str, period: str = "30d") -> Dict[str, Any]:
        """
        Get comprehensive user statistics
        
        Args:
            user_id: ID of the user
            period: Time period for stats (7d, 30d, 90d, 1y)
            
        Returns:
            Dictionary containing user statistics
        """
        try:
            db = await self._get_db()
            
            # Calculate date range
            end_date = datetime.now(timezone.utc)
            period_days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}
            start_date = end_date - timedelta(days=period_days.get(period, 30))
            
            user_obj_id = ObjectId(user_id)
            
            # Get session statistics
            session_pipeline = [
                {"$match": {"user_id": user_obj_id}},
                {"$group": {
                    "_id": None,
                    "total_sessions": {"$sum": 1},
                    "period_sessions": {"$sum": {"$cond": [{"$gte": ["$created_at", start_date]}, 1, 0]}},
                    "starred_sessions": {"$sum": {"$cond": [{"$eq": ["$is_starred", True]}, 1, 0]}},
                    "avg_messages_per_session": {"$avg": "$message_count"},
                    "last_activity": {"$max": "$last_activity"},
                    "first_session": {"$min": "$created_at"}
                }}
            ]
            
            session_stats_cursor = db.sessions.aggregate(session_pipeline)
            session_stats_list = await session_stats_cursor.to_list(length=1)
            session_data = session_stats_list[0] if session_stats_list else {}
            
            # Get message statistics
            message_pipeline = [
                {"$match": {"user_id": user_obj_id}},
                {"$group": {
                    "_id": None,
                    "total_messages": {"$sum": 1},
                    "period_messages": {"$sum": {"$cond": [{"$gte": ["$created_at", start_date]}, 1, 0]}},
                    "user_messages": {"$sum": {"$cond": [{"$eq": ["$role", "user"]}, 1, 0]}},
                    "assistant_messages": {"$sum": {"$cond": [{"$eq": ["$role", "assistant"]}, 1, 0]}},
                    "avg_message_length": {"$avg": {"$strLenCP": "$content"}},
                    "total_characters": {"$sum": {"$strLenCP": "$content"}},
                    "regenerated_messages": {"$sum": {"$cond": [{"$ne": ["$regenerated_at", None]}, 1, 0]}}
                }}
            ]
            
            message_stats_cursor = db.messages.aggregate(message_pipeline)
            message_stats_list = await message_stats_cursor.to_list(length=1)
            message_data = message_stats_list[0] if message_stats_list else {}
            
            # Get attachment statistics
            attachment_pipeline = [
                {"$match": {"user_id": user_obj_id}},
                {"$group": {
                    "_id": None,
                    "total_attachments": {"$sum": 1},
                    "period_attachments": {"$sum": {"$cond": [{"$gte": ["$created_at", start_date]}, 1, 0]}},
                    "total_size": {"$sum": "$file_size"},
                    "avg_size": {"$avg": "$file_size"},
                    "image_count": {"$sum": {"$cond": [{"$eq": ["$category", "image"]}, 1, 0]}},
                    "document_count": {"$sum": {"$cond": [{"$eq": ["$category", "document"]}, 1, 0]}},
                    "audio_count": {"$sum": {"$cond": [{"$eq": ["$category", "audio"]}, 1, 0]}},
                    "video_count": {"$sum": {"$cond": [{"$eq": ["$category", "video"]}, 1, 0]}}
                }}
            ]
            
            attachment_stats_cursor = db.attachments.aggregate(attachment_pipeline)
            attachment_stats_list = await attachment_stats_cursor.to_list(length=1)
            attachment_data = attachment_stats_list[0] if attachment_stats_list else {}
            
            # Get usage patterns
            usage_patterns = await self._get_user_usage_patterns(user_id, start_date, end_date)
            
            # Get feedback statistics
            feedback_stats = await self._get_user_feedback_stats(user_id, start_date)
            
            # Get top session categories/topics
            top_sessions = await self._get_top_user_sessions(user_id, period_days.get(period, 30))
            
            return {
                "user_id": user_id,
                "period": period,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "session_stats": session_data,
                "message_stats": message_data,
                "attachment_stats": attachment_data,
                "usage_patterns": usage_patterns,
                "feedback_stats": feedback_stats,
                "top_sessions": top_sessions,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting user stats for {user_id}: {str(e)}")
            raise
    
    async def get_system_analytics(self, admin_user_id: str, period: str = "30d") -> Dict[str, Any]:
        """
        Get system-wide analytics (admin only)
        
        Args:
            admin_user_id: ID of the admin user requesting analytics
            period: Time period for stats
            
        Returns:
            Dictionary containing system analytics
        """
        try:
            db = await self._get_db()
            
            # Verify admin permissions (implement based on your auth system)
            # This is a placeholder - implement actual admin check
            
            # Calculate date range
            end_date = datetime.now(timezone.utc)
            period_days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}
            start_date = end_date - timedelta(days=period_days.get(period, 30))
            
            # Get user statistics
            user_pipeline = [
                {"$group": {
                    "_id": None,
                    "total_users": {"$sum": 1},
                    "new_users": {"$sum": {"$cond": [{"$gte": ["$created_at", start_date]}, 1, 0]}},
                    "active_users": {"$sum": {"$cond": [{"$gte": ["$last_login", start_date]}, 1, 0]}}
                }}
            ]
            
            user_stats_cursor = db.users.aggregate(user_pipeline)
            user_stats_list = await user_stats_cursor.to_list(length=1)
            user_data = user_stats_list[0] if user_stats_list else {}
            
            # Get session statistics
            session_pipeline = [
                {"$group": {
                    "_id": None,
                    "total_sessions": {"$sum": 1},
                    "period_sessions": {"$sum": {"$cond": [{"$gte": ["$created_at", start_date]}, 1, 0]}},
                    "avg_messages_per_session": {"$avg": "$message_count"},
                    "users_with_sessions": {"$addToSet": "$user_id"}
                }},
                {"$addFields": {
                    "users_with_sessions": {"$size": "$users_with_sessions"}
                }}
            ]
            
            session_stats_cursor = db.sessions.aggregate(session_pipeline)
            session_stats_list = await session_stats_cursor.to_list(length=1)
            session_data = session_stats_list[0] if session_stats_list else {}
            
            # Get message statistics
            message_pipeline = [
                {"$group": {
                    "_id": None,
                    "total_messages": {"$sum": 1},
                    "period_messages": {"$sum": {"$cond": [{"$gte": ["$created_at", start_date]}, 1, 0]}},
                    "avg_message_length": {"$avg": {"$strLenCP": "$content"}},
                    "user_messages": {"$sum": {"$cond": [{"$eq": ["$role", "user"]}, 1, 0]}},
                    "assistant_messages": {"$sum": {"$cond": [{"$eq": ["$role", "assistant"]}, 1, 0]}}
                }}
            ]
            
            message_stats_cursor = db.messages.aggregate(message_pipeline)
            message_stats_list = await message_stats_cursor.to_list(length=1)
            message_data = message_stats_list[0] if message_stats_list else {}
            
            # Get attachment statistics
            attachment_pipeline = [
                {"$group": {
                    "_id": None,
                    "total_attachments": {"$sum": 1},
                    "total_storage_bytes": {"$sum": "$file_size"},
                    "avg_file_size": {"$avg": "$file_size"},
                    "image_count": {"$sum": {"$cond": [{"$eq": ["$category", "image"]}, 1, 0]}},
                    "document_count": {"$sum": {"$cond": [{"$eq": ["$category", "document"]}, 1, 0]}}
                }}
            ]
            
            attachment_stats_cursor = db.attachments.aggregate(attachment_pipeline)
            attachment_stats_list = await attachment_stats_cursor.to_list(length=1)
            attachment_data = attachment_stats_list[0] if attachment_stats_list else {}
            
            # Get daily activity for the period
            daily_activity = await self._get_system_daily_activity(start_date, end_date)
            
            # Get top users by activity
            top_users = await self._get_top_users_by_activity(start_date, limit=10)
            
            return {
                "period": period,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "user_stats": user_data,
                "session_stats": session_data,
                "message_stats": message_data,
                "attachment_stats": attachment_data,
                "daily_activity": daily_activity,
                "top_users": top_users,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system analytics: {str(e)}")
            raise
    
    async def get_usage_trends(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Get usage trends over time for a user
        
        Args:
            user_id: ID of the user
            days: Number of days to analyze
            
        Returns:
            Dictionary containing trend data
        """
        try:
            db = await self._get_db()
            
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=days)
            user_obj_id = ObjectId(user_id)
            
            # Get daily message counts
            daily_pipeline = [
                {"$match": {
                    "user_id": user_obj_id,
                    "created_at": {"$gte": start_date}
                }},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day": {"$dayOfMonth": "$created_at"}
                    },
                    "message_count": {"$sum": 1},
                    "user_messages": {"$sum": {"$cond": [{"$eq": ["$role", "user"]}, 1, 0]}},
                    "assistant_messages": {"$sum": {"$cond": [{"$eq": ["$role", "assistant"]}, 1, 0]}},
                    "date": {"$first": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            daily_cursor = db.messages.aggregate(daily_pipeline)
            daily_data = await daily_cursor.to_list(length=None)
            
            # Get weekly session counts
            weekly_pipeline = [
                {"$match": {
                    "user_id": user_obj_id,
                    "created_at": {"$gte": start_date}
                }},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "week": {"$week": "$created_at"}
                    },
                    "session_count": {"$sum": 1},
                    "avg_messages_per_session": {"$avg": "$message_count"},
                    "week": {"$first": {"$dateToString": {"format": "%Y-W%V", "date": "$created_at"}}}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            weekly_cursor = db.sessions.aggregate(weekly_pipeline)
            weekly_data = await weekly_cursor.to_list(length=None)
            
            # Calculate growth trends
            total_messages = sum(day["message_count"] for day in daily_data)
            avg_daily_messages = total_messages / days if days > 0 else 0
            
            return {
                "user_id": user_id,
                "period_days": days,
                "daily_messages": daily_data,
                "weekly_sessions": weekly_data,
                "summary": {
                    "total_messages": total_messages,
                    "avg_daily_messages": round(avg_daily_messages, 2),
                    "active_days": len(daily_data),
                    "activity_rate": round(len(daily_data) / days * 100, 1)
                },
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting usage trends for user {user_id}: {str(e)}")
            raise
    
    async def _get_session_hourly_distribution(self, session_id: str) -> List[Dict[str, Any]]:
        """Get hourly distribution of messages in a session"""
        try:
            db = await self._get_db()
            
            pipeline = [
                {"$match": {"session_id": ObjectId(session_id)}},
                {"$group": {
                    "_id": {"$hour": "$created_at"},
                    "message_count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}},
                {"$project": {
                    "hour": "$_id",
                    "message_count": 1,
                    "_id": 0
                }}
            ]
            
            cursor = db.messages.aggregate(pipeline)
            return await cursor.to_list(length=None)
            
        except Exception as e:
            logger.error(f"Error getting hourly distribution for session {session_id}: {str(e)}")
            return []
    
    async def _get_user_usage_patterns(self, user_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get user usage patterns (time of day, day of week, etc.)"""
        try:
            db = await self._get_db()
            user_obj_id = ObjectId(user_id)
            
            # Hour of day distribution
            hourly_pipeline = [
                {"$match": {
                    "user_id": user_obj_id,
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }},
                {"$group": {
                    "_id": {"$hour": "$created_at"},
                    "message_count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}},
                {"$project": {
                    "hour": "$_id",
                    "message_count": 1,
                    "_id": 0
                }}
            ]
            
            hourly_cursor = db.messages.aggregate(hourly_pipeline)
            hourly_data = await hourly_cursor.to_list(length=None)
            
            # Day of week distribution
            dow_pipeline = [
                {"$match": {
                    "user_id": user_obj_id,
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }},
                {"$group": {
                    "_id": {"$dayOfWeek": "$created_at"},
                    "message_count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}},
                {"$project": {
                    "day_of_week": "$_id",
                    "message_count": 1,
                    "_id": 0
                }}
            ]
            
            dow_cursor = db.messages.aggregate(dow_pipeline)
            dow_data = await dow_cursor.to_list(length=None)
            
            return {
                "hourly_distribution": hourly_data,
                "day_of_week_distribution": dow_data
            }
            
        except Exception as e:
            logger.error(f"Error getting usage patterns for user {user_id}: {str(e)}")
            return {"hourly_distribution": [], "day_of_week_distribution": []}
    
    async def _get_user_feedback_stats(self, user_id: str, start_date: datetime) -> Dict[str, Any]:
        """Get user feedback statistics"""
        try:
            db = await self._get_db()
            user_obj_id = ObjectId(user_id)
            
            pipeline = [
                {"$match": {
                    "user_id": user_obj_id,
                    "created_at": {"$gte": start_date}
                }},
                {"$group": {
                    "_id": None,
                    "total_feedback": {"$sum": 1},
                    "avg_rating": {"$avg": "$rating"},
                    "positive_feedback": {"$sum": {"$cond": [{"$gte": ["$rating", 4]}, 1, 0]}},
                    "negative_feedback": {"$sum": {"$cond": [{"$lte": ["$rating", 2]}, 1, 0]}},
                    "helpful_feedback": {"$sum": {"$cond": [{"$eq": ["$feedback_type", "helpful"]}, 1, 0]}},
                    "unhelpful_feedback": {"$sum": {"$cond": [{"$eq": ["$feedback_type", "unhelpful"]}, 1, 0]}}
                }}
            ]
            
            cursor = db.message_feedback.aggregate(pipeline)
            result = await cursor.to_list(length=1)
            return result[0] if result else {}
            
        except Exception as e:
            logger.error(f"Error getting feedback stats for user {user_id}: {str(e)}")
            return {}
    
    async def _get_top_user_sessions(self, user_id: str, days: int) -> List[Dict[str, Any]]:
        """Get top sessions by activity for a user"""
        try:
            db = await self._get_db()
            user_obj_id = ObjectId(user_id)
            start_date = datetime.now(timezone.utc) - timedelta(days=days)
            
            cursor = db.sessions.find({
                "user_id": user_obj_id,
                "created_at": {"$gte": start_date}
            }).sort([("message_count", DESCENDING), ("last_activity", DESCENDING)]).limit(10)
            
            sessions = await cursor.to_list(length=10)
            
            # Convert ObjectId to string
            for session in sessions:
                session["id"] = str(session.pop("_id"))
                session["user_id"] = str(session["user_id"])
            
            return sessions
            
        except Exception as e:
            logger.error(f"Error getting top sessions for user {user_id}: {str(e)}")
            return []
    
    async def _get_system_daily_activity(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get system-wide daily activity"""
        try:
            db = await self._get_db()
            
            pipeline = [
                {"$match": {
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }},
                {"$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"},
                        "day": {"$dayOfMonth": "$created_at"}
                    },
                    "active_users": {"$addToSet": "$user_id"},
                    "total_messages": {"$sum": 1},
                    "active_sessions": {"$addToSet": "$session_id"},
                    "date": {"$first": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}}
                }},
                {"$project": {
                    "date": 1,
                    "active_users": {"$size": "$active_users"},
                    "total_messages": 1,
                    "active_sessions": {"$size": "$active_sessions"},
                    "_id": 0
                }},
                {"$sort": {"date": 1}}
            ]
            
            cursor = db.messages.aggregate(pipeline)
            return await cursor.to_list(length=None)
            
        except Exception as e:
            logger.error(f"Error getting system daily activity: {str(e)}")
            return []
    
    async def _get_top_users_by_activity(self, start_date: datetime, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by activity"""
        try:
            db = await self._get_db()
            
            pipeline = [
                {"$match": {"created_at": {"$gte": start_date}}},
                {"$group": {
                    "_id": "$user_id",
                    "session_count": {"$sum": 1},
                    "last_activity": {"$max": "$last_activity"}
                }},
                {"$lookup": {
                    "from": "messages",
                    "let": {"user_id": "$_id"},
                    "pipeline": [
                        {"$match": {
                            "$expr": {"$eq": ["$user_id", "$$user_id"]},
                            "created_at": {"$gte": start_date}
                        }},
                        {"$count": "message_count"}
                    ],
                    "as": "message_stats"
                }},
                {"$project": {
                    "user_id": {"$toString": "$_id"},
                    "session_count": 1,
                    "message_count": {"$ifNull": [{"$arrayElemAt": ["$message_stats.message_count", 0]}, 0]},
                    "last_activity": 1,
                    "_id": 0
                }},
                {"$sort": {"message_count": DESCENDING}},
                {"$limit": limit}
            ]
            
            cursor = db.sessions.aggregate(pipeline)
            return await cursor.to_list(length=limit)
            
        except Exception as e:
            logger.error(f"Error getting top users by activity: {str(e)}")
            return []
    
    async def generate_user_report(self, user_id: str, period: str = "30d") -> Dict[str, Any]:
        """
        Generate a comprehensive user report
        
        Args:
            user_id: ID of the user
            period: Time period for the report
            
        Returns:
            Dictionary containing a comprehensive user report
        """
        try:
            # Get all component data
            user_stats = await self.get_user_stats(user_id, period)
            usage_trends = await self.get_usage_trends(user_id, 30)
            
            # Calculate insights
            insights = await self._generate_user_insights(user_stats, usage_trends)
            
            return {
                "user_id": user_id,
                "report_period": period,
                "stats": user_stats,
                "trends": usage_trends,
                "insights": insights,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating user report for {user_id}: {str(e)}")
            raise
    
    async def _generate_user_insights(self, stats: Dict[str, Any], trends: Dict[str, Any]) -> List[str]:
        """Generate insights based on user stats and trends"""
        insights = []
        
        try:
            # Message activity insights
            total_messages = stats["message_stats"].get("period_messages", 0)
            if total_messages > 100:
                insights.append("You're a very active user with high engagement")
            elif total_messages > 50:
                insights.append("You have good engagement with the chat system")
            
            # Session insights
            total_sessions = stats["session_stats"].get("period_sessions", 0)
            avg_messages = stats["session_stats"].get("avg_messages_per_session", 0)
            
            if avg_messages > 20:
                insights.append("You tend to have long, detailed conversations")
            elif avg_messages < 5:
                insights.append("You prefer quick, focused interactions")
            
            # Usage pattern insights
            activity_rate = trends["summary"].get("activity_rate", 0)
            if activity_rate > 80:
                insights.append("You use the system very consistently")
            elif activity_rate < 30:
                insights.append("Your usage is more sporadic")
            
            # Attachment usage
            attachment_count = stats["attachment_stats"].get("period_attachments", 0)
            if attachment_count > 10:
                insights.append("You frequently share files and attachments")
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
        
        return insights if insights else ["Keep exploring and chatting!"]