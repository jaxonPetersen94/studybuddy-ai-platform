from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId class for Pydantic compatibility"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

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
    
    class Config:
        # Allow population by field name for compatibility
        allow_population_by_field_name = True
        # JSON encoders for ObjectId if needed
        json_encoders = {ObjectId: str}
        # Example data for documentation
        schema_extra = {
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