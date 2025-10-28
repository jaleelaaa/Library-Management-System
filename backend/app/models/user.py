"""
User-related database models.
Based on FOLIO mod-users schema.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Table
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base
from app.models.base import TimestampMixin, TenantMixin


class UserType(str, enum.Enum):
    """User type enumeration."""
    STAFF = "staff"
    PATRON = "patron"
    SHADOW = "shadow"
    SYSTEM = "system"
    DCB = "dcb"


# Association table for many-to-many relationship between users and tenants
user_tenants = Table(
    'user_tenants',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('tenant_id', UUID(as_uuid=True), ForeignKey('tenants.id'), primary_key=True)
)


class User(Base, TimestampMixin, TenantMixin):
    """
    User model representing library users (patrons and staff).

    Based on FOLIO mod-users User schema.
    """
    __tablename__ = "users"

    # Primary identifiers
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    barcode = Column(String(255), unique=True, index=True)

    # User status
    active = Column(Boolean, default=True, nullable=False)
    user_type = Column(SQLEnum(UserType), default=UserType.PATRON, nullable=False)

    # Password (hashed)
    hashed_password = Column(String(255), nullable=False)

    # Relationships
    patron_group_id = Column(UUID(as_uuid=True), ForeignKey("patron_groups.id"))
    patron_group = relationship("PatronGroup", back_populates="users")

    # Personal information (stored as JSONB for flexibility, like FOLIO's JSONB approach)
    personal = Column(JSONB, nullable=False, default=dict)
    # personal structure:
    # {
    #     "lastName": "string",
    #     "firstName": "string",
    #     "middleName": "string",
    #     "preferredFirstName": "string",
    #     "pronouns": "string",
    #     "email": "string",
    #     "phone": "string",
    #     "mobilePhone": "string",
    #     "dateOfBirth": "ISO date",
    #     "preferredContactTypeId": "UUID"
    # }

    # Addresses (one-to-many relationship)
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")

    # Dates
    enrollment_date = Column(DateTime(timezone=True))
    expiration_date = Column(DateTime(timezone=True))

    # Custom fields (flexible JSONB storage)
    custom_fields = Column(JSONB, default=dict)

    # Tags
    tags = Column(JSONB, default=list)

    # Preferred communication
    preferred_email_communication = Column(JSONB, default=list)

    # Metadata
    created_by_user_id = Column(UUID(as_uuid=True))
    updated_by_user_id = Column(UUID(as_uuid=True))

    # Relationships
    tenants = relationship("Tenant", secondary=user_tenants, back_populates="users")
    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="user", cascade="all, delete-orphan")
    roles = relationship("Role", secondary="user_roles", back_populates="users")

    def __repr__(self):
        return f"<User(username={self.username}, id={self.id})>"


class PatronGroup(Base, TimestampMixin, TenantMixin):
    """
    Patron group model for categorizing users.

    Examples: Undergraduate, Graduate, Faculty, Staff
    """
    __tablename__ = "patron_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_name = Column(String(255), unique=True, nullable=False)
    description = Column(String(500))

    # Loan rules (simplified - in FOLIO this would be more complex)
    loan_period_days = Column(String(50), default="14")
    renewals_allowed = Column(Boolean, default=True)

    # Relationships
    users = relationship("User", back_populates="patron_group")

    def __repr__(self):
        return f"<PatronGroup(name={self.group_name})>"


class Department(Base, TimestampMixin, TenantMixin):
    """
    Department model for organizational units.
    """
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)

    def __repr__(self):
        return f"<Department(name={self.name}, code={self.code})>"


class Address(Base):
    """
    Address model for user addresses.

    Each user can have multiple addresses (home, work, etc.)
    """
    __tablename__ = "addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    region = Column(String(100))
    postal_code = Column(String(20))
    country_id = Column(String(2))  # ISO country code

    address_type = Column(String(50))  # e.g., "Home", "Work"
    primary_address = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="addresses")

    def __repr__(self):
        return f"<Address(user_id={self.user_id}, type={self.address_type})>"
