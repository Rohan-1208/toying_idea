from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel
from datetime import datetime, timezone
import secrets

from ..db import get_db
from ..mongo import normalize_id


router = APIRouter(tags=["cart"])


def uid(prefix: str) -> str:
    return f"{prefix}_{secrets.token_urlsafe(10)}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class AddToCartInput(BaseModel):
    productSlug: str
    variantId: str
    quantity: int = 1


class PatchCartItemInput(BaseModel):
    itemId: str
    quantity: int


async def get_session_id(req: Request, res: Response) -> str:
    existing = req.cookies.get("ti_session")
    if existing:
        return existing
    session_id = uid("sess")
    res.set_cookie("ti_session", session_id, httponly=True, samesite="lax", path="/")
    return session_id


async def get_or_create_cart(db, session_id: str) -> dict:
    cart = await db["carts"].find_one({"session_id": session_id})
    if cart:
        return cart
    doc = {
        "session_id": session_id,
        "id": uid("cart"),
        "currency": "INR",
        "items": [],
        "updatedAt": now_iso(),
    }
    await db["carts"].insert_one(doc)
    return await db["carts"].find_one({"session_id": session_id})


@router.get("/cart")
async def get_cart(req: Request, res: Response):
    db = await get_db()
    session_id = await get_session_id(req, res)
    cart = await get_or_create_cart(db, session_id)
    cart = normalize_id(cart) or {}
    cart.pop("session_id", None)
    return {"cart": cart}


@router.post("/cart")
async def add_to_cart(payload: AddToCartInput, req: Request, res: Response):
    if payload.quantity < 1 or payload.quantity > 20:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid quantity")

    db = await get_db()
    session_id = await get_session_id(req, res)
    cart = await get_or_create_cart(db, session_id)

    product = await db["products"].find_one({"slug": payload.productSlug, "active": True})
    if not product:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product/variant")
    variant = next((v for v in (product.get("variants") or []) if v.get("id") == payload.variantId), None)
    if not variant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product/variant")

    items = cart.get("items") or []
    existing = next(
        (i for i in items if i.get("productSlug") == payload.productSlug and i.get("variantId") == payload.variantId),
        None,
    )
    if existing:
        existing["quantity"] = min(20, int(existing.get("quantity", 0)) + payload.quantity)
    else:
        items.append(
            {
                "id": uid("ci"),
                "productSlug": payload.productSlug,
                "variantId": payload.variantId,
                "quantity": payload.quantity,
            }
        )

    await db["carts"].update_one(
        {"session_id": session_id},
        {"$set": {"items": items, "updatedAt": now_iso()}},
    )
    updated = await db["carts"].find_one({"session_id": session_id})
    updated = normalize_id(updated) or {}
    updated.pop("session_id", None)
    return {"cart": updated}


@router.patch("/cart")
async def patch_cart_item(payload: PatchCartItemInput, req: Request, res: Response):
    if payload.quantity < 0 or payload.quantity > 20:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid quantity")

    db = await get_db()
    session_id = await get_session_id(req, res)
    cart = await get_or_create_cart(db, session_id)
    items = cart.get("items") or []

    idx = next((i for i, it in enumerate(items) if it.get("id") == payload.itemId), None)
    if idx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if payload.quantity == 0:
        items.pop(idx)
    else:
        items[idx]["quantity"] = payload.quantity

    await db["carts"].update_one(
        {"session_id": session_id},
        {"$set": {"items": items, "updatedAt": now_iso()}},
    )
    updated = await db["carts"].find_one({"session_id": session_id})
    updated = normalize_id(updated) or {}
    updated.pop("session_id", None)
    return {"cart": updated}


@router.delete("/cart")
async def clear_cart(req: Request, res: Response):
    db = await get_db()
    session_id = await get_session_id(req, res)
    await db["carts"].delete_one({"session_id": session_id})
    return {"ok": True}
