"""Gemini AI integration service."""

import google.generativeai as genai

from ..config import get_settings
from ..models.schemas import Package
# RAG disabled for lighter deployment
# from .rag_service import rag_service


class GeminiService:
    """Service for AI-powered chat responses using Gemini."""

    def __init__(self):
        self._model = None
        self._settings = get_settings()
        self._system_prompt = """You are a friendly and knowledgeable travel assistant for NZ Tours,
a New Zealand travel agency. You help customers plan their perfect New Zealand adventure.

Key points about you:
- You greet customers with "Kia Ora" (Maori greeting)
- You're enthusiastic about New Zealand's natural beauty, culture, and adventures
- You provide helpful tips about weather, best seasons, and local customs
- You can recommend packages based on customer preferences
- You're knowledgeable about both North and South Islands
- You use New Zealand English spellings where appropriate
- You answer questions accurately based on the provided knowledge base
- If you don't know something, you honestly say so and offer to help find out

IMPORTANT: Always prioritize information from the Knowledge Base Context provided below.
If the knowledge base has relevant information, use it. Only use your general knowledge
for topics not covered in the knowledge base."""

    def _get_model(self):
        """Get or create Gemini model."""
        if self._model is None:
            try:
                api_key = self._settings.gemini_api_key
                if not api_key:
                    print("Warning: GEMINI_API_KEY not set")
                    return None

                genai.configure(api_key=api_key)
                self._model = genai.GenerativeModel("gemini-2.0-flash")
            except Exception as e:
                print(f"Error initializing Gemini: {e}")
                return None
        return self._model

    def _format_packages_context(self, packages: list[Package]) -> str:
        """Format packages as context for the AI."""
        if not packages:
            return ""

        context = "\n\nCurrent Available Tour Packages:\n"
        for pkg in packages[:5]:  # Limit to 5 packages
            context += f"""
- {pkg.name} ({pkg.region}, {pkg.type})
  Duration: {pkg.duration} days | Price: ${pkg.price} NZD
  Highlights: {', '.join(pkg.highlights[:3])}
"""
        return context

    async def generate_response(
        self,
        user_message: str,
        packages: list[Package],
        conversation_history: list[dict] = None
    ) -> str:
        """Generate an AI response using Gemini."""

        # Get model
        model = self._get_model()

        if model is None:
            return self._get_fallback_response(user_message)

        try:
            # Build packages context
            packages_context = self._format_packages_context(packages)

            # Build the prompt
            prompt = f"""{self._system_prompt}

=== AVAILABLE PACKAGES ===
{packages_context}
=== END CONTEXT ===

Customer message: {user_message}

Instructions:
1. If asking about packages, reference the available packages
2. Be friendly and helpful, using "Kia Ora" naturally
3. Keep response concise (2-3 paragraphs max)
4. If unsure, say so and offer alternatives

Your response:"""

            response = model.generate_content(prompt)
            return response.text

        except Exception as e:
            print(f"Error generating Gemini response: {e}")
            return self._get_fallback_response(user_message)

    def _get_fallback_response(self, user_message: str) -> str:
        """Provide fallback response when Gemini is unavailable."""
        message_lower = user_message.lower()

        # Keyword-based fallback
        if any(word in message_lower for word in ["hello", "hi", "hey", "kia ora"]):
            return "Kia Ora! Welcome to NZ Tours. I'm here to help you plan your perfect New Zealand adventure. Feel free to ask about destinations, activities, booking policies, or anything else about traveling in New Zealand!"

        if any(word in message_lower for word in ["book", "booking", "reserve", "reservation"]):
            return "Kia Ora! To book a tour, you can browse our packages and click 'Inquire Now', or use our custom trip planner. We require a 20% deposit to secure your booking, with the balance due 30 days before departure. Would you like help finding the perfect package?"

        if any(word in message_lower for word in ["cancel", "refund", "policy"]):
            return "Our cancellation policy offers: Full refund (minus processing fee) if cancelled 30+ days before departure, 50% refund for 15-29 days, and no refund for less than 15 days. We strongly recommend travel insurance. Would you like more details?"

        if any(word in message_lower for word in ["price", "cost", "expensive", "cheap", "budget"]):
            return "Kia Ora! Our packages range from budget-friendly options around $500-1,500 NZD to luxury experiences at $5,000+ NZD per person. Prices include accommodation, transportation, activities, and most meals. Would you like me to help find packages in your budget range?"

        if any(word in message_lower for word in ["weather", "season", "when", "best time"]):
            return "Kia Ora! The best time depends on your interests: Summer (Dec-Feb) for beaches and hiking, Winter (Jun-Aug) for skiing, and Autumn/Spring for fewer crowds and beautiful scenery. Would you like specific recommendations for your travel dates?"

        if any(word in message_lower for word in ["queenstown", "adventure", "bungee", "skydive"]):
            return "Kia Ora! Queenstown is the adventure capital of the world! From bungee jumping at Kawarau Bridge to skydiving with mountain views, it's perfect for thrill-seekers. Our adventure packages include these activities plus stunning Milford Sound trips. Interested in our Queenstown packages?"

        if any(word in message_lower for word in ["hobbit", "lord of the rings", "movie", "film"]):
            return "Kia Ora, fellow Tolkien fan! Hobbiton in Matamata is absolutely magical - you can walk through the Shire and even have a drink at the Green Dragon Inn! Our packages include guided tours of the movie set. Would you like details?"

        if any(word in message_lower for word in ["whale", "dolphin", "wildlife", "animal"]):
            return "Kia Ora! New Zealand has incredible wildlife! Kaikoura is famous for whale watching (95% success rate!), and you can swim with dolphins too. We also have tours to see penguins in Oamaru. Would you like to see our wildlife packages?"

        if any(word in message_lower for word in ["food", "wine", "eat", "restaurant"]):
            return "Kia Ora! New Zealand has amazing food and wine! The Marlborough and Central Otago regions produce world-class wines. Our culinary tours include vineyard visits, farm-to-table dining, and cooking experiences. Shall I show you our food & wine packages?"

        return "Kia Ora! Thanks for your message. I'm here to help with anything about New Zealand travel - destinations, activities, booking, or trip planning. What would you like to know? You can also browse our packages or use the custom trip planner!"


# Singleton instance
gemini_service = GeminiService()
