from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from .security import decode_token
from .db import get_db
from .mongo import object_id, normalize_id


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    req: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    token = None
    if credentials is not None and credentials.credentials:
        token = credentials.credentials
    if token is None:
        token = req.cookies.get("ti_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    db = await get_db()
    user = await db["users"].find_one({"_id": object_id(user_id)})
    user = normalize_id(user)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
