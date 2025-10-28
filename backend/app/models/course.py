"""
Course and Reserves models.
Based on FOLIO mod-courses schema.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base
from app.models.base import TimestampMixin, TenantMixin


class Course(Base, TimestampMixin, TenantMixin):
    """Course model for course reserves."""
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))

    # Term information
    term = Column(String(100))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))

    # Instructor
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Status
    is_active = Column(Boolean, default=True)

    # Description
    description = Column(String(1000))

    # Relationships
    reserves = relationship("Reserve", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Course(name={self.name}, code={self.code})>"


class Reserve(Base, TimestampMixin, TenantMixin):
    """Reserve model for course reserve items."""
    __tablename__ = "reserves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False)

    # Reserve type
    reserve_type = Column(String(50))  # Physical, Electronic

    # Loan period
    loan_period = Column(String(50))  # e.g., "2 hours", "1 day"

    # Relationships
    course = relationship("Course", back_populates="reserves")

    def __repr__(self):
        return f"<Reserve(course_id={self.course_id}, item_id={self.item_id})>"
