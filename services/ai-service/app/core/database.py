from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from bson.codec_options import CodecOptions
from datetime import timezone
from app.core.config import get_settings

# Singleton client
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    """
    Return a singleton MongoDB client instance.
    Uses settings from config.py (.env values).
    """
    global _client
    if _client is None:
        settings = get_settings()
        mongo_uri = getattr(settings, "mongo_uri", "mongodb://localhost:27017")
        # Add timezone-aware configuration
        _client = AsyncIOMotorClient(
            mongo_uri,
            tz_aware=True,
            tzinfo=timezone.utc
        )
    return _client


def get_database() -> AsyncIOMotorDatabase:
    """
    Return the MongoDB database instance defined in settings.
    With timezone-aware codec options.
    """
    settings = get_settings()
    db_name = getattr(settings, "mongo_db_name", "studybuddy_ai")
    
    # Get database with timezone-aware codec options
    return get_client().get_database(
        db_name,
        codec_options=CodecOptions(tz_aware=True, tzinfo=timezone.utc)
    )