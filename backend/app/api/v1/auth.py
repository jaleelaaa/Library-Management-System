"""
Authentication API endpoints.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Login request schema."""
    username: str
    password: str


@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """User login endpoint."""
    # Find user by username
    result = await db.execute(
        select(User).where(User.username == login_data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    from app.core.security import decode_token, verify_token_type
    import uuid

    payload = decode_token(refresh_token)
    verify_token_type(payload, "refresh")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    # Verify user exists
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Create new tokens
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user's profile.

    Returns complete user information including roles, addresses, and patron group.
    """
    # Refresh user with all relationships loaded (including role permissions)
    from app.models.permission import Role
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.addresses),
            selectinload(User.patron_group)
        )
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()

    # Build response with patron group name
    user_dict = UserResponse.model_validate(user).model_dump()
    if user.patron_group:
        user_dict['patron_group_name'] = user.patron_group.group_name

    return UserResponse(**user_dict)
