"""Chat endpoints."""

from fastapi import APIRouter

from ..models.schemas import ChatMessage, ChatResponse, Package
from ..services.sheets_service import sheets_service
from ..services.gemini_service import gemini_service
from ..services.recommendation import recommendation_service

router = APIRouter(prefix="/api", tags=["chat"])

# Define conversation flow states and options
FLOW_CONFIG = {
    "greeting": {
        "message": "Kia Ora! Welcome to NZ Tours. I'm here to help you discover the magic of Aotearoa New Zealand. How would you like to explore?",
        "options": [
            {"label": "Browse Packages", "value": "browse", "next_state": "destination"},
            {"label": "Plan Custom Trip", "value": "custom", "next_state": "destination"},
            {"label": "Talk to AI Assistant", "value": "ai", "next_state": "ai_chat"},
        ],
    },
    "destination": {
        "message": "Fantastic choice! Which region of New Zealand interests you most?",
        "options": [
            {"label": "North Island", "value": "north", "next_state": "trip_type"},
            {"label": "South Island", "value": "south", "next_state": "trip_type"},
            {"label": "Both Islands", "value": "both", "next_state": "trip_type"},
            {"label": "Not Sure - Recommend Me!", "value": "recommend", "next_state": "trip_type"},
        ],
    },
    "trip_type": {
        "message": "What type of experience are you looking for?",
        "options": [
            {"label": "Adventure & Outdoors", "value": "adventure", "next_state": "duration"},
            {"label": "Culture & Heritage", "value": "culture", "next_state": "duration"},
            {"label": "Nature & Wildlife", "value": "nature", "next_state": "duration"},
            {"label": "Food & Wine", "value": "food", "next_state": "duration"},
            {"label": "Mixed Experience", "value": "mixed", "next_state": "duration"},
        ],
    },
    "duration": {
        "message": "How long would you like your adventure to be?",
        "options": [
            {"label": "3-5 Days", "value": "short", "next_state": "budget"},
            {"label": "1 Week", "value": "week", "next_state": "budget"},
            {"label": "2 Weeks", "value": "two_weeks", "next_state": "budget"},
            {"label": "Flexible", "value": "flexible", "next_state": "budget"},
        ],
    },
    "budget": {
        "message": "What's your budget range per person?",
        "options": [
            {"label": "Budget ($500-$1,500)", "value": "budget", "next_state": "group_size"},
            {"label": "Mid-Range ($1,500-$3,000)", "value": "mid", "next_state": "group_size"},
            {"label": "Premium ($3,000-$5,000)", "value": "premium", "next_state": "group_size"},
            {"label": "Luxury ($5,000+)", "value": "luxury", "next_state": "group_size"},
        ],
    },
    "group_size": {
        "message": "How many travelers will be joining?",
        "options": [
            {"label": "Solo Traveler", "value": "solo", "next_state": "show_packages"},
            {"label": "Couple", "value": "couple", "next_state": "show_packages"},
            {"label": "Small Group (3-5)", "value": "small", "next_state": "show_packages"},
            {"label": "Large Group (6+)", "value": "large", "next_state": "show_packages"},
        ],
    },
    "show_packages": {
        "message": "Here are the perfect packages for your New Zealand adventure!",
        "options": [
            {"label": "Start New Search", "value": "restart", "next_state": "greeting"},
            {"label": "Talk to AI Assistant", "value": "ai", "next_state": "ai_chat"},
        ],
    },
    "ai_chat": {
        "message": "I'm your AI travel assistant! Ask me anything about New Zealand travel, our packages, or help planning your trip. What would you like to know?",
        "options": [
            {"label": "Back to Package Browser", "value": "browse", "next_state": "destination"},
        ],
    },
}

# Map flow states to selection keys
STATE_SELECTION_MAP = {
    "destination": "destination",
    "trip_type": "trip_type",
    "duration": "duration",
    "budget": "budget",
    "group_size": "group_size",
}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage):
    """Handle chat messages - both flow-based and AI responses."""
    flow_state = request.flow_state or "greeting"
    selections = request.selections or {}
    message = request.message

    # Check if user is in AI chat mode or typed a message
    if flow_state == "ai_chat" or (message and not message.startswith("_flow:")):
        # Use Gemini AI for response
        packages = sheets_service.get_packages()
        ai_response = await gemini_service.generate_response(message, packages)

        return ChatResponse(
            message=ai_response,
            flow_state="ai_chat",
            options=FLOW_CONFIG["ai_chat"]["options"],
            is_ai_response=True,
        )

    # Handle flow-based navigation
    if message.startswith("_flow:"):
        # Extract the selection value
        value = message.replace("_flow:", "")

        # Find which option was selected and get next state
        current_config = FLOW_CONFIG.get(flow_state, FLOW_CONFIG["greeting"])
        next_state = flow_state

        for option in current_config.get("options", []):
            if option["value"] == value:
                next_state = option.get("next_state", flow_state)
                # Store the selection
                if flow_state in STATE_SELECTION_MAP:
                    selections[STATE_SELECTION_MAP[flow_state]] = value
                break

        # Special handling for restart
        if value == "restart":
            selections = {}

        flow_state = next_state

    # Get the flow configuration for current state
    config = FLOW_CONFIG.get(flow_state, FLOW_CONFIG["greeting"])

    # Build response
    response = ChatResponse(
        message=config["message"],
        flow_state=flow_state,
        options=config.get("options"),
        is_ai_response=False,
    )

    # If showing packages, get recommendations
    if flow_state == "show_packages":
        packages = sheets_service.get_packages()

        if not packages:
            # No packages available at all
            response.message = "Sorry, there are no packages available at the moment. Please check back later or talk to our AI assistant for help!"
            response.packages = []
        else:
            recommended = recommendation_service.get_recommendations(packages, selections)
            if recommended:
                response.packages = recommended
            else:
                response.packages = packages[:3]
                response.message = "I couldn't find exact matches, but here are some amazing packages you might love!"

    return response


@router.get("/sync")
async def sync_packages():
    """Force refresh packages from Google Sheets."""
    packages = sheets_service.get_packages(force_refresh=True)
    return {"status": "success", "count": len(packages)}
