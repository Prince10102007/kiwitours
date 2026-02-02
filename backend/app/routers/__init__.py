"""Routers package."""

from .chat import router as chat_router
from .packages import router as packages_router
from .custom_trips import router as custom_trips_router
# knowledge_router disabled - requires chromadb
# from .knowledge import router as knowledge_router

__all__ = ["chat_router", "packages_router", "custom_trips_router"]
