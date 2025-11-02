"""
Users API endpoints.
Complete CRUD operations, search, and filtering for users, patron groups, and departments.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, and_
from uuid import UUID

from app.db.session import get_db
from app.models.user import User, PatronGroup, Department, Address, UserType
from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, UserListItem,
    PatronGroupCreate, PatronGroupUpdate, PatronGroupResponse,
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    BulkUserCreate, PasswordChange
)
from app.schemas.common import PaginatedResponse, BulkOperationResponse, ErrorResponse
from app.core.deps import get_current_user, get_current_tenant, require_permission
from app.core.security import get_password_hash, verify_password, validate_password_strength
from app.utils.pagination import paginate
from app.services.audit_service import AuditService

router = APIRouter()


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@router.get("/", response_model=PaginatedResponse[UserListItem])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    active: Optional[bool] = None,
    user_type: Optional[str] = None,
    patron_group_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    List users with pagination, search, and filtering.

    - **search**: Search by username, email, or name (firstName/lastName in personal)
    - **active**: Filter by active status
    - **user_type**: Filter by user type (staff, patron, etc.)
    - **patron_group_id**: Filter by patron group
    """
    query = select(User).where(User.tenant_id == UUID(tenant_id))

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term),
                User.barcode.ilike(search_term),
                func.jsonb_extract_path_text(User.personal, 'firstName').ilike(search_term),
                func.jsonb_extract_path_text(User.personal, 'lastName').ilike(search_term),
            )
        )

    if active is not None:
        query = query.where(User.active == active)

    if user_type:
        query = query.where(User.user_type == user_type)

    if patron_group_id:
        query = query.where(User.patron_group_id == patron_group_id)

    # Eager load relationships to avoid lazy loading errors
    from sqlalchemy.orm import selectinload
    from app.models.permission import Role
    query = query.options(
        selectinload(User.patron_group),
        selectinload(User.roles).selectinload(Role.permissions)
    )
    query = query.order_by(User.created_date.desc())

    # Paginate
    result = await paginate(db, query, page, page_size)

    # Transform to include patron group name
    users = []
    for user in result.data:
        user_dict = UserListItem.model_validate(user).model_dump()
        if user.patron_group:
            user_dict['patron_group_name'] = user.patron_group.group_name
        users.append(UserListItem(**user_dict))

    return PaginatedResponse(data=users, meta=result.meta)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Create a new user.

    Requires a strong password (min 8 chars, uppercase, lowercase, digit).
    """
    # Check if username or email already exists
    existing = await db.execute(
        select(User).where(
            and_(
                User.tenant_id == UUID(tenant_id),
                or_(
                    User.username == user_data.username,
                    User.email == user_data.email,
                    User.barcode == user_data.barcode if user_data.barcode else False
                )
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username, email, or barcode already exists"
        )

    # Verify patron group exists if provided
    if user_data.patron_group_id:
        patron_group = await db.execute(
            select(PatronGroup).where(
                and_(
                    PatronGroup.id == user_data.patron_group_id,
                    PatronGroup.tenant_id == UUID(tenant_id)
                )
            )
        )
        if not patron_group.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patron group not found"
            )

    # Verify roles if provided
    role_ids = user_data.role_ids if user_data.role_ids else []
    roles = []
    if role_ids:
        from app.models.permission import Role
        roles_result = await db.execute(
            select(Role).where(
                and_(
                    Role.id.in_(role_ids),
                    Role.tenant_id == UUID(tenant_id)
                )
            )
        )
        roles = roles_result.scalars().all()
        if len(roles) != len(role_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more roles not found"
            )

    # Validate password strength (BUG-008)
    validate_password_strength(user_data.password)

    # Create user
    user_dict = user_data.model_dump(exclude={'password', 'addresses', 'role_ids'})
    user_dict['hashed_password'] = get_password_hash(user_data.password)
    user_dict['tenant_id'] = UUID(tenant_id)
    user_dict['created_by_user_id'] = current_user.id

    new_user = User(**user_dict)

    # Add addresses
    for addr_data in user_data.addresses:
        address = Address(**addr_data.model_dump(), user_id=new_user.id)
        new_user.addresses.append(address)

    # Add roles
    if roles:
        new_user.roles.extend(roles)

    db.add(new_user)
    await db.commit()

    # Refresh with eager loading of relationships
    from sqlalchemy.orm import selectinload
    from app.models.permission import Role
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.addresses),
            selectinload(User.patron_group),
            selectinload(User.roles)
        )
        .where(User.id == new_user.id)
    )
    new_user = result.scalar_one()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="CREATE",
        target=str(new_user.id),
        resource_type="user",
        details={"username": new_user.username},
        tenant_id=UUID(tenant_id),
    )

    return UserResponse.model_validate(new_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a user by ID."""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(User)
        .options(
            selectinload(User.addresses),
            selectinload(User.patron_group),
            selectinload(User.roles)
        )
        .where(
            and_(
                User.id == user_id,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get patron group name
    user_dict = UserResponse.model_validate(user).model_dump()
    if user.patron_group:
        user_dict['patron_group_name'] = user.patron_group.group_name

    return UserResponse(**user_dict)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a user."""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(User)
        .options(
            selectinload(User.addresses),
            selectinload(User.patron_group),
            selectinload(User.roles)
        )
        .where(
            and_(
                User.id == user_id,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check for duplicate username/email if changed
    update_data = user_data.model_dump(exclude_unset=True, exclude={'password', 'role_ids'})

    if 'username' in update_data or 'email' in update_data or 'barcode' in update_data:
        existing = await db.execute(
            select(User).where(
                and_(
                    User.tenant_id == UUID(tenant_id),
                    User.id != user_id,
                    or_(
                        User.username == update_data.get('username', user.username),
                        User.email == update_data.get('email', user.email),
                        User.barcode == update_data.get('barcode', user.barcode) if update_data.get('barcode') else False
                    )
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username, email, or barcode already exists"
            )

    # Verify patron group if changed
    if 'patron_group_id' in update_data and update_data['patron_group_id']:
        patron_group = await db.execute(
            select(PatronGroup).where(
                and_(
                    PatronGroup.id == update_data['patron_group_id'],
                    PatronGroup.tenant_id == UUID(tenant_id)
                )
            )
        )
        if not patron_group.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patron group not found"
            )

    # Update password if provided
    if user_data.password:
        # Validate password strength (BUG-008)
        validate_password_strength(user_data.password)
        update_data['hashed_password'] = get_password_hash(user_data.password)

    # Update roles if provided
    if user_data.role_ids is not None:
        from app.models.permission import Role
        roles_result = await db.execute(
            select(Role).where(
                and_(
                    Role.id.in_(user_data.role_ids),
                    Role.tenant_id == UUID(tenant_id)
                )
            )
        )
        roles = roles_result.scalars().all()
        if len(roles) != len(user_data.role_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more roles not found"
            )
        user.roles = roles

    update_data['updated_by_user_id'] = current_user.id

    # Update user
    for key, value in update_data.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="UPDATE",
        target=str(user.id),
        resource_type="user",
        details={"username": user.username, "updated_fields": list(update_data.keys())},
        tenant_id=UUID(tenant_id),
    )

    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a user."""
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    username = user.username

    await db.delete(user)
    await db.commit()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="DELETE",
        target=str(user_id),
        resource_type="user",
        details={"username": username},
        tenant_id=UUID(tenant_id),
    )


@router.post("/bulk", response_model=BulkOperationResponse)
async def bulk_create_users(
    bulk_data: BulkUserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Bulk create users."""
    success_count = 0
    failure_count = 0
    errors = []

    for idx, user_data in enumerate(bulk_data.users):
        try:
            # Check if user exists
            existing = await db.execute(
                select(User).where(
                    and_(
                        User.tenant_id == UUID(tenant_id),
                        or_(
                            User.username == user_data.username,
                            User.email == user_data.email,
                            User.barcode == user_data.barcode if user_data.barcode else False
                        )
                    )
                )
            )
            if existing.scalar_one_or_none():
                errors.append(ErrorResponse(
                    code="DUPLICATE_USER",
                    message=f"User at index {idx} already exists",
                    details={"username": user_data.username}
                ))
                failure_count += 1
                continue

            # Validate password strength (BUG-008)
            validate_password_strength(user_data.password)

            # Create user
            user_dict = user_data.model_dump(exclude={'password', 'addresses'})
            user_dict['hashed_password'] = get_password_hash(user_data.password)
            user_dict['tenant_id'] = UUID(tenant_id)
            user_dict['created_by_user_id'] = current_user.id

            new_user = User(**user_dict)

            # Add addresses
            for addr_data in user_data.addresses:
                address = Address(**addr_data.model_dump(), user_id=new_user.id)
                new_user.addresses.append(address)

            db.add(new_user)
            success_count += 1

        except Exception as e:
            errors.append(ErrorResponse(
                code="CREATION_ERROR",
                message=f"Failed to create user at index {idx}",
                details={"error": str(e)}
            ))
            failure_count += 1

    await db.commit()

    return BulkOperationResponse(
        success_count=success_count,
        failure_count=failure_count,
        errors=errors
    )


@router.post("/{user_id}/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    user_id: UUID,
    password_data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Change user password."""
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify old password
    if not verify_password(password_data.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    # Validate new password strength (BUG-008)
    validate_password_strength(password_data.new_password)

    # Update password
    user.hashed_password = get_password_hash(password_data.new_password)
    user.updated_by_user_id = current_user.id

    await db.commit()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="UPDATE",
        target=str(user.id),
        resource_type="user",
        details={"action": "password_change"},
        tenant_id=UUID(tenant_id),
    )


# ============================================================================
# PATRON GROUP ENDPOINTS
# ============================================================================

@router.get("/patron-groups/", response_model=List[PatronGroupResponse])
async def list_patron_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all patron groups."""
    result = await db.execute(
        select(PatronGroup).where(PatronGroup.tenant_id == UUID(tenant_id))
    )
    groups = result.scalars().all()

    # Add user count for each group
    response = []
    for group in groups:
        group_dict = PatronGroupResponse.model_validate(group).model_dump()
        count_result = await db.execute(
            select(func.count()).where(User.patron_group_id == group.id)
        )
        group_dict['user_count'] = count_result.scalar()
        response.append(PatronGroupResponse(**group_dict))

    return response


@router.post("/patron-groups/", response_model=PatronGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_patron_group(
    group_data: PatronGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new patron group."""
    # Check if group name already exists
    existing = await db.execute(
        select(PatronGroup).where(
            and_(
                PatronGroup.tenant_id == UUID(tenant_id),
                PatronGroup.group_name == group_data.group_name
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patron group with this name already exists"
        )

    group = PatronGroup(**group_data.model_dump(), tenant_id=UUID(tenant_id))
    db.add(group)
    await db.commit()
    await db.refresh(group)

    return PatronGroupResponse.model_validate(group)


@router.put("/patron-groups/{group_id}", response_model=PatronGroupResponse)
async def update_patron_group(
    group_id: UUID,
    group_data: PatronGroupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a patron group."""
    result = await db.execute(
        select(PatronGroup).where(
            and_(
                PatronGroup.id == group_id,
                PatronGroup.tenant_id == UUID(tenant_id)
            )
        )
    )
    group = result.scalar_one_or_none()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patron group not found"
        )

    update_data = group_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(group, key, value)

    await db.commit()
    await db.refresh(group)

    return PatronGroupResponse.model_validate(group)


@router.delete("/patron-groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patron_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a patron group."""
    result = await db.execute(
        select(PatronGroup).where(
            and_(
                PatronGroup.id == group_id,
                PatronGroup.tenant_id == UUID(tenant_id)
            )
        )
    )
    group = result.scalar_one_or_none()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patron group not found"
        )

    # Check if group has users
    users_count = await db.execute(
        select(func.count()).where(User.patron_group_id == group_id)
    )
    if users_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete patron group with active users"
        )

    await db.delete(group)
    await db.commit()


# ============================================================================
# DEPARTMENT ENDPOINTS
# ============================================================================

@router.get("/departments/", response_model=List[DepartmentResponse])
async def list_departments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.read")),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all departments."""
    result = await db.execute(
        select(Department).where(Department.tenant_id == UUID(tenant_id))
    )
    return result.scalars().all()


@router.post("/departments/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    dept_data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.create")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new department."""
    # Check if department code already exists
    existing = await db.execute(
        select(Department).where(
            and_(
                Department.tenant_id == UUID(tenant_id),
                Department.code == dept_data.code
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this code already exists"
        )

    dept = Department(**dept_data.model_dump(), tenant_id=UUID(tenant_id))
    db.add(dept)
    await db.commit()
    await db.refresh(dept)

    return DepartmentResponse.model_validate(dept)


@router.put("/departments/{dept_id}", response_model=DepartmentResponse)
async def update_department(
    dept_id: UUID,
    dept_data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a department."""
    result = await db.execute(
        select(Department).where(
            and_(
                Department.id == dept_id,
                Department.tenant_id == UUID(tenant_id)
            )
        )
    )
    dept = result.scalar_one_or_none()

    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    update_data = dept_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(dept, key, value)

    await db.commit()
    await db.refresh(dept)

    return DepartmentResponse.model_validate(dept)


@router.delete("/departments/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    dept_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.delete")),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a department."""
    result = await db.execute(
        select(Department).where(
            and_(
                Department.id == dept_id,
                Department.tenant_id == UUID(tenant_id)
            )
        )
    )
    dept = result.scalar_one_or_none()

    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    await db.delete(dept)
    await db.commit()


# ============================================================================
# USER ACCOUNT MANAGEMENT (BUG-010 FIX)
# ============================================================================

@router.post("/{user_id}/suspend", status_code=status.HTTP_200_OK)
async def suspend_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Suspend a user account.

    Sets the user's active status to False, preventing login and circulation activities.
    """
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent suspending yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )

    # Suspend the user
    user.active = False
    user.updated_by_user_id = current_user.id

    await db.commit()
    await db.refresh(user)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="SUSPEND",
        target=str(user.id),
        resource_type="user",
        details={"username": user.username},
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": f"User {user.username} has been suspended",
        "user_id": str(user.id),
        "active": user.active
    }


@router.post("/{user_id}/unsuspend", status_code=status.HTTP_200_OK)
async def unsuspend_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("users.update")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Unsuspend (reactivate) a user account.

    Sets the user's active status to True, allowing login and circulation activities.
    """
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.tenant_id == UUID(tenant_id)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Unsuspend the user
    user.active = True
    user.updated_by_user_id = current_user.id

    await db.commit()
    await db.refresh(user)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="UNSUSPEND",
        target=str(user.id),
        resource_type="user",
        details={"username": user.username},
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": f"User {user.username} has been unsuspended",
        "user_id": str(user.id),
        "active": user.active
    }
