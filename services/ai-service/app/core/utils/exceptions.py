"""
Core exception classes for AI service operations.
"""

from typing import Optional


class AIServiceError(Exception):
    """Base exception for AI service related errors"""
    
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class ModelNotFoundError(AIServiceError):
    """Raised when requested AI model is not available"""
    
    def __init__(self, message: str = "Requested AI model not found"):
        super().__init__(message)


class RateLimitError(AIServiceError):
    """Raised when AI service rate limit is exceeded"""
    
    def __init__(self, message: str = "AI service rate limit exceeded"):
        super().__init__(message)