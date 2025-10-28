"""
Pydantic schemas for Course and Reserve models.
"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================================================
# COURSE SCHEMAS
# ============================================================================

class CourseBase(BaseModel):
    """Base schema for Course."""
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=50)
    department_id: Optional[UUID] = None
    term: Optional[str] = Field(None, max_length=100)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    instructor_id: Optional[UUID] = None
    is_active: bool = True
    description: Optional[str] = Field(None, max_length=1000)


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating a course."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    department_id: Optional[UUID] = None
    term: Optional[str] = Field(None, max_length=100)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    instructor_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=1000)


class CourseResponse(CourseBase):
    """Schema for course response."""
    id: UUID
    tenant_id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    created_by_user_id: Optional[UUID] = None
    updated_by_user_id: Optional[UUID] = None

    class Config:
        from_attributes = True


# ============================================================================
# RESERVE SCHEMAS
# ============================================================================

class ReserveBase(BaseModel):
    """Base schema for Reserve."""
    item_id: UUID
    reserve_type: Optional[str] = Field(None, max_length=50)
    loan_period: Optional[str] = Field(None, max_length=50)


class ReserveCreate(ReserveBase):
    """Schema for creating a new reserve."""
    pass


class ReserveResponse(ReserveBase):
    """Schema for reserve response."""
    id: UUID
    course_id: UUID
    tenant_id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None

    class Config:
        from_attributes = True
