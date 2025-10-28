"""
Notification Model
Real-time notification system for library events
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from uuid import uuid4
import enum

from app.db.base import Base
from app.models.base import TenantMixin, TimestampMixin


class NotificationType(str, enum.Enum):
    """Notification types"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    OVERDUE = "overdue"
    HOLD_AVAILABLE = "hold_available"
    CHECKOUT = "checkout"
    CHECKIN = "checkin"
    RENEWAL = "renewal"
    SYSTEM = "system"


class Notification(Base, TenantMixin, TimestampMixin):
    """
    Notification model for real-time user notifications
    """
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # User who receives the notification
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Notification details
    type = Column(
        SQLEnum(NotificationType),
        nullable=False,
        default=NotificationType.INFO,
        index=True
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # Additional metadata (JSON)
    notification_metadata = Column(JSONB, nullable=True, default=dict)  # Renamed from 'metadata'

    # Read status
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Link to related entity (optional)
    entity_type = Column(String(50), nullable=True)  # e.g., "loan", "request", "item"
    entity_id = Column(UUID(as_uuid=True), nullable=True)

    # Notification priority
    priority = Column(String(20), default="normal", nullable=False)  # low, normal, high, urgent

    # Expiration
    expires_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Notification {self.id}: {self.title} for user {self.user_id}>"

    def to_dict(self):
        """Convert notification to dictionary for API response"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "type": self.type.value,
            "title": self.title,
            "message": self.message,
            "metadata": self.metadata or {},
            "is_read": self.is_read,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "entity_type": self.entity_type,
            "entity_id": str(self.entity_id) if self.entity_id else None,
            "priority": self.priority,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_date": self.created_date.isoformat() if self.created_date else None,
            "updated_date": self.updated_date.isoformat() if self.updated_date else None,
            "tenant_id": str(self.tenant_id) if self.tenant_id else None,
        }
