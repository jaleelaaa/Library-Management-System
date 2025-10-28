"""
Notifications API Endpoints
CRUD operations and WebSocket notification management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime

from app.core.deps import get_current_user, get_current_tenant, get_db
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.services.websocket_service import get_websocket_service
from pydantic import BaseModel


router = APIRouter()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class NotificationCreate(BaseModel):
    """Create notification request"""
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    notification_metadata: dict = {}
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    priority: str = "normal"
    expires_at: Optional[datetime] = None


class NotificationUpdate(BaseModel):
    """Update notification request"""
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None


class NotificationResponse(BaseModel):
    """Notification response"""
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    metadata: dict
    is_read: bool
    read_at: Optional[datetime]
    entity_type: Optional[str]
    entity_id: Optional[UUID]
    priority: str
    expires_at: Optional[datetime]
    created_date: datetime
    updated_date: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[NotificationResponse])
async def get_user_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    notification_type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user's notifications

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - unread_only: Filter to show only unread notifications
    - notification_type: Filter by notification type
    """
    # Build query
    query = select(Notification).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.tenant_id == UUID(tenant_id)
        )
    )

    # Apply filters
    if unread_only:
        query = query.where(Notification.is_read == False)

    if notification_type:
        query = query.where(Notification.type == notification_type)

    # Filter out expired notifications
    query = query.where(
        or_(
            Notification.expires_at == None,
            Notification.expires_at > datetime.utcnow()
        )
    )

    # Order by created date (newest first)
    query = query.order_by(Notification.created_date.desc())

    # Apply pagination
    query = query.offset(skip).limit(limit)

    # Execute query
    result = await db.execute(query)
    notifications = result.scalars().all()

    return notifications


@router.get("/count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Get count of unread notifications for current user"""
    query = select(func.count(Notification.id)).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.tenant_id == UUID(tenant_id),
            Notification.is_read == False,
            or_(
                Notification.expires_at == None,
                Notification.expires_at > datetime.utcnow()
            )
        )
    )

    result = await db.execute(query)
    count = result.scalar()

    return {"unread_count": count}


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new notification

    This endpoint also sends real-time notification via WebSocket if the user is connected.
    """
    # Create notification
    notification = Notification(
        user_id=notification_data.user_id,
        type=notification_data.type,
        title=notification_data.title,
        message=notification_data.message,
        notification_metadata=notification_data.notification_metadata,
        entity_type=notification_data.entity_type,
        entity_id=notification_data.entity_id,
        priority=notification_data.priority,
        expires_at=notification_data.expires_at,
        tenant_id=UUID(tenant_id),
    )

    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    # Send real-time notification via WebSocket
    ws_service = get_websocket_service()
    await ws_service.send_notification_to_user(
        user_id=str(notification_data.user_id),
        notification=notification.to_dict()
    )

    return notification


@router.put("/{notification_id}/mark-read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Mark a notification as read"""
    # Get notification
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id,
                Notification.tenant_id == UUID(tenant_id)
            )
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Update read status
    notification.is_read = True
    notification.read_at = datetime.utcnow()

    await db.commit()
    await db.refresh(notification)

    return notification


@router.put("/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications as read for current user"""
    # Update all unread notifications
    from sqlalchemy import update

    stmt = (
        update(Notification)
        .where(
            and_(
                Notification.user_id == current_user.id,
                Notification.tenant_id == UUID(tenant_id),
                Notification.is_read == False
            )
        )
        .values(is_read=True, read_at=datetime.utcnow())
    )

    result = await db.execute(stmt)
    await db.commit()

    return {"message": f"Marked {result.rowcount} notifications as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Delete a notification"""
    # Get notification
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id,
                Notification.tenant_id == UUID(tenant_id)
            )
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    await db.delete(notification)
    await db.commit()

    return {"message": "Notification deleted successfully"}


@router.delete("/")
async def delete_all_read_notifications(
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Delete all read notifications for current user"""
    from sqlalchemy import delete as sql_delete

    stmt = sql_delete(Notification).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.tenant_id == UUID(tenant_id),
            Notification.is_read == True
        )
    )

    result = await db.execute(stmt)
    await db.commit()

    return {"message": f"Deleted {result.rowcount} read notifications"}
