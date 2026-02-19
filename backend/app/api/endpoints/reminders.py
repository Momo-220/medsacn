"""
Medication Reminders Endpoints
Persisted in MongoDB
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import structlog

from app.models.schemas import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    RemindersListResponse,
    ReminderTakeRequest,
    ReminderTakeResponse,
)
from app.services.auth_service import require_full_account
from app.services.reminders_service import (
    calculate_next_dose,
    create_reminder as svc_create,
    get_reminders as svc_get_all,
    count_medications_taken_today,
    get_reminder_by_id,
    update_reminder as svc_update,
    delete_reminder as svc_delete,
    mark_taken as svc_mark_taken,
    _to_response,
)

logger = structlog.get_logger()

router = APIRouter()


@router.post("", response_model=ReminderResponse, status_code=201)
async def create_reminder(
    reminder: ReminderCreate,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderResponse:
    user_id = user["uid"]
    logger.info("Creating reminder", user_id=user_id, medication=reminder.medication_name)
    try:
        data = reminder.model_dump()
        doc = svc_create(user_id, data)
        logger.info("Reminder created in DB", reminder_id=doc["id"])
        return ReminderResponse(**_to_response(doc))
    except Exception as e:
        logger.error("Failed to create reminder", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create reminder")


@router.get("", response_model=RemindersListResponse)
async def get_reminders(
    user: Dict[str, Any] = Depends(require_full_account),
    active_only: bool = Query(True, description="Only return active reminders"),
    limit: int = Query(50, ge=1, le=100),
) -> RemindersListResponse:
    user_id = user["uid"]
    logger.info("Fetching reminders", user_id=user_id, active_only=active_only)
    try:
        reminders = svc_get_all(user_id, active_only=active_only, limit=limit)
        medications_taken_today = count_medications_taken_today(user_id)
        result = [ReminderResponse(**_to_response(r)) for r in reminders]
        logger.info("Reminders fetched", count=len(result), medications_taken_today=medications_taken_today)
        return RemindersListResponse(
            reminders=result,
            count=len(result),
            medications_taken_today=medications_taken_today,
        )
    except Exception as e:
        logger.error("Failed to fetch reminders", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch reminders")


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(
    reminder_id: str,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderResponse:
    user_id = user["uid"]
    doc = get_reminder_by_id(reminder_id, user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return ReminderResponse(**_to_response(doc))


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str,
    update: ReminderUpdate,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderResponse:
    user_id = user["uid"]
    logger.info("Updating reminder", reminder_id=reminder_id, user_id=user_id)
    try:
        update_data = update.model_dump(exclude_unset=True)
        doc = svc_update(reminder_id, user_id, update_data)
        if not doc:
            raise HTTPException(status_code=404, detail="Reminder not found")
        logger.info("Reminder updated", reminder_id=reminder_id)
        return ReminderResponse(**_to_response(doc))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update reminder", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update reminder")


@router.delete("/{reminder_id}", status_code=204)
async def delete_reminder(
    reminder_id: str,
    user: Dict[str, Any] = Depends(require_full_account),
):
    user_id = user["uid"]
    logger.info("Deleting reminder", reminder_id=reminder_id, user_id=user_id)
    if not svc_delete(reminder_id, user_id):
        raise HTTPException(status_code=404, detail="Reminder not found")
    logger.info("Reminder deleted", reminder_id=reminder_id)
    return None


@router.post("/{reminder_id}/take", response_model=ReminderTakeResponse)
async def mark_reminder_taken(
    reminder_id: str,
    take_request: ReminderTakeRequest,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderTakeResponse:
    user_id = user["uid"]
    logger.info("Marking reminder as taken", reminder_id=reminder_id, user_id=user_id)
    try:
        taken_at = take_request.taken_at or datetime.utcnow()
        next_dose = svc_mark_taken(reminder_id, user_id, taken_at)
        if next_dose is None:
            raise HTTPException(status_code=404, detail="Reminder not found")
        logger.info("Reminder marked as taken", reminder_id=reminder_id, next_dose=next_dose)
        return ReminderTakeResponse(
            message="Prise enregistrée avec succès",
            reminder_id=reminder_id,
            taken_at=taken_at,
            next_dose=next_dose,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to mark reminder as taken", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark reminder as taken")
