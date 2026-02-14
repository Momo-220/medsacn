"""
Feedback Endpoints
User feedback and ratings
"""

from fastapi import APIRouter, Depends, status
from typing import Dict, Any
import structlog

from app.models.schemas import FeedbackRequest, FeedbackResponse
from app.services.auth_service import get_current_user
from app.services.firebase_service import firebase_service

logger = structlog.get_logger()

router = APIRouter()


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback: FeedbackRequest,
    user: Dict[str, Any] = Depends(get_current_user),
) -> FeedbackResponse:
    """
    💙 Submit feedback
    
    Help us improve MediScan by sharing your experience.
    
    **Feedback types:**
    - `helpful`: Information was accurate and useful
    - `incorrect`: Information was wrong or misleading
    - `unclear`: Information was confusing
    - `other`: General feedback or suggestions
    
    Your feedback helps us:
    - Improve AI accuracy
    - Enhance user experience
    - Add new features
    - Build trust and safety
    """
    
    user_id = user["uid"]
    logger.info(
        "Feedback received",
        user_id=user_id,
        type=feedback.feedback_type,
        rating=feedback.rating,
    )
    
    # Save feedback to Firestore
    feedback_data = {
        "scan_id": feedback.scan_id,
        "rating": feedback.rating,
        "feedback_type": feedback.feedback_type,
        "comment": feedback.comment,
    }
    
    feedback_id = await firebase_service.save_chat_message(
        user_id=user_id,
        message={
            "type": "feedback",
            **feedback_data,
        },
    )
    
    logger.info("Feedback saved", feedback_id=feedback_id)
    
    return FeedbackResponse(
        success=True,
        message="Thank you for your feedback! 💙",
        feedback_id=feedback_id,
    )


