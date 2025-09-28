from functools import lru_cache
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # Server Configuration
    app_name: str = "StudyBuddy AI Service"
    app_version: str = "0.1.0"
    debug: bool = Field(default=False, alias="DEBUG")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=5002, alias="PORT")
    
    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # CORS
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        alias="CORS_ORIGINS"
    )
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    
    # JWT Configuration
    jwt_secret: str = Field(..., alias="JWT_SECRET", description="Secret key for JWT token signing")
    
    # Database - MongoDB
    mongo_uri: str = Field(default="mongodb://localhost:27017", alias="MONGO_URI")
    mongo_db_name: str = Field(default="studybuddy_ai", alias="MONGO_DB_NAME")
    
    # AI Configuration
    ai_request_timeout: Optional[float] = Field(default=60.0, alias="AI_REQUEST_TIMEOUT")
    default_ai_model: Optional[str] = Field(default="gpt-4", alias="DEFAULT_AI_MODEL")
    ai_max_tokens: Optional[int] = Field(default=4000, alias="AI_MAX_TOKENS")
    ai_temperature: Optional[float] = Field(default=0.7, alias="AI_TEMPERATURE")
    
    # API Keys for AI Providers
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, alias="ANTHROPIC_API_KEY")
    google_api_key: Optional[str] = Field(default=None, alias="GOOGLE_API_KEY")


@lru_cache
def get_settings() -> Settings:
    return Settings()