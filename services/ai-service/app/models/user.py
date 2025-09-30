from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.core.database import MongoBaseConfig


class User(BaseModel):
    """
    User model for AI Service.
    This represents the user data forwarded from the API Gateway.
    """
    id: str = Field(..., description="User ID from the User Service")
    email: str = Field(..., description="User email address")
    firstName: Optional[str] = Field(None, description="User's first name")
    lastName: Optional[str] = Field(None, description="User's last name")
    
    # Optional fields that might be forwarded from gateway
    roles: Optional[List[str]] = Field(default_factory=list, description="User roles")
    
    class Config(MongoBaseConfig):
        # Example data for documentation
        json_schema_extra = {  # UPDATED: schema_extra -> json_schema_extra
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "user@studybuddy.com",
                "firstName": "John",
                "lastName": "Doe",
                "roles": ["student"]
            }
        }

    @property
    def full_name(self) -> str:
        """Get user's full name"""
        if self.firstName and self.lastName:
            return f"{self.firstName} {self.lastName}"
        elif self.firstName:
            return self.firstName
        elif self.lastName:
            return self.lastName
        else:
            return self.email.split("@")[0]  # Fallback to email username

    def to_dict(self) -> dict:
        """Convert to dictionary for MongoDB storage or logging"""
        return {
            "id": self.id,
            "email": self.email,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "roles": self.roles or []
        }