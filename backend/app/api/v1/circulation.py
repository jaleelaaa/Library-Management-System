"""
Circulation API endpoints.
Check-out, check-in, renewals, loans, and requests management.
"""

from typing import Optional
from datetime import datetime, timedelta
import math
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.models.inventory import Item
from app.models.circulation import Loan, Request, LoanPolicy, LoanStatus, RequestStatus
from app.schemas.circulation import (
    CheckOutRequest, CheckOutResponse,
    CheckInRequest, CheckInResponse,
    RenewRequest, RenewResponse,
    LoanResponse, RequestResponse,
    RequestCreate, RequestUpdate,
    LoanPolicyCreate, LoanPolicyUpdate, LoanPolicyResponse
)
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.core.deps import get_current_user, get_current_tenant, require_permission
from app.utils.pagination import paginate
from app.services.audit_service import AuditService

router = APIRouter()


# ============================================================================
# CHECK-OUT
# ============================================================================

@router.post("/check-out", response_model=CheckOutResponse)
async def check_out_item(
    checkout_data: CheckOutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Check out an item to a user.

    - Validates item availability
    - Creates a loan record
    - Updates item status to "checked out"
    - Calculates due date based on loan policy
    """
    # Find item by barcode
    item_result = await db.execute(
        select(Item).where(
            and_(
                Item.barcode == checkout_data.item_barcode,
                Item.tenant_id == UUID(tenant_id)
            )
        )
    )
    item = item_result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with barcode '{checkout_data.item_barcode}' not found"
        )

    # Check if item is available
    if item.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item is not available for checkout. Current status: {item.status}"
        )

    # Find user by barcode
    user_result = await db.execute(
        select(User).where(
            and_(
                User.barcode == checkout_data.user_barcode,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with barcode '{checkout_data.user_barcode}' not found"
        )

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )

    # Check for existing open loan
    existing_loan = await db.execute(
        select(Loan).where(
            and_(
                Loan.item_id == item.id,
                Loan.status == LoanStatus.OPEN,
                Loan.tenant_id == UUID(tenant_id)
            )
        )
    )
    if existing_loan.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item is already checked out"
        )

    # Calculate due date (default: 14 days from now)
    loan_date = datetime.utcnow()
    if checkout_data.due_date:
        due_date = checkout_data.due_date
    else:
        # TODO: Get from loan policy based on patron group and material type
        due_date = loan_date + timedelta(days=14)

    # Create loan record
    loan = Loan(
        user_id=user.id,
        item_id=item.id,
        loan_date=loan_date,
        due_date=due_date,
        status=LoanStatus.OPEN,
        renewal_count="0",
        max_renewals="3",
        checkout_service_point_id=checkout_data.service_point_id,
        tenant_id=UUID(tenant_id)
    )

    db.add(loan)

    # Update item status
    item.status = "checked_out"

    await db.commit()
    await db.refresh(loan)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CHECK_OUT",
        target=str(loan.id),
        resource_type="loan",
        details={
            "item_barcode": item.barcode,
            "user_barcode": user.barcode,
            "due_date": due_date.isoformat()
        },
        tenant_id=UUID(tenant_id),
    )

    # Build response
    return CheckOutResponse(
        loan_id=loan.id,
        item_id=item.id,
        user_id=user.id,
        item_barcode=item.barcode,
        user_barcode=user.barcode,
        loan_date=loan_date,
        due_date=due_date,
        status=LoanStatus.OPEN,
        item_title=item.holding.instance.title if item.holding and item.holding.instance else None,
        user_name=f"{user.personal.get('firstName', '')} {user.personal.get('lastName', '')}"
    )


# ============================================================================
# CHECK-IN
# ============================================================================

@router.post("/check-in", response_model=CheckInResponse)
async def check_in_item(
    checkin_data: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkin")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Check in an item.

    - Finds the open loan for the item
    - Closes the loan
    - Updates item status to "available"
    - Calculates fines if overdue
    """
    # Find item by barcode
    item_result = await db.execute(
        select(Item).where(
            and_(
                Item.barcode == checkin_data.item_barcode,
                Item.tenant_id == UUID(tenant_id)
            )
        )
    )
    item = item_result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with barcode '{checkin_data.item_barcode}' not found"
        )

    # Find the open loan for this item
    loan_result = await db.execute(
        select(Loan).where(
            and_(
                Loan.item_id == item.id,
                Loan.status == LoanStatus.OPEN,
                Loan.tenant_id == UUID(tenant_id)
            )
        )
    )
    loan = loan_result.scalar_one_or_none()

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No open loan found for this item"
        )

    # Get user info
    user = await db.get(User, loan.user_id)

    # Set return date
    return_date = checkin_data.check_in_date or datetime.utcnow()

    # Check if overdue
    was_overdue = return_date > loan.due_date
    fine_amount = None

    if was_overdue:
        # Calculate fine (e.g., $0.50 per day)
        days_overdue = (return_date - loan.due_date).days
        fine_amount = days_overdue * 0.50
        # TODO: Create fine/fee record in fees table

    # Update loan
    loan.return_date = return_date
    loan.status = LoanStatus.CLOSED
    loan.checkin_service_point_id = checkin_data.service_point_id

    # Update item status
    # Check if there are pending requests for this item
    pending_request = await db.execute(
        select(Request).where(
            and_(
                Request.item_id == item.id,
                Request.status == RequestStatus.OPEN,
                Request.tenant_id == UUID(tenant_id)
            )
        ).order_by(Request.position)
    )
    next_request = pending_request.scalar_one_or_none()

    if next_request:
        item.status = "awaiting_pickup"
        next_request.status = RequestStatus.AWAITING_PICKUP
    else:
        item.status = "available"

    await db.commit()
    await db.refresh(loan)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CHECK_IN",
        target=str(loan.id),
        resource_type="loan",
        details={
            "item_barcode": item.barcode,
            "was_overdue": was_overdue,
            "fine_amount": fine_amount
        },
        tenant_id=UUID(tenant_id),
    )

    return CheckInResponse(
        loan_id=loan.id,
        item_id=item.id,
        user_id=loan.user_id,
        item_barcode=item.barcode,
        user_barcode=user.barcode if user else None,
        loan_date=loan.loan_date,
        due_date=loan.due_date,
        return_date=return_date,
        status=LoanStatus.CLOSED,
        item_title=item.holding.instance.title if item.holding and item.holding.instance else None,
        was_overdue=was_overdue,
        fine_amount=fine_amount
    )


