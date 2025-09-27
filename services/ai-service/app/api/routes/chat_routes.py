import asyncio
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, Response, UploadFile
from fastapi.responses import StreamingResponse
from app.core.auth import get_current_user
from app.core.logging import get_logger
from app.models.user import User
from app.schemas.chat import (
    BulkDeleteRequest,
    MessageCreate,
    MessageFeedback,
    MessageRegenerate,
    MessageUpdate,
    SessionCreate,
    SessionUpdate,
    StreamMessageRequest,
)
from app.services.analytics_service import AnalyticsService
from app.services.attachment_service import AttachmentService
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.services.session_service import SessionService

# Initialize router and logger
router = APIRouter(prefix="/api/v1/chats", tags=["chats"])
logger = get_logger(__name__)

# Initialize services (you can also use dependency injection)
chat_service = ChatService()
session_service = SessionService()
message_service = MessageService()
attachment_service = AttachmentService()
analytics_service = AnalyticsService()

# ============================================================================
# Session Management Routes
# ============================================================================

@router.get("/sessions")
async def get_sessions(
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    starred: Optional[bool] = Query(None)
):
    """Get all sessions for the authenticated user"""
    try:
        sessions = await session_service.get_user_sessions(
            user_id=user.id,
            limit=limit,
            offset=offset,
            search=search,
            starred=starred
        )
        return {
            "success": True,
            "data": sessions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting sessions for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sessions")

@router.post("/sessions", status_code=201)
async def create_session(
    session_data: SessionCreate,
    user: User = Depends(get_current_user)
):
    """Create a new chat session"""
    try:
        session = await session_service.create_session(user.id, session_data.dict())
        return {
            "success": True,
            "data": session,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating session for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Get a specific session by ID"""
    try:
        session = await session_service.get_session(session_id, user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "data": session,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session {session_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session")

@router.put("/sessions/{session_id}")
async def update_session(
    session_id: str,
    session_data: SessionUpdate,
    user: User = Depends(get_current_user)
):
    """Update a session"""
    try:
        session = await session_service.update_session(session_id, user.id, session_data.dict(exclude_unset=True))
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "data": session,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session {session_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update session")

@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a session"""
    try:
        success = await session_service.delete_session(session_id, user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session {session_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete session")

# ============================================================================
# Message Management Routes
# ============================================================================

@router.get("/messages")
async def get_messages(
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session_id: Optional[str] = Query(None)
):
    """Get messages with optional filtering"""
    try:
        messages = await message_service.get_user_messages(
            user_id=user.id,
            limit=limit,
            offset=offset,
            session_id=session_id
        )
        return {
            "success": True,
            "data": messages,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting messages for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")

@router.post("/messages", status_code=201)
async def create_message(
    message_data: MessageCreate,
    user: User = Depends(get_current_user)
):
    """Create a new message"""
    try:
        message = await message_service.create_message(user.id, message_data.dict())
        return {
            "success": True,
            "data": message,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating message for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create message")

@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get all messages for a specific session"""
    try:
        messages = await message_service.get_session_messages(
            session_id=session_id,
            user_id=user.id,
            limit=limit,
            offset=offset
        )
        return {
            "success": True,
            "data": messages,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting messages for session {session_id}, user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session messages")

@router.get("/messages/{message_id}")
async def get_message(
    message_id: str,
    user: User = Depends(get_current_user)
):
    """Get a specific message by ID"""
    try:
        message = await message_service.get_message(message_id, user.id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        return {
            "success": True,
            "data": message,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting message {message_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve message")

@router.put("/messages/{message_id}")
async def update_message(
    message_id: str,
    message_data: MessageUpdate,
    user: User = Depends(get_current_user)
):
    """Update a message"""
    try:
        message = await message_service.update_message(message_id, user.id, message_data.dict(exclude_unset=True))
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        return {
            "success": True,
            "data": message,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating message {message_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update message")

@router.delete("/messages/{message_id}", status_code=204)
async def delete_message(
    message_id: str,
    user: User = Depends(get_current_user)
):
    """Delete a message"""
    try:
        success = await message_service.delete_message(message_id, user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Message not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting message {message_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete message")

@router.post("/messages/{message_id}/regenerate")
async def regenerate_message(
    message_id: str,
    regenerate_data: MessageRegenerate,
    user: User = Depends(get_current_user)
):
    """Regenerate an AI response for a message"""
    try:
        message = await message_service.regenerate_message(message_id, user.id, regenerate_data.dict())
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        return {
            "success": True,
            "data": message,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating message {message_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to regenerate message")

@router.post("/messages/{message_id}/feedback")
async def submit_feedback(
    message_id: str,
    feedback_data: MessageFeedback,
    user: User = Depends(get_current_user)
):
    """Submit feedback for a message"""
    try:
        feedback = await message_service.submit_feedback(message_id, user.id, feedback_data.dict())
        return {
            "success": True,
            "data": feedback,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error submitting feedback for message {message_id}, user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

# ============================================================================
# Streaming Route
# ============================================================================

@router.post("/messages/stream")
async def stream_message(
    stream_data: StreamMessageRequest,
    user: User = Depends(get_current_user)
):
    """Stream AI response for real-time chat"""
    async def generate_stream():
        try:
            async for chunk in chat_service.stream_response(user.id, stream_data.dict()):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            logger.error(f"Stream error for user {user.id}: {str(e)}")
            yield f"data: {json.dumps({'error': str(e), 'timestamp': datetime.now().isoformat()})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

# ============================================================================
# File Attachment Routes
# ============================================================================

@router.get("/attachments")
async def get_attachments(
    user: User = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's file attachments"""
    try:
        attachments = await attachment_service.get_user_attachments(
            user_id=user.id,
            limit=limit,
            offset=offset
        )
        return {
            "success": True,
            "data": attachments,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting attachments for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve attachments")

@router.post("/attachments", status_code=201)
async def create_attachment(
    file: UploadFile = File(...),
    metadata: str = Form("{}"),
    user: User = Depends(get_current_user)
):
    """Create/upload a new attachment"""
    try:
        metadata_dict = json.loads(metadata) if metadata else {}
        attachment = await attachment_service.create_attachment(user.id, file, metadata_dict)
        return {
            "success": True,
            "data": attachment,
            "timestamp": datetime.now().isoformat()
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid metadata JSON")
    except Exception as e:
        logger.error(f"Error creating attachment for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create attachment")

@router.get("/attachments/{attachment_id}")
async def get_attachment(
    attachment_id: str,
    user: User = Depends(get_current_user)
):
    """Get a specific attachment"""
    try:
        attachment = await attachment_service.get_attachment(attachment_id, user.id)
        if not attachment:
            raise HTTPException(status_code=404, detail="Attachment not found")
        
        return {
            "success": True,
            "data": attachment,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting attachment {attachment_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve attachment")

@router.delete("/attachments/{attachment_id}", status_code=204)
async def delete_attachment(
    attachment_id: str,
    user: User = Depends(get_current_user)
):
    """Delete an attachment"""
    try:
        success = await attachment_service.delete_attachment(attachment_id, user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Attachment not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting attachment {attachment_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete attachment")

# ============================================================================
# Search Routes
# ============================================================================

@router.get("/sessions/search")
async def search_sessions(
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Search sessions"""
    try:
        results = await session_service.search_sessions(
            user_id=user.id,
            query=q,
            limit=limit,
            offset=offset
        )
        return {
            "success": True,
            "data": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error searching sessions for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search sessions")

@router.get("/sessions/{session_id}/messages/search")
async def search_session_messages(
    session_id: str,
    q: str = Query(..., min_length=1),
    user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Search messages within a specific session"""
    try:
        results = await message_service.search_session_messages(
            session_id=session_id,
            user_id=user.id,
            query=q,
            limit=limit,
            offset=offset
        )
        return {
            "success": True,
            "data": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error searching messages in session {session_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search messages")

# ============================================================================
# Session Actions Routes
# ============================================================================

@router.post("/sessions/{session_id}/star")
async def star_session(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Star/favorite a session"""
    try:
        session = await session_service.star_session(session_id, user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "data": session,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starring session {session_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to star session")

@router.delete("/sessions/{session_id}/star")
async def unstar_session(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Unstar/unfavorite a session"""
    try:
        session = await session_service.unstar_session(session_id, user.id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "data": session,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unstarring session {session_id} for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to unstar session")

# ============================================================================
# Bulk Operations Routes
# ============================================================================

@router.post("/sessions/bulk-delete")
async def bulk_delete_sessions(
    request_data: BulkDeleteRequest,
    user: User = Depends(get_current_user)
):
    """Bulk delete sessions"""
    try:
        result = await session_service.bulk_delete_sessions(request_data.ids, user.id)
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error bulk deleting sessions for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to bulk delete sessions")

@router.post("/messages/bulk-delete")
async def bulk_delete_messages(
    request_data: BulkDeleteRequest,
    user: User = Depends(get_current_user)
):
    """Bulk delete messages"""
    try:
        result = await message_service.bulk_delete_messages(request_data.ids, user.id)
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error bulk deleting messages for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to bulk delete messages")

# ============================================================================
# Analytics Routes
# ============================================================================

@router.get("/sessions/{session_id}/analytics")
async def get_session_analytics(
    session_id: str,
    user: User = Depends(get_current_user)
):
    """Get analytics for a specific session"""
    try:
        analytics = await analytics_service.get_session_analytics(session_id, user.id)
        if not analytics:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "success": True,
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analytics for session {session_id}, user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve session analytics")

@router.get("/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$")
):
    """Get user's chat statistics"""
    try:
        stats = await analytics_service.get_user_stats(user.id, period=period)
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting stats for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user statistics")