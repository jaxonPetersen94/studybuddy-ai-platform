import time
from datetime import datetime
from fastapi import APIRouter
from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.common import HealthResponse

# Initialize
router = APIRouter(prefix="/health", tags=["Health"])
logger = get_logger(__name__)
settings = get_settings()

# Track service start time
_start_time = time.time()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Basic health check endpoint."""
    uptime = time.time() - _start_time
    
    logger.info("Health check requested", uptime_seconds=uptime)
    
    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        status="healthy",
        uptime_seconds=uptime
    )


@router.get("/ready", response_model=HealthResponse)
async def readiness_check():
    """Readiness probe for Kubernetes/Docker."""
    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        status="ready"
    )


@router.get("/live", response_model=HealthResponse)
async def liveness_check():
    """Liveness probe for Kubernetes/Docker."""
    return HealthResponse(
        service=settings.app_name,
        version=settings.app_version,
        status="alive"
    )