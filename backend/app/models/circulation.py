"""
Circulation models (Loans, Requests, Loan Policies).
Based on FOLIO mod-circulation schema.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum as SQLEnum, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base
from app.models.base import TimestampMixin, TenantMixin, UserTrackingMixin


class LoanStatus(str, enum.Enum):
    """Loan status enumeration."""
    OPEN = "open"
    CLOSED = "closed"
    OVERDUE = "overdue"


class RequestStatus(str, enum.Enum):
    """Request status enumeration."""
    OPEN = "open"
    CLOSED = "closed"
    AWAITING_PICKUP = "awaiting_pickup"
    IN_TRANSIT = "in_transit"
    CANCELLED = "cancelled"


class Loan(Base, TimestampMixin, TenantMixin):
    """
    Loan model for tracking borrowed items.
    """
    __tablename__ = "loans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False, index=True)

    # Dates
    loan_date = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    return_date = Column(DateTime(timezone=True))

    # Status
    status = Column(SQLEnum(LoanStatus), default=LoanStatus.OPEN, nullable=False, index=True)

    # Renewal information
    renewal_count = Column(String(50), default="0")
    max_renewals = Column(String(50), default="3")

    # Metadata
    checkout_service_point_id = Column(UUID(as_uuid=True))
    checkin_service_point_id = Column(UUID(as_uuid=True))

    # Relationships
    user = relationship("User", back_populates="loans")
    item = relationship("Item", back_populates="loans")

    def __repr__(self):
        return f"<Loan(user_id={self.user_id}, item_id={self.item_id}, status={self.status})>"


class Request(Base, TimestampMixin, TenantMixin):
    """
    Request model for item holds/reservations.
    """
    __tablename__ = "requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False, index=True)

    # Request information
    request_type = Column(String(50), nullable=False)  # Hold, Recall, Page
    request_date = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    request_expiration_date = Column(DateTime(timezone=True))

    # Status
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.OPEN, nullable=False, index=True)

    # Position in queue
    position = Column(String(50))

    # Fulfillment preference
    fulfillment_preference = Column(String(50))  # Hold Shelf, Delivery

    # Pickup service point
    pickup_service_point_id = Column(UUID(as_uuid=True))

    # Relationships
    user = relationship("User", back_populates="requests")
    item = relationship("Item", backref="requests")

    def __repr__(self):
        return f"<Request(user_id={self.user_id}, item_id={self.item_id}, status={self.status})>"


class LoanPolicy(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Loan Policy configuration.

    Defines circulation rules such as loan periods, renewals, and grace periods.
    Based on FOLIO's circulation rules.
    """

    __tablename__ = "loan_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Policy identification
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)

    # Loan period configuration
    loan_period_duration = Column(Integer, nullable=False, default=14)  # Days
    loan_period_interval = Column(String(20), default="Days")  # Days, Weeks, Months

    # Renewability
    renewable = Column(Boolean, default=True)
    number_of_renewals_allowed = Column(Integer, default=3)
    renewal_period_duration = Column(Integer, default=14)  # Days
    renewal_period_interval = Column(String(20), default="Days")

    # Grace period
    grace_period_duration = Column(Integer, default=0)
    grace_period_interval = Column(String(20), default="Days")

    # Recall configuration
    recall_return_interval_duration = Column(Integer)
    recall_return_interval_interval = Column(String(20))

    # Fixed due date schedule (optional)
    fixed_due_date_schedule_id = Column(UUID(as_uuid=True))

    # Active status
    is_active = Column(Boolean, default=True)

    # Additional metadata for extensibility
    policy_metadata = Column(JSON)  # Renamed from 'metadata' to avoid SQLAlchemy reserved name

    def __repr__(self):
        return f"<LoanPolicy(name={self.name}, code={self.code})>"
