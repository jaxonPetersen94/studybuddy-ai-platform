import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from bson import ObjectId
from app.core.database import get_database
from app.core.logging import get_logger

logger = get_logger(__name__)


class MessageService:
    """Service for handling chat message operations"""
    
    def __init__(self):
        self.db = None
    
    async def _get_db(self) -> AsyncIOMotorDatabase:
        """Get database connection"""
        if not self.db:
            self.db = await get_database()
        return self.db
    
    async def create_message(self, user_id: str, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new message
        
        Args:
            user_id: ID of the user creating the message
            message_data: Dictionary containing message information
            
        Returns:
            Dictionary containing the created message data
        """
        try:
            db = await self._get_db()
            
            # Validate session exists and belongs to user
            session_id = message_data.get("session_id")
            if session_id:
                session = await db.sessions.find_one({
                    "_id": ObjectId(session_id),
                    "user_id": user_id
                })
                if not session:
                    raise ValueError("Session not found or access denied")
            
            # Create message document
            message_doc = {
                "_id": ObjectId(),
                "session_id": ObjectId(session_id) if session_id else None,
                "user_id": user_id,
                "role": message_data.get("role", "user"),
                "content": message_data.get("content", ""),
                "attachments": message_data.get("attachments", []),
                "metadata": message_data.get("metadata", {}),
                "status": message_data.get("status", "completed"),
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "completed_at": message_data.get("completed_at"),
                "regenerated_at": message_data.get("regenerated_at")
            }
            
            # Insert message
            result = await db.messages.insert_one(message_doc)
            
            # Update session message count and last activity if session exists
            if session_id:
                await self._update_session_stats(session_id)
            
            # Convert ObjectIds to strings for response
            message_doc["id"] = str(message_doc["_id"])
            message_doc["user_id"] = str(message_doc["user_id"])
            if message_doc["session_id"]:
                message_doc["session_id"] = str(message_doc["session_id"])
            del message_doc["_id"]
            
            logger.info(f"Created message {message_doc['id']} for user {user_id}")
            
            return message_doc
            
        except Exception as e:
            logger.error(f"Error creating message for user {user_id}: {str(e)}")
            raise
    
    async def get_message(self, message_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific message by ID
        
        Args:
            message_id: ID of the message to retrieve
            user_id: ID of the user requesting the message
            
        Returns:
            Dictionary containing message data or None if not found
        """
        try:
            db = await self._get_db()
            
            # Find message with user access check
            message = await db.messages.find_one({
                "_id": ObjectId(message_id),
                "$or": [
                    {"user_id": user_id},
                    {"session_id": {"$in": await self._get_user_session_ids(user_id)}}
                ]
            })
            
            if not message:
                return None
            
            # Convert ObjectIds to strings
            message["id"] = str(message["_id"])
            message["user_id"] = str(message["user_id"])
            if message.get("session_id"):
                message["session_id"] = str(message["session_id"])
            del message["_id"]
            
            return message
            
        except Exception as e:
            logger.error(f"Error getting message {message_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_user_messages(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get messages for a user with optional filtering
        
        Args:
            user_id: ID of the user
            limit: Maximum number of messages to return
            offset: Number of messages to skip
            session_id: Optional filter by session ID
            
        Returns:
            Dictionary containing messages and pagination info
        """
        try:
            db = await self._get_db()
            
            # Build query filter
            if session_id:
                # Session-specific query
                query_filter = {
                    "user_id": user_id,
                    "session_id": ObjectId(session_id)
                }
            else:
                # User-wide query - include messages from user's sessions
                user_session_ids = await self._get_user_session_ids(user_id)
                query_filter = {
                    "$or": [
                        {"user_id": user_id},
                        {"session_id": {"$in": user_session_ids}}
                    ]
                }
            
            # Get messages with pagination
            cursor = db.messages.find(query_filter).sort("created_at", DESCENDING).skip(offset).limit(limit)
            messages = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings
            for message in messages:
                message["id"] = str(message["_id"])
                message["user_id"] = str(message["user_id"])
                if message.get("session_id"):
                    message["session_id"] = str(message["session_id"])
                del message["_id"]
            
            # Get total count
            total_count = await db.messages.count_documents(query_filter)
            
            return {
                "messages": messages,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + len(messages) < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting messages for user {user_id}: {str(e)}")
            raise
    
    async def get_session_messages(
        self, 
        session_id: str, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get all messages for a specific session
        
        Args:
            session_id: ID of the session
            user_id: ID of the user requesting the messages
            limit: Maximum number of messages to return
            offset: Number of messages to skip
            
        Returns:
            Dictionary containing messages and pagination info
        """
        try:
            db = await self._get_db()
            
            # Verify session ownership
            session = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            if not session:
                raise ValueError("Session not found or access denied")
            
            # Get messages for the session
            cursor = db.messages.find({
                "session_id": ObjectId(session_id)
            }).sort("created_at", ASCENDING).skip(offset).limit(limit)
            
            messages = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings
            for message in messages:
                message["id"] = str(message["_id"])
                message["user_id"] = str(message["user_id"])
                message["session_id"] = str(message["session_id"])
                del message["_id"]
            
            # Get total count
            total_count = await db.messages.count_documents({"session_id": ObjectId(session_id)})
            
            return {
                "messages": messages,
                "session_id": session_id,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + len(messages) < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting messages for session {session_id}, user {user_id}: {str(e)}")
            raise
    
    async def update_message(
        self, 
        message_id: str, 
        user_id: str, 
        update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a message
        
        Args:
            message_id: ID of the message to update
            user_id: ID of the user updating the message
            update_data: Dictionary containing fields to update
            
        Returns:
            Dictionary containing updated message data or None if not found
        """
        try:
            db = await self._get_db()
            
            # Check if message exists and user has access
            existing_message = await self.get_message(message_id, user_id)
            if not existing_message:
                return None
            
            # Build update document
            update_doc = {}
            allowed_fields = [
                "content", "attachments", "metadata", "status", 
                "completed_at", "regenerated_at"
            ]
            
            for field in allowed_fields:
                if field in update_data:
                    update_doc[field] = update_data[field]
            
            if not update_doc:
                return existing_message
            
            # Always update the updated_at timestamp
            update_doc["updated_at"] = datetime.now(timezone.utc)
            
            # Execute update
            result = await db.messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": update_doc}
            )
            
            if result.modified_count > 0:
                # Return updated message
                return await self.get_message(message_id, user_id)
            
            return existing_message
            
        except Exception as e:
            logger.error(f"Error updating message {message_id} for user {user_id}: {str(e)}")
            raise
    
    async def delete_message(self, message_id: str, user_id: str) -> bool:
        """
        Delete a message
        
        Args:
            message_id: ID of the message to delete
            user_id: ID of the user deleting the message
            
        Returns:
            True if deleted successfully, False if not found
        """
        try:
            db = await self._get_db()
            
            # Get message to check ownership and get session_id
            existing_message = await self.get_message(message_id, user_id)
            if not existing_message:
                return False
            
            session_id = existing_message.get("session_id")
            
            # Delete the message
            result = await db.messages.delete_one({"_id": ObjectId(message_id)})
            
            if result.deleted_count > 0:
                # Update session message count
                if session_id:
                    await self._update_session_stats(session_id)
                
                logger.info(f"Deleted message {message_id} for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting message {message_id} for user {user_id}: {str(e)}")
            raise
    
    async def regenerate_message(
        self, 
        message_id: str, 
        user_id: str, 
        regenerate_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Mark a message for regeneration
        
        Args:
            message_id: ID of the message to regenerate
            user_id: ID of the user
            regenerate_data: Dictionary containing regeneration parameters
            
        Returns:
            Dictionary containing updated message data or None if not found
        """
        try:
            # Update message status to indicate regeneration is requested
            update_data = {
                "status": "regenerating",
                "metadata": {
                    **regenerate_data.get("metadata", {}),
                    "regeneration_requested_at": datetime.now(timezone.utc).isoformat(),
                    "regeneration_config": regenerate_data.get("config", {})
                }
            }
            
            return await self.update_message(message_id, user_id, update_data)
            
        except Exception as e:
            logger.error(f"Error regenerating message {message_id} for user {user_id}: {str(e)}")
            raise
    
    async def submit_feedback(
        self, 
        message_id: str, 
        user_id: str, 
        feedback_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submit feedback for a message
        
        Args:
            message_id: ID of the message
            user_id: ID of the user providing feedback
            feedback_data: Dictionary containing feedback information
            
        Returns:
            Dictionary containing feedback record
        """
        try:
            db = await self._get_db()
            
            # Verify message exists and user has access
            message = await self.get_message(message_id, user_id)
            if not message:
                raise ValueError("Message not found or access denied")
            
            # Create feedback document
            feedback_doc = {
                "_id": ObjectId(),
                "message_id": ObjectId(message_id),
                "user_id": user_id,
                "rating": feedback_data.get("rating"),
                "feedback_type": feedback_data.get("type", "general"),
                "comment": feedback_data.get("comment", ""),
                "metadata": feedback_data.get("metadata", {}),
                "created_at": datetime.now(timezone.utc)
            }
            
            # Store feedback
            result = await db.message_feedback.insert_one(feedback_doc)
            
            # Convert ObjectIds to strings for response
            feedback_doc["id"] = str(feedback_doc["_id"])
            feedback_doc["message_id"] = str(feedback_doc["message_id"])
            feedback_doc["user_id"] = str(feedback_doc["user_id"])
            del feedback_doc["_id"]
            
            logger.info(f"Submitted feedback for message {message_id} by user {user_id}")
            
            return feedback_doc
            
        except Exception as e:
            logger.error(f"Error submitting feedback for message {message_id}, user {user_id}: {str(e)}")
            raise
    
    async def search_session_messages(
        self, 
        session_id: str, 
        user_id: str, 
        query: str, 
        limit: int = 20, 
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Search messages within a specific session
        
        Args:
            session_id: ID of the session
            user_id: ID of the user
            query: Search query string
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            Dictionary containing search results and pagination info
        """
        try:
            db = await self._get_db()
            
            # Verify session ownership
            session = await db.sessions.find_one({
                "_id": ObjectId(session_id),
                "user_id": user_id
            })
            if not session:
                raise ValueError("Session not found or access denied")
            
            # Search messages in session using text search
            search_filter = {
                "session_id": ObjectId(session_id),
                "content": {"$regex": query, "$options": "i"}
            }
            
            # Get messages with basic relevance scoring (exact matches first)
            exact_match_filter = {
                "session_id": ObjectId(session_id),
                "content": {"$regex": f"\\b{query}\\b", "$options": "i"}
            }
            
            # Get exact matches first
            exact_cursor = db.messages.find(exact_match_filter).sort("created_at", DESCENDING)
            exact_messages = await exact_cursor.to_list(length=limit)
            
            # If we don't have enough exact matches, get partial matches
            if len(exact_messages) < limit:
                remaining_limit = limit - len(exact_messages)
                partial_cursor = db.messages.find({
                    **search_filter,
                    "_id": {"$nin": [msg["_id"] for msg in exact_messages]}
                }).sort("created_at", DESCENDING).skip(offset).limit(remaining_limit)
                
                partial_messages = await partial_cursor.to_list(length=remaining_limit)
                messages = exact_messages + partial_messages
            else:
                messages = exact_messages[:limit]
            
            # Convert ObjectIds to strings and add relevance score
            for i, message in enumerate(messages):
                message["id"] = str(message["_id"])
                message["user_id"] = str(message["user_id"])
                message["session_id"] = str(message["session_id"])
                message["relevance_score"] = 1 if i < len(exact_messages) else 2
                del message["_id"]
            
            # Get total count
            total_count = await db.messages.count_documents(search_filter)
            
            return {
                "messages": messages,
                "session_id": session_id,
                "query": query,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + len(messages) < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching messages in session {session_id} for user {user_id}: {str(e)}")
            raise
    
    async def bulk_delete_messages(self, message_ids: List[str], user_id: str) -> Dict[str, Any]:
        """
        Delete multiple messages in bulk
        
        Args:
            message_ids: List of message IDs to delete
            user_id: ID of the user
            
        Returns:
            Dictionary containing deletion results
        """
        try:
            db = await self._get_db()
            
            deleted_count = 0
            failed_count = 0
            affected_sessions = set()
            
            for message_id in message_ids:
                try:
                    # Get message to track session for stats update
                    message = await self.get_message(message_id, user_id)
                    if message:
                        session_id = message.get("session_id")
                        if session_id:
                            affected_sessions.add(session_id)
                    
                    success = await self.delete_message(message_id, user_id)
                    if success:
                        deleted_count += 1
                    else:
                        failed_count += 1
                except Exception as e:
                    logger.error(f"Error deleting message {message_id}: {str(e)}")
                    failed_count += 1
            
            # Update session stats for affected sessions
            for session_id in affected_sessions:
                try:
                    await self._update_session_stats(session_id)
                except Exception as e:
                    logger.error(f"Error updating session stats for {session_id}: {str(e)}")
            
            return {
                "deleted_count": deleted_count,
                "failed_count": failed_count,
                "total_requested": len(message_ids),
                "affected_sessions": len(affected_sessions)
            }
            
        except Exception as e:
            logger.error(f"Error in bulk delete messages for user {user_id}: {str(e)}")
            raise
    
    async def get_message_thread(
        self, 
        message_id: str, 
        user_id: str, 
        context_size: int = 5
    ) -> Dict[str, Any]:
        """
        Get a message with surrounding context (thread)
        
        Args:
            message_id: ID of the central message
            user_id: ID of the user
            context_size: Number of messages before and after to include
            
        Returns:
            Dictionary containing the message thread
        """
        try:
            db = await self._get_db()
            
            # Get the target message
            target_message = await self.get_message(message_id, user_id)
            if not target_message:
                raise ValueError("Message not found or access denied")
            
            session_id = target_message.get("session_id")
            target_created_at = target_message.get("created_at")
            
            if not session_id:
                return {"messages": [target_message], "target_message_id": message_id}
            
            # Get messages before the target message
            before_cursor = db.messages.find({
                "session_id": ObjectId(session_id),
                "created_at": {"$lt": target_created_at}
            }).sort("created_at", DESCENDING).limit(context_size)
            
            before_messages = await before_cursor.to_list(length=context_size)
            before_messages.reverse()  # Reverse to get chronological order
            
            # Get messages after the target message
            after_cursor = db.messages.find({
                "session_id": ObjectId(session_id),
                "created_at": {"$gt": target_created_at}
            }).sort("created_at", ASCENDING).limit(context_size)
            
            after_messages = await after_cursor.to_list(length=context_size)
            
            # Convert ObjectIds to strings for all messages
            all_messages = before_messages + after_messages
            for message in all_messages:
                message["id"] = str(message["_id"])
                message["user_id"] = str(message["user_id"])
                message["session_id"] = str(message["session_id"])
                del message["_id"]
            
            # Combine all messages
            thread_messages = before_messages + [target_message] + after_messages
            
            return {
                "messages": thread_messages,
                "target_message_id": message_id,
                "session_id": session_id,
                "total_context": len(thread_messages)
            }
            
        except Exception as e:
            logger.error(f"Error getting message thread for {message_id}, user {user_id}: {str(e)}")
            raise
    
    async def get_message_statistics(self, user_id: str) -> Dict[str, Any]:
        """
        Get message statistics for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary containing message statistics
        """
        try:
            db = await self._get_db()
            
            # Get user's session IDs
            user_session_ids = await self._get_user_session_ids(user_id)
            
            # Build aggregation pipeline
            pipeline = [
                {"$match": {
                    "$or": [
                        {"user_id": user_id},
                        {"session_id": {"$in": user_session_ids}}
                    ]
                }},
                {"$group": {
                    "_id": None,
                    "total_messages": {"$sum": 1},
                    "user_messages": {"$sum": {"$cond": [{"$eq": ["$role", "user"]}, 1, 0]}},
                    "assistant_messages": {"$sum": {"$cond": [{"$eq": ["$role", "assistant"]}, 1, 0]}},
                    "completed_messages": {"$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}},
                    "generating_messages": {"$sum": {"$cond": [{"$eq": ["$status", "generating"]}, 1, 0]}},
                    "avg_message_length": {"$avg": {"$strLenCP": "$content"}},
                    "last_message_created": {"$max": "$created_at"},
                    "first_message_created": {"$min": "$created_at"}
                }}
            ]
            
            cursor = db.messages.aggregate(pipeline)
            result = await cursor.to_list(length=1)
            stats = result[0] if result else {}
            
            # Get recent activity (messages in last 7 days)
            from datetime import timedelta
            seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
            
            recent_count = await db.messages.count_documents({
                "$or": [
                    {"user_id": user_id},
                    {"session_id": {"$in": user_session_ids}}
                ],
                "created_at": {"$gte": seven_days_ago}
            })
            
            stats["recent_messages"] = recent_count
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting message statistics for user {user_id}: {str(e)}")
            raise
    
    async def _get_user_session_ids(self, user_id: str) -> List[ObjectId]:
        """Get list of session IDs belonging to a user"""
        try:
            db = await self._get_db()
            
            cursor = db.sessions.find(
                {"user_id": user_id},
                {"_id": 1}
            )
            
            sessions = await cursor.to_list(length=None)
            return [session["_id"] for session in sessions]
            
        except Exception as e:
            logger.error(f"Error getting user session IDs for {user_id}: {str(e)}")
            return []
    
    async def _update_session_stats(self, session_id: str):
        """
        Update session statistics (message count, last activity)
        
        Args:
            session_id: ID of the session to update
        """
        try:
            db = await self._get_db()
            
            # Get message count and last message time using aggregation
            pipeline = [
                {"$match": {"session_id": ObjectId(session_id)}},
                {"$group": {
                    "_id": None,
                    "message_count": {"$sum": 1},
                    "last_message_at": {"$max": "$created_at"}
                }}
            ]
            
            cursor = db.messages.aggregate(pipeline)
            result = await cursor.to_list(length=1)
            
            if result:
                stats = result[0]
                # Update session with new stats
                update_doc = {
                    "message_count": stats["message_count"],
                    "updated_at": datetime.now(timezone.utc)
                }
                
                if stats["last_message_at"]:
                    update_doc["last_activity"] = stats["last_message_at"]
                
                await db.sessions.update_one(
                    {"_id": ObjectId(session_id)},
                    {"$set": update_doc}
                )
            
        except Exception as e:
            logger.error(f"Error updating session stats for {session_id}: {str(e)}")
            # Don't raise here as this is a background operation