"""
Medication Service
Manages medication master data in PostgreSQL
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import structlog
import uuid

from app.models.database import get_db_context
from app.models.medication import Medication, UserMedication
from app.core.exceptions import DatabaseError

logger = structlog.get_logger()


class MedicationService:
    """Service for managing medications in PostgreSQL"""
    
    @staticmethod
    def create_or_update_medication(medication_data: Dict[str, Any]) -> str:
        """
        Create or update a medication record
        Returns medication ID
        """
        try:
            with get_db_context() as db:
                # Try to find existing medication by name
                existing = db.query(Medication).filter(
                    Medication.name == medication_data.get("name")
                ).first()
                
                if existing:
                    # Update existing
                    logger.info("Updating existing medication", medication_id=str(existing.id))
                    for key, value in medication_data.items():
                        if hasattr(existing, key) and key != 'id':
                            setattr(existing, key, value)
                    db.commit()
                    return str(existing.id)
                
                # Create new
                medication = Medication(
                    name=medication_data.get("name", "Unknown"),
                    generic_name=medication_data.get("generic_name"),
                    brand_names=medication_data.get("brand_names", []),
                    medication_type=medication_data.get("medication_type"),
                    therapeutic_class=medication_data.get("therapeutic_class"),
                    drug_class=medication_data.get("drug_class"),
                    dosage_forms=medication_data.get("dosage_forms", []),
                    strengths=medication_data.get("strengths", []),
                    indications=medication_data.get("indications"),
                    usage_instructions=medication_data.get("usage_instructions"),
                    dosage_guidelines=medication_data.get("dosage_guidelines", {}),
                    contraindications=medication_data.get("contraindications", []),
                    warnings=medication_data.get("warnings", []),
                    side_effects=medication_data.get("side_effects", []),
                    interactions=medication_data.get("interactions", []),
                    manufacturer=medication_data.get("manufacturer"),
                    storage_conditions=medication_data.get("storage_conditions"),
                    data_source=medication_data.get("data_source", "ai_scan"),
                    confidence_score=medication_data.get("confidence_score", 0.0),
                    verified=medication_data.get("verified", False),
                )
                
                db.add(medication)
                db.commit()
                db.refresh(medication)
                
                logger.info("Medication created", medication_id=str(medication.id))
                return str(medication.id)
                
        except Exception as e:
            logger.error("Failed to create/update medication", error=str(e))
            raise DatabaseError(f"Failed to save medication: {str(e)}")
    
    @staticmethod
    def get_medication_by_id(medication_id: str) -> Optional[Dict[str, Any]]:
        """Get medication by ID"""
        try:
            with get_db_context() as db:
                medication = db.query(Medication).filter(
                    Medication.id == medication_id
                ).first()
                
                if not medication:
                    return None
                
                return medication.to_dict()
        except Exception as e:
            logger.error("Failed to get medication", error=str(e))
            return None
    
    @staticmethod
    def search_medications(
        query: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Search medications by name or generic name"""
        try:
            with get_db_context() as db:
                search_term = f"%{query.lower()}%"
                
                medications = (
                    db.query(Medication)
                    .filter(
                        or_(
                            func.lower(Medication.name).like(search_term),
                            func.lower(Medication.generic_name).like(search_term),
                        )
                    )
                    .limit(limit)
                    .all()
                )
                
                return [med.to_dict() for med in medications]
        except Exception as e:
            logger.error("Failed to search medications", error=str(e))
            return []
    
    @staticmethod
    def add_user_medication(
        user_id: str,
        medication_data: Dict[str, Any],
    ) -> str:
        """
        Add a medication to user's personal list
        Returns user_medication_id
        """
        try:
            with get_db_context() as db:
                user_med = UserMedication(
                    user_id=user_id,
                    medication_id=medication_data.get("medication_id"),
                    medication_name=medication_data.get("medication_name", "Unknown"),
                    scan_id=medication_data.get("scan_id"),
                    image_url=medication_data.get("image_url"),
                    detected_dosage=medication_data.get("detected_dosage"),
                    detected_form=medication_data.get("detected_form"),
                    detected_manufacturer=medication_data.get("detected_manufacturer"),
                    nickname=medication_data.get("nickname"),
                    purpose=medication_data.get("purpose"),
                    prescribing_doctor=medication_data.get("prescribing_doctor"),
                    notes=medication_data.get("notes"),
                    dosage_schedule=medication_data.get("dosage_schedule", {}),
                    reminder_enabled=medication_data.get("reminder_enabled", False),
                    active=medication_data.get("active", True),
                )
                
                db.add(user_med)
                db.commit()
                db.refresh(user_med)
                
                logger.info("User medication added", 
                          user_id=user_id, 
                          medication_id=str(user_med.id))
                
                return str(user_med.id)
        except Exception as e:
            logger.error("Failed to add user medication", error=str(e))
            raise DatabaseError(f"Failed to add user medication: {str(e)}")
    
    @staticmethod
    def get_user_medications(
        user_id: str,
        active_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """Get user's medications"""
        try:
            with get_db_context() as db:
                query = db.query(UserMedication).filter(
                    UserMedication.user_id == user_id
                )
                
                if active_only:
                    query = query.filter(UserMedication.active == True)
                
                medications = query.all()
                return [med.to_dict() for med in medications]
        except Exception as e:
            logger.error("Failed to get user medications", error=str(e))
            return []


# Singleton instance
medication_service = MedicationService()
