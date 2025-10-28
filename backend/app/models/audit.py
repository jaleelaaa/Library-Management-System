"""
Audit log model for tracking all system actions.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from app.db.base import Base


class AuditAction(str, enum.Enum):
    """Audit action types."""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"


class AuditStatus(str, enum.Enum):
    """Audit status."""
    SUCCESS = "success"
    FAILURE = "failure"


class AuditLog(Base):
    """
    Audit log model for comprehensive activity tracking.
    """
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # When
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    # Who
    actor = Column(UUID(as_uuid=True), index=True)  # User ID

    # What
    action = Column(SQLEnum(AuditAction), nullable=False, index=True)
    target = Column(String(500))  # Resource path, e.g., "instances/123"
    resource_type = Column(String(100), index=True)  # e.g., "instance", "user"

    # Details
    details = Column(JSON, default=dict)  # Additional metadata

    # Result
    status = Column(SQLEnum(AuditStatus), default=AuditStatus.SUCCESS, nullable=False)

    # Tenant
    tenant_id = Column(UUID(as_uuid=True), index=True)

    # Request metadata
    ip_address = Column(String(50))
    user_agent = Column(String(500))

    def __repr__(self):
        return f"<AuditLog(action={self.action}, target={self.target}, status={self.status})>"