# ============================================================================
# RENEW
# ============================================================================

@router.post("/renew", response_model=RenewResponse)
async def renew_loan(
    renew_data: RenewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Renew a loan.

    - Staff with circulation.renew can renew any loan
    - Patrons with circulation.renew_own can only renew their own loans
    - Validates renewal eligibility
    - Extends due date
    - Increments renewal count
    """
    # Find item by barcode
    item_result = await db.execute(
        select(Item).where(
            and_(
                Item.barcode == renew_data.item_barcode,
                Item.tenant_id == UUID(tenant_id)
            )
        )
    )
    item = item_result.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with barcode '{renew_data.item_barcode}' not found"
        )

    # Find the open loan
    loan_result = await db.execute(
        select(Loan).where(
            and_(
                Loan.item_id == item.id,
                Loan.status == LoanStatus.OPEN,
                Loan.tenant_id == UUID(tenant_id)
            )
        )
    )
    loan = loan_result.scalar_one_or_none()

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No open loan found for this item"
        )

    # Check permissions: staff can renew any loan, patrons can only renew their own
    user_permissions = set()
    for role in current_user.roles:
        for perm in role.permissions:
            user_permissions.add(perm.name)

    has_staff_permission = "circulation.renew" in user_permissions
    has_patron_permission = "circulation.renew_own" in user_permissions

    if not has_staff_permission and not has_patron_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No renewal permission. Required: circulation.renew or circulation.renew_own"
        )

    # If user only has patron permission, verify they own the loan
    if has_patron_permission and not has_staff_permission:
        if loan.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only renew own items"
            )

    # Check renewal eligibility
    current_renewals = int(loan.renewal_count)
    max_renewals = int(loan.max_renewals)

    if current_renewals >= max_renewals:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum renewals ({max_renewals}) reached"
        )

    # Check for pending requests
    pending_request = await db.execute(
        select(Request).where(
            and_(
                Request.item_id == item.id,
                Request.status == RequestStatus.OPEN,
                Request.tenant_id == UUID(tenant_id)
            )
        )
    )
    if pending_request.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew - item has pending requests"
        )

    # Save old due date
    previous_due_date = loan.due_date

    # Calculate new due date (extend by loan period, e.g., 14 days)
    # TODO: Get from loan policy
    new_due_date = datetime.utcnow() + timedelta(days=14)

    # Update loan
    loan.due_date = new_due_date
    loan.renewal_count = str(current_renewals + 1)

    await db.commit()
    await db.refresh(loan)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="RENEW",
        target=str(loan.id),
        resource_type="loan",
        details={
            "item_barcode": item.barcode,
            "previous_due_date": previous_due_date.isoformat(),
            "new_due_date": new_due_date.isoformat(),
            "renewal_count": current_renewals + 1
        },
        tenant_id=UUID(tenant_id),
    )

    return RenewResponse(
        loan_id=loan.id,
        item_id=item.id,
        user_id=loan.user_id,
        previous_due_date=previous_due_date,
        new_due_date=new_due_date,
        renewal_count=current_renewals + 1,
        max_renewals=max_renewals
    )


# ============================================================================
# LOANS
# ============================================================================

@router.get("/loans", response_model=PaginatedResponse[LoanResponse])
async def list_loans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = None,
    item_id: Optional[UUID] = None,
    status: Optional[LoanStatus] = None,
    overdue_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List loans with filters and pagination."""
    query = select(Loan).where(Loan.tenant_id == UUID(tenant_id))

    if user_id:
        query = query.where(Loan.user_id == user_id)

    if item_id:
        query = query.where(Loan.item_id == item_id)

    if status:
        query = query.where(Loan.status == status)

    if overdue_only:
        query = query.where(
            and_(
                Loan.status == LoanStatus.OPEN,
                Loan.due_date < datetime.utcnow()
            )
        )

    query = query.order_by(Loan.loan_date.desc())

    result = await paginate(db, query, page, page_size)

    # Enrich with user/item data
    loans = []
    for loan in result.data:
        loan_dict = LoanResponse.model_validate(loan).model_dump()

        # Get item info
        item = await db.get(Item, loan.item_id)
        if item:
            loan_dict['item_barcode'] = item.barcode
            if item.holding and item.holding.instance:
                loan_dict['item_title'] = item.holding.instance.title

        # Get user info
        user = await db.get(User, loan.user_id)
        if user:
            loan_dict['user_barcode'] = user.barcode
            loan_dict['user_name'] = f"{user.personal.get('firstName', '')} {user.personal.get('lastName', '')}"

        loans.append(LoanResponse(**loan_dict))

    return PaginatedResponse(data=loans, meta=result.meta)


# ============================================================================
# REQUESTS (HOLDS)
# ============================================================================

@router.post("/requests", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: RequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new request (hold) for an item."""
    # Verify user exists
    user = await db.get(User, request_data.user_id)
    if not user or user.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify item exists
    item = await db.get(Item, request_data.item_id)
    if not item or item.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Check for existing open request by this user for this item
    existing_request = await db.execute(
        select(Request).where(
            and_(
                Request.user_id == request_data.user_id,
                Request.item_id == request_data.item_id,
                Request.status == RequestStatus.OPEN,
                Request.tenant_id == UUID(tenant_id)
            )
        )
    )
    if existing_request.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an open request for this item"
        )

    # Get the next position in queue
    position_result = await db.execute(
        select(func.count()).where(
            and_(
                Request.item_id == request_data.item_id,
                Request.status == RequestStatus.OPEN,
                Request.tenant_id == UUID(tenant_id)
            )
        )
    )
    position = position_result.scalar() + 1

    # Create request
    new_request = Request(
        user_id=request_data.user_id,
        item_id=request_data.item_id,
        request_type=request_data.request_type.value,
        request_date=datetime.utcnow(),
        request_expiration_date=request_data.request_expiration_date,
        status=RequestStatus.OPEN,
        position=str(position),
        fulfillment_preference=request_data.fulfillment_preference,
        pickup_service_point_id=request_data.pickup_service_point_id,
        tenant_id=UUID(tenant_id)
    )

    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CREATE",
        target=str(new_request.id),
        resource_type="request",
        details={
            "user_id": str(user.id),
            "item_id": str(item.id),
            "request_type": request_data.request_type.value
        },
        tenant_id=UUID(tenant_id),
    )

    return RequestResponse.model_validate(new_request)


@router.get("/requests", response_model=PaginatedResponse[RequestResponse])
async def list_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = None,
    item_id: Optional[UUID] = None,
    status: Optional[RequestStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List requests with filters and pagination."""
    query = select(Request).where(Request.tenant_id == UUID(tenant_id))

    if user_id:
        query = query.where(Request.user_id == user_id)

    if item_id:
        query = query.where(Request.item_id == item_id)

    if status:
        query = query.where(Request.status == status)

    query = query.order_by(Request.request_date.desc())

    result = await paginate(db, query, page, page_size)

    # Enrich with user/item data
    requests = []
    for req in result.data:
        req_dict = RequestResponse.model_validate(req).model_dump()

        # Get item info
        item = await db.get(Item, req.item_id)
        if item:
            req_dict['item_barcode'] = item.barcode
            if item.holding and item.holding.instance:
                req_dict['item_title'] = item.holding.instance.title

        # Get user info
        user = await db.get(User, req.user_id)
        if user:
            req_dict['user_barcode'] = user.barcode
            req_dict['user_name'] = f"{user.personal.get('firstName', '')} {user.personal.get('lastName', '')}"

        requests.append(RequestResponse(**req_dict))

    return PaginatedResponse(data=requests, meta=result.meta)


@router.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Cancel a request."""
    request = await db.get(Request, request_id)

    if not request or request.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    request.status = RequestStatus.CANCELLED

    await db.commit()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CANCEL",
        target=str(request_id),
        resource_type="request",
        details={},
        tenant_id=UUID(tenant_id),
    )


# ============================================================================
# LOAN POLICIES
# ============================================================================

@router.get("/loan-policies", response_model=PaginatedResponse[LoanPolicyResponse])
async def list_loan_policies(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all loan policies with optional filtering."""
    query = select(LoanPolicy).where(LoanPolicy.tenant_id == UUID(tenant_id))

    if is_active is not None:
        query = query.where(LoanPolicy.is_active == is_active)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(LoanPolicy.name)

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


@router.get("/loan-policies/{policy_id}", response_model=LoanPolicyResponse)
async def get_loan_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a specific loan policy."""
    query = select(LoanPolicy).where(
        and_(
            LoanPolicy.id == policy_id,
            LoanPolicy.tenant_id == UUID(tenant_id)
        )
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan policy not found"
        )

    return policy


@router.post("/loan-policies", response_model=LoanPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_loan_policy(
    policy_data: LoanPolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new loan policy."""
    # Check for duplicate code
    existing_query = select(LoanPolicy).where(
        and_(
            LoanPolicy.code == policy_data.code,
            LoanPolicy.tenant_id == UUID(tenant_id)
        )
    )
    existing = await db.scalar(existing_query)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Loan policy with code '{policy_data.code}' already exists"
        )

    policy = LoanPolicy(
        **policy_data.model_dump(),
        tenant_id=UUID(tenant_id),
        created_by=current_user.id,
    )

    db.add(policy)
    await db.commit()
    await db.refresh(policy)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CREATE",
        target=str(policy.id),
        resource_type="loan_policy",
        details={"name": policy.name, "code": policy.code},
        tenant_id=UUID(tenant_id),
    )

    return policy


