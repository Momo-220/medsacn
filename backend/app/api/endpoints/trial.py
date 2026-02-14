"""
Trial Endpoints
One-time trial per device
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import structlog

from app.services.auth_service import get_current_user_optional
from app.services.trial_service import has_used_trial, register_trial_device

logger = structlog.get_logger()

router = APIRouter()


class TrialCheckRequest(BaseModel):
    device_id: str


class TrialCheckResponse(BaseModel):
    can_use_trial: bool
    reason: Optional[str] = None


class TrialRegisterRequest(BaseModel):
    device_id: str


class TrialRegisterResponse(BaseModel):
    ok: bool


@router.post("/check", response_model=TrialCheckResponse)
async def check_trial(body: TrialCheckRequest) -> TrialCheckResponse:
    """
    Check if device can use trial (not yet used).
    """
    if not body.device_id or len(body.device_id) < 10:
        return TrialCheckResponse(can_use_trial=False, reason="device_id_invalid")
    used = has_used_trial(body.device_id)
    return TrialCheckResponse(can_use_trial=not used)


@router.post("/register", response_model=TrialRegisterResponse)
async def register_trial(
    body: TrialRegisterRequest,
    user: Optional[dict] = Depends(get_current_user_optional),
) -> TrialRegisterResponse:
    """
    Register device as having used trial (called when user starts trial).
    """
    if not body.device_id or len(body.device_id) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="device_id requis",
        )
    user_id = user["uid"] if user else "anonymous"
    register_trial_device(body.device_id, user_id)
    return TrialRegisterResponse(ok=True)
