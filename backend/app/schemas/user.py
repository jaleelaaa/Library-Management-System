"""
User-related Pydantic schemas for request/response validation.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator


class AddressBase(BaseModel):
    """Base address schema."""
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    postal_code: Optional[str] = None
    country_id: Optional[str] = Field(None, max_length=2)
    address_type: Optional[str] = Field(None, max_length=50)
    primary_address: bool = False


class AddressCreate(AddressBase):
    """Schema for creating an address."""
    pass


class AddressResponse(AddressBase):
    """Schema for address response."""
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


class PersonalInfo(BaseModel):
    """Personal information structure (stored as JSON)."""
    lastName: str
    firstName: str
    middleName: Optional[str] = None
    preferredFirstName: Optional[str] = None
    pronouns: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    mobilePhone: Optional[str] = None
    dateOfBirth: Optional[str] = None
    preferredContactTypeId: Optional[str] = None


class UserBase(BaseModel):
    """Base user schema."""
    username: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    barcode: Optional[str] = Field(None, max_length=255)
    active: bool = True
    user_type: str = "patron"
    patron_group_id: Optional[UUID] = None
    personal: PersonalInfo
    enrollment_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    custom_fields: Dict[str, Any] = {}
    tags: List[str] = []
    preferred_email_communication: List[str] = []
    role_ids: List[UUID] = []


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=8)
    addresses: List[AddressCreate] = []

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength."""
        import re
        errors = []

        if len(v) < 8:
            errors.append('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            errors.append('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            errors.append('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            errors.append('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;'`~]", v):
            errors.append('Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;\'`~)')

        if errors:
            raise ValueError('; '.join(errors))
        return v


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    username: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    barcode: Optional[str] = None
    active: Optional[bool] = None
    user_type: Optional[str] = None
    patron_group_id: Optional[UUID] = None
    personal: Optional[PersonalInfo] = None
    enrollment_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    custom_fields: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    preferred_email_communication: Optional[List[str]] = None
    role_ids: Optional[List[UUID]] = None
    password: Optional[str] = Field(None, min_length=8)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength if provided."""
        if v is None:
            return v

        import re
        errors = []

        if len(v) < 8:
            errors.append('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            errors.append('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            errors.append('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            errors.append('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;'`~]", v):
            errors.append('Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;\'`~)')

        if errors:
            raise ValueError('; '.join(errors))
        return v


class PermissionSimple(BaseModel):
    """Simplified permission schema for nested responses."""
    id: UUID
    name: str
    display_name: str
    description: Optional[str] = None
    resource: str
    action: str

    class Config:
        from_attributes = True


class RoleSimple(BaseModel):
    """Simplified role schema for nested responses."""
    id: UUID
    name: str
    display_name: str
    description: Optional[str] = None
    permissions: List['PermissionSimple'] = []

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID
    addresses: List[AddressResponse] = []
    patron_group_name: Optional[str] = None
    roles: List[RoleSimple] = []

    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    """Schema for user list item (simplified)."""
    id: UUID
    username: str
    email: str
    barcode: Optional[str] = None
    active: bool
    user_type: str
    personal: PersonalInfo
    patron_group_id: Optional[UUID] = None
    patron_group_name: Optional[str] = None
    roles: List[RoleSimple] = []
    created_date: datetime

    class Config:
        from_attributes = True


class PatronGroupBase(BaseModel):
    """Base patron group schema."""
    group_name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    loan_period_days: str = "14"
    renewals_allowed: bool = True


class PatronGroupCreate(PatronGroupBase):
    """Schema for creating a patron group."""
    pass


class PatronGroupUpdate(BaseModel):
    """Schema for updating a patron group."""
    group_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    loan_period_days: Optional[str] = None
    renewals_allowed: Optional[bool] = None


class PatronGroupResponse(PatronGroupBase):
    """Schema for patron group response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID
    user_count: int = 0

    class Config:
        from_attributes = True


class DepartmentBase(BaseModel):
    """Base department schema."""
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=50)


class DepartmentCreate(DepartmentBase):
    """Schema for creating a department."""
    pass


class DepartmentUpdate(BaseModel):
    """Schema for updating a department."""
    name: Optional[str] = Field(None, max_length=255)
    code: Optional[str] = Field(None, max_length=50)


class DepartmentResponse(DepartmentBase):
    """Schema for department response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


class BulkUserCreate(BaseModel):
    """Schema for bulk user creation."""
    users: List[UserCreate]


class PasswordChange(BaseModel):
    """Schema for password change."""
    old_password: str
    new_password: str = Field(..., min_length=8)

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
