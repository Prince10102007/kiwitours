"""Configuration settings for the NZ Tours API."""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Google Sheets
    google_sheets_id: str = ""
    google_service_account_key: str = ""  # Base64 encoded JSON key

    # Gemini AI
    gemini_api_key: str = ""

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Cache
    cache_ttl_seconds: int = 300  # 5 minutes

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
