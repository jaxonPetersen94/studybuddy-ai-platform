from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    """Base response model for all API responses."""
    success: bool = True
    message: str = "Operation completed successfully"
    timestamp: datetime = Field(default_factory=datetime.now)


class HealthResponse(BaseResponse):
    """Health check response model."""
    service: str
    version: str
    status: str = "healthy"
    uptime_seconds: Optional[float] = None


class ErrorResponse(BaseResponse):
    """Error response model."""
    success: bool = False
    error_code: Optional[str] = None
    details: Optional[dict] = None