"""
Fee/Fine schemas for API validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator


# ============================================================================
# Fee Schemas
# ============================================================================

class FeeBase(BaseModel):
    """Base schema for fee/fine records."""
    user_id: UUID
    loan_id: Optional[UUID] = None
    item_id: Optional[UUID] = None
    fee_type: str = Field(..., description="Fee type: overdue, lost_item, damaged_item, etc.")
    amount: Decimal = Field(..., ge=0, description="Original fee amount (2 decimal places)")
    description: Optional[str] = Field(None, max_length=500)
    reason: Optional[str] = None
    due_date: Optional[datetime] = Field(None, description="Payment due date")
    automated: bool = Field(default=False, description="System-generated vs manual fee")
    fee_metadata: Optional[str] = Field(None, description="JSON metadata for extensibility")

    @field_validator('fee_type')
    @classmethod
    def validate_fee_type(cls, v: str) -> str:
        """Validate fee type."""
        allowed_types = ['overdue', 'lost_item', 'damaged_item', 'processing',
                        'replacement', 'lost_item_processing', 'manual']
        if v not in allowed_types:
            raise ValueError(f"Invalid fee type. Must be one of: {', '.join(allowed_types)}")
        return v


class FeeCreate(FeeBase):
    """Schema for creating a new fee."""
    pass


class FeeUpdate(BaseModel):
    """Schema for updating a fee."""
    description: Optional[str] = Field(None, max_length=500)
    reason: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = Field(None, description="Fee status: open, closed, suspended")
    fee_metadata: Optional[str] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        """Validate fee status."""
        if v is not None:
            allowed_statuses = ['open', 'closed', 'suspended']
            if v not in allowed_statuses:
                raise ValueError(f"Invalid status. Must be one of: {', '.join(allowed_statuses)}")
        return v


class FeeResponse(FeeBase):
    """Schema for fee response."""
    id: UUID
    status: str
    remaining: Decimal = Field(..., description="Amount still owed")
    paid_amount: Decimal = Field(..., description="Amount paid")
    fee_date: datetime
    closed_date: Optional[datetime] = None
    created_date: datetime
    updated_date: Optional[datetime] = None
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# ============================================================================
# Payment Schemas
# ============================================================================

class PaymentBase(BaseModel):
    """Base schema for payment records."""
    fee_id: UUID
    payment_method: str = Field(..., description="Payment method: cash, check, credit_card, etc.")
    amount: Decimal = Field(..., gt=0, description="Payment amount (2 decimal places)")
    transaction_info: Optional[str] = Field(None, max_length=500, description="Transaction ID, check number, etc.")
    comments: Optional[str] = None
    payment_date: Optional[datetime] = Field(default_factory=datetime.utcnow)

    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        """Validate payment method."""
        allowed_methods = ['cash', 'check', 'credit_card', 'transfer', 'waive', 'forgive', 'refund']
        if v not in allowed_methods:
            raise ValueError(f"Invalid payment method. Must be one of: {', '.join(allowed_methods)}")
        return v


class PaymentCreate(PaymentBase):
    """Schema for creating a payment."""
    pass


class PaymentResponse(PaymentBase):
    """Schema for payment response."""
    id: UUID
    user_id: UUID
    balance: Decimal = Field(..., description="Balance remaining after this payment")
    created_date: datetime
    updated_date: Optional[datetime] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# ============================================================================
# Fee Policy Schemas
# ============================================================================

class FeePolicyBase(BaseModel):
    """Base schema for fee policy configuration."""
    name: str = Field(..., max_length=255)
    code: str = Field(..., max_length=50, description="Unique policy code")
    description: Optional[str] = None
    fee_type: str = Field(..., description="Fee type this policy applies to")
    initial_amount: Optional[Decimal] = Field(None, ge=0)
    max_amount: Optional[Decimal] = Field(None, ge=0)
    per_day_amount: Optional[Decimal] = Field(None, ge=0, description="Daily rate for overdue fees")
    grace_period_days: int = Field(default=0, ge=0, description="Days before fees start")
    is_active: bool = Field(default=True)

    @field_validator('fee_type')
    @classmethod
    def validate_fee_type(cls, v: str) -> str:
        """Validate fee type."""
        allowed_types = ['overdue', 'lost_item', 'damaged_item', 'processing',
                        'replacement', 'lost_item_processing', 'manual']
        if v not in allowed_types:
            raise ValueError(f"Invalid fee type. Must be one of: {', '.join(allowed_types)}")
        return v


class FeePolicyCreate(FeePolicyBase):
    """Schema for creating a fee policy."""
    pass


class FeePolicyUpdate(BaseModel):
    """Schema for updating a fee policy."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    initial_amount: Optional[Decimal] = Field(None, ge=0)
    max_amount: Optional[Decimal] = Field(None, ge=0)
    per_day_amount: Optional[Decimal] = Field(None, ge=0)
    grace_period_days: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class FeePolicyResponse(FeePolicyBase):
    """Schema for fee policy response."""
    id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    tenant_id: UUID

    class Config:
        from_attributes = True


# ============================================================================
# Waive/Forgive Schemas
# ============================================================================

class FeeWaiveRequest(BaseModel):
    """Schema for waiving/forgiving a fee."""
    amount: Optional[Decimal] = Field(None, gt=0, description="Amount to waive (defaults to full remaining)")
    reason: str = Field(..., min_length=1, description="Reason for waiving the fee")
    payment_method: str = Field(default="waive", description="Use 'waive' or 'forgive'")

    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        """Validate payment method is waive or forgive."""
        if v not in ['waive', 'forgive']:
            raise ValueError("Payment method must be 'waive' or 'forgive'")
        return v


# ============================================================================
# User Fees Summary
# ============================================================================

class UserFeesSummary(BaseModel):
    """Summary of fees for a user."""
    user_id: UUID
    total_fees: int = Field(..., description="Total number of fees")
    open_fees: int = Field(..., description="Number of open fees")
    total_owed: Decimal = Field(..., description="Total amount owed across all open fees")
    total_paid: Decimal = Field(..., description="Total amount paid historically")
    oldest_fee_date: Optional[datetime] = Field(None, description="Date of oldest open fee")
