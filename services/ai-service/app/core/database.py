from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
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
        _client = AsyncIOMotorClient(mongo_uri)
    return _client


def get_database() -> Database:
    """
    Return the MongoDB database instance defined in settings.
    """
    settings = get_settings()
    db_name = getattr(settings, "mongo_db_name", "studybuddy_ai")
    return get_client()[db_name]
