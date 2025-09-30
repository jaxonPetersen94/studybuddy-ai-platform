"""
API Routes Module

This module exports all route routers for easy import in main.py
"""

from .health import router as health_router
from .chat_routes import router as chat_router

# Export all routers for easy access
__all__ = [
    "health_router",
    "chat_router",
]