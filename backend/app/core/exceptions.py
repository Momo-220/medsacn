"""
Custom Exceptions
Graceful error handling with user-friendly messages
"""

from typing import Optional, Dict, Any
from fastapi import status


class MediScanException(Exception):
    """Base exception for all MediScan errors"""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(MediScanException):
    """Authentication failed"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTH_FAILED",
        )


class AuthorizationError(MediScanException):
    """User not authorized"""
    
    def __init__(self, message: str = "You don't have permission to access this resource"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
        )


class ValidationError(MediScanException):
    """Input validation failed"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class ResourceNotFoundError(MediScanException):
    """Resource not found"""
    
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            message=f"{resource} with ID '{resource_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            details={"resource": resource, "id": resource_id},
        )


class RateLimitExceededError(MediScanException):
    """Rate limit exceeded"""
    
    def __init__(self, retry_after: int):
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code="RATE_LIMIT_EXCEEDED",
            details={"retry_after_seconds": retry_after},
        )


class AIServiceError(MediScanException):
    """AI service (Gemini) error"""
    
    def __init__(self, message: str = "AI service is temporarily unavailable"):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="AI_SERVICE_ERROR",
        )


class ImageProcessingError(MediScanException):
    """Image processing failed"""
    
    def __init__(self, message: str = "Unable to process the image"):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="IMAGE_PROCESSING_ERROR",
        )


class DatabaseError(MediScanException):
    """Database operation failed"""
    
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
        )


