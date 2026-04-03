from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ..db import get_db
from ..deps import require_admin
from ..mongo import normalize_id, normalize_ids, object_id


router = APIRouter(tags=["products"])


class Money(BaseModel):
    currency: str = "INR"
    amount: float


class ProductImage(BaseModel):
    id: str
    alt: str
    url: str


class ProductVariant(BaseModel):
    id: str
    label: str
    material: str
    finish: str
    size: str
    in_stock: bool = Field(default=True, alias="inStock")
    price: Money

    model_config = {"populate_by_name": True}


class ProductUpsert(BaseModel):
    slug: str
    name: str
    tagline: str = ""
    description: str = ""
    badges: list[str] = []
    categories: list[str] = []
    images: list[ProductImage] = []
    variants: list[ProductVariant] = []
    featured_rank: int | None = Field(default=None, alias="featuredRank")
    active: bool = True

    model_config = {"populate_by_name": True}


@router.get("/products")
async def list_products(q: str | None = None, category: str | None = None, sort: str = "featured"):
    docs: list[dict] = []
    try:
        db = await get_db()
        cursor = db["products"].find({"active": True})
        docs = await cursor.to_list(length=200)
    except Exception:
        docs = []

    products = normalize_ids(docs)

    if q:
        needle = q.strip().lower()
        products = [
            p
            for p in products
            if needle
            in f"{p.get('name','')} {p.get('tagline','')} {p.get('description','')} {' '.join(p.get('categories', []))}".lower()
        ]

    if category:
        cat = category.strip()
        products = [p for p in products if cat in (p.get("categories") or [])]

    def min_price_amount(p: dict) -> float:
        variants = p.get("variants") or []
        if not variants:
            return 0.0
        amounts = [float(v.get("price", {}).get("amount", 0)) for v in variants]
        return min(amounts) if amounts else 0.0

    if sort == "price-asc":
        products.sort(key=min_price_amount)
    elif sort == "price-desc":
        products.sort(key=min_price_amount, reverse=True)
    else:
        products.sort(key=lambda p: int(p.get("featuredRank") or 999))

    all_categories = sorted({c for p in normalize_ids(docs) for c in (p.get("categories") or [])})

    return {"items": products, "facets": {"categories": all_categories}}


@router.get("/products/by-slug")
async def get_product_by_slug(slug: str):
    try:
        db = await get_db()
        doc = await db["products"].find_one({"slug": slug, "active": True})
        doc = normalize_id(doc)
        if doc is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        cursor = db["products"].find({"active": True, "slug": {"$ne": slug}})
        others = normalize_ids(await cursor.to_list(length=200))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    related = [p for p in others if any(c in (doc.get("categories") or []) for c in (p.get("categories") or []))][:4]
    if len(related) < 4:
        seen = {p.get("slug") for p in related}
        for p in sorted(others, key=lambda p: int(p.get("featuredRank") or 999)):
            if p.get("slug") in seen:
                continue
            related.append(p)
            seen.add(p.get("slug"))
            if len(related) >= 4:
                break
    return {"product": doc, "related": related}


@router.get("/products/{slug}")
async def get_product(slug: str):
    try:
        db = await get_db()
        doc = await db["products"].find_one({"slug": slug, "active": True})
        doc = normalize_id(doc)
        if doc is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        cursor = db["products"].find({"active": True, "slug": {"$ne": slug}})
        others = normalize_ids(await cursor.to_list(length=200))
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    related = [p for p in others if any(c in (doc.get("categories") or []) for c in (p.get("categories") or []))][:4]
    if len(related) < 4:
        seen = {p.get("slug") for p in related}
        for p in sorted(others, key=lambda p: int(p.get("featuredRank") or 999)):
            if p.get("slug") in seen:
                continue
            related.append(p)
            seen.add(p.get("slug"))
            if len(related) >= 4:
                break
    return {"product": doc, "related": related}


@router.get("/admin/products")
async def admin_list_products(admin=Depends(require_admin)):
    db = await get_db()
    cursor = db["products"].find({})
    docs = await cursor.to_list(length=500)
    return normalize_ids(docs)


@router.post("/admin/products", status_code=status.HTTP_201_CREATED)
async def admin_create_product(payload: ProductUpsert, admin=Depends(require_admin)):
    db = await get_db()
    exists = await db["products"].find_one({"slug": payload.slug})
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    doc = payload.model_dump(by_alias=True)
    res = await db["products"].insert_one(doc)
    created = await db["products"].find_one({"_id": res.inserted_id})
    return normalize_id(created)


@router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, payload: ProductUpsert, admin=Depends(require_admin)):
    db = await get_db()
    doc = payload.model_dump(by_alias=True)
    if "_id" in doc:
        del doc["_id"]
    await db["products"].update_one({"_id": object_id(product_id)}, {"$set": doc})
    updated = await db["products"].find_one({"_id": object_id(product_id)})
    updated = normalize_id(updated)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return updated


@router.delete("/admin/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_product(product_id: str, admin=Depends(require_admin)):
    db = await get_db()
    await db["products"].delete_one({"_id": object_id(product_id)})
    return None
