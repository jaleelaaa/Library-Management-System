"""
Inventory models (Instances, Holdings, Items).
Based on FOLIO mod-inventory schema.
"""

from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, JSON, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.base import Base
from app.models.base import TimestampMixin, UserTrackingMixin, TenantMixin


class InstanceType(str, enum.Enum):
    """Instance type enumeration."""
    TEXT = "text"
    AUDIO = "audio"
    VIDEO = "video"
    SOFTWARE = "software"
    MAP = "map"
    MIXED = "mixed"


class ItemStatus(str, enum.Enum):
    """Item status enumeration."""
    AVAILABLE = "available"
    CHECKED_OUT = "checked_out"
    IN_TRANSIT = "in_transit"
    AWAITING_PICKUP = "awaiting_pickup"
    ON_ORDER = "on_order"
    IN_PROCESS = "in_process"
    MISSING = "missing"
    WITHDRAWN = "withdrawn"
    LOST = "lost"
    DAMAGED = "damaged"


class Instance(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Instance represents a bibliographic record (title-level).

    Based on FOLIO's Instance schema.
    Example: "Harry Potter and the Philosopher's Stone" (all editions/formats)
    """

    __tablename__ = "instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic bibliographic information
    title = Column(String(500), nullable=False, index=True)
    subtitle = Column(String(500))
    series = Column(String(500))
    instance_type = Column(SQLEnum(InstanceType), default=InstanceType.TEXT)

    # Identifiers (ISBN, ISSN, etc.) stored as JSON array
    # [{"identifierTypeId": "uuid", "value": "1234567890"}]
    identifiers = Column(JSON, default=list)

    # Contributors (authors, editors, etc.)
    # [{"contributorNameTypeId": "uuid", "name": "Rowling, J.K.", "contributorTypeId": "author"}]
    contributors = Column(JSON, default=list)

    # Publication info
    # [{"publisher": "Bloomsbury", "place": "London", "dateOfPublication": "1997"}]
    publication = Column(JSON, default=list)

    # Editions
    editions = Column(JSON, default=list)

    # Physical description
    physical_descriptions = Column(JSON, default=list)

    # Subjects
    subjects = Column(JSON, default=list)

    # Classifications (Dewey, LC, etc.)
    # [{"classificationTypeId": "uuid", "classificationNumber": "823.92"}]
    classifications = Column(JSON, default=list)

    # Languages (ISO codes)
    languages = Column(JSON, default=list)

    # Notes
    notes = Column(JSON, default=list)

    # MARC record (if imported)
    marc_record = Column(Text)

    # Tags
    tags = Column(JSON, default=list)

    # Discovery suppress
    discovery_suppress = Column(Boolean, default=False)

    # Staff suppress
    staff_suppress = Column(Boolean, default=False)

    # Source (MARC, FOLIO, etc.)
    source = Column(String(50), default="FOLIO")

    # Relationships
    holdings = relationship("Holding", back_populates="instance", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Instance(title={self.title}, id={self.id})>"


class Holding(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Holding represents copy-level holdings information.

    Example: Library X has 3 copies of "Harry Potter" in the Fiction section
    """

    __tablename__ = "holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instance_id = Column(UUID(as_uuid=True), ForeignKey("instances.id"), nullable=False, index=True)

    # Location
    permanent_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))
    temporary_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))

    # Call number
    call_number_type_id = Column(UUID(as_uuid=True))
    call_number = Column(String(255), index=True)
    call_number_prefix = Column(String(50))
    call_number_suffix = Column(String(50))

    # Shelving data
    shelving_title = Column(String(500))

    # Acquisition
    acquisition_method = Column(String(100))
    receipt_status = Column(String(100))

    # Notes
    notes = Column(JSON, default=list)

    # Holdings statements
    holdings_statements = Column(JSON, default=list)

    # Discovery suppress
    discovery_suppress = Column(Boolean, default=False)

    # Tags
    tags = Column(JSON, default=list)

    # Relationships
    instance = relationship("Instance", back_populates="holdings")
    items = relationship("Item", back_populates="holding", cascade="all, delete-orphan")
    location_permanent = relationship(
        "Location",
        foreign_keys=[permanent_location_id],
        backref="holdings_permanent",
    )
    location_temporary = relationship(
        "Location",
        foreign_keys=[temporary_location_id],
        backref="holdings_temporary",
    )

    def __repr__(self):
        return f"<Holding(call_number={self.call_number}, id={self.id})>"


class Item(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    """
    Item represents a physical copy.

    Example: Copy #1 with barcode 123456789
    """

    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    holding_id = Column(UUID(as_uuid=True), ForeignKey("holdings.id"), nullable=False, index=True)

    # Item identifiers
    barcode = Column(String(255), unique=True, index=True)
    accession_number = Column(String(255))
    item_identifier = Column(String(255))

    # Status
    status = Column(SQLEnum(ItemStatus), default=ItemStatus.AVAILABLE, nullable=False, index=True)

    # Material type
    material_type_id = Column(UUID(as_uuid=True))

    # Locations
    permanent_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))
    temporary_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))
    effective_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"))

    # Loan type
    permanent_loan_type_id = Column(UUID(as_uuid=True))
    temporary_loan_type_id = Column(UUID(as_uuid=True))

    # Copy/volume info
    copy_number = Column(String(50))
    volume = Column(String(100))
    enumeration = Column(String(100))
    chronology = Column(String(100))

    # Number of pieces
    number_of_pieces = Column(Integer, default=1)

    # Description of pieces
    description_of_pieces = Column(String(500))

    # Notes
    notes = Column(JSON, default=list)

    # Circulation notes
    circulation_notes = Column(JSON, default=list)

    # Discovery suppress
    discovery_suppress = Column(Boolean, default=False)

    # Tags
    tags = Column(JSON, default=list)

    # Relationships
    holding = relationship("Holding", back_populates="items")
    location_permanent = relationship(
        "Location",
        foreign_keys=[permanent_location_id],
        backref="items_permanent",
    )
    location_temporary = relationship(
        "Location",
        foreign_keys=[temporary_location_id],
        backref="items_temporary",
    )
    location_effective = relationship(
        "Location",
        foreign_keys=[effective_location_id],
        backref="items_effective",
    )
    loans = relationship("Loan", back_populates="item")

    def __repr__(self):
        return f"<Item(barcode={self.barcode}, status={self.status})>"


class Location(Base, TimestampMixin, TenantMixin):
    """Location model for organizing items."""

    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text)
    discovery_display_name = Column(String(255))

    # Library/Campus
    library_id = Column(UUID(as_uuid=True), ForeignKey("libraries.id"))
    campus_id = Column(UUID(as_uuid=True))
    institution_id = Column(UUID(as_uuid=True))

    # Service point
    primary_service_point_id = Column(UUID(as_uuid=True))

    # Active flag
    is_active = Column(Boolean, default=True)

    # Relationships
    library = relationship("Library", back_populates="locations")

    def __repr__(self):
        return f"<Location(name={self.name}, code={self.code})>"


class Library(Base, TimestampMixin, TenantMixin):
    """Library model."""

    __tablename__ = "libraries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)

    # Relationships
    locations = relationship("Location", back_populates="library")

    def __repr__(self):
        return f"<Library(name={self.name})>"
