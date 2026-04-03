from fastapi import APIRouter, HTTPException, status, Depends, Response
from pydantic import BaseModel
from ..db import get_db
from ..security import hash_password, verify_password, create_access_token
from ..mongo import normalize_id
from ..deps import require_admin, get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterInput(BaseModel):
    email: str
    name: str | None = None
    password: str
    is_admin: bool = False


class LoginInput(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(payload: RegisterInput, admin=Depends(require_admin)):
    db = await get_db()
    exists = await db["users"].find_one({"email": payload.email})
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    doc = {
        "email": payload.email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "is_admin": payload.is_admin,
    }
    res = await db["users"].insert_one(doc)
    created = await db["users"].find_one({"_id": res.inserted_id})
    return normalize_id(created)


@router.post("/login")
async def login(payload: LoginInput, res: Response):
    db = await get_db()
    user = await db["users"].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    role = "admin" if user.get("is_admin") else "user"
    token = create_access_token(subject=str(user["_id"]), role=role)
    res.set_cookie("ti_token", token, httponly=True, samesite="lax", path="/")
    res.set_cookie("ti_role", role, httponly=True, samesite="lax", path="/")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
async def logout(res: Response):
    res.delete_cookie("ti_token", path="/")
    res.delete_cookie("ti_role", path="/")
    return {"ok": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    safe = dict(user)
    safe.pop("password_hash", None)
    return safe


@router.post("/bootstrap-admin")
async def bootstrap_admin(payload: RegisterInput):
    db = await get_db()
    existing_admin = await db["users"].find_one({"is_admin": True})
    if existing_admin is not None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin already exists")
    exists = await db["users"].find_one({"email": payload.email})
    if exists:
        return {"created": False}
    doc = {
        "email": payload.email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "is_admin": True,
    }
    await db["users"].insert_one(doc)
    return {"created": True}
