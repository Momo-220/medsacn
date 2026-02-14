"""
Script de test complet pour Cloud Storage
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
import os
from app.models.database import get_db_context
from app.models.medication import ScanHistory
from sqlalchemy import func
from google.cloud import storage
import io

def test_storage_config():
    """Tester la configuration Cloud Storage"""
    print("=" * 60)
    print("TEST 1: Configuration Cloud Storage")
    print("=" * 60)
    
    print(f"\nVariables d'environnement:")
    print(f"  GOOGLE_CLOUD_PROJECT: {settings.GOOGLE_CLOUD_PROJECT}")
    print(f"  GCS_BUCKET_NAME: {settings.GCS_BUCKET_NAME}")
    print(f"  ENVIRONMENT: {settings.ENVIRONMENT}")
    
    if not settings.GCS_BUCKET_NAME:
        print("\nERREUR: GCS_BUCKET_NAME non defini dans .env")
        return False
    
    if not settings.GOOGLE_CLOUD_PROJECT:
        print("\nERREUR: GOOGLE_CLOUD_PROJECT non defini dans .env")
        return False
    
    print("\nOK: Configuration trouvee")
    return True

def test_bucket_exists():
    """Tester que le bucket existe"""
    print("\n" + "=" * 60)
    print("TEST 2: Existence du Bucket")
    print("=" * 60)
    
    try:
        # Utiliser les credentials explicites si disponibles
        from google.oauth2 import service_account
        credentials = None
        if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            credentials = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_APPLICATION_CREDENTIALS
            )
        
        if credentials:
            client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT, credentials=credentials)
        else:
            client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        
        # Verifier que le bucket existe
        if not bucket.exists():
            print(f"\nERREUR: Le bucket '{settings.GCS_BUCKET_NAME}' n'existe pas")
            print(f"  Verifiez dans Google Cloud Console")
            return False
        
        print(f"\nOK: Bucket '{settings.GCS_BUCKET_NAME}' existe")
        
        # Afficher les infos du bucket
        bucket.reload()
        print(f"  Zone: {bucket.location}")
        print(f"  Classe: {bucket.storage_class}")
        print(f"  Cree le: {bucket.time_created}")
        
        return True
        
    except Exception as e:
        print(f"\nERREUR: {e}")
        print(f"  Verifiez vos credentials Google Cloud")
        return False

def test_bucket_permissions():
    """Tester les permissions sur le bucket"""
    print("\n" + "=" * 60)
    print("TEST 3: Permissions sur le Bucket")
    print("=" * 60)
    
    try:
        # Utiliser les credentials explicites si disponibles
        from google.oauth2 import service_account
        credentials = None
        if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            credentials = service_account.Credentials.from_service_account_file(
                settings.GOOGLE_APPLICATION_CREDENTIALS
            )
        
        if credentials:
            client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT, credentials=credentials)
        else:
            client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        
        # Tester l'upload d'un fichier test
        test_blob_name = f"test/test-{os.urandom(8).hex()}.txt"
        blob = bucket.blob(test_blob_name)
        
        test_content = b"Test de connexion Cloud Storage"
        blob.upload_from_string(test_content, content_type="text/plain")
        
        print(f"\nOK: Upload de test reussi")
        print(f"  Fichier teste: {test_blob_name}")
        
        # Supprimer le fichier test
        blob.delete()
        print(f"  Fichier test supprime")
        
        return True
        
    except Exception as e:
        print(f"\nERREUR: {e}")
        print(f"  Verifiez les permissions IAM (Storage Object Admin)")
        return False

def test_database_images():
    """Tester les images dans PostgreSQL"""
    print("\n" + "=" * 60)
    print("TEST 4: Images dans PostgreSQL")
    print("=" * 60)
    
    try:
        with get_db_context() as db:
            total_scans = db.query(func.count(ScanHistory.id)).scalar()
            scans_with_images = db.query(func.count(ScanHistory.id)).filter(
                ScanHistory.image_url.isnot(None),
                ScanHistory.image_url != ''
            ).scalar()
            
            print(f"\nStatistiques:")
            print(f"  Total scans: {total_scans}")
            print(f"  Scans avec images: {scans_with_images}")
            print(f"  Scans sans images: {total_scans - scans_with_images}")
            
            if scans_with_images > 0:
                # Afficher les 5 derniers scans
                recent_scans = db.query(ScanHistory).filter(
                    ScanHistory.image_url.isnot(None),
                    ScanHistory.image_url != ''
                ).order_by(ScanHistory.created_at.desc()).limit(5).all()
                
                print(f"\n5 derniers scans avec images:")
                for i, scan in enumerate(recent_scans, 1):
                    url_preview = scan.image_url[:60] + "..." if len(scan.image_url) > 60 else scan.image_url
                    print(f"  {i}. {scan.medication_name}")
                    print(f"     URL: {url_preview}")
                
                # Verifier les URLs invalides
                invalid_urls = db.query(ScanHistory).filter(
                    ScanHistory.image_url.like('%localhost:8080%')
                ).count()
                
                if invalid_urls > 0:
                    print(f"\nATTENTION: {invalid_urls} scan(s) avec URL invalide (localhost:8080)")
                else:
                    print(f"\nOK: Toutes les URLs sont valides")
            else:
                print(f"\nINFO: Aucun scan avec image pour le moment")
            
            return True
            
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_storage_service():
    """Tester le service Storage"""
    print("\n" + "=" * 60)
    print("TEST 5: Service Storage")
    print("=" * 60)
    
    try:
        from app.services.storage_service import storage_service
        import asyncio
        
        async def test():
            await storage_service.initialize()
            
            if not storage_service._initialized:
                print("\nERREUR: Service Storage non initialise")
                return False
            
            print(f"\nOK: Service Storage initialise")
            print(f"  Bucket: {settings.GCS_BUCKET_NAME}")
            
            # Tester un upload
            test_image = b"fake image content for test"
            test_user_id = "test-user-123"
            
            try:
                url = await storage_service.upload_image(
                    image_bytes=test_image,
                    user_id=test_user_id,
                    content_type="image/jpeg"
                )
                
                print(f"\nOK: Upload de test reussi")
                print(f"  URL generee: {url[:80]}...")
                
                # Supprimer le fichier test
                if "gs://" in url or "storage.googleapis.com" in url:
                    # Extraire le nom du blob de l'URL
                    blob_name = url.split(f"{settings.GCS_BUCKET_NAME}/")[-1].split("?")[0]
                    
                    # Utiliser les credentials explicites
                    from google.oauth2 import service_account
                    credentials = None
                    if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
                        credentials = service_account.Credentials.from_service_account_file(
                            settings.GOOGLE_APPLICATION_CREDENTIALS
                        )
                    
                    if credentials:
                        client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT, credentials=credentials)
                    else:
                        client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
                    
                    bucket = client.bucket(settings.GCS_BUCKET_NAME)
                    blob = bucket.blob(blob_name)
                    blob.delete()
                    print(f"  Fichier test supprime")
                
                return True
                
            except Exception as e:
                print(f"\nERREUR lors de l'upload: {e}")
                import traceback
                traceback.print_exc()
                return False
        
        return asyncio.run(test())
        
    except Exception as e:
        print(f"\nERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Executer tous les tests"""
    print("\n" + "=" * 60)
    print("TESTS COMPLETS - Cloud Storage & PostgreSQL")
    print("=" * 60)
    
    results = []
    
    # Test 1: Configuration
    results.append(("Configuration", test_storage_config()))
    
    # Test 2: Bucket existe
    if results[-1][1]:
        results.append(("Bucket existe", test_bucket_exists()))
    
    # Test 3: Permissions
    if results[-1][1]:
        results.append(("Permissions", test_bucket_permissions()))
    
    # Test 4: Database
    results.append(("Database", test_database_images()))
    
    # Test 5: Service Storage
    if results[0][1]:  # Si config OK
        results.append(("Service Storage", test_storage_service()))
    
    # Resume
    print("\n" + "=" * 60)
    print("RESUME DES TESTS")
    print("=" * 60)
    
    for name, result in results:
        status = "OK" if result else "ERREUR"
        print(f"  {name}: {status}")
    
    all_ok = all(r[1] for r in results)
    
    if all_ok:
        print("\n" + "=" * 60)
        print("TOUS LES TESTS SONT OK!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("CERTAINS TESTS ONT ECHOUE")
        print("=" * 60)
        print("\nVerifiez les erreurs ci-dessus")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nERREUR CRITIQUE: {e}")
        import traceback
        traceback.print_exc()
