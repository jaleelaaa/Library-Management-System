"""
Tenant models for multi-tenancy support.
"""

from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base
from app.models.base import TimestampMixin


class Tenant(Base, TimestampMixin):
    """
    Tenant model for multi-tenancy.
    Each tenant represents an independent organization using the system.
    """

    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    active = Column(Boolean, default=True, nullable=False)

    # Configuration (JSONB in PostgreSQL)
    # config = Column(JSON, default=dict)

    # Relationships
    users = relationship("User", secondary="user_tenants", back_populates="tenants")

    def __repr__(self):
        return f"<Tenant(name={self.name}, code={self.code})>"