@router.put("/loan-policies/{policy_id}", response_model=LoanPolicyResponse)
async def update_loan_policy(
    policy_id: UUID,
    policy_data: LoanPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a loan policy."""
    query = select(LoanPolicy).where(
        and_(
            LoanPolicy.id == policy_id,
            LoanPolicy.tenant_id == UUID(tenant_id)
        )
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan policy not found"
        )

    # Update only provided fields
    update_data = policy_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(policy, field, value)

    policy.updated_by = current_user.id

    await db.commit()
    await db.refresh(policy)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="UPDATE",
        target=str(policy.id),
        resource_type="loan_policy",
        details={"name": policy.name},
        tenant_id=UUID(tenant_id),
    )

    return policy


@router.delete("/loan-policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a loan policy."""
    query = select(LoanPolicy).where(
        and_(
            LoanPolicy.id == policy_id,
            LoanPolicy.tenant_id == UUID(tenant_id)
        )
    )
    result = await db.execute(query)
    policy = result.scalar_one_or_none()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan policy not found"
        )

    await db.delete(policy)
    await db.commit()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="DELETE",
        target=str(policy_id),
        resource_type="loan_policy",
        details={},
        tenant_id=UUID(tenant_id),
    )


# ============================================================================
# ADDITIONAL CIRCULATION ENDPOINTS (BUG-010 FIX)
# ============================================================================

