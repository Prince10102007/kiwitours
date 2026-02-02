"""Package endpoints."""

from fastapi import APIRouter, HTTPException

from ..models.schemas import Package, PackageFilter
from ..services.sheets_service import sheets_service
from ..services.recommendation import recommendation_service

router = APIRouter(prefix="/api/packages", tags=["packages"])


@router.get("", response_model=list[Package])
async def get_packages():
    """Get all active packages."""
    packages = sheets_service.get_packages()
    return packages


@router.get("/{package_id}", response_model=Package)
async def get_package(package_id: str):
    """Get a specific package by ID."""
    packages = sheets_service.get_packages()
    for package in packages:
        if package.id == package_id:
            return package
    raise HTTPException(status_code=404, detail="Package not found")


@router.post("/filter", response_model=list[Package])
async def filter_packages(filters: PackageFilter):
    """Filter packages by criteria."""
    packages = sheets_service.get_packages()
    filtered = recommendation_service.filter_packages(packages, filters)
    return filtered
