"""
Circulation-related Pydantic schemas for request/response validation.
"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from enum import Enum


class LoanStatus(str, Enum):
    """Loan status enumeration."""
    OPEN = "open"
    CLOSED = "closed"
    CLAIMED_RETURNED = "claimed_returned"


class RequestStatus(str, Enum):
    """Request status enumeration."""
    OPEN_NOT_YET_FILLED = "open_not_yet_filled"
    OPEN_AWAITING_PICKUP = "open_awaiting_pickup"
    OPEN_IN_TRANSIT = "open_in_transit"
    CLOSED_FILLED = "closed_filled"
    CLOSED_CANCELLED = "closed_cancelled"
    CLOSED_UNFILLED = "closed_unfilled"
    CLOSED_PICKUP_EXPIRED = "closed_pickup_expired"


class RequestType(str, Enum):
    """Request type enumeration."""
    HOLD = "hold"
    RECALL = "recall"
    PAGE = "page"


# ============================================================================
# CHECK-OUT / CHECK-IN SCHEMAS
# ============================================================================

class CheckOutRequest(BaseModel):
    """Schema for check-out request."""
    item_barcode: str = Field(..., description="Barcode of the item to check out")
    user_barcode: str = Field(..., description="Barcode of the user checking out")
    service_point_id: UUID = Field(..., description="Service point ID where checkout occurs")
    due_date: Optional[datetime] = Field(None, description="Custom due date (optional)")


class CheckOutResponse(BaseModel):
    """Schema for check-out response."""
    loan_id: UUID
    item_id: UUID
    user_id: UUID
    item_barcode: str
    user_barcode: str
    loan_date: datetime
    due_date: datetime
    status: LoanStatus
    item_title: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class CheckInRequest(BaseModel):
    """Schema for check-in request."""
    item_barcode: str = Field(..., description="Barcode of the item to check in")
    service_point_id: UUID = Field(..., description="Service point ID where checkin occurs")
    check_in_date: Optional[datetime] = Field(None, description="Custom check-in date (optional)")


class CheckInResponse(BaseModel):
    """Schema for check-in response."""
    loan_id: UUID
    item_id: UUID
    user_id: UUID
    item_barcode: str
    user_barcode: Optional[str] = None
    loan_date: datetime
    due_date: datetime
    return_date: datetime
    status: LoanStatus
    item_title: Optional[str] = None
    was_overdue: bool = False
    fine_amount: Optional[float] = None

    class Config:
        from_attributes = True


class RenewRequest(BaseModel):
    """Schema for loan renewal request."""
    item_barcode: str = Field(..., description="Barcode of the item to renew")
    user_barcode: Optional[str] = Field(None, description="User barcode (optional)")


class RenewResponse(BaseModel):
    """Schema for loan renewal response."""
    loan_id: UUID
    item_id: UUID
    user_id: UUID
    previous_due_date: datetime
    new_due_date: datetime
    renewal_count: int
    max_renewals: int

    class Config:
        from_attributes = True


# ============================================================================
# LOAN SCHEMAS
# ============================================================================

class LoanBase(BaseModel):
    """Base loan schema."""
    user_id: UUID
    item_id: UUID
    loan_date: datetime
    due_date: datetime
    status: LoanStatus = LoanStatus.OPEN
    renewal_count: int = 0
    max_renewals: int = 3


class LoanCreate(LoanBase):
    """Schema for creating a loan."""
    checkout_service_point_id: UUID


class LoanUpdate(BaseModel):
    """Schema for updating a loan."""
    due_date: Optional[datetime] = None
    status: Optional[LoanStatus] = None
    return_date: Optional[datetime] = None
    checkin_service_point_id: Optional[UUID] = None


class LoanResponse(LoanBase):
    """Schema for loan response."""
    id: UUID
    return_date: Optional[datetime] = None
    checkout_service_point_id: UUID
    checkin_service_point_id: Optional[UUID] = None
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    # Joined data
    item_barcode: Optional[str] = None
    item_title: Optional[str] = None
    user_barcode: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# REQUEST (HOLD) SCHEMAS
# ============================================================================

class RequestBase(BaseModel):
    """Base request schema."""
    user_id: UUID
    item_id: UUID
    request_type: RequestType = RequestType.HOLD
    fulfillment_preference: str = "Hold Shelf"
    pickup_service_point_id: Optional[UUID] = None


class RequestCreate(RequestBase):
    """Schema for creating a request."""
    request_expiration_date: Optional[datetime] = None


class RequestUpdate(BaseModel):
    """Schema for updating a request."""
    status: Optional[RequestStatus] = None
    position: Optional[int] = None
    request_expiration_date: Optional[datetime] = None
    pickup_service_point_id: Optional[UUID] = None


class RequestResponse(RequestBase):
    """Schema for request response."""
    id: UUID
    request_date: datetime
    request_expiration_date: Optional[datetime] = None
    status: RequestStatus
    position: int
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    # Joined data
    item_barcode: Optional[str] = None
    item_title: Optional[str] = None
    user_barcode: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# SERVICE POINT SCHEMAS
# ============================================================================

class ServicePointBase(BaseModel):
    """Base service point schema."""
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=50)
    discovery_display_name: str = Field(..., max_length=255)
    description: Optional[str] = None
    is_active: bool = True


class ServicePointCreate(ServicePointBase):
    """Schema for creating a service point."""
    pass


class ServicePointUpdate(BaseModel):
    """Schema for updating a service point."""
    name: Optional[str] = Field(None, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    discovery_display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ServicePointResponse(ServicePointBase):
    """Schema for service point response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# ============================================================================
