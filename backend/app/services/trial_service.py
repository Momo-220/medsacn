"""
Trial Service
One-time trial per device (Firestore)
"""

from typing import Optional
from datetime import datetime
import structlog

from app.config import settings
from app.services.firebase_service import firebase_service

logger = structlog.get_logger()


def has_used_trial(device_id: str) -> bool:
    """Check if device has already used trial."""
    if not device_id or not firebase_service.db:
        return False
    try:
        ref = firebase_service.db.collection(settings.FIRESTORE_COLLECTION_TRIAL_DEVICES)
        docs = ref.where("device_id", "==", device_id).limit(1).stream()
        return any(True for _ in docs)
    except Exception as e:
        logger.error("Trial check failed", device_id=device_id[:16], error=str(e))
        return False


def register_trial_device(device_id: str, user_id: str) -> None:
    """Register device as having used trial."""
    if not device_id or not firebase_service.db:
        return
    try:
        firebase_service.db.collection(settings.FIRESTORE_COLLECTION_TRIAL_DEVICES).add({
            "device_id": device_id,
            "user_id": user_id,
            "used_at": datetime.utcnow().isoformat(),
        })
        logger.info("Trial device registered", device_id=device_id[:16])
    except Exception as e:
        logger.error("Trial register failed", error=str(e))
