from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class SessionCreate(BaseModel):
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageCreate(BaseModel):
    session_id: str
    content: str
    role: str = "user"
    attachments: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageUpdate(BaseModel):
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MessageRegenerate(BaseModel):
    parameters: Optional[Dict[str, Any]] = None

class MessageFeedback(BaseModel):
    rating: Optional[int] = None
    feedback_type: str
    content: Optional[str] = None

class BulkDeleteRequest(BaseModel):
    ids: List[str]

class StreamMessageRequest(BaseModel):
    session_id: str
    content: str
    parameters: Optional[Dict[str, Any]] = None