# LOAN POLICY SCHEMAS
# ============================================================================

class LoanPolicyBase(BaseModel):
    """Base loan policy schema."""
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=50, description="Unique policy code")
    description: Optional[str] = None

    # Loan period configuration
    loan_period_duration: int = Field(14, ge=1, description="Duration of loan period")
    loan_period_interval: str = Field("Days", description="Interval: Days, Weeks, Months")

    # Renewability
    renewable: bool = Field(True, description="Whether items are renewable")
    number_of_renewals_allowed: int = Field(3, ge=0, description="Number of renewals allowed")
    renewal_period_duration: int = Field(14, ge=1, description="Duration of renewal period")
    renewal_period_interval: str = Field("Days", description="Interval: Days, Weeks, Months")

    # Grace period
    grace_period_duration: int = Field(0, ge=0, description="Duration of grace period")
    grace_period_interval: str = Field("Days", description="Interval: Days, Weeks, Months")

    # Recall configuration (optional)
    recall_return_interval_duration: Optional[int] = Field(None, ge=1)
    recall_return_interval_interval: Optional[str] = None

    # Active status
    is_active: bool = Field(True, description="Whether policy is active")


class LoanPolicyCreate(LoanPolicyBase):
    """Schema for creating a loan policy."""
    pass


class LoanPolicyUpdate(BaseModel):
    """Schema for updating a loan policy."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    loan_period_duration: Optional[int] = Field(None, ge=1)
    loan_period_interval: Optional[str] = None
    renewable: Optional[bool] = None
    number_of_renewals_allowed: Optional[int] = Field(None, ge=0)
    renewal_period_duration: Optional[int] = Field(None, ge=1)
    renewal_period_interval: Optional[str] = None
    grace_period_duration: Optional[int] = Field(None, ge=0)
    grace_period_interval: Optional[str] = None
    recall_return_interval_duration: Optional[int] = None
    recall_return_interval_interval: Optional[str] = None
    is_active: Optional[bool] = None


class LoanPolicyResponse(LoanPolicyBase):
    """Schema for loan policy response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    tenant_id: UUID

    class Config:
        from_attributes = True
