"""
API endpoints for Course Reserves module
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user, get_current_tenant
from app.models.user import User
from app.models.course_reserves import Course, Reserve
from app.models.inventory import Item
from app.schemas.course_reserves import (
    CourseCreate, CourseUpdate, CourseResponse, CourseListItem,
    ReserveCreate, ReserveUpdate, ReserveResponse
)
from app.schemas.common import PaginatedResponse

router = APIRouter()


# ============================================================================
# Course Endpoints
# ============================================================================

@router.get("/courses/", response_model=PaginatedResponse[CourseListItem])
async def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    instructor_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all courses with pagination and filters"""
    query = select(Course).where(Course.tenant_id == tenant_id)

    # Apply filters
    if search:
        query = query.where(
            or_(
                Course.name.ilike(f"%{search}%"),
                Course.code.ilike(f"%{search}%"),
                Course.department.ilike(f"%{search}%")
            )
        )

    if status:
        query = query.where(Course.status == status)

    if instructor_id:
        query = query.where(Course.instructor_id == instructor_id)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(Course.code).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    courses = result.scalars().all()

    # Get instructor names
    instructor_ids = [c.instructor_id for c in courses if c.instructor_id]
    instructors_result = await db.execute(
        select(User).where(User.id.in_(instructor_ids))
    )
    instructors = {u.id: f"{u.first_name} {u.last_name}" for u in instructors_result.scalars().all()}

    # Enrich with instructor names
    course_list = []
    for course in courses:
        course_dict = {
            "id": course.id,
            "code": course.code,
            "name": course.name,
            "department": course.department,
            "instructor_name": instructors.get(course.instructor_id) if course.instructor_id else None,
            "start_date": course.start_date,
            "end_date": course.end_date,
            "status": course.status,
            "total_reserves": course.total_reserves
        }
        course_list.append(course_dict)

    return {
        "data": course_list,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/courses/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new course"""
    # Check if code already exists
    existing = await db.execute(
        select(Course).where(
            and_(
                Course.tenant_id == tenant_id,
                Course.code == course_data.code
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course with code '{course_data.code}' already exists"
        )

    # Verify instructor exists if provided
    instructor = None
    if course_data.instructor_id:
        instructor_result = await db.execute(
            select(User).where(
                and_(
                    User.id == course_data.instructor_id,
                    User.tenant_id == tenant_id
                )
            )
        )
        instructor = instructor_result.scalar_one_or_none()
        if not instructor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instructor not found"
            )

    # Create course
    course = Course(
        tenant_id=tenant_id,
        **course_data.model_dump()
    )

    db.add(course)
    await db.commit()
    await db.refresh(course)

    return {
        **course.__dict__,
        "instructor_name": f"{instructor.first_name} {instructor.last_name}" if instructor else None
    }


@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Get a course by ID"""
    result = await db.execute(
        select(Course).where(and_(Course.id == course_id, Course.tenant_id == tenant_id))
    )
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Get instructor name
    instructor = None
    if course.instructor_id:
        instructor_result = await db.execute(
            select(User).where(User.id == course.instructor_id)
        )
        instructor = instructor_result.scalar_one_or_none()

    return {
        **course.__dict__,
        "instructor_name": f"{instructor.first_name} {instructor.last_name}" if instructor else None
    }


@router.patch("/courses/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a course"""
    result = await db.execute(
        select(Course).where(and_(Course.id == course_id, Course.tenant_id == tenant_id))
    )
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Update fields
    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    course.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(course)

    # Get instructor name
    instructor = None
    if course.instructor_id:
        instructor_result = await db.execute(
            select(User).where(User.id == course.instructor_id)
        )
        instructor = instructor_result.scalar_one_or_none()

    return {
        **course.__dict__,
        "instructor_name": f"{instructor.first_name} {instructor.last_name}" if instructor else None
    }


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a course"""
    result = await db.execute(
        select(Course).where(and_(Course.id == course_id, Course.tenant_id == tenant_id))
    )
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Check if course has associated reserves
    reserves_count = await db.execute(
        select(func.count()).select_from(Reserve).where(Reserve.course_id == course_id)
    )
    if reserves_count.scalar() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete course with existing reserves"
        )

    await db.delete(course)
    await db.commit()


# ============================================================================
# Reserve Endpoints
# ============================================================================

@router.get("/reserves/", response_model=PaginatedResponse[ReserveResponse])
async def list_reserves(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    course_id: Optional[UUID] = None,
    processing_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """List all reserves with pagination and filters"""
    query = select(Reserve).join(Course).where(Course.tenant_id == tenant_id)

    # Apply filters
    if course_id:
        query = query.where(Reserve.course_id == course_id)

    if processing_status:
        query = query.where(Reserve.processing_status == processing_status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total_items = result.scalar() or 0

    # Apply pagination
    query = query.order_by(Reserve.created_at.desc()).offset((page - 1) * page_size).limit(page_size)

    # Execute query
    result = await db.execute(query)
    reserves = result.scalars().all()

    # Get course and item info
    course_ids = [r.course_id for r in reserves]
    item_ids = [r.item_id for r in reserves]

    courses_result = await db.execute(select(Course).where(Course.id.in_(course_ids)))
    courses = {c.id: c for c in courses_result.scalars().all()}

    items_result = await db.execute(select(Item).where(Item.id.in_(item_ids)))
    items = {i.id: i for i in items_result.scalars().all()}

    # Enrich with course and item data
    reserve_list = []
    for reserve in reserves:
        course = courses.get(reserve.course_id)
        item = items.get(reserve.item_id)

        reserve_dict = {
            **reserve.__dict__,
            "course_code": course.code if course else None,
            "course_name": course.name if course else None,
            "item_barcode": item.barcode if item else None,
            "item_title": item.title if item else None
        }
        reserve_list.append(reserve_dict)

    return {
        "data": reserve_list,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": (total_items + page_size - 1) // page_size
        }
    }


@router.post("/reserves/", response_model=ReserveResponse, status_code=status.HTTP_201_CREATED)
async def create_reserve(
    reserve_data: ReserveCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Create a new reserve"""
    # Verify course exists
    course_result = await db.execute(
        select(Course).where(
            and_(
                Course.id == reserve_data.course_id,
                Course.tenant_id == tenant_id
            )
        )
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Verify item exists
    item_result = await db.execute(
        select(Item).where(
            and_(
                Item.id == reserve_data.item_id,
                Item.tenant_id == tenant_id
            )
        )
    )
    item = item_result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Create reserve
    reserve = Reserve(**reserve_data.model_dump())

    # Update course total_reserves
    course.total_reserves += 1

    db.add(reserve)
    await db.commit()
    await db.refresh(reserve)

    return {
        **reserve.__dict__,
        "course_code": course.code,
        "course_name": course.name,
        "item_barcode": item.barcode,
        "item_title": item.title
    }


@router.patch("/reserves/{reserve_id}", response_model=ReserveResponse)
async def update_reserve(
    reserve_id: UUID,
    reserve_data: ReserveUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Update a reserve"""
    result = await db.execute(
        select(Reserve).join(Course).where(
            and_(
                Reserve.id == reserve_id,
                Course.tenant_id == tenant_id
            )
        )
    )
    reserve = result.scalar_one_or_none()

    if not reserve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserve not found"
        )

    # Update fields
    update_data = reserve_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reserve, field, value)

    reserve.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(reserve)

    # Get course and item info
    course_result = await db.execute(select(Course).where(Course.id == reserve.course_id))
    course = course_result.scalar_one()

    item_result = await db.execute(select(Item).where(Item.id == reserve.item_id))
    item = item_result.scalar_one()

    return {
        **reserve.__dict__,
        "course_code": course.code,
        "course_name": course.name,
        "item_barcode": item.barcode,
        "item_title": item.title
    }


@router.delete("/reserves/{reserve_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reserve(
    reserve_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """Delete a reserve"""
    result = await db.execute(
        select(Reserve).join(Course).where(
            and_(
                Reserve.id == reserve_id,
                Course.tenant_id == tenant_id
            )
        )
    )
    reserve = result.scalar_one_or_none()

    if not reserve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserve not found"
        )

    # Update course total_reserves
    course_result = await db.execute(select(Course).where(Course.id == reserve.course_id))
    course = course_result.scalar_one()
    course.total_reserves -= 1

    await db.delete(reserve)
    await db.commit()