@router.post("/requests/{request_id}/fulfill", response_model=dict)
async def fulfill_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.checkout")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Fulfill a request/hold (BUG-010 FIX).

    Marks the request as fulfilled and available for pickup.
    """
    request = await db.get(Request, request_id)

    if not request or request.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )

    if request.status != RequestStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot fulfill request with status {request.status}"
        )

    # Update request status
    request.status = RequestStatus.AWAITING_PICKUP
    request.fulfillment_date = datetime.utcnow()

    await db.commit()
    await db.refresh(request)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="FULFILL",
        target=str(request_id),
        resource_type="request",
        details={"requester_id": str(request.requester_id), "item_id": str(request.item_id)},
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": "Request fulfilled successfully",
        "request_id": str(request.id),
        "status": request.status.value,
        "fulfillment_date": request.fulfillment_date.isoformat()
    }


@router.get("/loans/overdue", response_model=PaginatedResponse[LoanResponse])
async def list_overdue_loans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("circulation.view_all")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Get all overdue loans (BUG-010 FIX).

    Returns loans past their due date that haven't been returned.
    """
    today = datetime.utcnow().date()

    query = select(Loan).where(
        and_(
            Loan.tenant_id == UUID(tenant_id),
            Loan.status == LoanStatus.CHECKED_OUT,
            Loan.due_date < today
        )
    ).order_by(Loan.due_date.asc())

    # Paginate
    from app.utils.pagination import paginate
    result = await paginate(db, query, page, page_size)

    # Convert to response format
    loans = []
    for loan in result.data:
        loan_dict = LoanResponse.model_validate(loan).model_dump()

        # Calculate days overdue
        days_overdue = (today - loan.due_date).days
        loan_dict['days_overdue'] = days_overdue

        # Get user info
        user = await db.get(User, loan.user_id)
        if user:
            loan_dict['user_barcode'] = user.barcode
            loan_dict['user_name'] = f"{user.personal.get('firstName', '')} {user.personal.get('lastName', '')}"

        # Get item info
        item = await db.get(Item, loan.item_id)
        if item:
            loan_dict['item_barcode'] = item.barcode

        loans.append(LoanResponse(**loan_dict))

    return PaginatedResponse(data=loans, meta=result.meta)


@router.post("/loans/{loan_id}/forgive-fine", response_model=dict)
async def forgive_fine(
    loan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fees.waive")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Forgive/waive fine for a loan (BUG-010 FIX).

    Sets the fine to zero for the specified loan.
    """
    loan = await db.get(Loan, loan_id)

    if not loan or loan.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )

    if not loan.fine_amount or loan.fine_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fine to forgive for this loan"
        )

    original_fine = loan.fine_amount
    loan.fine_amount = 0.0
    loan.fine_paid = True

    await db.commit()
    await db.refresh(loan)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="FORGIVE_FINE",
        target=str(loan_id),
        resource_type="loan",
        details={
            "original_fine": float(original_fine),
            "user_id": str(loan.user_id),
            "forgiven_by": current_user.username
        },
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": f"Fine of ${original_fine:.2f} forgiven successfully",
        "loan_id": str(loan.id),
        "original_fine": float(original_fine),
        "current_fine": float(loan.fine_amount)
    }
