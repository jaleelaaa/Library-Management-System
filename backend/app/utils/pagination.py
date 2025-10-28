"""
Pagination utilities.
"""

from typing import TypeVar, Generic
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.common import PaginatedResponse, PaginationMeta
import math

T = TypeVar('T')


async def paginate(
    db: AsyncSession,
    query,
    page: int,
    page_size: int,
) -> PaginatedResponse:
    """
    Paginate a SQLAlchemy query.

    Args:
        db: Database session
        query: SQLAlchemy select query
        page: Page number (1-indexed)
        page_size: Items per page

    Returns:
        PaginatedResponse with data and metadata
    """
    # Count total items
    count_query = select(func.count()).select_from(query.subquery())
    total_items = (await db.execute(count_query)).scalar()

    # Calculate pagination
    total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0
    offset = (page - 1) * page_size

    # Fetch paginated data
    query = query.limit(page_size).offset(offset)
    result = await db.execute(query)
    data = result.scalars().all()

    return PaginatedResponse(
        data=data,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
        ),
    )
