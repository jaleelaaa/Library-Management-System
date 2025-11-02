"""
Permissions and Roles API endpoints.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_tenant, require_permission
from app.models.user import User
from app.models.permission import Permission, Role
from app.schemas.permission import (
    PermissionResponse,
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    RoleListItem,
)
from app.services.audit_service import AuditService

router = APIRouter()


@router.get("/permissions", response_model=List[PermissionResponse])
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    List all available permissions.

    Requires: settings.read permission
    """
    result = await db.execute(
        select(Permission)
        .where(Permission.tenant_id == UUID(tenant_id))
        .order_by(Permission.resource, Permission.action)
    )
    permissions = result.scalars().all()
    return permissions


@router.get("/roles", response_model=List[RoleListItem])
async def list_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    List all roles with permission counts.

    Requires: settings.read permission
    """
    result = await db.execute(
        select(
            Role,
            func.count(Permission.id).label('permission_count')
        )
        .outerjoin(Role.permissions)
        .where(Role.tenant_id == UUID(tenant_id))
        .group_by(Role.id)
        .order_by(Role.name)
    )

    roles_data = []
    for role, perm_count in result.all():
        roles_data.append(
            RoleListItem(
                id=role.id,
                name=role.name,
                display_name=role.display_name,
                description=role.description,
                is_system=role.is_system,
                permission_count=perm_count,
                created_date=role.created_date,
            )
        )

    return roles_data


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Create a new role.

    Requires: settings.update permission
    """
    # Check if role name already exists
    existing = await db.execute(
        select(Role).where(
            and_(
                Role.tenant_id == UUID(tenant_id),
                Role.name == role_data.name
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role with this name already exists"
        )

    # Create role
    new_role = Role(
        name=role_data.name,
        display_name=role_data.display_name,
        description=role_data.description,
        is_system=False,  # User-created roles are never system roles
        tenant_id=UUID(tenant_id),
    )

    # Add permissions
    if role_data.permission_ids:
        permissions_result = await db.execute(
            select(Permission).where(
                and_(
                    Permission.id.in_(role_data.permission_ids),
                    Permission.tenant_id == UUID(tenant_id)
                )
            )
        )
        permissions = permissions_result.scalars().all()
        new_role.permissions.extend(permissions)

    db.add(new_role)
    await db.commit()

    # Refresh with eager loading
    result = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions))
        .where(Role.id == new_role.id)
    )
    new_role = result.scalar_one()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="CREATE",
        target=str(new_role.id),
        resource_type="role",
        details={"name": new_role.name},
        tenant_id=UUID(tenant_id),
    )

    return RoleResponse.model_validate(new_role)


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Get a role by ID with all its permissions.

    Requires: settings.read permission
    """
    result = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions))
        .where(
            and_(
                Role.id == role_id,
                Role.tenant_id == UUID(tenant_id)
            )
        )
    )
    role = result.scalar_one_or_none()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    return RoleResponse.model_validate(role)


@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: UUID,
    role_data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Update a role.

    Requires: settings.update permission
    Note: System roles cannot be modified.
    """
    result = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions))
        .where(
            and_(
                Role.id == role_id,
                Role.tenant_id == UUID(tenant_id)
            )
        )
    )
    role = result.scalar_one_or_none()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System roles cannot be modified"
        )

    # Update fields
    update_data = role_data.model_dump(exclude_unset=True, exclude={'permission_ids'})
    for field, value in update_data.items():
        setattr(role, field, value)

    # Update permissions if provided
    if role_data.permission_ids is not None:
        permissions_result = await db.execute(
            select(Permission).where(
                and_(
                    Permission.id.in_(role_data.permission_ids),
                    Permission.tenant_id == UUID(tenant_id)
                )
            )
        )
        permissions = permissions_result.scalars().all()
        role.permissions = permissions

    await db.commit()
    await db.refresh(role)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="UPDATE",
        target=str(role.id),
        resource_type="role",
        details={"name": role.name},
        tenant_id=UUID(tenant_id),
    )

    return RoleResponse.model_validate(role)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("settings.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Delete a role.

    Requires: settings.update permission
    Note: System roles cannot be deleted.
    """
    result = await db.execute(
        select(Role).where(
            and_(
                Role.id == role_id,
                Role.tenant_id == UUID(tenant_id)
            )
        )
    )
    role = result.scalar_one_or_none()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )

    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System roles cannot be deleted"
        )

    # Log audit before deletion
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="DELETE",
        target=str(role.id),
        resource_type="role",
        details={"name": role.name},
        tenant_id=UUID(tenant_id),
    )

    await db.delete(role)
    await db.commit()

    return None
