"""Knowledge base management endpoints."""

import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.rag_service import rag_service

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class FAQItem(BaseModel):
    """FAQ entry."""
    question: str
    answer: str


class DestinationItem(BaseModel):
    """Destination entry."""
    name: str
    region: str
    description: str
    highlights: list[str]
    best_for: list[str]


class ActivityItem(BaseModel):
    """Activity entry."""
    name: str
    location: str
    description: str
    price_range: str
    duration: str
    difficulty: str


class DocumentItem(BaseModel):
    """Generic document for RAG."""
    id: str
    content: str
    doc_type: str


class BulkAddRequest(BaseModel):
    """Request to add multiple items."""
    faqs: Optional[list[FAQItem]] = None
    destinations: Optional[list[DestinationItem]] = None
    activities: Optional[list[ActivityItem]] = None


@router.post("/initialize")
async def initialize_rag(force_rebuild: bool = False):
    """Initialize or rebuild the RAG index."""
    success = rag_service.initialize(force_rebuild=force_rebuild)
    if success:
        return {"status": "success", "message": "RAG system initialized successfully"}
    raise HTTPException(status_code=500, detail="Failed to initialize RAG system")


@router.get("/search")
async def search_knowledge(query: str, n_results: int = 5):
    """Search the knowledge base."""
    results = rag_service.retrieve(query, n_results=n_results)
    return {"query": query, "results": results}


@router.post("/faq")
async def add_faq(faq: FAQItem):
    """Add a new FAQ to the knowledge base."""
    try:
        kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"

        with open(kb_path, 'r', encoding='utf-8') as f:
            kb = json.load(f)

        if "faqs" not in kb:
            kb["faqs"] = []

        kb["faqs"].append({"question": faq.question, "answer": faq.answer})

        with open(kb_path, 'w', encoding='utf-8') as f:
            json.dump(kb, f, indent=2, ensure_ascii=False)

        # Rebuild RAG index
        rag_service.initialize(force_rebuild=True)

        return {"status": "success", "message": "FAQ added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/destination")
async def add_destination(destination: DestinationItem):
    """Add a new destination to the knowledge base."""
    try:
        kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"

        with open(kb_path, 'r', encoding='utf-8') as f:
            kb = json.load(f)

        if "destinations" not in kb:
            kb["destinations"] = []

        kb["destinations"].append(destination.model_dump())

        with open(kb_path, 'w', encoding='utf-8') as f:
            json.dump(kb, f, indent=2, ensure_ascii=False)

        rag_service.initialize(force_rebuild=True)

        return {"status": "success", "message": "Destination added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/activity")
async def add_activity(activity: ActivityItem):
    """Add a new activity to the knowledge base."""
    try:
        kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"

        with open(kb_path, 'r', encoding='utf-8') as f:
            kb = json.load(f)

        if "activities" not in kb:
            kb["activities"] = []

        kb["activities"].append(activity.model_dump())

        with open(kb_path, 'w', encoding='utf-8') as f:
            json.dump(kb, f, indent=2, ensure_ascii=False)

        rag_service.initialize(force_rebuild=True)

        return {"status": "success", "message": "Activity added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/document")
async def add_document(doc: DocumentItem):
    """Add a generic document to RAG index."""
    success = rag_service.add_document(
        doc_id=doc.id,
        content=doc.content,
        metadata={"type": doc.doc_type}
    )
    if success:
        return {"status": "success", "message": "Document added successfully"}
    raise HTTPException(status_code=500, detail="Failed to add document")


@router.post("/bulk")
async def bulk_add(request: BulkAddRequest):
    """Add multiple items to knowledge base."""
    try:
        kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"

        with open(kb_path, 'r', encoding='utf-8') as f:
            kb = json.load(f)

        added = {"faqs": 0, "destinations": 0, "activities": 0}

        if request.faqs:
            if "faqs" not in kb:
                kb["faqs"] = []
            for faq in request.faqs:
                kb["faqs"].append({"question": faq.question, "answer": faq.answer})
                added["faqs"] += 1

        if request.destinations:
            if "destinations" not in kb:
                kb["destinations"] = []
            for dest in request.destinations:
                kb["destinations"].append(dest.model_dump())
                added["destinations"] += 1

        if request.activities:
            if "activities" not in kb:
                kb["activities"] = []
            for activity in request.activities:
                kb["activities"].append(activity.model_dump())
                added["activities"] += 1

        with open(kb_path, 'w', encoding='utf-8') as f:
            json.dump(kb, f, indent=2, ensure_ascii=False)

        rag_service.initialize(force_rebuild=True)

        return {"status": "success", "added": added}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_knowledge_stats():
    """Get knowledge base statistics."""
    try:
        kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"

        with open(kb_path, 'r', encoding='utf-8') as f:
            kb = json.load(f)

        stats = {
            "faqs": len(kb.get("faqs", [])),
            "destinations": len(kb.get("destinations", [])),
            "activities": len(kb.get("activities", [])),
            "has_company_info": "company_info" in kb,
            "has_policies": "policies" in kb,
            "seasons_documented": len(kb.get("seasonal_tips", {})),
        }

        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
async def export_knowledge():
    """Export the entire knowledge base."""
    try:
        kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"

        with open(kb_path, 'r', encoding='utf-8') as f:
            kb = json.load(f)

        return kb
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
