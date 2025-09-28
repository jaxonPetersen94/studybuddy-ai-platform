import logging
import structlog
from typing import Any


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured logging for the application."""
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.JSONRenderer() if log_level != "DEBUG" 
            else structlog.dev.ConsoleRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, log_level.upper())
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
    )
    
    # Configure standard library logging
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format="%(message)s" if log_level != "DEBUG" else None,
    )
    
    # Silence MongoDB/PyMongo verbose logging
    # This will prevent all the heartbeat and connection monitoring spam
    logging.getLogger("pymongo").setLevel(logging.ERROR)
    logging.getLogger("pymongo.command").setLevel(logging.ERROR)
    logging.getLogger("pymongo.connection").setLevel(logging.ERROR)
    logging.getLogger("pymongo.server").setLevel(logging.ERROR)
    logging.getLogger("pymongo.topology").setLevel(logging.ERROR)
    logging.getLogger("pymongo.heartbeat").setLevel(logging.ERROR)
    logging.getLogger("pymongo.pool").setLevel(logging.ERROR)


def get_logger(name: str) -> Any:
    """Get a structured logger instance."""
    return structlog.get_logger(name)