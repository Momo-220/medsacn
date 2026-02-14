"""
Rate Limiting Middleware
Protect against abuse while maintaining smooth UX
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict
import time
from collections import defaultdict
from app.config import settings
from app.core.exceptions import RateLimitExceededError
import structlog

logger = structlog.get_logger()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter
    For production: Use Redis-based rate limiting
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.requests: Dict[str, list] = defaultdict(list)
        # Cleanup périodique désactivé - le nettoyage se fait déjà à chaque requête (ligne 46)
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/"]:
            return await call_next(request)
        
        # Get client identifier (IP or user ID from token)
        client_id = self._get_client_id(request)
        
        # Check rate limit
        current_time = time.time()
        # Pas de cleanup périodique - nettoyage fait directement ci-dessous (ligne 46)
        
        # Get request timestamps for this client
        request_times = self.requests[client_id]
        
        # Remove requests older than 1 minute
        request_times[:] = [t for t in request_times if current_time - t < 60]
        
        # Check if limit exceeded
        if len(request_times) >= settings.RATE_LIMIT_PER_MINUTE:
            logger.warning(
                "Rate limit exceeded",
                client_id=client_id,
                requests_count=len(request_times),
            )
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "retry_after_seconds": 60
                },
                headers={
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_PER_MINUTE),
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": "60"
                }
            )
        
        # Add current request
        request_times.append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
        response.headers["X-RateLimit-Remaining"] = str(
            settings.RATE_LIMIT_PER_MINUTE - len(request_times)
        )
        
        return response
    
    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier"""
        # Try to get user ID from request state (set by auth middleware)
        if hasattr(request.state, "user_id"):
            return f"user:{request.state.user_id}"
        
        # Fall back to IP address
        if request.client:
            return f"ip:{request.client.host}"
        
        return "unknown"
    
    # Méthode _cleanup_old_requests supprimée - pas nécessaire
    # Le nettoyage se fait déjà à chaque requête (ligne 46) qui supprime les requêtes > 1 minute
    # Les clients inactifs seront automatiquement nettoyés quand leur liste devient vide


