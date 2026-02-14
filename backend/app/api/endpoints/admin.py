"""
Admin Dashboard - Login indépendant de l'app
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.config import settings
from app.services.admin_auth_service import create_admin_token

router = APIRouter()


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    token: str


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(body: AdminLoginRequest) -> AdminLoginResponse:
    """
    Connexion dashboard admin - indépendant de Firebase/app.
    Email et mot de passe configurés dans .env (ADMIN_EMAIL, ADMIN_PASSWORD).
    """
    if not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dashboard admin non configuré (ADMIN_PASSWORD manquant)",
        )
    if body.email.strip().lower() != settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    if body.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    token = create_admin_token()
    return AdminLoginResponse(token=token)
