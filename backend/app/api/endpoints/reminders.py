"""
Medication Reminders Endpoints
Manage medication reminders and adherence tracking
Persisted in PostgreSQL/SQLite via SQLAlchemy
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import structlog
import uuid

from app.models.schemas import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    RemindersListResponse,
    ReminderTakeRequest,
    ReminderTakeResponse
)
from app.services.auth_service import get_current_user, require_full_account
from app.models.database import get_db_context
from app.models.medication import Reminder, ReminderTake

logger = structlog.get_logger()

router = APIRouter()


def calculate_next_dose(time_str: str, frequency: str, days: Optional[List[int]] = None) -> datetime:
    """Calculate the next dose time based on frequency"""
    now = datetime.now()
    hour, minute = map(int, time_str.split(':'))
    
    next_dose = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    if next_dose <= now:
        next_dose += timedelta(days=1)
    
    return next_dose


@router.post("", response_model=ReminderResponse, status_code=201)
async def create_reminder(
    reminder: ReminderCreate,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderResponse:
    """Create a new medication reminder (persisted in DB)"""
    user_id = user["uid"]
    logger.info("Creating reminder", user_id=user_id, medication=reminder.medication_name)
    
    try:
        reminder_id = str(uuid.uuid4())
        now = datetime.utcnow()
        next_dose = calculate_next_dose(reminder.time, reminder.frequency, reminder.days)
        
        with get_db_context() as db:
            db_reminder = Reminder(
                id=reminder_id,
                user_id=user_id,
                medication_name=reminder.medication_name,
                dosage=reminder.dosage,
                time=reminder.time,
                frequency=reminder.frequency,
                days=reminder.days,
                notes=reminder.notes,
                active=True,
                next_dose=next_dose,
                created_at=now,
                updated_at=now,
            )
            db.add(db_reminder)
        
        logger.info("Reminder created in DB", reminder_id=reminder_id)
        
        return ReminderResponse(
            id=reminder_id,
            medication_name=reminder.medication_name,
            dosage=reminder.dosage,
            time=reminder.time,
            frequency=reminder.frequency,
            days=reminder.days,
            notes=reminder.notes,
            active=True,
            next_dose=next_dose,
            created_at=now,
            updated_at=now,
        )
        
    except Exception as e:
        logger.error("Failed to create reminder", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create reminder")


@router.get("", response_model=RemindersListResponse)
async def get_reminders(
    user: Dict[str, Any] = Depends(require_full_account),
    active_only: bool = Query(True, description="Only return active reminders"),
    limit: int = Query(50, ge=1, le=100)
) -> RemindersListResponse:
    """Get all reminders for the current user (from DB)"""
    user_id = user["uid"]
    logger.info("Fetching reminders", user_id=user_id, active_only=active_only)
    
    try:
        with get_db_context() as db:
            query = db.query(Reminder).filter(Reminder.user_id == user_id)
            
            if active_only:
                query = query.filter(Reminder.active == True)
            
            reminders = query.order_by(Reminder.next_dose.asc()).limit(limit).all()
            
            # Compter les prises d'aujourd'hui pour les statistiques
            today_start = datetime.combine(date.today(), datetime.min.time())
            today_end = datetime.combine(date.today(), datetime.max.time())
            medications_taken_today = db.query(ReminderTake).filter(
                ReminderTake.user_id == user_id,
                ReminderTake.taken_at >= today_start,
                ReminderTake.taken_at <= today_end,
            ).count()
            
            result = []
            for r in reminders:
                result.append(ReminderResponse(
                    id=str(r.id),
                    medication_name=r.medication_name,
                    dosage=r.dosage,
                    time=r.time,
                    frequency=r.frequency,
                    days=r.days,
                    notes=r.notes,
                    active=r.active,
                    next_dose=r.next_dose,
                    created_at=r.created_at,
                    updated_at=r.updated_at,
                ))
        
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
    """Get a specific reminder by ID"""
    user_id = user["uid"]
    
    with get_db_context() as db:
        reminder = db.query(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == user_id,
        ).first()
        
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
        
        return ReminderResponse(
            id=str(reminder.id),
            medication_name=reminder.medication_name,
            dosage=reminder.dosage,
            time=reminder.time,
            frequency=reminder.frequency,
            days=reminder.days,
            notes=reminder.notes,
            active=reminder.active,
            next_dose=reminder.next_dose,
            created_at=reminder.created_at,
            updated_at=reminder.updated_at,
        )


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str,
    update: ReminderUpdate,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderResponse:
    """Update a reminder"""
    user_id = user["uid"]
    logger.info("Updating reminder", reminder_id=reminder_id, user_id=user_id)
    
    try:
        with get_db_context() as db:
            reminder = db.query(Reminder).filter(
                Reminder.id == reminder_id,
                Reminder.user_id == user_id,
            ).first()
            
            if not reminder:
                raise HTTPException(status_code=404, detail="Reminder not found")
            
            update_data = update.dict(exclude_unset=True)
            
            for key, value in update_data.items():
                if hasattr(reminder, key):
                    setattr(reminder, key, value)
            
            reminder.updated_at = datetime.utcnow()
            
            # Recalculer next_dose si time ou frequency changent
            if "time" in update_data or "frequency" in update_data:
                reminder.next_dose = calculate_next_dose(
                    reminder.time,
                    reminder.frequency,
                    reminder.days,
                )
            
            db.flush()
            
            result = ReminderResponse(
                id=str(reminder.id),
                medication_name=reminder.medication_name,
                dosage=reminder.dosage,
                time=reminder.time,
                frequency=reminder.frequency,
                days=reminder.days,
                notes=reminder.notes,
                active=reminder.active,
                next_dose=reminder.next_dose,
                created_at=reminder.created_at,
                updated_at=reminder.updated_at,
            )
        
        logger.info("Reminder updated", reminder_id=reminder_id)
        return result
        
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
    """Delete a reminder"""
    user_id = user["uid"]
    logger.info("Deleting reminder", reminder_id=reminder_id, user_id=user_id)
    
    with get_db_context() as db:
        reminder = db.query(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == user_id,
        ).first()
        
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
        
        db.delete(reminder)
    
    logger.info("Reminder deleted", reminder_id=reminder_id)
    return None


@router.post("/{reminder_id}/take", response_model=ReminderTakeResponse)
async def mark_reminder_taken(
    reminder_id: str,
    take_request: ReminderTakeRequest,
    user: Dict[str, Any] = Depends(require_full_account),
) -> ReminderTakeResponse:
    """Mark a reminder as taken and calculate next dose"""
    user_id = user["uid"]
    logger.info("Marking reminder as taken", reminder_id=reminder_id, user_id=user_id)
    
    try:
        with get_db_context() as db:
            reminder = db.query(Reminder).filter(
                Reminder.id == reminder_id,
                Reminder.user_id == user_id,
            ).first()
            
            if not reminder:
                raise HTTPException(status_code=404, detail="Reminder not found")
            
            taken_at = take_request.taken_at or datetime.utcnow()
            
            # Calculer la prochaine dose
            if reminder.frequency == "daily":
                next_dose = reminder.next_dose + timedelta(days=1)
            elif reminder.frequency == "twice":
                next_dose = reminder.next_dose + timedelta(hours=12)
            elif reminder.frequency == "three-times":
                next_dose = reminder.next_dose + timedelta(hours=8)
            else:
                next_dose = calculate_next_dose(
                    reminder.time,
                    reminder.frequency,
                    reminder.days,
                )
            
            reminder.next_dose = next_dose
            reminder.updated_at = datetime.utcnow()
            
            # Enregistrer la prise pour les statistiques d'observance
            take_record = ReminderTake(
                id=str(uuid.uuid4()),
                reminder_id=reminder_id,
                user_id=user_id,
                taken_at=taken_at if isinstance(taken_at, datetime) else datetime.utcnow(),
            )
            db.add(take_record)
            
            db.flush()
        
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
