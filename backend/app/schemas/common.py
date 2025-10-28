"""
Common schemas used across the application.
"""

from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, Field

T = TypeVar('T')


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_items: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""
    data: List[T]
    meta: PaginationMeta


class ErrorResponse(BaseModel):
    """Standard error response."""
    code: str
    message: str
    details: Optional[dict] = None


class BulkOperationResponse(BaseModel):
    """Response for bulk operations."""
    success_count: int
    failure_count: int
    errors: List[ErrorResponse] = []
