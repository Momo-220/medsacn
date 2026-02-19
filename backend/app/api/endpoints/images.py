"""
Image serving - MongoDB GridFS
"""
from fastapi import APIRouter, Response
from bson import ObjectId
from gridfs import GridFS
import structlog

from app.db.mongodb import get_db

logger = structlog.get_logger()
router = APIRouter()


@router.get("/{file_id}", response_class=Response)
async def get_image(file_id: str):
    """Serve image from GridFS by ID."""
    try:
        if not ObjectId.is_valid(file_id):
            return Response(status_code=400, content="Invalid image id")
        db = get_db()
        fs = GridFS(db, collection="scan_images")
        grid_out = fs.get(ObjectId(file_id))
        if not grid_out:
            return Response(status_code=404, content="Image not found")
        data = grid_out.read()
        content_type = grid_out.content_type or "image/jpeg"
        return Response(
            content=data,
            media_type=content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception as e:
        logger.error("Image get failed", file_id=file_id, error=str(e))
        return Response(status_code=500, content="Failed to load image")
