from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ..db import get_db
from ..deps import require_admin
from ..mongo import normalize_id, normalize_ids, object_id


router = APIRouter(tags=["collections"])


class CollectionUpsert(BaseModel):
    slug: str
    title: str
    description: str = ""
    product_slugs: list[str] = Field(default_factory=list, alias="productSlugs")

    model_config = {"populate_by_name": True}


def normalize_collection(document: dict | None) -> dict | None:
    doc = normalize_id(document)
    if doc is None:
        return None
    if "product_slugs" in doc and "productSlugs" not in doc:
        doc["productSlugs"] = doc["product_slugs"]
        del doc["product_slugs"]
    return doc


def normalize_collections(documents: list[dict]) -> list[dict]:
    return [normalize_collection(d) for d in documents if d is not None]


@router.get("/collections")
async def list_collections():
    try:
        db = await get_db()
        cursor = db["collections"].find({})
        docs = await cursor.to_list(length=200)
        return normalize_collections(docs)
    except Exception:
        return []


@router.get("/collections/featured")
async def featured_collections():
    try:
        db = await get_db()
        cursor = db["collections"].find({})
        docs = await cursor.to_list(length=20)
        collections = normalize_collections(docs)
        collections.sort(key=lambda c: int(c.get("featuredRank") or 999))
        return {"collections": collections[:6]}
    except Exception:
        return {"collections": []}


@router.get("/collections/{slug}")
async def get_collection(slug: str):
    db = await get_db()
    doc = await db["collections"].find_one({"slug": slug})
    doc = normalize_collection(doc)
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return doc


@router.get("/admin/collections")
async def admin_list_collections(admin=Depends(require_admin)):
    db = await get_db()
    cursor = db["collections"].find({})
    docs = await cursor.to_list(length=500)
    return normalize_collections(docs)


@router.post("/admin/collections", status_code=status.HTTP_201_CREATED)
async def admin_create_collection(payload: CollectionUpsert, admin=Depends(require_admin)):
    db = await get_db()
    exists = await db["collections"].find_one({"slug": payload.slug})
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    res = await db["collections"].insert_one(payload.model_dump(by_alias=True))
    created = await db["collections"].find_one({"_id": res.inserted_id})
    return normalize_collection(created)


@router.put("/admin/collections/{collection_id}")
async def admin_update_collection(collection_id: str, payload: CollectionUpsert, admin=Depends(require_admin)):
    db = await get_db()
    await db["collections"].update_one(
        {"_id": object_id(collection_id)},
        {"$set": payload.model_dump(by_alias=True)},
    )
    updated = await db["collections"].find_one({"_id": object_id(collection_id)})
    updated = normalize_collection(updated)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return updated


@router.delete("/admin/collections/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_collection(collection_id: str, admin=Depends(require_admin)):
    db = await get_db()
    await db["collections"].delete_one({"_id": object_id(collection_id)})
    return None
