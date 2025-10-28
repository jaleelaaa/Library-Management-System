"""
Base model class with common fields.
"""

from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
import uuid


class TimestampMixin:
    """Mixin to add timestamp fields to models."""

    created_date = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_date = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class UserTrackingMixin:
    """Mixin to track which user created/updated a record."""

    @declared_attr
    def created_by_user_id(cls):
        return Column(UUID(as_uuid=True))

    @declared_attr
    def updated_by_user_id(cls):
        return Column(UUID(as_uuid=True))


class TenantMixin:
    """Mixin to add tenant isolation."""

    @declared_attr
    def tenant_id(cls):
        return Column(UUID(as_uuid=True), nullable=False, index=True)
