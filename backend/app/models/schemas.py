"""Pydantic models for the NZ Tours API."""

from typing import Optional
from pydantic import BaseModel


class Package(BaseModel):
    """Tour package model."""
    id: str
    name: str
    region: str  # North/South/Both
    type: str  # Adventure/Culture/Nature/Food/Mixed
    duration: int  # Number of days
    price: float  # Price per person (NZD)
    group_size_min: int
    group_size_max: int
    description: str
    highlights: list[str]
    itinerary: list[str]
    inclusions: list[str]
    exclusions: list[str]
    image_url: str
    gallery: list[str]
    season: list[str]  # Best seasons
    status: str  # Active/Inactive


class PackageFilter(BaseModel):
    """Filter criteria for packages."""
    region: Optional[str] = None
    type: Optional[str] = None
    duration_min: Optional[int] = None
    duration_max: Optional[int] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    group_size: Optional[int] = None


class ChatMessage(BaseModel):
    """Chat message from user."""
    message: str
    flow_state: Optional[str] = None
    selections: Optional[dict] = None


class ChatResponse(BaseModel):
    """Chat response to user."""
    message: str
    flow_state: Optional[str] = None
    options: Optional[list[dict]] = None
    packages: Optional[list[Package]] = None
    is_ai_response: bool = False


class FlowOption(BaseModel):
    """Quick reply option in flow."""
    label: str
    value: str
    next_state: Optional[str] = None


class CustomTripRequest(BaseModel):
    """Custom trip planning request from user."""
    selections: dict  # destination, tripType, duration, budget, groupSize, interests
    name: str
    phone: str
    email: str
    notes: Optional[str] = None


class CustomTripResponse(BaseModel):
    """Response after submitting custom trip request."""
    success: bool
    message: str
    request_id: Optional[str] = None
