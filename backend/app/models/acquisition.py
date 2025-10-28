"""
Acquisition models (Orders, Vendors, Invoices).
Based on FOLIO mod-orders schema.
"""

from datetime import datetime
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, JSON, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base
from app.models.base import TimestampMixin, UserTrackingMixin, TenantMixin


class OrderStatus(str, enum.Enum):
    """Order status enumeration."""
    PENDING = "pending"
    OPEN = "open"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class Order(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """Purchase order model."""
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    po_number = Column(String(100), unique=True, nullable=False, index=True)  # Purchase order number
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False)

    # Order details
    order_date = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    workflow_status = Column(String(50), default="pending")  # For API compatibility
    order_type = Column(String(50), default="one_time")  # one_time or ongoing
    approved = Column(Boolean, default=False)

    # Financial
    total_amount = Column(Numeric(10, 2), default=0.00)
    total_estimated_price = Column(Numeric(10, 2), default=0.00)  # Alias for compatibility
    currency = Column(String(3), default="USD")
    total_items = Column(String(50), default="0")

    # Shipping and billing
    ship_to = Column(String(500))
    bill_to = Column(String(500))

    # Notes
    notes = Column(JSON, default=list)

    # Relationships
    vendor = relationship("Vendor", back_populates="orders")
    order_lines = relationship("OrderLine", back_populates="order", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order(po_number={self.po_number}, status={self.status})>"


class OrderLine(Base, TimestampMixin, TenantMixin):
    """Order line item model."""
    __tablename__ = "order_lines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    instance_id = Column(UUID(as_uuid=True), ForeignKey("instances.id"))

    # Item details
    title = Column(String(500), nullable=False)
    quantity = Column(String(50), default="1")
    unit_price = Column(Numeric(10, 2), default=0.00)
    total_price = Column(Numeric(10, 2), default=0.00)

    # Relationships
    order = relationship("Order", back_populates="order_lines")

    def __repr__(self):
        return f"<OrderLine(title={self.title}, quantity={self.quantity})>"


class Vendor(Base, TimestampMixin, TenantMixin):
    """Vendor/Supplier model."""
    __tablename__ = "vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(500))

    # Contact information
    contact_info = Column(JSON, default=dict)

    # Status
    is_active = Column(Boolean, default=True)

    # Relationships
    orders = relationship("Order", back_populates="vendor")

    def __repr__(self):
        return f"<Vendor(name={self.name})>"


class Fund(Base, TimestampMixin, TenantMixin):
    """Fund model for budget management."""
    __tablename__ = "funds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500))

    # Fund status and type
    fund_status = Column(String(50), default="active")  # active, inactive, frozen
    fund_type = Column(String(50))

    # Financial
    allocated_amount = Column(Numeric(10, 2), default=0.00)
    currency = Column(String(3), default="USD")

    def __repr__(self):
        return f"<Fund(code={self.code}, name={self.name})>"
