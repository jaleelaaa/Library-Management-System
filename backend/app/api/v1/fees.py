"""
Fee/Fine management API endpoints.
Handles fees, payments, and fee policies.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, get_db, require_permission
from app.models.user import User
from app.models.fee import Fee, Payment, FeePolicy, FeeStatus, PaymentMethod
from app.schemas.fee import (
    FeeCreate,
    FeeUpdate,
    FeeResponse,
    PaymentCreate,
    PaymentResponse,
    FeePolicyCreate,
    FeePolicyUpdate,
    FeePolicyResponse,
    FeeWaiveRequest,
    UserFeesSummary,
)
from app.schemas.common import PaginatedResponse, PaginationMeta

router = APIRouter()


# ============================================================================
# Fee Endpoints
# ============================================================================

@router.get("/fees", response_model=PaginatedResponse[FeeResponse])
async def list_fees(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    user_id: Optional[UUID] = None,
    status: Optional[str] = None,
    fee_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """
    List all fees with optional filtering.

    Filters:
    - user_id: Filter by user
    - status: Filter by status (open, closed, suspended)
    - fee_type: Filter by fee type
    """
    query = select(Fee).where(Fee.tenant_id == current_user.tenant_id)

    if user_id:
        query = query.where(Fee.user_id == user_id)
    if status:
        query = query.where(Fee.status == status)
    if fee_type:
        query = query.where(Fee.fee_type == fee_type)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Fee.fee_date.desc())

    result = await db.execute(query)
    fees = result.scalars().all()

    return PaginatedResponse(
        data=fees,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total or 0,
            total_pages=math.ceil((total or 0) / page_size) if page_size > 0 else 0
        )
    )


@router.get("/fees/{fee_id}", response_model=FeeResponse)
async def get_fee(
    fee_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """Get a specific fee by ID."""
    query = select(Fee).where(
        and_(
            Fee.id == fee_id,
            Fee.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    return fee


@router.post("/fees", response_model=FeeResponse, status_code=status.HTTP_201_CREATED)
async def create_fee(
    fee_data: FeeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.create")),
):
    """
    Create a new fee/fine.

    Automatically sets remaining = amount and paid_amount = 0.
    """
    # Verify user exists
    user_query = select(User).where(
        and_(
            User.id == fee_data.user_id,
            User.tenant_id == current_user.tenant_id
        )
    )
    user = await db.scalar(user_query)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create fee
    fee = Fee(
        **fee_data.model_dump(),
        remaining=fee_data.amount,  # Initially, full amount is owed
        paid_amount=Decimal("0.00"),
        status=FeeStatus.OPEN,
        tenant_id=current_user.tenant_id,
        created_by=current_user.id,
    )

    db.add(fee)
    await db.commit()
    await db.refresh(fee)

    return fee


@router.put("/fees/{fee_id}", response_model=FeeResponse)
async def update_fee(
    fee_id: UUID,
    fee_data: FeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.update")),
):
    """Update a fee's metadata (not financial amounts)."""
    query = select(Fee).where(
        and_(
            Fee.id == fee_id,
            Fee.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    # Update only provided fields
    update_data = fee_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fee, field, value)

    fee.updated_by = current_user.id

    await db.commit()
    await db.refresh(fee)

    return fee


@router.delete("/fees/{fee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fee(
    fee_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """Delete a fee (only if no payments have been made)."""
    query = select(Fee).where(
        and_(
            Fee.id == fee_id,
            Fee.tenant_id == current_user.tenant_id
        )
    ).options(selectinload(Fee.payments))

    result = await db.execute(query)
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    if fee.payments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete fee with existing payments. Close or adjust the fee instead."
        )

    await db.delete(fee)
    await db.commit()


# ============================================================================
# Payment Endpoints
# ============================================================================

@router.post("/fees/{fee_id}/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    fee_id: UUID,
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.create")),
):
    """
    Record a payment against a fee.

    Automatically updates fee.remaining and fee.paid_amount.
    Closes fee if remaining reaches 0.
    """
    # Verify fee_id matches
    if payment_data.fee_id != fee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fee ID mismatch"
        )

    # Get fee
    query = select(Fee).where(
        and_(
            Fee.id == fee_id,
            Fee.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    if fee.status == FeeStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add payment to closed fee"
        )

    # Validate payment amount doesn't exceed remaining
    if payment_data.amount > fee.remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment amount (${payment_data.amount}) exceeds remaining balance (${fee.remaining})"
        )

    # Update fee amounts
    fee.paid_amount += payment_data.amount
    fee.remaining -= payment_data.amount

    # Close fee if fully paid
    if fee.remaining <= 0:
        fee.status = FeeStatus.CLOSED
        fee.closed_date = datetime.utcnow()

    # Create payment record
    payment = Payment(
        fee_id=fee_id,
        user_id=fee.user_id,
        payment_method=payment_data.payment_method,
        amount=payment_data.amount,
        transaction_info=payment_data.transaction_info,
        comments=payment_data.comments,
        payment_date=payment_data.payment_date,
        balance=fee.remaining,  # Remaining balance after this payment
        tenant_id=current_user.tenant_id,
        created_by=current_user.id,
    )

    db.add(payment)
    fee.updated_by = current_user.id

    await db.commit()
    await db.refresh(payment)

    return payment


