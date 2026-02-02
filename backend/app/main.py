"""FastAPI main application for NZ Tours API."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import chat_router, packages_router, custom_trips_router
# knowledge_router disabled - requires heavy dependencies (chromadb, sentence-transformers)

# Create FastAPI app
app = FastAPI(
    title="NZ Tours API",
    description="API for New Zealand travel chatbot and tour packages",
    version="1.0.0",
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router)
app.include_router(packages_router)
app.include_router(custom_trips_router)
# app.include_router(knowledge_router)  # Disabled for lighter deployment


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Kia Ora! Welcome to NZ Tours API",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
