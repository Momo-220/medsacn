"""
SQLAlchemy Database Configuration
PostgreSQL connection and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import structlog

from app.config import settings

logger = structlog.get_logger()

# Create SQLAlchemy engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Connection pool size
    max_overflow=20,  # Max overflow connections
    echo=settings.DEBUG,  # Log SQL statements in debug mode
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Database session dependency
    Use in FastAPI routes with Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database sessions
    Use in services that don't use FastAPI dependencies
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """Initialize database using Alembic migrations"""
    try:
        from alembic.config import Config
        from alembic import command
        
        logger.info("Running database migrations...")
        
        # Configure Alembic
        alembic_cfg = Config("alembic.ini")
        
        # Run migrations to head (latest version)
        command.upgrade(alembic_cfg, "head")
        
        logger.info("✅ Database migrations completed successfully")
        
    except Exception as e:
        logger.error("Failed to run migrations, falling back to create_all", error=str(e))
        # Fallback to create_all if Alembic fails (for backwards compatibility)
        from app.models import medication  # Import all models
        logger.warning("Using create_all as fallback...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created (fallback method)")



