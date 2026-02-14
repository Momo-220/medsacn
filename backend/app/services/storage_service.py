"""
Google Cloud Storage Service
Image upload and management
"""

from google.cloud import storage
from google.oauth2 import service_account
from typing import Optional
from datetime import timedelta
import uuid
import os
import structlog

from app.config import settings
from app.core.exceptions import ImageProcessingError

logger = structlog.get_logger()


class StorageService:
    """Manage image storage in Google Cloud Storage"""
    
    def __init__(self):
        self.client: Optional[storage.Client] = None
        self.bucket: Optional[storage.Bucket] = None
        self._initialized = False
    
    async def initialize(self):
        """Initialize GCS client"""
        if self._initialized:
            return
        
        try:
            # Mode dev sans GCS
            if settings.ENVIRONMENT == "development":
                logger.warning(" Running in DEV MODE - Using local file storage")
                # Crer le dossier local pour stocker les images
                os.makedirs("./uploads", exist_ok=True)
                self._initialized = True
                return
            
            # Utiliser les credentials explicites si disponibles
            credentials = None
            if settings.GOOGLE_APPLICATION_CREDENTIALS:
                credentials_path = settings.GOOGLE_APPLICATION_CREDENTIALS
                if os.path.exists(credentials_path):
                    credentials = service_account.Credentials.from_service_account_file(
                        credentials_path
                    )
                    logger.info(" Using service account credentials from file", path=credentials_path)
                else:
                    logger.warning(" Credentials file not found", path=credentials_path)
            
            # Créer le client avec ou sans credentials explicites
            if credentials:
                self.client = storage.Client(
                    project=settings.GOOGLE_CLOUD_PROJECT,
                    credentials=credentials
                )
            else:
                # Essayer avec Application Default Credentials
                self.client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
            
            self.bucket = self.client.bucket(settings.GCS_BUCKET_NAME)
            
            self._initialized = True
            logger.info(" GCS Storage initialized successfully", bucket=settings.GCS_BUCKET_NAME)
            
        except Exception as e:
            logger.error(" GCS initialization failed", error=str(e))
            if settings.ENVIRONMENT == "development":
                logger.warning(" Continuing with local storage")
                self._initialized = True
            else:
                raise ImageProcessingError("Failed to initialize storage service")
    
    async def upload_image(
        self,
        image_bytes: bytes,
        user_id: str,
        content_type: str = "image/jpeg",
    ) -> str:
        """
        Upload image to GCS
        Returns public URL
        """
        try:
            # Mode dev - stockage local, servi via le backend
            if not self.bucket:
                import os
                file_extension = content_type.split("/")[-1]
                filename = f"{uuid.uuid4()}.{file_extension}"
                filepath = f"./uploads/{filename}"
                
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                
                # URL accessible via le backend - utiliser IP locale pour mobile
                # Note: En production, utiliser GCS avec signed URLs
                base_url = "http://192.168.1.126:8888"
                image_url = f"{base_url}/uploads/{filename}"
                
                logger.info(" DEV: Image saved locally", filename=filename, url=image_url, user_id=user_id)
                return image_url
            
            # Generate unique filename
            file_extension = content_type.split("/")[-1]
            filename = f"scans/{user_id}/{uuid.uuid4()}.{file_extension}"
            
            # Create blob
            blob = self.bucket.blob(filename)
            
            # Set content type
            blob.content_type = content_type
            
            # Upload
            blob.upload_from_string(
                image_bytes,
                content_type=content_type,
            )
            
            # Generate signed URL (works with uniform bucket-level access)
            # URL valide pendant 7 jours maximum (604800 secondes)
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=604800),  # 7 jours (maximum autorisé)
                method="GET",
            )
            
            logger.info("Image uploaded successfully", filename=filename, user_id=user_id)
            return signed_url
            
        except Exception as e:
            logger.error("Image upload failed", error=str(e))
            raise ImageProcessingError(f"Failed to upload image: {str(e)}")
    
    async def get_signed_url(
        self,
        blob_name: str,
        expiration: int = 3600,
    ) -> str:
        """
        Generate signed URL for private access
        Expires after `expiration` seconds
        """
        try:
            blob = self.bucket.blob(blob_name)
            
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=expiration),
                method="GET",
            )
            
            return url
            
        except Exception as e:
            logger.error("Failed to generate signed URL", error=str(e))
            raise ImageProcessingError("Failed to generate image URL")
    
    async def delete_image(self, blob_name: str) -> bool:
        """Delete image from GCS"""
        try:
            blob = self.bucket.blob(blob_name)
            blob.delete()
            
            logger.info("Image deleted", blob_name=blob_name)
            return True
            
        except Exception as e:
            logger.error("Failed to delete image", error=str(e))
            return False


# Singleton instance
storage_service = StorageService()


