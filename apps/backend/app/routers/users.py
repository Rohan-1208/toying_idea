from fastapi import APIRouter, Depends
from ..db import get_db
from ..deps import require_admin
from ..mongo import normalize_ids


router = APIRouter(tags=["users"])


@router.get("/admin/users")
async def admin_list_users(admin=Depends(require_admin)):
    db = await get_db()
    cursor = db["users"].find({})
    docs = await cursor.to_list(length=500)
    return normalize_ids(docs)

