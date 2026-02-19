"""
History Endpoints
User's scan and interaction history
"""

from fastapi import APIRouter, Depends, Query
from typing import Dict, Any
import structlog

from app.models.schemas import HistoryResponse, ScanHistoryItem
from app.services.auth_service import get_current_user, require_full_account
from app.services.scan_history_service import scan_history_service

logger = structlog.get_logger()

router = APIRouter()


@router.get("", response_model=HistoryResponse)
async def get_history(
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    page: int = Query(1, ge=1, description="Page number"),
    user: Dict[str, Any] = Depends(require_full_account),
) -> HistoryResponse:
    """
    📚 Get scan history
    
    Retrieve your medication scan history.
    Results are ordered by most recent first.
    
    **Use cases:**
    - Review past scans
    - Track medication changes
    - Access previous analysis
    """
    
    user_id = user["uid"]
    logger.info("Retrieving scan history", user_id=user_id, limit=limit, page=page)
    
    # Calculate offset for pagination
    offset = (page - 1) * limit
    
    # Get history from PostgreSQL
    history_data = scan_history_service.get_user_history(
        user_id=user_id,
        limit=limit,
        offset=offset,
    )
    
    # Get total count for pagination
    total_count = scan_history_service.get_scan_count(user_id)
    
    # Convert to response format with full data
    scans = []
    for item in history_data:
        # Extraire analysis_data si c'est une string JSON
        analysis_data = item.get("analysis_data")
        if isinstance(analysis_data, str):
            import json
            try:
                analysis_data = json.loads(analysis_data)
            except:
                analysis_data = {}
        
        scans.append(
            ScanHistoryItem(
                id=item.get("scan_id", item.get("id")),
                scan_id=item.get("scan_id", item.get("id")),
                medication_name=item.get("medication_name", "Unknown"),
                generic_name=item.get("generic_name") or (analysis_data.get("generic_name") if analysis_data else None),
                dosage=item.get("dosage"),
                form=item.get("form"),
                category=item.get("category", "Unknown"),
                manufacturer=item.get("manufacturer") or (analysis_data.get("manufacturer") if analysis_data else None),
                packaging_language=item.get("packaging_language") or (analysis_data.get("packaging_language") if analysis_data else "fr"),
                image_url=item.get("image_url"),
                confidence=item.get("confidence", "medium"),
                scanned_at=item.get("created_at"),
                analysis_data=analysis_data,
                warnings=item.get("warnings"),
                contraindications=item.get("contraindications"),
                interactions=item.get("interactions"),
                side_effects=item.get("side_effects"),
                disclaimer=analysis_data.get("disclaimer", "⚕️ Ceci est uniquement à titre informatif.") if analysis_data else "⚕️ Ceci est uniquement à titre informatif.",
            )
        )
    
    logger.info("History retrieved from MongoDB", 
                user_id=user_id, 
                count=len(scans),
                total=total_count)
    
    return HistoryResponse(
        scans=scans,
        count=len(scans),
        total=total_count,
        page=page,
        per_page=limit,
    )


