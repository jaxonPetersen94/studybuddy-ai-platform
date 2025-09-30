from .config import Settings, get_settings
from .dependencies import (
    # Service getters
    get_ai_service,
    get_analytics_service,
    get_attachment_service,
    get_chat_service,
    get_message_service,
    get_session_service,
    # Type aliases for dependency injection
    AIServiceDep,
    AnalyticsServiceDep,
    AttachmentServiceDep,
    ChatServiceDep,
    MessageServiceDep,
    SessionServiceDep,
)

__all__ = [
    # Settings
    "Settings",
    "get_settings",
    # Service getters
    "get_ai_service",
    "get_analytics_service",
    "get_attachment_service",
    "get_chat_service",
    "get_message_service",
    "get_session_service",
    # Dependency type aliases
    "AIServiceDep",
    "AnalyticsServiceDep",
    "AttachmentServiceDep",
    "ChatServiceDep",
    "MessageServiceDep",
    "SessionServiceDep",
]