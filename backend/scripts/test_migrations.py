"""
Test script for Alembic migrations
Run this to verify migrations work correctly
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from alembic.config import Config
from alembic import command
from app.config import settings
import structlog

logger = structlog.get_logger()

def test_migrations():
    """Test that migrations can run successfully"""
    try:
        logger.info("Testing Alembic migrations...")
        logger.info(f"Database URL: {settings.database_url}")
        logger.info(f"Environment: {settings.ENVIRONMENT}")
        
        # Configure Alembic
        alembic_cfg = Config("alembic.ini")
        
        # Check current revision
        logger.info("Checking current database revision...")
        try:
            command.current(alembic_cfg)
        except Exception as e:
            logger.info("No current revision (database is empty)")
        
        # Run migrations
        logger.info("Running migrations to head...")
        command.upgrade(alembic_cfg, "head")
        
        logger.info("✅ Migrations completed successfully!")
        
        # Show current revision
        logger.info("Current database revision:")
        command.current(alembic_cfg)
        
        return True
        
    except Exception as e:
        logger.error("❌ Migration test failed", error=str(e))
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_migrations()
    sys.exit(0 if success else 1)
