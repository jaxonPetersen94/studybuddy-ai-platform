"""
Dependency injection container for services.
This module provides all service dependencies for FastAPI routes.
"""
from functools import lru_cache
from typing import Annotated
from fastapi import Depends

from app.services.ai_service import AIService
from app.services.analytics_service import AnalyticsService
from app.services.attachment_service import AttachmentService
from app.services.chat_service import ChatService
from app.services.message_service import MessageService
from app.services.session_service import SessionService

# ============================================================================
# Core Service Dependencies (Singletons)
# ============================================================================

@lru_cache()
def get_ai_service() -> AIService:
    """Get AI service instance (singleton)"""
    return AIService()

@lru_cache()
def get_analytics_service() -> AnalyticsService:
    """Get analytics service instance (singleton)"""
    return AnalyticsService()

@lru_cache()
def get_attachment_service() -> AttachmentService:
    """Get attachment service instance (singleton)"""
    return AttachmentService()

@lru_cache()
def get_message_service() -> MessageService:
    """Get message service instance (singleton)"""
    return MessageService()

@lru_cache()
def get_session_service() -> SessionService:
    """Get session service instance (singleton)"""
    return SessionService()

# ============================================================================
# Composite Service Dependencies
# ============================================================================

def get_chat_service(
    ai_service: Annotated[AIService, Depends(get_ai_service)],
    message_service: Annotated[MessageService, Depends(get_message_service)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    attachment_service: Annotated[AttachmentService, Depends(get_attachment_service)]
) -> ChatService:
    """Get chat service instance with injected dependencies"""
    return ChatService(
        ai_service=ai_service,
        message_service=message_service,
        session_service=session_service,
        attachment_service=attachment_service
    )

# ============================================================================
# Dependency Type Aliases for Clean Injection
# ============================================================================

# These type aliases make your route signatures much cleaner
AIServiceDep = Annotated[AIService, Depends(get_ai_service)]
AnalyticsServiceDep = Annotated[AnalyticsService, Depends(get_analytics_service)]
AttachmentServiceDep = Annotated[AttachmentService, Depends(get_attachment_service)]
ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
MessageServiceDep = Annotated[MessageService, Depends(get_message_service)]
SessionServiceDep = Annotated[SessionService, Depends(get_session_service)]