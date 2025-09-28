import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from app.core.database import get_database
from app.core.logging import get_logger

logger = get_logger(__name__)


class SessionService:
    """Service for handling chat session operations"""
    
    def __init__(self):
        self.db = None
    
    async def _get_db(self) -> AsyncIOMotorDatabase:
        """Get database connection"""
        if self.db is None:
            self.db = get_database()
        return self.db
    
    async def create_session(self, user_id: str, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new chat session
        
        Args:
            user_id: ID of the user creating the session
            session_data: Dictionary containing session information
            
        Returns:
            Dictionary containing the created session data
        """
        try:
            db = await self._get_db()
            
            # Create session document
            session_doc = {
                "_id": ObjectId(),
                "user_id": user_id,
                "title": session_data.get("title", "New Chat"),
                "model_config": session_data.get("model_config", {}),
                "metadata": session_data.get("metadata", {}),
                "is_starred": session_data.get("is_starred", False),
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "last_activity": datetime.now(timezone.utc),
                "message_count": 0
            }
            
            # Insert session
            result = await db.sessions.insert_one(session_doc)
            
            # Convert ObjectIds to strings for response
            session_doc["id"] = str(session_doc["_id"])
            session_doc["user_id"] = str(session_doc["user_id"])
            del session_doc["_id"]
            
            logger.info(f"Created session {session_doc['id']} for user {user_id}")
            
            return session_doc
            
        except Exception as e:
            logger.error(f"Error creating session for user {user_id}: {str(e)}")
            raise
    
    async def get_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific session by ID
        
        Args:
            session_id: ID of the session to retrieve
            user_id: ID of the user requesting the session
            
        Returns:
            Dictionary containing session data or None if not found
        """
        try:
            db = await self._get_db()
            
            # Find session with user ownership check
            session = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session:
                return None
            
            # Get message count
            message_count = await db.messages.count_documents({
                "session_id": ObjectId(session_id)
            })
            
            # Convert ObjectIds to strings
            session["id"] = str(session["_id"])
            session["user_id"] = str(session["user_id"])
            session["message_count"] = message_count
            del session["_id"]
            
            return session
            
        except Exception as e:
            logger.error(f"Error getting session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_user_sessions(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        search: Optional[str] = None,
        starred: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Get all sessions for a user with optional filtering
        
        Args:
            user_id: ID of the user
            limit: Maximum number of sessions to return
            offset: Number of sessions to skip
            search: Optional search query for session titles
            starred: Optional filter for starred sessions
            
        Returns:
            Dictionary containing sessions and pagination info
        """
        try:
            db = await self._get_db()
            
            # Build query filter
            query_filter = {"user_id": user_id}
            
            if search:
                query_filter["title"] = {"$regex": search, "$options": "i"}
            
            if starred is not None:
                query_filter["is_starred"] = starred
            
            # Get sessions with pagination using aggregation to include message count
            pipeline = [
                {"$match": query_filter},
                {"$lookup": {
                    "from": "messages",
                    "localField": "_id",
                    "foreignField": "session_id",
                    "as": "messages"
                }},
                {"$addFields": {
                    "message_count": {"$size": "$messages"}
                }},
                {"$project": {"messages": 0}},  # Remove the messages array
                {"$sort": {"last_activity": DESCENDING}},
                {"$skip": offset},
                {"$limit": limit}
            ]
            
            cursor = db.sessions.aggregate(pipeline)
            sessions = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings
            for session in sessions:
                session["id"] = str(session["_id"])
                session["user_id"] = str(session["user_id"])
                del session["_id"]
            
            # Get total count for pagination
            total_count = await db.sessions.count_documents(query_filter)
            
            return {
                "sessions": sessions,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + len(sessions) < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting sessions for user {user_id}: {str(e)}")
            raise
    
    async def update_session(
        self, 
        session_id: str, 
        user_id: str, 
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a session
        
        Args:
            session_id: ID of the session to update
            user_id: ID of the user updating the session
            update_data: Dictionary containing fields to update
            
        Returns:
            Dictionary containing updated session data or None if not found
        """
        try:
            db = await self._get_db()
            
            # Check if session exists and belongs to user
            existing_session = await self.get_session(session_id, user_id)
            if not existing_session:
                return None
            
            # Build update document
            update_doc = {}
            allowed_fields = [
                "title", "model_config", "metadata", "is_starred", 
                "last_activity", "message_count"
            ]
            
            for field in allowed_fields:
                if field in update_data:
                    update_doc[field] = update_data[field]
            
            if not update_doc:
                return existing_session
            
            # Always update the updated_at timestamp
            update_doc["updated_at"] = datetime.now(timezone.utc)
            
            # Execute update
            result = await db.sessions.update_one(
                {
                    "_id": ObjectId(session_id),
                    "user_id": user_id
                },
                {"$set": update_doc}
            )
            
            if result.modified_count > 0:
                # Return updated session
                return await self.get_session(session_id, user_id)
            
            return existing_session
            
        except Exception as e:
            logger.error(f"Error updating session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """
        Delete a session and all its messages
        
        Args:
            session_id: ID of the session to delete
            user_id: ID of the user deleting the session
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            db = await self._get_db()
            
            # Check if session exists and belongs to user
            existing_session = await self.get_session(session_id, user_id)
            if not existing_session:
                return False
            
            # Delete associated messages first
            await db.messages.delete_many({"session_id": ObjectId(session_id)})
            
            # Delete the session
            result = await db.sessions.delete_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if result.deleted_count > 0:
                logger.info(f"Deleted session {session_id} for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def search_sessions(
        self, 
        user_id: str, 
        query: str, 
        limit: int = 20, 
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Search sessions by title and content
        
        Args:
            user_id: ID of the user
            query: Search query string
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            Dictionary containing search results and pagination info
        """
        try:
            db = await self._get_db()
            
            # Create aggregation pipeline for searching sessions and their messages
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$lookup": {
                    "from": "messages",
                    "localField": "_id",
                    "foreignField": "session_id",
                    "as": "messages"
                }},
                {"$addFields": {
                    "title_match": {
                        "$regexMatch": {
                            "input": "$title",
                            "regex": query,
                            "options": "i"
                        }
                    },
                    "content_match": {
                        "$anyElementTrue": {
                            "$map": {
                                "input": "$messages",
                                "as": "message",
                                "in": {
                                    "$regexMatch": {
                                        "input": "$$message.content",
                                        "regex": query,
                                        "options": "i"
                                    }
                                }
                            }
                        }
                    },
                    "message_count": {"$size": "$messages"}
                }},
                {"$match": {
                    "$or": [
                        {"title_match": True},
                        {"content_match": True}
                    ]
                }},
                {"$addFields": {
                    "relevance_score": {
                        "$cond": [
                            {"$eq": ["$title_match", True]},
                            1,
                            2
                        ]
                    }
                }},
                {"$project": {
                    "messages": 0,
                    "title_match": 0,
                    "content_match": 0
                }},
                {"$sort": {
                    "relevance_score": ASCENDING,
                    "last_activity": DESCENDING
                }},
                {"$skip": offset},
                {"$limit": limit}
            ]
            
            cursor = db.sessions.aggregate(pipeline)
            sessions = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings
            for session in sessions:
                session["id"] = str(session["_id"])
                session["user_id"] = str(session["user_id"])
                del session["_id"]
            
            # Get total count for search results
            count_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$lookup": {
                    "from": "messages",
                    "localField": "_id",
                    "foreignField": "session_id",
                    "as": "messages"
                }},
                {"$match": {
                    "$or": [
                        {"title": {"$regex": query, "$options": "i"}},
                        {"messages.content": {"$regex": query, "$options": "i"}}
                    ]
                }},
                {"$count": "total"}
            ]
            
            count_cursor = db.sessions.aggregate(count_pipeline)
            count_result = await count_cursor.to_list(length=1)
            total_count = count_result[0]["total"] if count_result else 0
            
            return {
                "sessions": sessions,
                "query": query,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + len(sessions) < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching sessions for user {user_id}: {str(e)}")
            raise
    
    async def star_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Star/favorite a session
        
        Args:
            session_id: ID of the session to star
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        return await self.update_session(session_id, user_id, {"is_starred": True})
    
    async def unstar_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Unstar/unfavorite a session
        
        Args:
            session_id: ID of the session to unstar
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        return await self.update_session(session_id, user_id, {"is_starred": False})
    
    async def bulk_delete_sessions(self, session_ids: List[str], user_id: str) -> Dict[str, Any]:
        """
        Delete multiple sessions in bulk
        
        Args:
            session_ids: List of session IDs to delete
            user_id: ID of the user
            
        Returns:
            Dictionary containing deletion results
        """
        try:
            deleted_count = 0
            failed_count = 0
            
            for session_id in session_ids:
                try:
                    success = await self.delete_session(session_id, user_id)
                    if success:
                        deleted_count += 1
                    else:
                        failed_count += 1
                except Exception as e:
                    logger.error(f"Error deleting session {session_id}: {str(e)}")
                    failed_count += 1
            
            return {
                "deleted_count": deleted_count,
                "failed_count": failed_count,
                "total_requested": len(session_ids)
            }
            
        except Exception as e:
            logger.error(f"Error in bulk delete sessions for user {user_id}: {str(e)}")
            raise
    
    async def get_session_statistics(self, user_id: str) -> Dict[str, Any]:
        """
        Get session statistics for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary containing session statistics
        """
        try:
            db = await self._get_db()
            
            # Use aggregation pipeline to get comprehensive stats
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$lookup": {
                    "from": "messages",
                    "localField": "_id",
                    "foreignField": "session_id",
                    "as": "messages"
                }},
                {"$group": {
                    "_id": None,
                    "total_sessions": {"$sum": 1},
                    "starred_sessions": {"$sum": {"$cond": [{"$eq": ["$is_starred", True]}, 1, 0]}},
                    "avg_messages_per_session": {"$avg": {"$size": "$messages"}},
                    "last_activity": {"$max": "$last_activity"},
                    "first_session_created": {"$min": "$created_at"}
                }}
            ]
            
            cursor = db.sessions.aggregate(pipeline)
            result = await cursor.to_list(length=1)
            stats = result[0] if result else {}
            
            # Get recent activity (sessions in last 7 days)
            seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
            recent_count = await db.sessions.count_documents({
                "user_id": user_id,
                "last_activity": {"$gte": seven_days_ago}
            })
            
            stats["recent_sessions"] = recent_count
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting session statistics for user {user_id}: {str(e)}")
            raise
    
    async def get_recent_sessions(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get most recently active sessions for a user
        
        Args:
            user_id: ID of the user
            limit: Maximum number of sessions to return
            
        Returns:
            List of recent session dictionaries
        """
        try:
            result = await self.get_user_sessions(
                user_id=user_id,
                limit=limit,
                offset=0
            )
            
            return result.get("sessions", [])
            
        except Exception as e:
            logger.error(f"Error getting recent sessions for user {user_id}: {str(e)}")
            raise
    
    async def duplicate_session(
        self, 
        session_id: str, 
        user_id: str, 
        new_title: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Duplicate a session and all its messages
        
        Args:
            session_id: ID of the session to duplicate
            user_id: ID of the user
            new_title: Optional new title for the duplicated session
            
        Returns:
            Dictionary containing the new session data or None if original not found
        """
        try:
            # Get original session
            original_session = await self.get_session(session_id, user_id)
            if not original_session:
                return None
            
            # Create new session
            new_session_data = {
                "title": new_title or f"{original_session['title']} (Copy)",
                "model_config": original_session.get("model_config", {}),
                "metadata": original_session.get("metadata", {})
            }
            
            new_session = await self.create_session(user_id, new_session_data)
            
            # Note: Message duplication would be handled by MessageService
            # This method just creates the session structure
            
            return new_session
            
        except Exception as e:
            logger.error(f"Error duplicating session {session_id} for user {user_id}: {str(e)}")
            raise