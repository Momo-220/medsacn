"""
MongoDB connection and collections.
Remplace PostgreSQL (Cloud SQL) pour Render.
"""

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
import structlog

from app.config import settings

logger = structlog.get_logger()

_client: MongoClient | None = None
_db: Database | None = None


def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
        logger.info("MongoDB client created")
    return _client


def get_db() -> Database:
    global _db
    if _db is None:
        client = get_mongo_client()
        # Nom de la base depuis l'URI ou défaut
        db_name = "mediscan"
        if "/" in settings.MONGODB_URI.rstrip("/"):
            path = settings.MONGODB_URI.split("/")[-1].split("?")[0]
            if path and path != "mongodb.net":
                db_name = path
        _db = client[db_name]
        logger.info("MongoDB database", db=db_name)
    return _db


def get_collection(name: str) -> Collection:
    return get_db()[name]


def close_mongo():
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB client closed")
