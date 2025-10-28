"""
Courses and Course Reserves API endpoints.
Complete CRUD operations for managing courses and reserves.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.course import Course, Reserve
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse,
    ReserveCreate, ReserveResponse
)
from app.schemas.common import PaginatedResponse
from app.core.deps import get_current_user, get_current_tenant
from app.utils.pagination import paginate
from app.services.audit_service import AuditService

router = APIRouter()


# ============================================================================
# COURSE ENDPOINTS
# ============================================================================

@router.get("/", response_model=PaginatedResponse[CourseResponse])
async def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    term: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    List courses with pagination, search, and filtering.

    - **search**: Search by course name or code
    - **is_active**: Filter by active status
    - **term**: Filter by term (e.g., "Fall 2024")
    """
    query = select(Course).where(Course.tenant_id == UUID(tenant_id))

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Course.name.ilike(search_term),
                Course.code.ilike(search_term),
                Course.description.ilike(search_term)
            )
        )

    if is_active is not None:
        query = query.where(Course.is_active == is_active)

    if term:
        query = query.where(Course.term == term)

    query = query.order_by(Course.created_date.desc())

    # Paginate
    result = await paginate(db, query, page, page_size)

    return PaginatedResponse(data=result.data, meta=result.meta)


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new course."""
    # Check if course code already exists
    existing = await db.execute(
        select(Course).where(
            and_(
                Course.tenant_id == UUID(tenant_id),
                Course.code == course_data.code
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course with this code already exists"
        )

    # Create course
    course_dict = course_data.model_dump()
    course_dict['tenant_id'] = UUID(tenant_id)
    course_dict['created_by_user_id'] = current_user.id

    new_course = Course(**course_dict)

    db.add(new_course)
    await db.commit()
    await db.refresh(new_course)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CREATE",
        target=str(new_course.id),
        resource_type="course",
        details={"name": new_course.name, "code": new_course.code},
        tenant_id=UUID(tenant_id),
    )

    return CourseResponse.model_validate(new_course)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a course by ID."""
    result = await db.execute(
        select(Course).where(
            and_(
                Course.id == course_id,
                Course.tenant_id == UUID(tenant_id)
            )
        )
    )
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    return CourseResponse.model_validate(course)


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a course."""
    result = await db.execute(
        select(Course).where(
            and_(
                Course.id == course_id,
                Course.tenant_id == UUID(tenant_id)
            )
        )
    )
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check for duplicate code if changed
    update_data = course_data.model_dump(exclude_unset=True)

    if 'code' in update_data and update_data['code'] != course.code:
        existing = await db.execute(
            select(Course).where(
                and_(
                    Course.tenant_id == UUID(tenant_id),
                    Course.code == update_data['code'],
                    Course.id != course_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Course with this code already exists"
            )

    update_data['updated_by_user_id'] = current_user.id

    # Update course
    for key, value in update_data.items():
        setattr(course, key, value)

    await db.commit()
    await db.refresh(course)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="UPDATE",
        target=str(course.id),
        resource_type="course",
        details={"name": course.name, "updated_fields": list(update_data.keys())},
        tenant_id=UUID(tenant_id),
    )

    return CourseResponse.model_validate(course)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a course."""
    result = await db.execute(
        select(Course).where(
            and_(
                Course.id == course_id,
                Course.tenant_id == UUID(tenant_id)
            )
        )
    )
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    course_name = course.name

    await db.delete(course)
    await db.commit()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="DELETE",
        target=str(course_id),
        resource_type="course",
        details={"name": course_name},
        tenant_id=UUID(tenant_id),
    )


# ============================================================================
# RESERVES ENDPOINTS
# ============================================================================

@router.get("/{course_id}/reserves", response_model=List[ReserveResponse])
async def list_course_reserves(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all reserves for a course."""
    # Verify course exists
    course = await db.get(Course, course_id)
    if not course or course.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    result = await db.execute(
        select(Reserve).where(
            and_(
                Reserve.course_id == course_id,
                Reserve.tenant_id == UUID(tenant_id)
            )
        )
    )
    reserves = result.scalars().all()

    return [ReserveResponse.model_validate(reserve) for reserve in reserves]


@router.post("/{course_id}/reserves", response_model=ReserveResponse, status_code=status.HTTP_201_CREATED)
async def create_course_reserve(
    course_id: UUID,
    reserve_data: ReserveCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Add an item to course reserves."""
    # Verify course exists
    course = await db.get(Course, course_id)
    if not course or course.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Create reserve
    reserve = Reserve(
        course_id=course_id,
        item_id=reserve_data.item_id,
        reserve_type=reserve_data.reserve_type,
        loan_period=reserve_data.loan_period,
        tenant_id=UUID(tenant_id),
        created_by_user_id=current_user.id
    )

    db.add(reserve)
    await db.commit()
    await db.refresh(reserve)

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="CREATE",
        target=str(reserve.id),
        resource_type="reserve",
        details={"course_id": str(course_id), "item_id": str(reserve_data.item_id)},
        tenant_id=UUID(tenant_id),
    )

    return ReserveResponse.model_validate(reserve)


@router.delete("/reserves/{reserve_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course_reserve(
    reserve_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Remove an item from course reserves."""
    reserve = await db.get(Reserve, reserve_id)

    if not reserve or reserve.tenant_id != UUID(tenant_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserve not found"
        )

    await db.delete(reserve)
    await db.commit()

    # Log audit
    await AuditService.log_action(
        db=db,
        actor=current_user.username,
        action="DELETE",
        target=str(reserve_id),
        resource_type="reserve",
        details={},
        tenant_id=UUID(tenant_id),
    )
