"""
Fee/Fine models for circulation billing.
Based on FOLIO mod-feesfines schema.
"""

from datetime import datetime
from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, DateTime, Text, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base
from app.models.base import TimestampMixin, UserTrackingMixin, TenantMixin


class FeeStatus(str, enum.Enum):
    """Fee/Fine status enumeration."""
    OPEN = "open"
    CLOSED = "closed"
    SUSPENDED = "suspended"


class FeeType(str, enum.Enum):
    """Fee/Fine type enumeration."""
    OVERDUE = "overdue"
    LOST_ITEM = "lost_item"
    DAMAGED_ITEM = "damaged_item"
    PROCESSING = "processing"
    REPLACEMENT = "replacement"
    LOST_ITEM_PROCESSING = "lost_item_processing"
    MANUAL = "manual"


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration."""
    CASH = "cash"
    CHECK = "check"
    CREDIT_CARD = "credit_card"
    TRANSFER = "transfer"
    WAIVE = "waive"
    FORGIVE = "forgive"
    REFUND = "refund"


class Fee(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Fee/Fine record for user charges.

    Based on FOLIO's Account schema.
    Tracks fines, fees, and payments.
    """

    __tablename__ = "fees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # User who owes the fee
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Related loan (if applicable)
    loan_id = Column(UUID(as_uuid=True), ForeignKey("loans.id"), index=True)

    # Related item (if applicable)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), index=True)

    # Fee/Fine details
    fee_type = Column(SQLEnum(FeeType), nullable=False)
    status = Column(SQLEnum(FeeStatus), default=FeeStatus.OPEN, nullable=False, index=True)

    # Financial details
    amount = Column(Numeric(10, 2), nullable=False)  # Original amount
    remaining = Column(Numeric(10, 2), nullable=False)  # Amount still owed
    paid_amount = Column(Numeric(10, 2), default=0.00)  # Amount paid

    # Description and reason
    description = Column(String(500))
    reason = Column(Text)

    # Dates
    fee_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime)  # Payment due date
    closed_date = Column(DateTime)  # Date fee was fully paid/waived

    # Automated flag (system-generated vs manual)
    automated = Column(Boolean, default=False)

    # Additional metadata
    fee_metadata = Column(Text)  # JSON metadata for extensibility (renamed from 'metadata')

    # Relationships
    user = relationship("User", backref="fees")
    loan = relationship("Loan", backref="fees")
    item = relationship("Item", backref="fees")
    payments = relationship("Payment", back_populates="fee", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Fee(user_id={self.user_id}, type={self.fee_type}, amount={self.amount}, remaining={self.remaining})>"


class Payment(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Payment record for fee/fine transactions.

    Based on FOLIO's Feefineaction schema.
    Tracks payments, waivers, and refunds.
    """

    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Related fee
    fee_id = Column(UUID(as_uuid=True), ForeignKey("fees.id"), nullable=False, index=True)

    # User who made the payment
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    # Payment details
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)

    # Transaction details
    transaction_info = Column(String(500))  # Check number, transaction ID, etc.
    comments = Column(Text)

    # Payment date
    payment_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Balance after this payment
    balance = Column(Numeric(10, 2), nullable=False)

    # Relationships
    fee = relationship("Fee", back_populates="payments")
    user = relationship("User", backref="payments")

    def __repr__(self):
        return f"<Payment(fee_id={self.fee_id}, method={self.payment_method}, amount={self.amount})>"


class FeePolicy(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Fee/Fine policy configuration.

    Defines automated fee amounts and rules.
    """

    __tablename__ = "fee_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Policy identification
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)

    # Fee type this policy applies to
    fee_type = Column(SQLEnum(FeeType), nullable=False)

    # Fee amounts
    initial_amount = Column(Numeric(10, 2))  # Initial charge
    max_amount = Column(Numeric(10, 2))  # Maximum charge cap

    # For overdue fees
    per_day_amount = Column(Numeric(10, 2))  # Daily rate
    grace_period_days = Column(Integer, default=0)  # Days before fees start

    # Active status
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<FeePolicy(name={self.name}, type={self.fee_type})>"
