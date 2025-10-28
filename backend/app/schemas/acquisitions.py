"""
Pydantic schemas for Acquisitions module
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


# ============================================================================
# Vendor / Organization Schemas
# ============================================================================

class VendorContactCreate(BaseModel):
    """Schema for creating a vendor contact"""
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    role: Optional[str] = Field(None, max_length=100)


class VendorContactResponse(VendorContactCreate):
    """Schema for vendor contact response"""
    id: UUID
    vendor_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VendorAddressCreate(BaseModel):
    """Schema for creating a vendor address"""
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state_region: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(..., min_length=2, max_length=100)
    is_primary: bool = False


class VendorAddressResponse(VendorAddressCreate):
    """Schema for vendor address response"""
    id: UUID
    vendor_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VendorCreate(BaseModel):
    """Schema for creating a vendor"""
    code: str = Field(..., min_length=1, max_length=50, description="Unique vendor code")
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    vendor_status: str = Field(default="active", pattern="^(active|inactive|pending)$")
    payment_method: Optional[str] = Field(None, max_length=50)
    discount_percent: Optional[Decimal] = Field(None, ge=0, le=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    language: str = Field(default="en", max_length=10)
    currency: str = Field(default="USD", max_length=3)
    is_vendor: bool = True
    is_customer: bool = False
    contacts: Optional[List[VendorContactCreate]] = []
    addresses: Optional[List[VendorAddressCreate]] = []


class VendorUpdate(BaseModel):
    """Schema for updating a vendor"""
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    vendor_status: Optional[str] = Field(None, pattern="^(active|inactive|pending)$")
    payment_method: Optional[str] = Field(None, max_length=50)
    discount_percent: Optional[Decimal] = Field(None, ge=0, le=100)
    tax_id: Optional[str] = None
    language: Optional[str] = None
    currency: Optional[str] = None
    is_vendor: Optional[bool] = None
    is_customer: Optional[bool] = None


class VendorResponse(BaseModel):
    """Schema for vendor response"""
    id: UUID
    code: str
    name: str
    description: Optional[str]
    vendor_status: str
    payment_method: Optional[str]
    discount_percent: Optional[Decimal]
    tax_id: Optional[str]
    language: str
    currency: str
    is_vendor: bool
    is_customer: bool
    contacts: List[VendorContactResponse] = []
    addresses: List[VendorAddressResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VendorListItem(BaseModel):
    """Schema for vendor list item"""
    id: UUID
    code: str
    name: str
    vendor_status: str
    payment_method: Optional[str]
    is_vendor: bool
    is_customer: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Fund Schemas
# ============================================================================

class FundCreate(BaseModel):
    """Schema for creating a fund"""
    code: str = Field(..., min_length=1, max_length=50, description="Unique fund code")
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    fund_status: str = Field(default="active", pattern="^(active|inactive|frozen)$")
    fund_type: Optional[str] = Field(None, max_length=50)
    allocated_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    currency: str = Field(default="USD", max_length=3)


class FundUpdate(BaseModel):
    """Schema for updating a fund"""
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    fund_status: Optional[str] = Field(None, pattern="^(active|inactive|frozen)$")
    fund_type: Optional[str] = None
    allocated_amount: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = None


class FundResponse(BaseModel):
    """Schema for fund response"""
    id: UUID
    code: str
    name: str
    description: Optional[str]
    fund_status: str
    fund_type: Optional[str]
    allocated_amount: Decimal
    available_amount: Decimal
    expenditure_amount: Decimal
    encumbrance_amount: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Purchase Order Schemas
# ============================================================================

class PurchaseOrderCreate(BaseModel):
    """Schema for creating a purchase order"""
    po_number: str = Field(..., min_length=1, max_length=50, description="Unique PO number")
    vendor_id: UUID
    order_type: str = Field(..., pattern="^(one_time|ongoing)$")
    workflow_status: str = Field(default="pending", pattern="^(pending|open|closed|cancelled)$")
    approved: bool = False
    ship_to: Optional[str] = Field(None, max_length=500)
    bill_to: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class PurchaseOrderUpdate(BaseModel):
    """Schema for updating a purchase order"""
    vendor_id: Optional[UUID] = None
    order_type: Optional[str] = Field(None, pattern="^(one_time|ongoing)$")
    workflow_status: Optional[str] = Field(None, pattern="^(pending|open|closed|cancelled)$")
    approved: Optional[bool] = None
    ship_to: Optional[str] = None
    bill_to: Optional[str] = None
    notes: Optional[str] = None


class PurchaseOrderResponse(BaseModel):
    """Schema for purchase order response"""
    id: UUID
    po_number: str
    vendor_id: UUID
    vendor_name: Optional[str]
    order_type: str
    workflow_status: str
    approved: bool
    total_items: int
    total_estimated_price: Decimal
    ship_to: Optional[str]
    bill_to: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PurchaseOrderListItem(BaseModel):
    """Schema for purchase order list item"""
    id: UUID
    po_number: str
    vendor_id: UUID
    vendor_name: Optional[str]
    order_type: str
    workflow_status: str
    approved: bool
    total_items: int
    total_estimated_price: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Order Line Schemas
# ============================================================================

class OrderLineCreate(BaseModel):
    """Schema for creating an order line"""
    po_id: UUID
    title: str = Field(..., min_length=1, max_length=500)
    item_id: Optional[UUID] = None
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", max_length=3)
    fund_id: Optional[UUID] = None
    acquisition_method: Optional[str] = Field(None, max_length=50)
    receipt_status: str = Field(default="pending", pattern="^(pending|partially_received|received|cancelled)$")
    payment_status: str = Field(default="pending", pattern="^(pending|partially_paid|paid|cancelled)$")


class OrderLineUpdate(BaseModel):
    """Schema for updating an order line"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    quantity: Optional[int] = Field(None, ge=1)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = None
    fund_id: Optional[UUID] = None
    acquisition_method: Optional[str] = None
    receipt_status: Optional[str] = Field(None, pattern="^(pending|partially_received|received|cancelled)$")
    payment_status: Optional[str] = Field(None, pattern="^(pending|partially_paid|paid|cancelled)$")


