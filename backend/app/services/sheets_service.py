"""Google Sheets integration service."""

import base64
import json
import time
from typing import Optional

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from ..config import get_settings
from ..models.schemas import Package


class SheetsService:
    """Service for fetching data from Google Sheets."""

    SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

    def __init__(self):
        self._service = None
        self._cache: Optional[list[Package]] = None
        self._cache_time: float = 0
        self._settings = get_settings()

    def _get_service(self):
        """Get or create Google Sheets API service."""
        if self._service is None:
            try:
                # Decode base64 service account key
                key_json = base64.b64decode(self._settings.google_service_account_key)
                key_dict = json.loads(key_json)

                credentials = Credentials.from_service_account_info(
                    key_dict, scopes=self.SCOPES
                )
                self._service = build("sheets", "v4", credentials=credentials)
            except Exception as e:
                print(f"Error initializing Sheets service: {e}")
                return None
        return self._service

    def _parse_list(self, value: str) -> list[str]:
        """Parse a comma-separated or newline-separated string into a list."""
        if not value:
            return []
        # Handle both comma and newline separators
        items = value.replace("\n", ",").split(",")
        return [item.strip() for item in items if item.strip()]

    def _parse_package(self, row: list, headers: list[str]) -> Optional[Package]:
        """Parse a row into a Package object."""
        try:
            # Create a dict from headers and row values
            data = {}
            for i, header in enumerate(headers):
                data[header.lower().replace(" ", "_")] = row[i] if i < len(row) else ""

            # Parse group size (format: "2-8" or "2")
            group_size = data.get("group_size", "1-10")
            if "-" in str(group_size):
                parts = str(group_size).split("-")
                group_min = int(parts[0])
                group_max = int(parts[1])
            else:
                group_min = group_max = int(group_size) if group_size else 1

            return Package(
                id=str(data.get("id", "")),
                name=str(data.get("name", "")),
                region=str(data.get("region", "Both")),
                type=str(data.get("type", "Mixed")),
                duration=int(data.get("duration", 1)),
                price=float(data.get("price", 0)),
                group_size_min=group_min,
                group_size_max=group_max,
                description=str(data.get("description", "")),
                highlights=self._parse_list(str(data.get("highlights", ""))),
                itinerary=self._parse_list(str(data.get("itinerary", ""))),
                inclusions=self._parse_list(str(data.get("inclusions", ""))),
                exclusions=self._parse_list(str(data.get("exclusions", ""))),
                image_url=str(data.get("image_url", "")),
                gallery=self._parse_list(str(data.get("gallery", ""))),
                season=self._parse_list(str(data.get("season", "All"))),
                status=str(data.get("status", "Active")),
            )
        except Exception as e:
            print(f"Error parsing package row: {e}")
            return None

    def get_packages(self, force_refresh: bool = False) -> list[Package]:
        """Get all packages from Google Sheets with caching."""
        current_time = time.time()
        cache_valid = (
            self._cache is not None
            and (current_time - self._cache_time) < self._settings.cache_ttl_seconds
        )

        if cache_valid and not force_refresh:
            return self._cache

        service = self._get_service()
        if service is None:
            # Return demo packages if sheets not configured
            return self._get_demo_packages()

        try:
            sheet = service.spreadsheets()
            result = sheet.values().get(
                spreadsheetId=self._settings.google_sheets_id,
                range="A:P"  # All columns
            ).execute()

            values = result.get("values", [])
            if not values:
                return self._get_demo_packages()

            headers = values[0]
            packages = []

            for row in values[1:]:
                package = self._parse_package(row, headers)
                if package and package.status.lower() == "active":
                    packages.append(package)

            self._cache = packages
            self._cache_time = current_time

            # If no active packages found but sheet was accessible, return empty (not demo)
            if not packages:
                print("No active packages found in Google Sheet")
            return packages

        except Exception as e:
            print(f"Error fetching from sheets: {e}")
            # Only return demo packages if sheets is not configured
            if not self._settings.google_sheets_id or not self._settings.google_service_account_key:
                return self._get_demo_packages()
            # If configured but error occurred, return empty to indicate issue
            return []

    def _get_demo_packages(self) -> list[Package]:
        """Return demo packages when sheets not available."""
        return [
            Package(
                id="1",
                name="Hobbiton & Rotorua Adventure",
                region="North Island",
                type="Culture",
                duration=3,
                price=1299,
                group_size_min=2,
                group_size_max=12,
                description="Experience the magic of Middle-earth at Hobbiton before exploring Rotorua's geothermal wonders and Maori culture.",
                highlights=["Hobbiton Movie Set Tour", "Te Puia Geothermal Valley", "Maori Cultural Performance", "Wai-O-Tapu Thermal Wonderland"],
                itinerary=["Day 1: Auckland to Hobbiton, evening in Rotorua", "Day 2: Te Puia & Maori village experience", "Day 3: Wai-O-Tapu and return to Auckland"],
                inclusions=["Accommodation", "Transport", "Hobbiton entry", "Te Puia entry", "Maori hangi dinner"],
                exclusions=["Flights", "Personal expenses", "Travel insurance"],
                image_url="https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800",
                gallery=["https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800"],
                season=["All Year"],
                status="Active",
            ),
            Package(
                id="2",
                name="South Island Explorer",
                region="South Island",
                type="Adventure",
                duration=7,
                price=3499,
                group_size_min=2,
                group_size_max=8,
                description="Journey through the stunning landscapes of the South Island, from Queenstown's adventure capital to Milford Sound's majestic fjords.",
                highlights=["Queenstown Adventure Activities", "Milford Sound Cruise", "Franz Josef Glacier", "Mount Cook National Park"],
                itinerary=["Day 1: Arrive Queenstown", "Day 2: Adventure activities", "Day 3: Milford Sound cruise", "Day 4: Te Anau to Franz Josef", "Day 5: Glacier exploration", "Day 6: Mount Cook", "Day 7: Christchurch departure"],
                inclusions=["6 nights accommodation", "All transport", "Milford Sound cruise", "Glacier walk", "Breakfast daily"],
                exclusions=["Flights", "Lunches and dinners", "Optional activities", "Travel insurance"],
                image_url="https://images.unsplash.com/photo-1469521669194-babb45599def?w=800",
                gallery=["https://images.unsplash.com/photo-1508193638397-1c4234db14d9?w=800"],
                season=["Summer", "Autumn"],
                status="Active",
            ),
            Package(
                id="3",
                name="Ultimate NZ Experience",
                region="Both",
                type="Mixed",
                duration=14,
                price=6999,
                group_size_min=2,
                group_size_max=6,
                description="The complete New Zealand journey covering both islands' must-see destinations with luxury accommodation.",
                highlights=["Auckland City", "Waitomo Caves", "Rotorua", "Wellington", "Queenstown", "Milford Sound", "Christchurch"],
                itinerary=["Days 1-2: Auckland exploration", "Day 3: Waitomo glowworm caves", "Days 4-5: Rotorua adventures", "Day 6: Wellington city", "Day 7: Flight to Queenstown", "Days 8-10: Queenstown & surrounds", "Day 11: Milford Sound", "Days 12-13: West Coast glaciers", "Day 14: Christchurch departure"],
                inclusions=["13 nights luxury accommodation", "All transport including domestic flight", "All major attractions", "Daily breakfast", "Selected dinners"],
                exclusions=["International flights", "Travel insurance", "Personal expenses"],
                image_url="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800",
                gallery=["https://images.unsplash.com/photo-1513996203842-5dbed7b87c70?w=800"],
                season=["All Year"],
                status="Active",
            ),
            Package(
                id="4",
                name="Wine & Dine South Island",
                region="South Island",
                type="Food",
                duration=5,
                price=2799,
                group_size_min=2,
                group_size_max=10,
                description="A culinary journey through New Zealand's finest wine regions with gourmet dining experiences.",
                highlights=["Marlborough Wine Tours", "Gourmet Restaurant Experiences", "Central Otago Wineries", "Cheese and Olive Tastings"],
                itinerary=["Day 1: Arrive Blenheim, Marlborough wines", "Day 2: More Marlborough exploration", "Day 3: Travel to Central Otago", "Day 4: Queenstown wineries", "Day 5: Final tastings and departure"],
                inclusions=["4 nights boutique accommodation", "All wine tastings", "3 gourmet dinners", "Private transport", "Expert wine guide"],
                exclusions=["Flights", "Lunches", "Wine purchases", "Travel insurance"],
                image_url="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
                gallery=["https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800"],
                season=["Autumn", "Spring"],
                status="Active",
            ),
            Package(
                id="5",
                name="Wildlife & Nature Escape",
                region="South Island",
                type="Nature",
                duration=6,
                price=2299,
                group_size_min=1,
                group_size_max=8,
                description="Get up close with New Zealand's unique wildlife including penguins, seals, and dolphins.",
                highlights=["Kaikoura Whale Watching", "Oamaru Blue Penguins", "Dunedin Wildlife", "Otago Peninsula"],
                itinerary=["Day 1: Christchurch to Kaikoura", "Day 2: Whale watching & seals", "Day 3: Travel to Oamaru", "Day 4: Blue penguin colony", "Day 5: Dunedin & Otago Peninsula", "Day 6: Return to Christchurch"],
                inclusions=["5 nights accommodation", "Whale watching tour", "Penguin colony entry", "Wildlife tours", "Transport"],
                exclusions=["Flights", "Meals", "Travel insurance"],
                image_url="https://images.unsplash.com/photo-1551085254-e96b210db58a?w=800",
                gallery=["https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800"],
                season=["All Year"],
                status="Active",
            ),
            Package(
                id="6",
                name="Adrenaline Junkie Package",
                region="South Island",
                type="Adventure",
                duration=4,
                price=1999,
                group_size_min=1,
                group_size_max=6,
                description="Non-stop adventure in Queenstown - the adventure capital of the world!",
                highlights=["Bungee Jumping", "Skydiving", "Jet Boating", "Canyon Swing"],
                itinerary=["Day 1: Arrive, settle in, canyon swing", "Day 2: Skydiving & jet boat", "Day 3: Bungee & luge", "Day 4: White water rafting & departure"],
                inclusions=["3 nights accommodation", "All activities listed", "Transport to activities", "GoPro footage"],
                exclusions=["Flights", "Meals", "Travel insurance"],
                image_url="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800",
                gallery=["https://images.unsplash.com/photo-1601024445121-e5b839abd215?w=800"],
                season=["All Year"],
                status="Active",
            ),
        ]


# Singleton instance
sheets_service = SheetsService()
