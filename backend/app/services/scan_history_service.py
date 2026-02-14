"""
Scan History Service
Manages medication scan history in PostgreSQL (replaces Firestore)
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
import structlog
import uuid
from datetime import datetime

from app.models.database import get_db_context
from app.models.medication import ScanHistory
from app.core.exceptions import DatabaseError

logger = structlog.get_logger()


class ScanHistoryService:
    """Service for managing scan history in PostgreSQL"""
    
    # Limite de scans par utilisateur (pour economiser le stockage)
    MAX_SCANS_PER_USER = 50
    
    @staticmethod
    def _cleanup_old_scans(db: Session, user_id: str) -> int:
        """
        Supprime les scans les plus anciens si la limite est depassee.
        Garde les MAX_SCANS_PER_USER plus recents.
        Retourne le nombre de scans supprimes.
        """
        count = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).count()
        
        if count < ScanHistoryService.MAX_SCANS_PER_USER:
            return 0
        
        # Trouver les scans a supprimer (les plus anciens)
        scans_to_keep = (
            db.query(ScanHistory.id)
            .filter(ScanHistory.user_id == user_id)
            .order_by(desc(ScanHistory.created_at))
            .limit(ScanHistoryService.MAX_SCANS_PER_USER - 1)  # -1 car on va en ajouter un nouveau
            .subquery()
        )
        
        deleted = (
            db.query(ScanHistory)
            .filter(ScanHistory.user_id == user_id)
            .filter(~ScanHistory.id.in_(scans_to_keep))
            .delete(synchronize_session='fetch')
        )
        
        if deleted > 0:
            logger.info("Cleaned up old scans", user_id=user_id, deleted=deleted)
        
        return deleted
    
    @staticmethod
    def save_scan(
        user_id: str,
        scan_data: Dict[str, Any],
    ) -> str:
        """
        Save a scan to user history
        Returns scan_id
        Automatically removes oldest scans if limit (50) exceeded
        """
        try:
            with get_db_context() as db:
                # Nettoyer les anciens scans si limite atteinte
                ScanHistoryService._cleanup_old_scans(db, user_id)
                
                # Generate scan_id if not provided
                scan_id = scan_data.get("scan_id") or str(uuid.uuid4())
                
                # Check if scan_id already exists
                existing = db.query(ScanHistory).filter(
                    ScanHistory.scan_id == scan_id
                ).first()
                
                if existing:
                    logger.warning("Scan ID already exists, updating", scan_id=scan_id)
                    # Update existing scan
                    for key, value in scan_data.items():
                        if hasattr(existing, key) and key != 'id' and key != 'scan_id':
                            setattr(existing, key, value)
                    existing.updated_at = datetime.utcnow()
                    db.commit()
                    return scan_id
                
                # Create new scan record
                scan = ScanHistory(
                    user_id=user_id,
                    scan_id=scan_id,
                    medication_name=scan_data.get("medication_name", "Unknown"),
                    generic_name=scan_data.get("generic_name"),
                    dosage=scan_data.get("dosage"),
                    form=scan_data.get("form"),
                    manufacturer=scan_data.get("manufacturer"),
                    confidence=scan_data.get("confidence", "low"),
                    analysis_data=scan_data.get("analysis_data", {}),
                    warnings=scan_data.get("warnings", []),
                    contraindications=scan_data.get("contraindications", []),
                    interactions=scan_data.get("interactions", []),
                    side_effects=scan_data.get("side_effects", []),
                    image_url=scan_data.get("image_url"),
                    packaging_language=scan_data.get("packaging_language", "fr"),
                    category=scan_data.get("category", "autre"),
                )
                
                db.add(scan)
                db.commit()
                db.refresh(scan)
                
                logger.info("Scan saved to PostgreSQL", 
                          user_id=user_id, 
                          scan_id=scan_id,
                          medication=scan.medication_name)
                
                return scan_id
                
        except Exception as e:
            logger.error("Failed to save scan", error=str(e))
            raise DatabaseError(f"Failed to save scan history: {str(e)}")
    
    @staticmethod
    def get_user_history(
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Get user's scan history
        Returns list of scan records
        """
        try:
            with get_db_context() as db:
                scans = (
                    db.query(ScanHistory)
                    .filter(ScanHistory.user_id == user_id)
                    .order_by(desc(ScanHistory.created_at))
                    .limit(limit)
                    .offset(offset)
                    .all()
                )
                
                history = [scan.to_dict() for scan in scans]
                
                logger.info("Retrieved user history", 
                          user_id=user_id, 
                          count=len(history))
                
                return history
                
        except Exception as e:
            logger.error("Failed to get user history", error=str(e))
            raise DatabaseError(f"Failed to retrieve scan history: {str(e)}")
    
    @staticmethod
    def get_scan_by_id(
        scan_id: str,
        user_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Get specific scan by ID
        Optionally verify user ownership
        """
        try:
            with get_db_context() as db:
                query = db.query(ScanHistory).filter(ScanHistory.scan_id == scan_id)
                
                # Verify user ownership if user_id provided
                if user_id:
                    query = query.filter(ScanHistory.user_id == user_id)
                
                scan = query.first()
                
                if not scan:
                    return None
                
                return scan.to_dict()
                
        except Exception as e:
            logger.error("Failed to get scan", scan_id=scan_id, error=str(e))
            return None
    
    @staticmethod
    def delete_scan(
        scan_id: str,
        user_id: str,
    ) -> bool:
        """
        Delete a scan (verify user ownership)
        Returns True if deleted, False if not found
        """
        try:
            with get_db_context() as db:
                scan = (
                    db.query(ScanHistory)
                    .filter(ScanHistory.scan_id == scan_id)
                    .filter(ScanHistory.user_id == user_id)
                    .first()
                )
                
                if not scan:
                    logger.warning("Scan not found or user mismatch", 
                                  scan_id=scan_id, 
                                  user_id=user_id)
                    return False
                
                db.delete(scan)
                db.commit()
                
                logger.info("Scan deleted", scan_id=scan_id, user_id=user_id)
                return True
                
        except Exception as e:
            logger.error("Failed to delete scan", error=str(e))
            raise DatabaseError(f"Failed to delete scan: {str(e)}")
    
    @staticmethod
    def get_scan_count(user_id: str) -> int:
        """Get total number of scans for a user"""
        try:
            with get_db_context() as db:
                count = (
                    db.query(ScanHistory)
                    .filter(ScanHistory.user_id == user_id)
                    .count()
                )
                return count
        except Exception as e:
            logger.error("Failed to get scan count", error=str(e))
            return 0


# Singleton instance
scan_history_service = ScanHistoryService()
