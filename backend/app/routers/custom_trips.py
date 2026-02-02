"""Custom trip request endpoints."""

import uuid
from datetime import datetime
from fastapi import APIRouter

from ..models.schemas import CustomTripRequest, CustomTripResponse

router = APIRouter(prefix="/api/custom-trips", tags=["custom-trips"])

# In-memory storage for demo (use database in production)
custom_trip_requests: list[dict] = []


@router.post("", response_model=CustomTripResponse)
async def submit_custom_trip(request: CustomTripRequest):
    """Submit a custom trip planning request."""
    request_id = str(uuid.uuid4())[:8].upper()

    # Store the request
    trip_data = {
        "id": request_id,
        "selections": request.selections,
        "name": request.name,
        "phone": request.phone,
        "email": request.email,
        "notes": request.notes,
        "created_at": datetime.now().isoformat(),
        "status": "pending",
    }
    custom_trip_requests.append(trip_data)

    # Here you would typically:
    # 1. Save to database
    # 2. Send notification email to admin
    # 3. Send confirmation email to user

    return CustomTripResponse(
        success=True,
        message=f"Your custom trip request has been submitted! Our travel experts will contact you within 24-48 hours.",
        request_id=request_id,
    )


@router.get("")
async def get_custom_trip_requests():
    """Get all custom trip requests (admin endpoint)."""
    return {"requests": custom_trip_requests, "total": len(custom_trip_requests)}
