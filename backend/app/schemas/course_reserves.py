"""
Pydantic schemas for Course Reserves module
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================================================
# Course Schemas
# ============================================================================

class CourseCreate(BaseModel):
    """Schema for creating a course"""
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    instructor_id: Optional[UUID] = None
    start_date: datetime
    end_date: datetime
    status: str = Field(default="active", pattern="^(active|inactive|archived)$")


class CourseUpdate(BaseModel):
    """Schema for updating a course"""
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    instructor_id: Optional[UUID] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive|archived)$")


class CourseResponse(BaseModel):
    """Schema for course response"""
    id: UUID
    code: str
    name: str
    department: Optional[str]
    instructor_id: Optional[UUID]
    instructor_name: Optional[str]
    start_date: datetime
    end_date: datetime
    status: str
    total_reserves: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseListItem(BaseModel):
    """Schema for course list item"""
    id: UUID
    code: str
    name: str
    department: Optional[str]
    instructor_name: Optional[str]
    start_date: datetime
    end_date: datetime
    status: str
    total_reserves: int

    class Config:
        from_attributes = True


# ============================================================================
# Reserve Schemas
# ============================================================================

class ReserveCreate(BaseModel):
    """Schema for creating a reserve"""
    course_id: UUID
    item_id: UUID
    reserve_type: str = Field(..., pattern="^(physical|electronic)$")
    processing_status: str = Field(default="pending", pattern="^(pending|available|unavailable)$")
    copyright_status: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class ReserveUpdate(BaseModel):
    """Schema for updating a reserve"""
    reserve_type: Optional[str] = Field(None, pattern="^(physical|electronic)$")
    processing_status: Optional[str] = Field(None, pattern="^(pending|available|unavailable)$")
    copyright_status: Optional[str] = None
    notes: Optional[str] = None


class ReserveResponse(BaseModel):
    """Schema for reserve response"""
    id: UUID
    course_id: UUID
    course_code: Optional[str]
    course_name: Optional[str]
    item_id: UUID
    item_barcode: Optional[str]
    item_title: Optional[str]
    reserve_type: str
    processing_status: str
    copyright_status: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
