"""
Inventory schemas (Pydantic models).
"""

from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
import html


class InstanceBase(BaseModel):
    """Base instance schema."""
    title: str = Field(..., max_length=500)
    subtitle: Optional[str] = None
    instance_type: str = "text"
    identifiers: List[dict] = []
    contributors: List[dict] = []
    publication: List[dict] = []
    subjects: List[str] = []
    classifications: List[dict] = []
    languages: List[str] = []
    notes: List[dict] = []
    tags: List[str] = []
    discovery_suppress: bool = False
    staff_suppress: bool = False


class InstanceCreate(InstanceBase):
    """Schema for creating an instance."""

    @field_validator('title', 'subtitle')
    @classmethod
    def sanitize_html(cls, v):
        """Sanitize HTML to prevent XSS attacks."""
        if v is None:
            return v
        # Escape HTML special characters
        return html.escape(str(v))


class InstanceUpdate(BaseModel):
    """Schema for updating an instance."""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    instance_type: Optional[str] = None
    identifiers: Optional[List[dict]] = None
    contributors: Optional[List[dict]] = None
    publication: Optional[List[dict]] = None
    subjects: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    @field_validator('title', 'subtitle')
    @classmethod
    def sanitize_html(cls, v):
        """Sanitize HTML to prevent XSS attacks."""
        if v is None:
            return v
        # Escape HTML special characters
        return html.escape(str(v))


class InstanceResponse(InstanceBase):
    """Schema for instance response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


class InstanceList(BaseModel):
    """Schema for instance list item."""
    id: UUID
    title: str
    subtitle: Optional[str] = None
    instance_type: str
    contributors: List[dict] = []

    class Config:
        from_attributes = True


# Holdings Schemas
class HoldingBase(BaseModel):
    """Base holding schema."""
    instance_id: UUID
    permanent_location_id: Optional[UUID] = None
    temporary_location_id: Optional[UUID] = None
    call_number: Optional[str] = Field(None, max_length=255)
    call_number_prefix: Optional[str] = Field(None, max_length=50)
    call_number_suffix: Optional[str] = Field(None, max_length=50)
    shelving_title: Optional[str] = Field(None, max_length=500)
    acquisition_method: Optional[str] = Field(None, max_length=100)
    receipt_status: Optional[str] = Field(None, max_length=100)
    notes: List[dict] = []
    holdings_statements: List[dict] = []
    discovery_suppress: bool = False
    tags: List[str] = []


class HoldingCreate(HoldingBase):
    """Schema for creating a holding."""
    pass


class HoldingUpdate(BaseModel):
    """Schema for updating a holding."""
    permanent_location_id: Optional[UUID] = None
    temporary_location_id: Optional[UUID] = None
    call_number: Optional[str] = None
    call_number_prefix: Optional[str] = None
    call_number_suffix: Optional[str] = None
    shelving_title: Optional[str] = None
    notes: Optional[List[dict]] = None
    tags: Optional[List[str]] = None


class HoldingResponse(HoldingBase):
    """Schema for holding response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# Item Schemas
class ItemBase(BaseModel):
    """Base item schema."""
    holding_id: UUID
    barcode: Optional[str] = Field(None, max_length=255)
    accession_number: Optional[str] = Field(None, max_length=255)
    item_identifier: Optional[str] = Field(None, max_length=255)
    status: str = "available"
    material_type_id: Optional[UUID] = None
    permanent_location_id: Optional[UUID] = None
    temporary_location_id: Optional[UUID] = None
    effective_location_id: Optional[UUID] = None
    permanent_loan_type_id: Optional[UUID] = None
    temporary_loan_type_id: Optional[UUID] = None
    copy_number: Optional[str] = Field(None, max_length=50)
    volume: Optional[str] = Field(None, max_length=100)
    enumeration: Optional[str] = Field(None, max_length=100)
    chronology: Optional[str] = Field(None, max_length=100)
    number_of_pieces: int = 1
    description_of_pieces: Optional[str] = Field(None, max_length=500)
    notes: List[dict] = []
    circulation_notes: List[dict] = []
    discovery_suppress: bool = False
    tags: List[str] = []


class ItemCreate(ItemBase):
    """Schema for creating an item."""
    pass


class ItemUpdate(BaseModel):
    """Schema for updating an item."""
    barcode: Optional[str] = None
    status: Optional[str] = None
    material_type_id: Optional[UUID] = None
    permanent_location_id: Optional[UUID] = None
    temporary_location_id: Optional[UUID] = None
    copy_number: Optional[str] = None
    notes: Optional[List[dict]] = None
    tags: Optional[List[str]] = None


class ItemResponse(ItemBase):
    """Schema for item response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# Location Schemas
class LocationBase(BaseModel):
    """Base location schema."""
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=50)
    description: Optional[str] = None
    discovery_display_name: Optional[str] = Field(None, max_length=255)
    library_id: Optional[UUID] = None
    campus_id: Optional[UUID] = None
    institution_id: Optional[UUID] = None
    primary_service_point_id: Optional[UUID] = None
    is_active: bool = True


class LocationCreate(LocationBase):
    """Schema for creating a location."""
    pass


class LocationUpdate(BaseModel):
    """Schema for updating a location."""
    name: Optional[str] = None
    description: Optional[str] = None
    discovery_display_name: Optional[str] = None
    library_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class LocationResponse(LocationBase):
    """Schema for location response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# Library Schemas
class LibraryBase(BaseModel):
    """Base library schema."""
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=50)


class LibraryCreate(LibraryBase):
    """Schema for creating a library."""
    pass


class LibraryUpdate(BaseModel):
    """Schema for updating a library."""
    name: Optional[str] = None
    code: Optional[str] = None


class LibraryResponse(LibraryBase):
    """Schema for library response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True
