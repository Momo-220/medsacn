"""
Script pour vérifier les images sauvegardées dans PostgreSQL
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.database import get_db_context
from app.models.medication import ScanHistory
from sqlalchemy import func

def check_images():
    """Verifier les images dans la base de donnees"""
    print("Verification des images dans PostgreSQL...\n")
    
    with get_db_context() as db:
        # Compter les scans avec images
        total_scans = db.query(func.count(ScanHistory.id)).scalar()
        scans_with_images = db.query(func.count(ScanHistory.id)).filter(
            ScanHistory.image_url.isnot(None),
            ScanHistory.image_url != ''
        ).scalar()
        
        print(f"Statistiques:")
        print(f"   Total scans: {total_scans}")
        print(f"   Scans avec images: {scans_with_images}")
        print(f"   Scans sans images: {total_scans - scans_with_images}\n")
        
        if total_scans == 0:
            print("Aucun scan trouve dans la base de donnees")
            return
        
        # Afficher les 10 derniers scans avec leurs URLs
        print("10 derniers scans avec images:\n")
        recent_scans = db.query(ScanHistory).filter(
            ScanHistory.image_url.isnot(None),
            ScanHistory.image_url != ''
        ).order_by(ScanHistory.created_at.desc()).limit(10).all()
        
        if not recent_scans:
            print("Aucun scan avec image trouve")
        else:
            for i, scan in enumerate(recent_scans, 1):
                print(f"{i}. Scan ID: {scan.scan_id}")
                print(f"   Medicament: {scan.medication_name}")
                print(f"   Image URL: {scan.image_url[:80]}..." if len(scan.image_url) > 80 else f"   Image URL: {scan.image_url}")
                print(f"   Date: {scan.created_at}")
                print()
        
        # Verifier les URLs invalides (localhost:8080)
        print("Verification des URLs invalides (localhost:8080)...\n")
        invalid_urls = db.query(ScanHistory).filter(
            ScanHistory.image_url.like('%localhost:8080%')
        ).all()
        
        if invalid_urls:
            print(f"{len(invalid_urls)} scan(s) avec URL invalide (localhost:8080):")
            for scan in invalid_urls:
                print(f"   - Scan ID: {scan.scan_id}, URL: {scan.image_url}")
        else:
            print("OK: Aucune URL invalide trouvee")
        
        # Verifier les URLs Cloud Storage
        print("\nVerification des URLs Cloud Storage...\n")
        gcs_urls = db.query(ScanHistory).filter(
            ScanHistory.image_url.like('%storage.googleapis.com%')
        ).count()
        
        print(f"OK: {gcs_urls} scan(s) avec URL Cloud Storage valide")

if __name__ == "__main__":
    try:
        check_images()
    except Exception as e:
        print(f"ERREUR: {e}")
        import traceback
        traceback.print_exc()
