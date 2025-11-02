"""
API endpoints for Acquisitions module
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, get_current_user, get_current_tenant, require_permission
from app.models.user import User
from app.models.acquisition import (
    Vendor, OrderLine, Order, Fund
)
# TODO: The following models don't exist yet in acquisition.py:
# VendorContact, VendorAddress, Invoice, InvoiceLine
from app.schemas.acquisitions import (
    VendorCreate, VendorUpdate, VendorResponse, VendorListItem,
    VendorContactCreate, VendorAddressCreate,
    FundCreate, FundUpdate, FundResponse,
    PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse, PurchaseOrderListItem,
    OrderLineCreate, OrderLineUpdate, OrderLineResponse,
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceListItem,
    InvoiceLineCreate, InvoiceLineUpdate, InvoiceLineResponse
)
from app.schemas.common import PaginatedResponse

router = APIRouter()


# ============================================================================
# Vendor Endpoints
# ============================================================================

@router.get("/vendors/", response_model=PaginatedResponse[VendorListItem])
async def list_vendors(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    vendor_status: Optional[str] = None,
    is_vendor: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all vendors with pagination and filters"""
    query = select(Vendor).where(Vendor.tenant_id == tenant_id)

    # Apply filters
    if search:
        query = query.where(
            or_(
                Vendor.name.ilike(f"%{search}%"),
                Vendor.code.ilike(f"%{search}%"),
                Vendor.description.ilike(f"%{search}%")
            )
        )

    if vendor_status:
        query = query.where(Vendor.vendor_status == vendor_status)

    if is_vendor is not None:
        query = query.where(Vendor.is_vendor == is_vendor)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(Vendor.name).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    vendors = result.scalars().all()

    return {
        "data": vendors,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/vendors/", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    vendor_data: VendorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new vendor"""
    # Check if code already exists
    existing = await db.execute(
        select(Vendor).where(
            and_(
                Vendor.tenant_id == tenant_id,
                Vendor.code == vendor_data.code
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor with code '{vendor_data.code}' already exists"
        )

    # Create vendor
    vendor = Vendor(
        tenant_id=tenant_id,
        **vendor_data.model_dump(exclude={"contacts", "addresses"})
    )

    # Add contacts
    if vendor_data.contacts:
        for contact_data in vendor_data.contacts:
            contact = VendorContact(tenant_id=tenant_id, **contact_data.model_dump())
            vendor.contacts.append(contact)

    # Add addresses
    if vendor_data.addresses:
        for address_data in vendor_data.addresses:
            address = VendorAddress(tenant_id=tenant_id, **address_data.model_dump())
            vendor.addresses.append(address)

    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)

    # Load relationships
    await db.refresh(vendor, ["contacts", "addresses"])

    return vendor


@router.get("/vendors/{vendor_id}", response_model=VendorResponse)
async def get_vendor(
    vendor_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a vendor by ID"""
    result = await db.execute(
        select(Vendor)
        .options(selectinload(Vendor.contacts), selectinload(Vendor.addresses))
        .where(and_(Vendor.id == vendor_id, Vendor.tenant_id == tenant_id))
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    return vendor


@router.patch("/vendors/{vendor_id}", response_model=VendorResponse)
async def update_vendor(
    vendor_id: UUID,
    vendor_data: VendorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a vendor"""
    result = await db.execute(
        select(Vendor)
        .options(selectinload(Vendor.contacts), selectinload(Vendor.addresses))
        .where(and_(Vendor.id == vendor_id, Vendor.tenant_id == tenant_id))
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Check if code is being changed and already exists
    if vendor_data.code and vendor_data.code != vendor.code:
        existing = await db.execute(
            select(Vendor).where(
                and_(
                    Vendor.tenant_id == tenant_id,
                    Vendor.code == vendor_data.code,
                    Vendor.id != vendor_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vendor with code '{vendor_data.code}' already exists"
            )

    # Update fields
    update_data = vendor_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vendor, field, value)

    vendor.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(vendor)

    return vendor


@router.delete("/vendors/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(
    vendor_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a vendor"""
    result = await db.execute(
        select(Vendor).where(and_(Vendor.id == vendor_id, Vendor.tenant_id == tenant_id))
    )
    vendor = result.scalar_one_or_none()

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Check if vendor has associated purchase orders
    po_count = await db.execute(
        select(func.count()).select_from(Order).where(Order.vendor_id == vendor_id)
    )
    if po_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete vendor with existing purchase orders"
        )

    await db.delete(vendor)
    await db.commit()


# ============================================================================
# Fund Endpoints
# ============================================================================

@router.get("/funds/", response_model=PaginatedResponse[FundResponse])
async def list_funds(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    fund_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all funds with pagination and filters"""
    query = select(Fund).where(Fund.tenant_id == tenant_id)

    # Apply filters
    if search:
        query = query.where(
            or_(
                Fund.name.ilike(f"%{search}%"),
                Fund.code.ilike(f"%{search}%"),
                Fund.description.ilike(f"%{search}%")
            )
        )

    if fund_status:
        query = query.where(Fund.fund_status == fund_status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(Fund.name).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    funds = result.scalars().all()

    return {
        "data": funds,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/funds/", response_model=FundResponse, status_code=status.HTTP_201_CREATED)
async def create_fund(
    fund_data: FundCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new fund"""
    # Check if code already exists
    existing = await db.execute(
        select(Fund).where(
            and_(
                Fund.tenant_id == tenant_id,
                Fund.code == fund_data.code
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fund with code '{fund_data.code}' already exists"
        )

    # Create fund
    fund = Fund(
        tenant_id=tenant_id,
        available_amount=fund_data.allocated_amount,  # Initially all is available
        **fund_data.model_dump()
    )

    db.add(fund)
    await db.commit()
    await db.refresh(fund)

    return fund


@router.get("/funds/{fund_id}", response_model=FundResponse)
async def get_fund(
    fund_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a fund by ID"""
    result = await db.execute(
        select(Fund).where(and_(Fund.id == fund_id, Fund.tenant_id == tenant_id))
    )
    fund = result.scalar_one_or_none()

    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fund not found"
        )

    return fund


@router.patch("/funds/{fund_id}", response_model=FundResponse)
async def update_fund(
    fund_id: UUID,
    fund_data: FundUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a fund"""
    result = await db.execute(
        select(Fund).where(and_(Fund.id == fund_id, Fund.tenant_id == tenant_id))
    )
    fund = result.scalar_one_or_none()

    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fund not found"
        )

    # Check if code is being changed and already exists
    if fund_data.code and fund_data.code != fund.code:
        existing = await db.execute(
            select(Fund).where(
                and_(
                    Fund.tenant_id == tenant_id,
                    Fund.code == fund_data.code,
                    Fund.id != fund_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Fund with code '{fund_data.code}' already exists"
            )

    # Update fields
    update_data = fund_data.model_dump(exclude_unset=True)

    # If allocated_amount is being updated, adjust available_amount
    if 'allocated_amount' in update_data:
        old_allocated = fund.allocated_amount
        new_allocated = update_data['allocated_amount']
        difference = new_allocated - old_allocated
        fund.available_amount += difference

    for field, value in update_data.items():
        setattr(fund, field, value)

    fund.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(fund)

    return fund


@router.delete("/funds/{fund_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fund(
    fund_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a fund"""
    result = await db.execute(
        select(Fund).where(and_(Fund.id == fund_id, Fund.tenant_id == tenant_id))
    )
    fund = result.scalar_one_or_none()

    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fund not found"
        )

    # Check if fund has associated order lines
    ol_count = await db.execute(
        select(func.count()).select_from(OrderLine).where(OrderLine.fund_id == fund_id)
    )
    if ol_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete fund with existing order lines"
        )

    await db.delete(fund)
    await db.commit()


# ============================================================================
# Purchase Order Endpoints
# ============================================================================

@router.get("/purchase-orders/", response_model=PaginatedResponse[PurchaseOrderListItem])
async def list_purchase_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    vendor_id: Optional[UUID] = None,
    workflow_status: Optional[str] = None,
    approved: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all purchase orders with pagination and filters"""
    query = select(Order).where(Order.tenant_id == tenant_id)

    # Apply filters
    if search:
        query = query.where(
            or_(
                Order.po_number.ilike(f"%{search}%"),
                Order.notes.ilike(f"%{search}%")
            )
        )

    if vendor_id:
        query = query.where(Order.vendor_id == vendor_id)

    if workflow_status:
        query = query.where(Order.workflow_status == workflow_status)

    if approved is not None:
        query = query.where(Order.approved == approved)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    purchase_orders = result.scalars().all()

    # Get vendor names
    vendor_ids = [po.vendor_id for po in purchase_orders]
    vendors_result = await db.execute(
        select(Vendor).where(Vendor.id.in_(vendor_ids))
    )
    vendors = {v.id: v.name for v in vendors_result.scalars().all()}

    # Enrich with vendor names
    po_list = []
    for po in purchase_orders:
        po_dict = {
            "id": po.id,
            "po_number": po.po_number,
            "vendor_id": po.vendor_id,
            "vendor_name": vendors.get(po.vendor_id),
            "order_type": po.order_type,
            "workflow_status": po.workflow_status,
            "approved": po.approved,
            "total_items": po.total_items,
            "total_estimated_price": po.total_estimated_price,
            "created_at": po.created_at
        }
        po_list.append(po_dict)

    return {
        "data": po_list,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/purchase-orders/", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    po_data: PurchaseOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new purchase order"""
    # Check if PO number already exists
    existing = await db.execute(
        select(Order).where(
            and_(
                Order.tenant_id == tenant_id,
                Order.po_number == po_data.po_number
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Purchase order with number '{po_data.po_number}' already exists"
        )

    # Verify vendor exists
    vendor_result = await db.execute(
        select(Vendor).where(and_(Vendor.id == po_data.vendor_id, Vendor.tenant_id == tenant_id))
    )
    vendor = vendor_result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Create purchase order
    purchase_order = Order(
        tenant_id=tenant_id,
        **po_data.model_dump()
    )

    db.add(purchase_order)
    await db.commit()
    await db.refresh(purchase_order)

    return {
        **purchase_order.__dict__,
        "vendor_name": vendor.name
    }


@router.get("/purchase-orders/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    po_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a purchase order by ID"""
    result = await db.execute(
        select(Order).where(and_(Order.id == po_id, Order.tenant_id == tenant_id))
    )
    purchase_order = result.scalar_one_or_none()

    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    # Get vendor name
    vendor_result = await db.execute(
        select(Vendor).where(Vendor.id == purchase_order.vendor_id)
    )
    vendor = vendor_result.scalar_one_or_none()

    return {
        **purchase_order.__dict__,
        "vendor_name": vendor.name if vendor else None
    }


@router.patch("/purchase-orders/{po_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(
    po_id: UUID,
    po_data: PurchaseOrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a purchase order"""
    result = await db.execute(
        select(Order).where(and_(Order.id == po_id, Order.tenant_id == tenant_id))
    )
    purchase_order = result.scalar_one_or_none()

    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    # Update fields
    update_data = po_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(purchase_order, field, value)

    purchase_order.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(purchase_order)

    # Get vendor name
    vendor_result = await db.execute(
        select(Vendor).where(Vendor.id == purchase_order.vendor_id)
    )
    vendor = vendor_result.scalar_one_or_none()

    return {
        **purchase_order.__dict__,
        "vendor_name": vendor.name if vendor else None
    }


@router.delete("/purchase-orders/{po_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_purchase_order(
    po_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a purchase order"""
    result = await db.execute(
        select(Order).where(and_(Order.id == po_id, Order.tenant_id == tenant_id))
    )
    purchase_order = result.scalar_one_or_none()

    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    # Check if PO has associated order lines
    ol_count = await db.execute(
        select(func.count()).select_from(OrderLine).where(OrderLine.po_id == po_id)
    )
    if ol_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete purchase order with existing order lines"
        )

    await db.delete(purchase_order)
    await db.commit()


# ============================================================================
# Order Line Endpoints
# ============================================================================

@router.get("/order-lines/", response_model=PaginatedResponse[OrderLineResponse])
async def list_order_lines(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    po_id: Optional[UUID] = None,
    fund_id: Optional[UUID] = None,
    receipt_status: Optional[str] = None,
    payment_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all order lines with pagination and filters"""
    query = select(OrderLine).join(Order).where(Order.tenant_id == tenant_id)

    # Apply filters
    if po_id:
        query = query.where(OrderLine.po_id == po_id)

    if fund_id:
        query = query.where(OrderLine.fund_id == fund_id)

    if receipt_status:
        query = query.where(OrderLine.receipt_status == receipt_status)

    if payment_status:
        query = query.where(OrderLine.payment_status == payment_status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(OrderLine.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    order_lines = result.scalars().all()

    # Get PO numbers and fund codes
    po_ids = [ol.po_id for ol in order_lines]
    fund_ids = [ol.fund_id for ol in order_lines if ol.fund_id]

    pos_result = await db.execute(select(Order).where(Order.id.in_(po_ids)))
    pos = {po.id: po.po_number for po in pos_result.scalars().all()}

    funds_result = await db.execute(select(Fund).where(Fund.id.in_(fund_ids)))
    funds = {f.id: f.code for f in funds_result.scalars().all()}

    # Enrich with PO numbers and fund codes
    ol_list = []
    for ol in order_lines:
        ol_dict = {
            **ol.__dict__,
            "po_number": pos.get(ol.po_id),
            "fund_code": funds.get(ol.fund_id) if ol.fund_id else None
        }
        ol_list.append(ol_dict)

    return {
        "data": ol_list,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/order-lines/", response_model=OrderLineResponse, status_code=status.HTTP_201_CREATED)
async def create_order_line(
    ol_data: OrderLineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new order line"""
    # Verify PO exists
    po_result = await db.execute(
        select(Order).where(
            and_(
                Order.id == ol_data.po_id,
                Order.tenant_id == tenant_id
            )
        )
    )
    purchase_order = po_result.scalar_one_or_none()
    if not purchase_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    # Verify fund exists if provided
    fund = None
    if ol_data.fund_id:
        fund_result = await db.execute(
            select(Fund).where(
                and_(
                    Fund.id == ol_data.fund_id,
                    Fund.tenant_id == tenant_id
                )
            )
        )
        fund = fund_result.scalar_one_or_none()
        if not fund:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fund not found"
            )

    # Create order line
    total_price = ol_data.unit_price * ol_data.quantity
    order_line = OrderLine(
        **ol_data.model_dump(),
        total_price=total_price,
        quantity_received=0
    )

    # Update fund encumbrance if fund is specified
    if fund:
        fund.encumbrance_amount += total_price
        fund.available_amount -= total_price

    # Update PO totals
    purchase_order.total_items += ol_data.quantity
    purchase_order.total_estimated_price += total_price

    db.add(order_line)
    await db.commit()
    await db.refresh(order_line)

    return {
        **order_line.__dict__,
        "po_number": purchase_order.po_number,
        "fund_code": fund.code if fund else None
    }


@router.patch("/order-lines/{ol_id}", response_model=OrderLineResponse)
async def update_order_line(
    ol_id: UUID,
    ol_data: OrderLineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update an order line"""
    result = await db.execute(
        select(OrderLine).join(Order).where(
            and_(
                OrderLine.id == ol_id,
                Order.tenant_id == tenant_id
            )
        )
    )
    order_line = result.scalar_one_or_none()

    if not order_line:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order line not found"
        )

    # Get associated PO and fund
    po_result = await db.execute(
        select(Order).where(Order.id == order_line.po_id)
    )
    purchase_order = po_result.scalar_one()

    old_fund = None
    if order_line.fund_id:
        old_fund_result = await db.execute(
            select(Fund).where(Fund.id == order_line.fund_id)
        )
        old_fund = old_fund_result.scalar_one_or_none()

    # Calculate old total
    old_total = order_line.total_price

    # Update fields
    update_data = ol_data.model_dump(exclude_unset=True)

    # Recalculate total if quantity or unit_price changed
    new_quantity = update_data.get('quantity', order_line.quantity)
    new_unit_price = update_data.get('unit_price', order_line.unit_price)
    new_total = new_quantity * new_unit_price

    for field, value in update_data.items():
        setattr(order_line, field, value)

    order_line.total_price = new_total
    order_line.updated_at = datetime.utcnow()

    # Update fund encumbrances
    if old_fund:
        old_fund.encumbrance_amount -= old_total
        old_fund.available_amount += old_total
        old_fund.encumbrance_amount += new_total
        old_fund.available_amount -= new_total

    # Update PO totals
    purchase_order.total_estimated_price = purchase_order.total_estimated_price - old_total + new_total

    await db.commit()
    await db.refresh(order_line)

    return {
        **order_line.__dict__,
        "po_number": purchase_order.po_number,
        "fund_code": old_fund.code if old_fund else None
    }


# ============================================================================
# Invoice Endpoints
# ============================================================================

@router.get("/invoices/", response_model=PaginatedResponse[InvoiceListItem])
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    vendor_id: Optional[UUID] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all invoices with pagination and filters"""
    query = select(Invoice).where(Invoice.tenant_id == tenant_id)

    # Apply filters
    if search:
        query = query.where(
            or_(
                Invoice.invoice_number.ilike(f"%{search}%"),
                Invoice.notes.ilike(f"%{search}%")
            )
        )

    if vendor_id:
        query = query.where(Invoice.vendor_id == vendor_id)

    if status:
        query = query.where(Invoice.status == status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(Invoice.invoice_date.desc()).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    invoices = result.scalars().all()

    # Get vendor names
    vendor_ids = [inv.vendor_id for inv in invoices]
    vendors_result = await db.execute(
        select(Vendor).where(Vendor.id.in_(vendor_ids))
    )
    vendors = {v.id: v.name for v in vendors_result.scalars().all()}

    # Enrich with vendor names
    inv_list = []
    for inv in invoices:
        inv_dict = {
            **inv.__dict__,
            "vendor_name": vendors.get(inv.vendor_id)
        }
        inv_list.append(inv_dict)

    return {
        "data": inv_list,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/invoices/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new invoice"""
    # Check if invoice number already exists
    existing = await db.execute(
        select(Invoice).where(
            and_(
                Invoice.tenant_id == tenant_id,
                Invoice.invoice_number == invoice_data.invoice_number
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invoice with number '{invoice_data.invoice_number}' already exists"
        )

    # Verify vendor exists
    vendor_result = await db.execute(
        select(Vendor).where(
            and_(
                Vendor.id == invoice_data.vendor_id,
                Vendor.tenant_id == tenant_id
            )
        )
    )
    vendor = vendor_result.scalar_one_or_none()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )

    # Create invoice
    invoice = Invoice(
        tenant_id=tenant_id,
        **invoice_data.model_dump()
    )

    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    return {
        **invoice.__dict__,
        "vendor_name": vendor.name
    }


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get an invoice by ID"""
    result = await db.execute(
        select(Invoice).where(
            and_(
                Invoice.id == invoice_id,
                Invoice.tenant_id == tenant_id
            )
        )
    )
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Get vendor name
    vendor_result = await db.execute(
        select(Vendor).where(Vendor.id == invoice.vendor_id)
    )
    vendor = vendor_result.scalar_one_or_none()

    return {
        **invoice.__dict__,
        "vendor_name": vendor.name if vendor else None
    }


@router.patch("/invoices/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID,
    invoice_data: InvoiceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update an invoice"""
    result = await db.execute(
        select(Invoice).where(
            and_(
                Invoice.id == invoice_id,
                Invoice.tenant_id == tenant_id
            )
        )
    )
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Update fields
    update_data = invoice_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(invoice, field, value)

    invoice.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(invoice)

    # Get vendor name
    vendor_result = await db.execute(
        select(Vendor).where(Vendor.id == invoice.vendor_id)
    )
    vendor = vendor_result.scalar_one_or_none()

    return {
        **invoice.__dict__,
        "vendor_name": vendor.name if vendor else None
    }


@router.delete("/invoices/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete an invoice"""
    result = await db.execute(
        select(Invoice).where(
            and_(
                Invoice.id == invoice_id,
                Invoice.tenant_id == tenant_id
            )
        )
    )
    invoice = result.scalar_one_or_none()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    await db.delete(invoice)
    await db.commit()


# ============================================================================
# PURCHASE ORDER RECEIVING AND CANCELLATION (BUG-010 FIX)
# ============================================================================

@router.post("/purchase-orders/{po_id}/receive", response_model=dict)
async def receive_purchase_order(
    po_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.receive")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Receive (mark as received) a purchase order (BUG-010 FIX).

    Updates the purchase order status to received and records receiving date.
    """
    result = await db.execute(
        select(PurchaseOrder).where(
            and_(
                PurchaseOrder.id == po_id,
                PurchaseOrder.tenant_id == UUID(tenant_id)
            )
        )
    )
    po = result.scalar_one_or_none()

    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    if po.status == "Closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot receive a closed purchase order"
        )

    # Update status to received
    po.status = "Closed"  # Mark as closed/received
    po.notes = (po.notes or {})
    if not isinstance(po.notes, dict):
        po.notes = {}
    po.notes['received_date'] = datetime.utcnow().isoformat()
    po.notes['received_by'] = current_user.username

    await db.commit()
    await db.refresh(po)

    # Log audit
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="RECEIVE",
        target=str(po.id),
        resource_type="purchase_order",
        details={"po_number": po.po_number, "vendor_id": str(po.vendor_id)},
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": f"Purchase order {po.po_number} marked as received",
        "po_id": str(po.id),
        "po_number": po.po_number,
        "status": po.status,
        "received_date": po.notes.get('received_date')
    }


@router.post("/purchase-orders/{po_id}/cancel", response_model=dict)
async def cancel_purchase_order(
    po_id: UUID,
    reason: str = Query(..., description="Reason for cancellation"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("acquisitions.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Cancel a purchase order (BUG-010 FIX).

    Updates the purchase order status to cancelled and records cancellation reason.
    """
    result = await db.execute(
        select(PurchaseOrder).where(
            and_(
                PurchaseOrder.id == po_id,
                PurchaseOrder.tenant_id == UUID(tenant_id)
            )
        )
    )
    po = result.scalar_one_or_none()

    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase order not found"
        )

    if po.status == "Closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a closed purchase order"
        )

    # Update status to cancelled
    original_status = po.status
    po.status = "Cancelled"
    po.notes = (po.notes or {})
    if not isinstance(po.notes, dict):
        po.notes = {}
    po.notes['cancelled_date'] = datetime.utcnow().isoformat()
    po.notes['cancelled_by'] = current_user.username
    po.notes['cancellation_reason'] = reason

    await db.commit()
    await db.refresh(po)

    # Log audit
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="CANCEL",
        target=str(po.id),
        resource_type="purchase_order",
        details={
            "po_number": po.po_number,
            "original_status": original_status,
            "cancellation_reason": reason
        },
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": f"Purchase order {po.po_number} cancelled",
        "po_id": str(po.id),
        "po_number": po.po_number,
        "status": po.status,
        "cancelled_date": po.notes.get('cancelled_date'),
        "reason": reason
    }
