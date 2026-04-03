from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from .config import settings
import os


client: AsyncIOMotorClient | None = None
db = None


async def get_db():
    global client, db
    if client is None:
        timeout_ms = int(os.getenv("MONGODB_TIMEOUT_MS", "3000"))
        client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=timeout_ms)
        db = client[settings.db_name]
        await ensure_indexes()
    return db


async def ensure_indexes():
    database = client[settings.db_name]
    await database["users"].create_index([("email", ASCENDING)], unique=True)
    await database["products"].create_index([("slug", ASCENDING)], unique=True)
    await database["collections"].create_index([("slug", ASCENDING)], unique=True)
    await database["orders"].create_index([("number", ASCENDING)], unique=True)
    await database["orders"].create_index([("user_id", ASCENDING)])
    await database["carts"].create_index([("session_id", ASCENDING)], unique=True)
