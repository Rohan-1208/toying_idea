from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from ..db import get_db
from ..deps import require_admin
from ..mongo import object_id


router = APIRouter(tags=["uploads"])


@router.post("/admin/uploads/image")
async def upload_image(file: UploadFile = File(...), admin=Depends(require_admin)):
    db = await get_db()
    bucket = AsyncIOMotorGridFSBucket(db)
    try:
        file_id = await bucket.upload_from_stream(
            filename=file.filename or "image",
            source=file.file,
            metadata={"contentType": file.content_type or "application/octet-stream"},
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload failed") from e
    return {"id": str(file_id), "url": f"/api/uploads/{str(file_id)}"}


@router.get("/uploads/{file_id}")
async def get_upload(file_id: str):
    db = await get_db()
    bucket = AsyncIOMotorGridFSBucket(db)
    try:
        oid = object_id(file_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found") from e
    try:
        grid_out = await bucket.open_download_stream(oid)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found") from e

    async def iterator():
        while True:
            chunk = await grid_out.readchunk()
            if not chunk:
                break
            yield chunk

    content_type = None
    try:
        if grid_out.metadata and isinstance(grid_out.metadata, dict):
            content_type = grid_out.metadata.get("contentType")
    except Exception:
        content_type = None
    if not content_type:
        content_type = getattr(grid_out, "content_type", None) or "application/octet-stream"

    filename = getattr(grid_out, "filename", None) or "file"
    return StreamingResponse(
        iterator(),
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )
