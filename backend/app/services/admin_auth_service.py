"""
Admin Dashboard Auth - Authentification indépendante de l'app
JWT pour le dashboard analytics uniquement
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from app.config import settings

security = HTTPBearer(auto_error=False)
admin_header = APIKeyHeader(name="X-Dashboard-Token", auto_error=False)


def create_admin_token() -> str:
    """Crée un JWT pour le dashboard admin."""
    payload = {
        "admin": True,
        "email": settings.ADMIN_EMAIL,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def verify_admin_token(token: str) -> Optional[Dict[str, Any]]:
    """Vérifie le JWT dashboard. Retourne les claims si valide."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("admin") and payload.get("email", "").lower() == settings.ADMIN_EMAIL.lower():
            return payload
    except Exception:
        pass
    return None
