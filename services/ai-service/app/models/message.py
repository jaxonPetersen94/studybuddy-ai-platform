from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId
from app.core.database import PyObjectId, MongoBaseConfig


class Message(BaseModel):
    """Message model for storing chat messages"""
    
    # Primary fields - using string IDs to match your User model pattern
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    session_id: str = Field(..., description="Session ID this message belongs to")
    user_id: str = Field(..., description="User ID from the User Service")
    
    # Message content
    role: str = Field(..., description="Message role: 'user', 'assistant', 'system'")
    content: str = Field(..., description="Message content")
    
    # Message metadata
    status: str = Field(default="completed", description="Message status: 'generating', 'completed', 'error', 'regenerating'")
    message_type: str = Field(default="text", description="Message type: 'text', 'function_call', 'function_result'")
    
    # Timestamps - using timezone-aware UTC datetimes
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Message creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    completed_at: Optional[datetime] = Field(None, description="Message completion timestamp")
    regenerated_at: Optional[datetime] = Field(None, description="Last regeneration timestamp")
    
    # Additional data - using Optional with default_factory for None handling
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Extra message data")
    attachments: Optional[List[str]] = Field(default_factory=list, description="List of attachment IDs")
    function_calls: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="AI function calls")
    tokens_used: int = Field(default=0, description="Token count for this message")
    
    # Message relationships and threading
    parent_message_id: Optional[str] = Field(None, description="Parent message ID for threading")
    thread_id: Optional[str] = Field(None, description="Thread ID for grouping related messages")
    
    # Quality and feedback
    feedback_score: Optional[int] = Field(None, description="User rating (1-5 or thumbs up/down)")
    feedback_text: Optional[str] = Field(None, description="User feedback comments")
    is_pinned: bool = Field(default=False, description="User can pin important messages")
    is_hidden: bool = Field(default=False, description="Soft delete or hide from UI")
    
    # Model and generation info
    model_name: Optional[str] = Field(None, description="Which AI model generated this")
    generation_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model configuration used")
    temperature: Optional[str] = Field(None, description="Generation temperature")
    
    # Content moderation
    is_flagged: bool = Field(default=False, description="Content moderation flag")
    moderation_score: Optional[str] = Field(None, description="Moderation confidence")
    
    # Validators
    @field_validator('session_id', mode='before')
    @classmethod
    def convert_objectid_to_string(cls, v):
        """Convert ObjectId to string for session_id"""
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    @field_validator('metadata', 'generation_config', mode='before')
    @classmethod
    def ensure_dict_not_none(cls, v):
        """Convert None to empty dict"""
        return v if v is not None else {}
    
    @field_validator('attachments', 'function_calls', mode='before')
    @classmethod
    def ensure_list_not_none(cls, v):
        """Convert None to empty list"""
        return v if v is not None else []
    
    class Config(MongoBaseConfig):
        # Schema extra for documentation
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "user_id": "user_456",
                "role": "user",
                "content": "Hello, how can you help me today?",
                "status": "completed",
                "message_type": "text",
                "attachments": [],
                "function_calls": [],
                "tokens_used": 0,
                "metadata": {}
            }
        }
    
    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role}, session_id={self.session_id})>"
    
    def to_dict(self, include_content: bool = True) -> Dict[str, Any]:
        """Convert message to dictionary representation"""
        data = {
            "id": str(self.id),
            "session_id": self.session_id,
            "user_id": self.user_id,
            "role": self.role,
            "status": self.status,
            "message_type": self.message_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "regenerated_at": self.regenerated_at.isoformat() if self.regenerated_at else None,
            "attachments": self.attachments or [],
            "function_calls": self.function_calls or [],
            "tokens_used": self.tokens_used,
            "parent_message_id": self.parent_message_id,
            "thread_id": self.thread_id,
            "feedback_score": self.feedback_score,
            "feedback_text": self.feedback_text,
            "is_pinned": self.is_pinned,
            "is_hidden": self.is_hidden,
            "model_name": self.model_name,
            "generation_config": self.generation_config or {},
            "temperature": self.temperature,
            "is_flagged": self.is_flagged,
            "moderation_score": self.moderation_score,
            "metadata": self.metadata or {}
        }
        
        if include_content:
            data["content"] = self.content
            
        return data
    
    def to_ai_format(self) -> Dict[str, Any]:
        """Convert message to AI service format"""
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "message_id": str(self.id),
            "attachments": self.attachments or [],
            "function_calls": self.function_calls or []
        }
    
    @classmethod
    def create_from_dict(cls, data: Dict[str, Any]) -> "Message":
        """Create a Message instance from dictionary data"""
        # Handle MongoDB's _id field - convert ObjectId to string for our id field
        if "_id" in data:
            data["id"] = str(data.pop("_id"))
        
        # Convert datetime strings if present
        datetime_fields = ["created_at", "updated_at", "completed_at", "regenerated_at"]
        for field in datetime_fields:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                except ValueError:
                    # Invalid datetime format, remove from data
                    data.pop(field, None)
        
        return cls(**data)
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update message fields from dictionary data"""
        updatable_fields = [
            "content", "status", "completed_at", "regenerated_at",
            "feedback_score", "feedback_text", "is_pinned", "is_hidden",
            "tokens_used", "metadata", "attachments", "function_calls",
            "model_name", "generation_config", "temperature", "updated_at"
        ]
        
        for field in updatable_fields:
            if field in data:
                if field in ["completed_at", "regenerated_at", "updated_at"] and isinstance(data[field], str):
                    try:
                        setattr(self, field, datetime.fromisoformat(data[field].replace('Z', '+00:00')))
                    except ValueError:
                        # Invalid datetime format, skip
                        pass
                else:
                    setattr(self, field, data[field])
        
        # Auto-update the updated_at timestamp with timezone-aware datetime
        self.updated_at = datetime.now(timezone.utc)
    
    @property
    def is_ai_message(self) -> bool:
        """Check if this is an AI-generated message"""
        return self.role == "assistant"
    
    @property
    def is_user_message(self) -> bool:
        """Check if this is a user message"""
        return self.role == "user"
    
    @property
    def is_system_message(self) -> bool:
        """Check if this is a system message"""
        return self.role == "system"
    
    @property
    def is_complete(self) -> bool:
        """Check if message generation is complete"""
        return self.status == "completed"
    
    @property
    def is_generating(self) -> bool:
        """Check if message is currently being generated"""
        return self.status in ["generating", "regenerating"]
    
    @property
    def has_attachments(self) -> bool:
        """Check if message has attachments"""
        return bool(self.attachments)
    
    @property
    def has_function_calls(self) -> bool:
        """Check if message contains function calls"""
        return bool(self.function_calls)
    
    @property
    def word_count(self) -> int:
        """Get approximate word count of message content"""
        return len(self.content.split()) if self.content else 0
    
    @property
    def char_count(self) -> int:
        """Get character count of message content"""
        return len(self.content) if self.content else 0