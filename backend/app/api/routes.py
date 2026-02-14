"""
API Routes Configuration
Combines all API endpoints
"""

from fastapi import APIRouter
from app.api.endpoints import (
    scan,
    assistant,
    history,
    medication,
    feedback,
    suggestions,
    reminders,
    credits,
    analytics,
    trial,
    admin,
)

router = APIRouter()

# Include all endpoint routers
router.include_router(
    scan.router,
    prefix="/scan",
    tags=["Medication Scan"],
)

router.include_router(
    assistant.router,
    prefix="/assistant",
    tags=["AI Assistant"],
)

router.include_router(
    history.router,
    prefix="/history",
    tags=["History"],
)

router.include_router(
    medication.router,
    prefix="/medication",
    tags=["Medication"],
)

router.include_router(
    feedback.router,
    prefix="/feedback",
    tags=["Feedback"],
)

router.include_router(
    suggestions.router,
    prefix="/suggestions",
    tags=["Suggestions"],
)

router.include_router(
    credits.router,
    prefix="/credits",
    tags=["Credits"],
)

router.include_router(
    reminders.router,
    prefix="/reminders",
    tags=["Reminders"],
)

router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["Analytics"],
)

router.include_router(
    trial.router,
    prefix="/trial",
    tags=["Trial"],
)

router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin Dashboard"],
)

