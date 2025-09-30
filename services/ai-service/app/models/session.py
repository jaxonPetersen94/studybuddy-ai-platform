from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.core.database import PyObjectId, MongoBaseConfig


class Session(BaseModel):
    """Session model for storing chat sessions"""
    
    # Primary fields
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., description="User ID from the User Service")
    
    # Session content
    title: str = Field(..., description="Session title/name")
    
    # Session metadata
    status: str = Field(default="active", description="Session status: 'active', 'archived', 'deleted'")
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Session creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    last_activity: Optional[datetime] = Field(None, description="Last activity timestamp")
    
    # Session statistics
    message_count: int = Field(default=0, description="Total number of messages in session")
    
    # Model and generation configuration
    generation_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="AI model configuration for session")
    
    # Session organization
    is_pinned: bool = Field(default=False, description="User can pin important sessions")
    is_archived: bool = Field(default=False, description="Archive old sessions")
    tags: Optional[list[str]] = Field(default_factory=list, description="User-defined tags for organization")
    
    # Additional data
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Extra session data")
    
    # Validators to convert None to default values
    @field_validator('metadata', 'generation_config', mode='before')
    @classmethod
    def ensure_dict_not_none(cls, v):
        """Convert None to empty dict"""
        return v if v is not None else {}
    
    @field_validator('tags', mode='before')
    @classmethod
    def ensure_list_not_none(cls, v):
        """Convert None to empty list"""
        return v if v is not None else []
    
    class Config(MongoBaseConfig):
        json_schema_extra = {
            "example": {
                "user_id": "user_456",
                "title": "Help with Python coding",
                "status": "active",
                "message_count": 12,
                "generation_config": {
                    "model": "claude-3-sonnet",
                    "temperature": 0.7,
                    "max_tokens": 4000
                },
                "is_pinned": False,
                "is_archived": False,
                "tags": ["coding", "python"],
                "metadata": {}
            }
        }
    
    def __repr__(self):
        return f"<Session(id={self.id}, title={self.title}, user_id={self.user_id})>"
    
    def to_dict(self, include_sensitive: bool = True) -> Dict[str, Any]:
        """Convert session to dictionary representation"""
        data = {
            "id": str(self.id),
            "user_id": self.user_id,
            "title": self.title,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_activity": self.last_activity.isoformat() if self.last_activity else None,
            "message_count": self.message_count,
            "generation_config": self.generation_config or {},
            "is_pinned": self.is_pinned,
            "is_archived": self.is_archived,
            "tags": self.tags or [],
            "metadata": self.metadata or {}
        }
        
        return data
    
    @classmethod
    def create_from_dict(cls, data: Dict[str, Any]) -> "Session":
        """Create a Session instance from dictionary data"""
        # Convert datetime strings if present
        datetime_fields = ["created_at", "updated_at", "last_activity"]
        for field in datetime_fields:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                except ValueError:
                    # Invalid datetime format, remove from data
                    data.pop(field, None)
        
        return cls(**data)
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update session fields from dictionary data"""
        updatable_fields = [
            "title", "status", "last_activity", "message_count",
            "generation_config", "is_pinned", "is_archived", "tags",
            "metadata", "updated_at"
        ]
        
        for field in updatable_fields:
            if field in data:
                if field in ["last_activity", "updated_at"] and isinstance(data[field], str):
                    try:
                        setattr(self, field, datetime.fromisoformat(data[field].replace('Z', '+00:00')))
                    except ValueError:
                        # Invalid datetime format, skip
                        pass
                else:
                    setattr(self, field, data[field])
        
        # Auto-update the updated_at timestamp
        self.updated_at = datetime.now(timezone.utc)
    
    @property
    def is_active(self) -> bool:
        """Check if session is active"""
        return self.status == "active"
    
    @property
    def is_empty(self) -> bool:
        """Check if session has no messages"""
        return self.message_count == 0
    
    @property
    def has_recent_activity(self, hours: int = 24) -> bool:
        """Check if session has recent activity within specified hours"""
        if not self.last_activity:
            return False
        
        time_diff = datetime.now(timezone.utc) - self.last_activity
        return time_diff.total_seconds() < (hours * 3600)
    
    def update_activity(self) -> None:
        """Update last activity timestamp"""
        self.last_activity = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
    
    def increment_message_count(self) -> None:
        """Increment message count and update activity"""
        self.message_count += 1
        self.update_activity()
    
    def archive(self) -> None:
        """Archive the session"""
        self.is_archived = True
        self.status = "archived"
        self.updated_at = datetime.now(timezone.utc)
    
    def restore(self) -> None:
        """Restore archived session"""
        self.is_archived = False
        self.status = "active"
        self.updated_at = datetime.now(timezone.utc)
    
    def soft_delete(self) -> None:
        """Soft delete the session"""
        self.status = "deleted"
        self.updated_at = datetime.now(timezone.utc)