@router.get("/fees/{fee_id}/payments", response_model=list[PaymentResponse])
async def list_fee_payments(
    fee_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """Get all payments for a specific fee."""
    # Verify fee exists and belongs to tenant
    fee_query = select(Fee).where(
        and_(
            Fee.id == fee_id,
            Fee.tenant_id == current_user.tenant_id
        )
    )
    fee = await db.scalar(fee_query)
    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    query = select(Payment).where(Payment.fee_id == fee_id).order_by(Payment.payment_date.desc())
    result = await db.execute(query)
    payments = result.scalars().all()

    return payments


# ============================================================================
# Waive/Forgive Endpoints
# ============================================================================

@router.post("/fees/{fee_id}/waive", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def waive_fee(
    fee_id: UUID,
    waive_data: FeeWaiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.create")),
):
    """
    Waive or forgive a fee (or portion of it).

    Creates a payment record with payment_method = 'waive' or 'forgive'.
    """
    # Get fee
    query = select(Fee).where(
        and_(
            Fee.id == fee_id,
            Fee.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    fee = result.scalar_one_or_none()

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    if fee.status == FeeStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot waive closed fee"
        )

    # Determine waive amount (default to full remaining)
    waive_amount = waive_data.amount if waive_data.amount else fee.remaining

    if waive_amount > fee.remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Waive amount (${waive_amount}) exceeds remaining balance (${fee.remaining})"
        )

    # Update fee
    fee.remaining -= waive_amount
    fee.paid_amount += waive_amount  # Treated as "paid" for accounting

    # Close if fully waived
    if fee.remaining <= 0:
        fee.status = FeeStatus.CLOSED
        fee.closed_date = datetime.utcnow()

    # Create payment record
    payment = Payment(
        fee_id=fee_id,
        user_id=fee.user_id,
        payment_method=waive_data.payment_method,
        amount=waive_amount,
        comments=waive_data.reason,
        payment_date=datetime.utcnow(),
        balance=fee.remaining,
        tenant_id=current_user.tenant_id,
        created_by=current_user.id,
    )

    db.add(payment)
    fee.updated_by = current_user.id

    await db.commit()
    await db.refresh(payment)

    return payment


# ============================================================================
# User Fee Summary
# ============================================================================

@router.get("/users/{user_id}/fees/summary", response_model=UserFeesSummary)
async def get_user_fees_summary(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """Get summary of all fees for a user."""
    # Verify user exists
    user_query = select(User).where(
        and_(
            User.id == user_id,
            User.tenant_id == current_user.tenant_id
        )
    )
    user = await db.scalar(user_query)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get all fees for user
    fees_query = select(Fee).where(
        and_(
            Fee.user_id == user_id,
            Fee.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(fees_query)
    all_fees = result.scalars().all()

    # Calculate summary
    open_fees = [f for f in all_fees if f.status == FeeStatus.OPEN]
    total_owed = sum(f.remaining for f in open_fees)
    total_paid = sum(f.paid_amount for f in all_fees)
    oldest_fee_date = min((f.fee_date for f in open_fees), default=None)

    return UserFeesSummary(
        user_id=user_id,
        total_fees=len(all_fees),
        open_fees=len(open_fees),
        total_owed=total_owed,
        total_paid=total_paid,
        oldest_fee_date=oldest_fee_date,
    )


# ============================================================================
# Fee Policy Endpoints
# ============================================================================

@router.get("/fee-policies", response_model=PaginatedResponse[FeePolicyResponse])
async def list_fee_policies(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    fee_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """List all fee policies."""
    query = select(FeePolicy).where(FeePolicy.tenant_id == current_user.tenant_id)

    if fee_type:
        query = query.where(FeePolicy.fee_type == fee_type)
    if is_active is not None:
        query = query.where(FeePolicy.is_active == is_active)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(FeePolicy.name)

    result = await db.execute(query)
    policies = result.scalars().all()

    return PaginatedResponse(
        data=policies,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total or 0,
            total_pages=math.ceil((total or 0) / page_size) if page_size > 0 else 0
        )
    )


@router.get("/fee-policies/{policy_id}", response_model=FeePolicyResponse)
async def get_fee_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """Get a specific fee policy."""
    query = select(FeePolicy).where(
        and_(
            FeePolicy.id == policy_id,
            FeePolicy.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee policy not found"
        )

    return policy


@router.post("/fee-policies", response_model=FeePolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_policy(
    policy_data: FeePolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.create")),
):
    """Create a new fee policy."""
    # Check for duplicate code
    existing_query = select(FeePolicy).where(
        and_(
            FeePolicy.code == policy_data.code,
            FeePolicy.tenant_id == current_user.tenant_id
        )
    )
    existing = await db.scalar(existing_query)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fee policy with code '{policy_data.code}' already exists"
        )

    policy = FeePolicy(
        **policy_data.model_dump(),
        tenant_id=current_user.tenant_id,
        created_by=current_user.id,
    )

    db.add(policy)
    await db.commit()
    await db.refresh(policy)

    return policy


@router.put("/fee-policies/{policy_id}", response_model=FeePolicyResponse)
async def update_fee_policy(
    policy_id: UUID,
    policy_data: FeePolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.update")),
):
    """Update a fee policy."""
    query = select(FeePolicy).where(
        and_(
            FeePolicy.id == policy_id,
            FeePolicy.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee policy not found"
        )

    # Update only provided fields
    update_data = policy_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(policy, field, value)

    policy.updated_by = current_user.id

    await db.commit()
    await db.refresh(policy)

    return policy


@router.delete("/fee-policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fee_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.read")),
):
    """Delete a fee policy."""
    query = select(FeePolicy).where(
        and_(
            FeePolicy.id == policy_id,
            FeePolicy.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee policy not found"
        )

    await db.delete(policy)
    await db.commit()
