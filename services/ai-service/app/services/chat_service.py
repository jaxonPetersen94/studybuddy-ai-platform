import asyncio
import json
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, Optional
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.message import Message
from app.models.session import Session
from app.services.ai_service import AIService
from app.services.message_service import MessageService
from app.services.session_service import SessionService
from app.services.attachment_service import AttachmentService
from app.schemas.chat import StreamMessageRequest

settings = get_settings()
logger = get_logger(__name__)


class ChatService:
    """Service for handling chat operations and AI interactions"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.message_service = MessageService()
        self.session_service = SessionService()
        self.attachment_service = AttachmentService()
    
    async def stream_response(
        self, 
        user_id: str, 
        stream_data: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream AI response for real-time chat
        
        Args:
            user_id: ID of the user making the request
            stream_data: Dictionary containing message and session information
            
        Yields:
            Dictionary chunks containing streaming response data
        """
        try:
            # Extract data from stream request
            session_id = stream_data.get("session_id")
            message_content = stream_data.get("message", "")
            attachments = stream_data.get("attachments", [])
            model_config = stream_data.get("model_config", {})
            
            # Validate session exists and belongs to user
            if session_id:
                session = await self.session_service.get_session(session_id, user_id)
                if not session:
                    yield {
                        "type": "error",
                        "error": "Session not found",
                        "timestamp": datetime.now().isoformat()
                    }
                    return
            else:
                # Create new session if none provided
                session_data = {
                    "title": self._generate_session_title(message_content),
                    "model_config": model_config
                }
                session = await self.session_service.create_session(user_id, session_data)
                session_id = session["id"]
                
                yield {
                    "type": "session_created",
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Create user message
            user_message_data = {
                "session_id": session_id,
                "role": "user",
                "content": message_content,
                "attachments": attachments
            }
            user_message = await self.message_service.create_message(user_id, user_message_data)
            
            yield {
                "type": "user_message_created",
                "message": user_message,
                "timestamp": datetime.now().isoformat()
            }
            
            # Get conversation history
            conversation_history = await self._get_conversation_context(session_id, user_id)
            
            # Process attachments if any
            processed_attachments = []
            if attachments:
                for attachment_id in attachments:
                    attachment = await self.attachment_service.get_attachment(attachment_id, user_id)
                    if attachment:
                        processed_attachments.append(attachment)
            
            # Prepare AI request
            ai_request = {
                "messages": conversation_history,
                "attachments": processed_attachments,
                "model_config": model_config,
                "user_id": user_id,
                "session_id": session_id
            }
            
            # Start streaming AI response
            ai_response_content = ""
            ai_message_id = None
            
            # Create placeholder AI message
            ai_message_data = {
                "session_id": session_id,
                "role": "assistant",
                "content": "",
                "status": "generating"
            }
            ai_message = await self.message_service.create_message(user_id, ai_message_data)
            ai_message_id = ai_message["id"]
            
            yield {
                "type": "ai_message_started",
                "message_id": ai_message_id,
                "timestamp": datetime.now().isoformat()
            }
            
            # Stream AI response
            async for chunk in self.ai_service.stream_chat_completion(ai_request):
                if chunk.get("type") == "content":
                    content_delta = chunk.get("content", "")
                    ai_response_content += content_delta
                    
                    yield {
                        "type": "content_delta",
                        "message_id": ai_message_id,
                        "content": content_delta,
                        "timestamp": datetime.now().isoformat()
                    }
                
                elif chunk.get("type") == "function_call":
                    yield {
                        "type": "function_call",
                        "message_id": ai_message_id,
                        "function_name": chunk.get("function_name"),
                        "arguments": chunk.get("arguments"),
                        "timestamp": datetime.now().isoformat()
                    }
                
                elif chunk.get("type") == "function_result":
                    yield {
                        "type": "function_result",
                        "message_id": ai_message_id,
                        "function_name": chunk.get("function_name"),
                        "result": chunk.get("result"),
                        "timestamp": datetime.now().isoformat()
                    }
                
                elif chunk.get("type") == "error":
                    yield {
                        "type": "error",
                        "message_id": ai_message_id,
                        "error": chunk.get("error"),
                        "timestamp": datetime.now().isoformat()
                    }
                    return
            
            # Update AI message with final content
            final_ai_message = await self.message_service.update_message(
                ai_message_id, 
                user_id, 
                {
                    "content": ai_response_content,
                    "status": "completed",
                    "completed_at": datetime.now().isoformat()
                }
            )
            
            # Update session's last activity
            await self.session_service.update_session(
                session_id, 
                user_id, 
                {
                    "last_activity": datetime.now().isoformat(),
                    "message_count": await self._get_session_message_count(session_id)
                }
            )
            
            yield {
                "type": "ai_message_completed",
                "message": final_ai_message,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in stream_response for user {user_id}: {str(e)}")
            yield {
                "type": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _get_conversation_context(
        self, 
        session_id: str, 
        user_id: str, 
        limit: int = 50
    ) -> list:
        """
        Get conversation history for context
        
        Args:
            session_id: ID of the session
            user_id: ID of the user
            limit: Maximum number of messages to retrieve
            
        Returns:
            List of message dictionaries for AI context
        """
        try:
            messages = await self.message_service.get_session_messages(
                session_id=session_id,
                user_id=user_id,
                limit=limit,
                offset=0
            )
            
            # Convert messages to AI format
            conversation = []
            for message in reversed(messages.get("messages", [])):
                if message.get("status") == "completed":
                    conversation.append({
                        "role": message.get("role"),
                        "content": message.get("content"),
                        "timestamp": message.get("created_at")
                    })
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error getting conversation context: {str(e)}")
            return []
    
    async def _get_session_message_count(self, session_id: str) -> int:
        """Get total message count for a session"""
        try:
            # This would typically be a database query
            # For now, return a placeholder
            return 0
        except Exception as e:
            logger.error(f"Error getting session message count: {str(e)}")
            return 0
    
    def _generate_session_title(self, message_content: str, max_length: int = 50) -> str:
        """
        Generate a session title from the first message
        
        Args:
            message_content: Content of the first message
            max_length: Maximum length of the title
            
        Returns:
            Generated session title
        """
        if not message_content:
            return "New Chat"
        
        # Clean and truncate the message
        title = message_content.strip()
        if len(title) > max_length:
            title = title[:max_length].rsplit(' ', 1)[0] + "..."
        
        return title or "New Chat"
    
    async def regenerate_response(
        self, 
        message_id: str, 
        user_id: str, 
        regenerate_config: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Regenerate an AI response for a specific message
        
        Args:
            message_id: ID of the message to regenerate
            user_id: ID of the user
            regenerate_config: Optional configuration for regeneration
            
        Yields:
            Dictionary chunks containing streaming response data
        """
        try:
            # Get the original message
            message = await self.message_service.get_message(message_id, user_id)
            if not message:
                yield {
                    "type": "error",
                    "error": "Message not found",
                    "timestamp": datetime.now().isoformat()
                }
                return
            
            session_id = message.get("session_id")
            
            # Get conversation history up to this message
            conversation_history = await self._get_conversation_context_up_to_message(
                session_id, user_id, message_id
            )
            
            # Prepare AI request
            ai_request = {
                "messages": conversation_history,
                "model_config": regenerate_config or {},
                "user_id": user_id,
                "session_id": session_id
            }
            
            # Update message status
            await self.message_service.update_message(
                message_id, 
                user_id, 
                {"status": "regenerating"}
            )
            
            yield {
                "type": "regeneration_started",
                "message_id": message_id,
                "timestamp": datetime.now().isoformat()
            }
            
            # Stream new AI response
            ai_response_content = ""
            async for chunk in self.ai_service.stream_chat_completion(ai_request):
                if chunk.get("type") == "content":
                    content_delta = chunk.get("content", "")
                    ai_response_content += content_delta
                    
                    yield {
                        "type": "content_delta",
                        "message_id": message_id,
                        "content": content_delta,
                        "timestamp": datetime.now().isoformat()
                    }
                
                elif chunk.get("type") == "error":
                    yield {
                        "type": "error",
                        "message_id": message_id,
                        "error": chunk.get("error"),
                        "timestamp": datetime.now().isoformat()
                    }
                    return
            
            # Update message with new content
            updated_message = await self.message_service.update_message(
                message_id, 
                user_id, 
                {
                    "content": ai_response_content,
                    "status": "completed",
                    "regenerated_at": datetime.now().isoformat()
                }
            )
            
            yield {
                "type": "regeneration_completed",
                "message": updated_message,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in regenerate_response: {str(e)}")
            yield {
                "type": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _get_conversation_context_up_to_message(
        self, 
        session_id: str, 
        user_id: str, 
        message_id: str
    ) -> list:
        """
        Get conversation history up to a specific message
        
        Args:
            session_id: ID of the session
            user_id: ID of the user
            message_id: ID of the message to stop at
            
        Returns:
            List of message dictionaries for AI context
        """
        try:
            # Get all messages in session
            all_messages = await self.message_service.get_session_messages(
                session_id=session_id,
                user_id=user_id,
                limit=1000,  # Large limit to get all messages
                offset=0
            )
            
            # Find the target message and get all messages before it
            conversation = []
            for message in reversed(all_messages.get("messages", [])):
                if message.get("id") == message_id:
                    break
                
                if message.get("status") == "completed":
                    conversation.append({
                        "role": message.get("role"),
                        "content": message.get("content"),
                        "timestamp": message.get("created_at")
                    })
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error getting conversation context up to message: {str(e)}")
            return []
    
    async def get_chat_suggestions(
        self, 
        user_id: str, 
        session_id: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get chat suggestions based on context
        
        Args:
            user_id: ID of the user
            session_id: Optional session ID for context
            context: Optional context string
            
        Returns:
            Dictionary containing suggested prompts/questions
        """
        try:
            suggestions = []
            
            if session_id:
                # Get recent conversation for context-aware suggestions
                recent_messages = await self.message_service.get_session_messages(
                    session_id=session_id,
                    user_id=user_id,
                    limit=5,
                    offset=0
                )
                
                # Generate context-aware suggestions
                if recent_messages.get("messages"):
                    suggestions = await self.ai_service.generate_suggestions(
                        conversation_history=recent_messages["messages"],
                        context=context
                    )
            
            # Fallback to general suggestions
            if not suggestions:
                suggestions = [
                    "Help me brainstorm ideas for my project",
                    "Explain a complex concept in simple terms",
                    "Review and improve my writing",
                    "Help me solve a problem step by step",
                    "Generate creative content or stories"
                ]
            
            return {
                "suggestions": suggestions,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating chat suggestions: {str(e)}")
            return {
                "suggestions": [],
                "timestamp": datetime.now().isoformat()
            }
    
    async def export_conversation(
        self, 
        session_id: str, 
        user_id: str, 
        format_type: str = "json"
    ) -> Dict[str, Any]:
        """
        Export conversation in specified format
        
        Args:
            session_id: ID of the session to export
            user_id: ID of the user
            format_type: Export format (json, markdown, txt)
            
        Returns:
            Dictionary containing exported conversation data
        """
        try:
            # Get session details
            session = await self.session_service.get_session(session_id, user_id)
            if not session:
                raise ValueError("Session not found")
            
            # Get all messages
            messages = await self.message_service.get_session_messages(
                session_id=session_id,
                user_id=user_id,
                limit=1000,
                offset=0
            )
            
            export_data = {
                "session": session,
                "messages": messages.get("messages", []),
                "exported_at": datetime.now().isoformat(),
                "format": format_type
            }
            
            if format_type == "markdown":
                export_data["content"] = self._format_as_markdown(session, messages.get("messages", []))
            elif format_type == "txt":
                export_data["content"] = self._format_as_text(session, messages.get("messages", []))
            
            return export_data
            
        except Exception as e:
            logger.error(f"Error exporting conversation: {str(e)}")
            raise
    
    def _format_as_markdown(self, session: Dict[str, Any], messages: list) -> str:
        """Format conversation as markdown"""
        content = f"# {session.get('title', 'Chat Session')}\n\n"
        content += f"**Created:** {session.get('created_at', '')}\n"
        content += f"**Last Activity:** {session.get('last_activity', '')}\n\n"
        content += "---\n\n"
        
        for message in messages:
            role = message.get("role", "").title()
            timestamp = message.get("created_at", "")
            content_text = message.get("content", "")
            
            content += f"## {role}\n"
            content += f"*{timestamp}*\n\n"
            content += f"{content_text}\n\n"
            content += "---\n\n"
        
        return content
    
    def _format_as_text(self, session: Dict[str, Any], messages: list) -> str:
        """Format conversation as plain text"""
        content = f"{session.get('title', 'Chat Session')}\n"
        content += f"Created: {session.get('created_at', '')}\n"
        content += f"Last Activity: {session.get('last_activity', '')}\n\n"
        content += "=" * 50 + "\n\n"
        
        for message in messages:
            role = message.get("role", "").upper()
            timestamp = message.get("created_at", "")
            content_text = message.get("content", "")
            
            content += f"{role} ({timestamp}):\n"
            content += f"{content_text}\n\n"
            content += "-" * 30 + "\n\n"
        
        return content
    
    