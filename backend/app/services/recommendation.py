"""Package recommendation and filtering service."""

from typing import Optional

from ..models.schemas import Package, PackageFilter


class RecommendationService:
    """Service for filtering and recommending packages."""

    def filter_packages(
        self,
        packages: list[Package],
        filters: PackageFilter
    ) -> list[Package]:
        """Filter packages based on criteria."""
        filtered = packages.copy()

        if filters.region:
            region = filters.region.lower()
            if region != "both":
                filtered = [
                    p for p in filtered
                    if p.region.lower() == region or p.region.lower() == "both"
                ]

        if filters.type:
            pkg_type = filters.type.lower()
            if pkg_type != "mixed":
                filtered = [
                    p for p in filtered
                    if p.type.lower() == pkg_type or p.type.lower() == "mixed"
                ]

        if filters.duration_min is not None:
            filtered = [p for p in filtered if p.duration >= filters.duration_min]

        if filters.duration_max is not None:
            filtered = [p for p in filtered if p.duration <= filters.duration_max]

        if filters.budget_min is not None:
            filtered = [p for p in filtered if p.price >= filters.budget_min]

        if filters.budget_max is not None:
            filtered = [p for p in filtered if p.price <= filters.budget_max]

        if filters.group_size is not None:
            filtered = [
                p for p in filtered
                if p.group_size_min <= filters.group_size <= p.group_size_max
            ]

        return filtered

    def get_recommendations(
        self,
        packages: list[Package],
        selections: dict
    ) -> list[Package]:
        """Get recommended packages based on user selections from flow."""
        # Map flow selections to filter criteria
        filters = PackageFilter()

        # Region mapping
        region = selections.get("destination")
        if region:
            region_map = {
                "north": "North Island",
                "south": "South Island",
                "both": "Both",
            }
            filters.region = region_map.get(region.lower())

        # Type mapping
        trip_type = selections.get("trip_type")
        if trip_type:
            type_map = {
                "adventure": "Adventure",
                "culture": "Culture",
                "nature": "Nature",
                "food": "Food",
                "mixed": "Mixed",
            }
            filters.type = type_map.get(trip_type.lower())

        # Duration mapping
        duration = selections.get("duration")
        if duration:
            duration_ranges = {
                "short": (3, 5),
                "week": (6, 8),
                "two_weeks": (12, 16),
            }
            if duration.lower() in duration_ranges:
                filters.duration_min, filters.duration_max = duration_ranges[duration.lower()]

        # Budget mapping
        budget = selections.get("budget")
        if budget:
            budget_ranges = {
                "budget": (500, 1500),
                "mid": (1500, 3000),
                "premium": (3000, 5000),
                "luxury": (5000, 20000),
            }
            if budget.lower() in budget_ranges:
                filters.budget_min, filters.budget_max = budget_ranges[budget.lower()]

        # Group size mapping
        group = selections.get("group_size")
        if group:
            group_sizes = {
                "solo": 1,
                "couple": 2,
                "small": 4,
                "large": 8,
            }
            filters.group_size = group_sizes.get(group.lower())

        # Apply filters
        recommended = self.filter_packages(packages, filters)

        # Sort by relevance (price for now, could be more sophisticated)
        recommended.sort(key=lambda p: p.price)

        return recommended

    def calculate_match_score(
        self,
        package: Package,
        selections: dict
    ) -> float:
        """Calculate how well a package matches user selections."""
        score = 0.0
        total_weight = 0.0

        # Region match (weight: 2)
        region = selections.get("destination")
        if region:
            total_weight += 2
            if package.region.lower() == region.lower() or package.region.lower() == "both":
                score += 2
            elif region.lower() == "both":
                score += 1.5  # Any region is acceptable

        # Type match (weight: 2)
        trip_type = selections.get("trip_type")
        if trip_type:
            total_weight += 2
            if package.type.lower() == trip_type.lower():
                score += 2
            elif package.type.lower() == "mixed":
                score += 1  # Mixed packages partially match

        # Duration match (weight: 1.5)
        duration = selections.get("duration")
        if duration:
            total_weight += 1.5
            duration_ranges = {
                "short": (3, 5),
                "week": (6, 8),
                "two_weeks": (12, 16),
            }
            if duration.lower() in duration_ranges:
                min_d, max_d = duration_ranges[duration.lower()]
                if min_d <= package.duration <= max_d:
                    score += 1.5
                elif abs(package.duration - (min_d + max_d) / 2) <= 2:
                    score += 0.75  # Close enough

        # Budget match (weight: 1.5)
        budget = selections.get("budget")
        if budget:
            total_weight += 1.5
            budget_ranges = {
                "budget": (500, 1500),
                "mid": (1500, 3000),
                "premium": (3000, 5000),
                "luxury": (5000, 20000),
            }
            if budget.lower() in budget_ranges:
                min_b, max_b = budget_ranges[budget.lower()]
                if min_b <= package.price <= max_b:
                    score += 1.5
                elif package.price < min_b:
                    score += 1  # Under budget is still good

        if total_weight == 0:
            return 1.0  # No criteria, everything matches

        return score / total_weight


# Singleton instance
recommendation_service = RecommendationService()
