"""
Permission and Role related Pydantic schemas for request/response validation.
"""

from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class PermissionBase(BaseModel):
    """Base permission schema."""
    name: str = Field(..., max_length=255, description="Permission name (e.g., 'users.create')")
    display_name: str = Field(..., max_length=255, description="Human-readable permission name")
    description: Optional[str] = Field(None, max_length=500)
    resource: str = Field(..., max_length=100, description="Resource type (e.g., 'users', 'inventory')")
    action: str = Field(..., max_length=50, description="Action (e.g., 'create', 'read', 'update', 'delete')")


class PermissionCreate(PermissionBase):
    """Schema for creating a permission."""
    pass


class PermissionUpdate(BaseModel):
    """Schema for updating a permission."""
    name: Optional[str] = Field(None, max_length=255)
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    resource: Optional[str] = Field(None, max_length=100)
    action: Optional[str] = Field(None, max_length=50)


class PermissionResponse(PermissionBase):
    """Schema for permission response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    """Base role schema."""
    name: str = Field(..., max_length=255, description="Role name (e.g., 'librarian')")
    display_name: str = Field(..., max_length=255, description="Human-readable role name (e.g., 'Librarian')")
    description: Optional[str] = Field(None, max_length=500)


class RoleCreate(RoleBase):
    """Schema for creating a role."""
    permission_ids: List[UUID] = Field(default=[], description="List of permission IDs to assign to this role")


class RoleUpdate(BaseModel):
    """Schema for updating a role."""
    name: Optional[str] = Field(None, max_length=255)
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    permission_ids: Optional[List[UUID]] = Field(None, description="List of permission IDs to assign to this role")


class RoleResponse(RoleBase):
    """Schema for role response."""
    id: UUID
    is_system: bool = False
    permissions: List[PermissionResponse] = []
    created_date: datetime
    updated_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoleListItem(BaseModel):
    """Schema for role list item (simplified)."""
    id: UUID
    name: str
    display_name: str
    description: Optional[str] = None
    is_system: bool = False
    permission_count: int = 0
    created_date: datetime

    class Config:
        from_attributes = True
