import asyncio
import uuid
import os
import hashlib
import mimetypes
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, BinaryIO
from pathlib import Path
import aiofiles
from fastapi import UploadFile, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.core.database import get_database
from app.core.config import get_settings
from app.core.logging import get_logger

# Only safe imports - no heavy C extensions
settings = get_settings()
logger = get_logger(__name__)


class AttachmentService:
    """Service for handling file attachments in chat - minimal version"""
    
    # File size limits (in bytes)
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB for images
    MAX_DOCUMENT_SIZE = 25 * 1024 * 1024  # 25MB for documents
    
    # Allowed file types
    ALLOWED_IMAGE_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp", 
        "image/bmp", "image/tiff", "image/svg+xml"
    }
    
    ALLOWED_DOCUMENT_TYPES = {
        "application/pdf", "text/plain", "text/markdown", "text/csv",
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/json", "application/xml", "text/xml", "text/html"
    }
    
    ALLOWED_AUDIO_TYPES = {
        "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm"
    }
    
    ALLOWED_VIDEO_TYPES = {
        "video/mp4", "video/webm", "video/ogg", "video/quicktime"
    }
    
    def __init__(self):
        self.db = None
        self.storage_path = Path(settings.upload_dir or "./uploads")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        logger.info("AttachmentService initialized with minimal processing capabilities")
    
    def _get_db(self) -> AsyncIOMotorDatabase:
        """Get database connection"""
        if not self.db:
            self.db = get_database()
        return self.db
    
    async def create_attachment(
        self, 
        user_id: str, 
        file: UploadFile, 
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create/upload a new attachment
        
        Args:
            user_id: ID of the user uploading the file
            file: The uploaded file
            metadata: Optional metadata dictionary
            
        Returns:
            Dictionary containing attachment information
        """
        try:
            db = self._get_db()
            
            # Validate file
            await self._validate_file(file)
            
            # Generate attachment ID and file paths
            attachment_id = str(uuid.uuid4())
            file_hash = await self._calculate_file_hash(file)
            file_extension = self._get_file_extension(file.filename)
            stored_filename = f"{attachment_id}{file_extension}"
            file_path = self.storage_path / user_id / stored_filename
            
            # Create user directory if it doesn't exist
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Detect content type (using mimetypes only)
            content_type = self._detect_content_type_safe(file.filename)
            file_category = self._categorize_file(content_type)
            
            # Save file to disk
            await self._save_file_to_disk(file, file_path)
            
            # Basic metadata processing (no heavy libraries)
            processed_metadata = await self._process_file_basic(file_path, content_type, metadata or {})
            
            # Create attachment record
            attachment_data = {
                "_id": ObjectId(),
                "user_id": user_id,
                "filename": file.filename,
                "original_filename": file.filename,
                "stored_filename": stored_filename,
                "file_path": str(file_path),
                "content_type": content_type,
                "file_size": file.size,
                "file_hash": file_hash,
                "category": file_category,
                "metadata": processed_metadata,
                "is_processed": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            # Insert into database
            result = await db.attachments.insert_one(attachment_data)
            
            # Convert ObjectId to string for response
            attachment_data["id"] = str(attachment_data["_id"])
            attachment_data["user_id"] = str(attachment_data["user_id"])
            del attachment_data["_id"]
            
            logger.info(f"Created attachment {attachment_data['id']} for user {user_id}")
            
            return attachment_data
            
        except Exception as e:
            logger.error(f"Error creating attachment for user {user_id}: {str(e)}")
            
            # Clean up file if it was saved
            try:
                if 'file_path' in locals() and file_path.exists():
                    file_path.unlink()
            except Exception:
                pass
            
            raise
    
    async def get_attachment(self, attachment_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific attachment by ID"""
        try:
            db = self._get_db()
            
            attachment = await db.attachments.find_one({
                "_id": ObjectId(attachment_id),
                "user_id": user_id
            })
            
            if not attachment:
                return None
            
            # Convert ObjectIds to strings
            attachment["id"] = str(attachment["_id"])
            attachment["user_id"] = str(attachment["user_id"])
            del attachment["_id"]
            
            # Check if file still exists on disk
            file_path = Path(attachment["file_path"])
            attachment["file_exists"] = file_path.exists()
            
            return attachment
            
        except Exception as e:
            logger.error(f"Error getting attachment {attachment_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_user_attachments(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get user's file attachments with optional filtering"""
        try:
            db = self._get_db()
            
            # Build query filter
            query_filter = {"user_id": user_id}
            
            if category:
                query_filter["category"] = category
            
            # Get attachments with pagination
            cursor = db.attachments.find(query_filter).sort("created_at", -1).skip(offset).limit(limit)
            attachments = await cursor.to_list(length=limit)
            
            # Convert ObjectIds to strings and check file existence
            for attachment in attachments:
                attachment["id"] = str(attachment["_id"])
                attachment["user_id"] = str(attachment["user_id"])
                del attachment["_id"]
                
                # Check file existence
                file_path = Path(attachment["file_path"])
                attachment["file_exists"] = file_path.exists()
            
            # Get total count for pagination
            total_count = await db.attachments.count_documents(query_filter)
            
            return {
                "attachments": attachments,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": offset + len(attachments) < total_count
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting attachments for user {user_id}: {str(e)}")
            raise
    
    async def delete_attachment(self, attachment_id: str, user_id: str) -> bool:
        """Delete an attachment and its file"""
        try:
            db = self._get_db()
            
            # Get attachment info first
            attachment = await self.get_attachment(attachment_id, user_id)
            if not attachment:
                return False
            
            # Delete file from disk
            file_path = Path(attachment["file_path"])
            if file_path.exists():
                try:
                    file_path.unlink()
                except Exception as e:
                    logger.warning(f"Could not delete file {file_path}: {str(e)}")
            
            # Delete from database
            result = await db.attachments.delete_one({
                "_id": ObjectId(attachment_id),
                "user_id": user_id
            })
            
            if result.deleted_count > 0:
                logger.info(f"Deleted attachment {attachment_id} for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting attachment {attachment_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_attachment_content(self, attachment_id: str, user_id: str) -> Optional[bytes]:
        """Get the raw content of an attachment file"""
        try:
            attachment = await self.get_attachment(attachment_id, user_id)
            if not attachment or not attachment.get("file_exists", False):
                return None
            
            file_path = Path(attachment["file_path"])
            
            async with aiofiles.open(file_path, 'rb') as f:
                content = await f.read()
            
            return content
            
        except Exception as e:
            logger.error(f"Error getting attachment content {attachment_id} for user {user_id}: {str(e)}")
            raise
    
    async def get_attachment_text_content(self, attachment_id: str, user_id: str) -> Optional[str]:
        """Extract text content from an attachment (basic text files only)"""
        try:
            attachment = await self.get_attachment(attachment_id, user_id)
            if not attachment:
                return None
            
            content_type = attachment.get("content_type", "")
            file_path = Path(attachment["file_path"])
            
            if not file_path.exists():
                return None
            
            # Handle only basic text files for now
            if content_type.startswith("text/"):
                try:
                    async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                        return await f.read()
                except UnicodeDecodeError:
                    # Try with different encoding
                    async with aiofiles.open(file_path, 'r', encoding='latin-1') as f:
                        return await f.read()
            
            elif content_type == "application/json":
                async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    import json
                    return json.dumps(json.loads(content), indent=2)
            
            # For other file types, return None for now
            # Can be enhanced later when heavy libraries are working
            return None
            
        except Exception as e:
            logger.error(f"Error extracting text from attachment {attachment_id}: {str(e)}")
            return None
    
    async def _validate_file(self, file: UploadFile):
        """Validate uploaded file"""
        if file.size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size is {self.MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        # Check file extension
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg',
                            '.pdf', '.txt', '.md', '.csv', '.doc', '.docx', '.xls', '.xlsx',
                            '.ppt', '.pptx', '.json', '.xml', '.html', '.mp3', '.wav', '.ogg',
                            '.mp4', '.webm', '.mov'}
        
        file_extension = self._get_file_extension(file.filename).lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type {file_extension} not allowed"
            )
    
    def _detect_content_type_safe(self, filename: str) -> str:
        """Detect content type using only mimetypes (no magic)"""
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or "application/octet-stream"
    
    def _categorize_file(self, content_type: str) -> str:
        """Categorize file based on content type"""
        if content_type in self.ALLOWED_IMAGE_TYPES:
            return "image"
        elif content_type in self.ALLOWED_DOCUMENT_TYPES:
            return "document"
        elif content_type in self.ALLOWED_AUDIO_TYPES:
            return "audio"
        elif content_type in self.ALLOWED_VIDEO_TYPES:
            return "video"
        else:
            return "other"
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        return Path(filename).suffix
    
    async def _calculate_file_hash(self, file: UploadFile) -> str:
        """Calculate SHA-256 hash of the file"""
        await file.seek(0)
        
        hash_sha256 = hashlib.sha256()
        chunk_size = 8192
        
        while chunk := await file.read(chunk_size):
            hash_sha256.update(chunk)
        
        await file.seek(0)
        return hash_sha256.hexdigest()
    
    async def _save_file_to_disk(self, file: UploadFile, file_path: Path):
        """Save uploaded file to disk"""
        await file.seek(0)
        
        async with aiofiles.open(file_path, 'wb') as f:
            chunk_size = 8192
            while chunk := await file.read(chunk_size):
                await f.write(chunk)
        
        await file.seek(0)
    
    async def _process_file_basic(self, file_path: Path, content_type: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Basic file processing without heavy libraries"""
        processed_metadata = metadata.copy()
        
        try:
            # Add basic file stats
            stat = file_path.stat()
            processed_metadata.update({
                "file_size_bytes": stat.st_size,
                "created_timestamp": stat.st_ctime,
                "modified_timestamp": stat.st_mtime,
                "processing_mode": "basic"  # Indicates minimal processing
            })
            
            # Basic text file processing
            if content_type.startswith("text/"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read(1000)  # First 1000 chars
                        processed_metadata.update({
                            "preview_text": content,
                            "estimated_lines": content.count('\n') + 1,
                            "has_content": len(content.strip()) > 0
                        })
                except Exception:
                    pass
            
        except Exception as e:
            logger.warning(f"Error in basic file processing for {file_path}: {str(e)}")
        
        return processed_metadata
    
    async def get_attachment_stats(self, user_id: str) -> Dict[str, Any]:
        """Get attachment statistics for a user"""
        try:
            db = self._get_db()
            
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": None,
                    "total_attachments": {"$sum": 1},
                    "total_size": {"$sum": "$file_size"},
                    "avg_size": {"$avg": "$file_size"},
                    "image_count": {"$sum": {"$cond": [{"$eq": ["$category", "image"]}, 1, 0]}},
                    "document_count": {"$sum": {"$cond": [{"$eq": ["$category", "document"]}, 1, 0]}},
                    "audio_count": {"$sum": {"$cond": [{"$eq": ["$category", "audio"]}, 1, 0]}},
                    "video_count": {"$sum": {"$cond": [{"$eq": ["$category", "video"]}, 1, 0]}},
                    "last_upload": {"$max": "$created_at"}
                }}
            ]
            
            cursor = db.attachments.aggregate(pipeline)
            result = await cursor.to_list(length=1)
            stats = result[0] if result else {}
            
            # Convert sizes to human readable format
            if stats.get("total_size"):
                stats["total_size_mb"] = round(stats["total_size"] / (1024 * 1024), 2)
            if stats.get("avg_size"):
                stats["avg_size_mb"] = round(stats["avg_size"] / (1024 * 1024), 2)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting attachment stats for user {user_id}: {str(e)}")
            raise