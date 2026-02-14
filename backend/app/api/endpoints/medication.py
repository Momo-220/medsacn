"""
Medication Endpoints
Medication database access
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
import structlog

from app.models.schemas import MedicationDetail
from app.services.auth_service import get_current_user

logger = structlog.get_logger()

router = APIRouter()


@router.get("/{medication_id}", response_model=MedicationDetail)
async def get_medication(
    medication_id: str,
    user: Dict[str, Any] = Depends(get_current_user),
) -> MedicationDetail:
    """
    💊 Get detailed medication information
    
    Retrieve comprehensive information about a specific medication.
    
    **Information includes:**
    - Generic and brand names
    - Dosage forms and strengths
    - Usage instructions
    - Warnings and contraindications
    - Drug interactions
    - Storage conditions
    """
    
    user_id = user["uid"]
    logger.info("Medication details requested", user_id=user_id, medication_id=medication_id)
    
    # TODO: Implement medication database lookup
    # For now, return placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Medication database coming soon",
    )


@router.get("/search/{query}")
async def search_medications(
    query: str,
    limit: int = 10,
    user: Dict[str, Any] = Depends(get_current_user),
):
    """
    🔍 Search medications by name
    
    Search for medications in the database.
    Useful for finding alternatives or checking specific medications.
    """
    
    user_id = user["uid"]
    logger.info("Medication search", user_id=user_id, query=query)
    
    # TODO: Implement medication search
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Search functionality coming soon",
    )

