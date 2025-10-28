"""
Dependency injection utilities.
"""

from typing import Optional, AsyncGenerator
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import decode_token, verify_token_type
from app.models.user import User
from app.services.cache_service import CacheService
import uuid

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials
    payload = decode_token(token)
    verify_token_type(payload, "access")

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.permission import Role

    # Eagerly load relationships to avoid lazy loading issues
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
            selectinload(User.tenants),
            selectinload(User.patron_group)
        )
        .filter(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user."""
    return current_user


async def get_current_tenant(
    x_tenant_id: Optional[str] = Header(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> str:
    """Get current tenant ID from header or user's default tenant."""
    from app.core.config import settings
    from sqlalchemy import select
    from app.models.tenant import Tenant

    if not settings.ENABLE_MULTI_TENANCY:
        # Fetch the default tenant UUID
        result = await db.execute(select(Tenant).where(Tenant.code == settings.DEFAULT_TENANT))
        default_tenant = result.scalar_one_or_none()
        if default_tenant:
            return str(default_tenant.id)
        return settings.DEFAULT_TENANT

    if x_tenant_id:
        # Verify user has access to this tenant
        if x_tenant_id not in [str(t.id) for t in current_user.tenants]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have access to this tenant",
            )
        return x_tenant_id

    # Return user's default tenant from user.tenant_id
    if current_user.tenant_id:
        return str(current_user.tenant_id)

    # Fallback: use first associated tenant
    if current_user.tenants:
        return str(current_user.tenants[0].id)

    # Final fallback: fetch default tenant
    result = await db.execute(select(Tenant).where(Tenant.code == settings.DEFAULT_TENANT))
    default_tenant = result.scalar_one_or_none()
    if default_tenant:
        return str(default_tenant.id)

    return settings.DEFAULT_TENANT


def require_permission(permission: str):
    """Dependency to require a specific permission."""
    async def permission_checker(
        current_user: User = Depends(get_current_user),
    ):
        # Get user permissions from roles (relationships are already eagerly loaded in get_current_user)
        user_permissions = set()
        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.name)

        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required",
            )

        return current_user

    return permission_checker


async def get_cache_service() -> CacheService:
    """Get cache service instance."""
    return CacheService()
