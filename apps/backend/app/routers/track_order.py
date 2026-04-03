from fastapi import APIRouter, Request
from pydantic import BaseModel

from ..db import get_db
from ..mongo import normalize_id


router = APIRouter(tags=["track-order"])


def normalize_order(document: dict | None) -> dict | None:
    doc = normalize_id(document)
    if doc is None:
        return None
    user_id = doc.get("user_id")
    if user_id is not None:
        doc["user_id"] = str(user_id)
    return doc


class TrackOrderInput(BaseModel):
    order: str


@router.get("/track-order")
async def track_order_get(req: Request):
    order_number = (req.query_params.get("order") or "").strip()
    if not order_number:
        return {"order": None, "events": []}
    db = await get_db()
    doc = await db["orders"].find_one({"number": order_number})
    order = normalize_order(doc)
    if order is None:
        return {"order": None, "events": []}
    events = order.get("events") or []
    return {"order": order, "events": events}


@router.post("/track-order")
async def track_order_post(payload: TrackOrderInput):
    order_number = (payload.order or "").strip()
    if not order_number:
        return {"order": None, "events": []}
    db = await get_db()
    doc = await db["orders"].find_one({"number": order_number})
    order = normalize_order(doc)
    if order is None:
        return {"order": None, "events": []}
    events = order.get("events") or []
    return {"order": order, "events": events}
