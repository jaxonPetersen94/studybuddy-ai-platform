from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict, List, Optional

class SessionCreate(BaseModel):
    title: Optional[str] = None
    session_type: Optional[str] = Field(None, alias="sessionType")
    metadata: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(populate_by_name=True)

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    session_type: Optional[str] = Field(None, alias="sessionType")
    metadata: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(populate_by_name=True)

class MessageCreate(BaseModel):
    session_id: str = Field(alias="sessionId")
    content: str
    role: str = "user"
    attachments: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(populate_by_name=True)

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

class SendMessageRequest(BaseModel):
    content: str
    session_id: Optional[str] = Field(None, alias="sessionId")
    attachments: Optional[List[Dict[str, Any]]] = None
    model_config_data: Optional[Dict[str, Any]] = Field(None, alias="modelConfig")
    response_format: Optional[str] = Field(None, alias="responseFormat")
    system_prompt: Optional[str] = Field(None, alias="systemPrompt")
    subject: Optional[str] = None
    quick_action: Optional[str] = Field(None, alias="quickAction")
    model_config = ConfigDict(populate_by_name=True)

class StreamMessageRequest(BaseModel):
    session_id: str = Field(alias="sessionId")
    content: str
    parameters: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(populate_by_name=True)