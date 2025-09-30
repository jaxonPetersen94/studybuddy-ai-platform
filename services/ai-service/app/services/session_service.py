import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from app.core.database import get_database
from app.core.utils import get_logger
from app.models.session import Session

logger = get_logger(__name__)


class SessionService:
    """Service for handling chat session operations"""
    
    def __init__(self):
        self.db = None
    
    def _get_db(self) -> AsyncIOMotorDatabase:
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
            db = self._get_db()
            
            # Create Session model instance
            session = Session(
                user_id=user_id,
                title=session_data.get("title", "New Chat"),
                generation_config=session_data.get("generation_config", session_data.get("model_config", {})),
                metadata=session_data.get("metadata", {}),
                is_pinned=session_data.get("is_pinned", session_data.get("is_starred", False)),
                is_archived=session_data.get("is_archived", False),
                tags=session_data.get("tags", []),
                status=session_data.get("status", "active")
            )
            
            # Convert to dict for MongoDB insertion
            session_dict = session.model_dump(by_alias=True, exclude_none=True)
            
            # Insert session
            result = await db.sessions.insert_one(session_dict)
            session.id = result.inserted_id
            
            logger.info(f"Created session {session.id} for user {user_id}")
            
            return session.to_dict()
            
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
            db = self._get_db()
            
            # Find session with user ownership check
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return None
            
            # Get message count from database
            message_count = await db.messages.count_documents({
                "session_id": ObjectId(session_id)
            })
            
            # Create Session model instance
            session_doc["message_count"] = message_count
            session = Session(**session_doc)
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error getting session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_user_sessions(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        search: Optional[str] = None,
        starred: Optional[bool] = None,
        pinned: Optional[bool] = None,
        archived: Optional[bool] = None,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Get all sessions for a user with optional filtering
        
        Args:
            user_id: ID of the user
            limit: Maximum number of sessions to return
            offset: Number of sessions to skip
            search: Optional search query for session titles
            starred: Optional filter for starred sessions (legacy, maps to pinned)
            pinned: Optional filter for pinned sessions
            archived: Optional filter for archived sessions
            tags: Optional filter for sessions with specific tags
            
        Returns:
            Dictionary containing sessions and pagination info
        """
        try:
            db = self._get_db()
            
            # Build query filter
            query_filter = {"user_id": user_id}
            
            if search:
                query_filter["title"] = {"$regex": search, "$options": "i"}
            
            # Support both starred (legacy) and pinned
            if starred is not None or pinned is not None:
                query_filter["is_pinned"] = pinned if pinned is not None else starred
            
            if archived is not None:
                query_filter["is_archived"] = archived
            else:
                # By default, exclude archived sessions
                query_filter["is_archived"] = False
            
            if tags:
                query_filter["tags"] = {"$in": tags}
            
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
            session_docs = await cursor.to_list(length=limit)
            
            # Convert to Session models
            sessions = []
            for doc in session_docs:
                try:
                    session = Session(**doc)
                    sessions.append(session.to_dict())
                except Exception as e:
                    logger.error(f"Error converting session document: {str(e)}")
                    continue
            
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
            db = self._get_db()
            
            # Check if session exists and belongs to user
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return None
            
            # Create Session model instance
            session = Session(**session_doc)
            
            # Map legacy field names
            if "is_starred" in update_data:
                update_data["is_pinned"] = update_data.pop("is_starred")
            if "model_config" in update_data:
                update_data["generation_config"] = update_data.pop("model_config")
            
            # Update the session model
            session.update_from_dict(update_data)
            
            # Convert to dict for MongoDB update
            update_doc = session.model_dump(by_alias=True, exclude={"id"}, exclude_none=True)
            
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
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error updating session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_session(self, session_id: str, user_id: str, soft: bool = True) -> bool:
        """
        Delete a session and all its messages
        
        Args:
            session_id: ID of the session to delete
            user_id: ID of the user deleting the session
            soft: If True, perform soft delete (default), else hard delete
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            db = self._get_db()
            
            # Check if session exists and belongs to user
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return False
            
            if soft:
                # Soft delete - update status
                session = Session(**session_doc)
                session.soft_delete()
                
                result = await db.sessions.update_one(
                    {"_id": ObjectId(session_id)},
                    {"$set": {
                        "status": session.status,
                        "updated_at": session.updated_at
                    }}
                )
                
                if result.modified_count > 0:
                    logger.info(f"Soft deleted session {session_id} for user {user_id}")
                    return True
            else:
                # Hard delete - remove from database
                # Delete associated messages first
                await db.messages.delete_many({"session_id": ObjectId(session_id)})
                
                # Delete the session
                result = await db.sessions.delete_one({
                    "_id": ObjectId(session_id),
                    "user_id": user_id
                })
                
                if result.deleted_count > 0:
                    logger.info(f"Hard deleted session {session_id} for user {user_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def archive_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Archive a session
        
        Args:
            session_id: ID of the session to archive
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        try:
            db = self._get_db()
            
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return None
            
            session = Session(**session_doc)
            session.archive()
            
            await db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {
                    "is_archived": session.is_archived,
                    "status": session.status,
                    "updated_at": session.updated_at
                }}
            )
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error archiving session {session_id}: {str(e)}")
            raise
    
    async def restore_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Restore an archived session
        
        Args:
            session_id: ID of the session to restore
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        try:
            db = self._get_db()
            
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return None
            
            session = Session(**session_doc)
            session.restore()
            
            await db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {
                    "is_archived": session.is_archived,
                    "status": session.status,
                    "updated_at": session.updated_at
                }}
            )
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error restoring session {session_id}: {str(e)}")
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
            db = self._get_db()
            
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
            session_docs = await cursor.to_list(length=limit)
            
            # Convert to Session models
            sessions = []
            for doc in session_docs:
                try:
                    session = Session(**doc)
                    sessions.append(session.to_dict())
                except Exception as e:
                    logger.error(f"Error converting session document: {str(e)}")
                    continue
            
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
        Star/pin a session (legacy method, maps to pin_session)
        
        Args:
            session_id: ID of the session to star
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        return await self.update_session(session_id, user_id, {"is_pinned": True})
    
    async def unstar_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Unstar/unpin a session (legacy method, maps to unpin_session)
        
        Args:
            session_id: ID of the session to unstar
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        return await self.update_session(session_id, user_id, {"is_pinned": False})
    
    async def pin_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Pin a session
        
        Args:
            session_id: ID of the session to pin
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        return await self.update_session(session_id, user_id, {"is_pinned": True})
    
    async def unpin_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Unpin a session
        
        Args:
            session_id: ID of the session to unpin
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        return await self.update_session(session_id, user_id, {"is_pinned": False})
    
    async def bulk_delete_sessions(self, session_ids: List[str], user_id: str, soft: bool = True) -> Dict[str, Any]:
        """
        Delete multiple sessions in bulk
        
        Args:
            session_ids: List of session IDs to delete
            user_id: ID of the user
            soft: If True, perform soft delete (default), else hard delete
            
        Returns:
            Dictionary containing deletion results
        """
        try:
            deleted_count = 0
            failed_count = 0
            
            for session_id in session_ids:
                try:
                    success = await self.delete_session(session_id, user_id, soft=soft)
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
            db = self._get_db()
            
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
                    "pinned_sessions": {"$sum": {"$cond": [{"$eq": ["$is_pinned", True]}, 1, 0]}},
                    "archived_sessions": {"$sum": {"$cond": [{"$eq": ["$is_archived", True]}, 1, 0]}},
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
            original_session_dict = await self.get_session(session_id, user_id)
            if not original_session_dict:
                return None
            
            # Create new session data
            new_session_data = {
                "title": new_title or f"{original_session_dict['title']} (Copy)",
                "generation_config": original_session_dict.get("generation_config", {}),
                "metadata": original_session_dict.get("metadata", {}),
                "tags": original_session_dict.get("tags", []),
                "is_pinned": False,
                "is_archived": False
            }
            
            new_session = await self.create_session(user_id, new_session_data)
            
            # Note: Message duplication would be handled by MessageService
            # This method just creates the session structure
            
            return new_session
            
        except Exception as e:
            logger.error(f"Error duplicating session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def update_activity(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Update session activity timestamp
        
        Args:
            session_id: ID of the session
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        try:
            db = self._get_db()
            
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return None
            
            session = Session(**session_doc)
            session.update_activity()
            
            await db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {
                    "last_activity": session.last_activity,
                    "updated_at": session.updated_at
                }}
            )
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error updating activity for session {session_id}: {str(e)}")
            raise
    
    async def increment_message_count(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Increment session message count and update activity
        
        Args:
            session_id: ID of the session
            user_id: ID of the user
            
        Returns:
            Updated session data or None if not found
        """
        try:
            db = self._get_db()
            
            session_doc = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            
            if not session_doc:
                return None
            
            session = Session(**session_doc)
            session.increment_message_count()
            
            await db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {
                    "message_count": session.message_count,
                    "last_activity": session.last_activity,
                    "updated_at": session.updated_at
                }}
            )
            
            return session.to_dict()
            
        except Exception as e:
            logger.error(f"Error incrementing message count for session {session_id}: {str(e)}")
            raise