class OrderLineResponse(BaseModel):
    """Schema for order line response"""
    id: UUID
    po_id: UUID
    po_number: Optional[str]
    title: str
    item_id: Optional[UUID]
    quantity: int
    quantity_received: int
    unit_price: Decimal
    total_price: Decimal
    currency: str
    fund_id: Optional[UUID]
    fund_code: Optional[str]
    acquisition_method: Optional[str]
    receipt_status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Invoice Schemas
# ============================================================================

class InvoiceCreate(BaseModel):
    """Schema for creating an invoice"""
    invoice_number: str = Field(..., min_length=1, max_length=50)
    vendor_id: UUID
    invoice_date: datetime
    payment_due_date: Optional[datetime] = None
    payment_terms: Optional[str] = Field(None, max_length=255)
    status: str = Field(default="open", pattern="^(open|approved|paid|cancelled)$")
    notes: Optional[str] = None


class InvoiceUpdate(BaseModel):
    """Schema for updating an invoice"""
    vendor_id: Optional[UUID] = None
    invoice_date: Optional[datetime] = None
    payment_due_date: Optional[datetime] = None
    payment_terms: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(open|approved|paid|cancelled)$")
    notes: Optional[str] = None


class InvoiceResponse(BaseModel):
    """Schema for invoice response"""
    id: UUID
    invoice_number: str
    vendor_id: UUID
    vendor_name: Optional[str]
    invoice_date: datetime
    payment_due_date: Optional[datetime]
    payment_terms: Optional[str]
    status: str
    total_amount: Decimal
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvoiceListItem(BaseModel):
    """Schema for invoice list item"""
    id: UUID
    invoice_number: str
    vendor_id: UUID
    vendor_name: Optional[str]
    invoice_date: datetime
    payment_due_date: Optional[datetime]
    status: str
    total_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Invoice Line Schemas
# ============================================================================

class InvoiceLineCreate(BaseModel):
    """Schema for creating an invoice line"""
    invoice_id: UUID
    order_line_id: Optional[UUID] = None
    description: str = Field(..., min_length=1, max_length=500)
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., ge=0)
    total: Decimal = Field(..., ge=0)


class InvoiceLineUpdate(BaseModel):
    """Schema for updating an invoice line"""
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    quantity: Optional[int] = Field(None, ge=1)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    total: Optional[Decimal] = Field(None, ge=0)


class InvoiceLineResponse(BaseModel):
    """Schema for invoice line response"""
    id: UUID
    invoice_id: UUID
    order_line_id: Optional[UUID]
    description: str
    quantity: int
    unit_price: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
