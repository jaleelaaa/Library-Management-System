"""
Pytest configuration and fixtures for backend tests.
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.permission import Role, Permission
from app.models.tenant import Tenant
from app.models.inventory import Instance, Holding, Item, Location, Library
from app.models.circulation import Loan, Request, LoanPolicy
from app.models.course import Course, Reserve
from app.models.acquisition import Vendor, Order, Fund


# Test database URL
TEST_DATABASE_URL = "postgresql+asyncpg://folio:folio_password@localhost:5432/folio_lms_test"


# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with database override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_tenant(db_session: AsyncSession) -> Tenant:
    """Create a test tenant."""
    tenant = Tenant(
        name="Test Library",
        code="TEST",
        subdomain="test",
        is_active=True,
    )
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return tenant


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession, test_tenant: Tenant) -> User:
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword"),
        is_active=True,
        tenant_id=test_tenant.id,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin_user(db_session: AsyncSession, test_tenant: Tenant) -> User:
    """Create a test admin user."""
    user = User(
        username="adminuser",
        email="admin@example.com",
        full_name="Admin User",
        hashed_password=get_password_hash("adminpassword"),
        is_active=True,
        is_superuser=True,
        tenant_id=test_tenant.id,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    access_token = create_access_token(
        data={"sub": str(test_user.id), "tenant_id": str(test_user.tenant_id)}
    )
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_headers(test_admin_user: User) -> dict:
    """Create authentication headers for admin user."""
    access_token = create_access_token(
        data={"sub": str(test_admin_user.id), "tenant_id": str(test_admin_user.tenant_id)}
    )
    return {"Authorization": f"Bearer {access_token}"}


@pytest_asyncio.fixture
async def test_library(db_session: AsyncSession, test_tenant: Tenant) -> Library:
    """Create a test library."""
    library = Library(
        name="Main Library",
        code="MAIN",
        tenant_id=test_tenant.id,
    )
    db_session.add(library)
    await db_session.commit()
    await db_session.refresh(library)
    return library


@pytest_asyncio.fixture
async def test_location(db_session: AsyncSession, test_tenant: Tenant, test_library: Library) -> Location:
    """Create a test location."""
    location = Location(
        name="Main Stacks",
        code="MAIN-ST",
        library_id=test_library.id,
        tenant_id=test_tenant.id,
        is_active=True,
    )
    db_session.add(location)
    await db_session.commit()
    await db_session.refresh(location)
    return location


@pytest_asyncio.fixture
async def test_instance(db_session: AsyncSession, test_tenant: Tenant, test_user: User) -> Instance:
    """Create a test instance."""
    instance = Instance(
        title="Test Book Title",
        subtitle="A Comprehensive Guide",
        instance_type="text",
        contributors=[{"name": "Test Author", "type": "author"}],
        publication=[{"publisher": "Test Publisher", "dateOfPublication": "2024"}],
        tenant_id=test_tenant.id,
        created_by_user_id=test_user.id,
    )
    db_session.add(instance)
    await db_session.commit()
    await db_session.refresh(instance)
    return instance


@pytest_asyncio.fixture
async def test_holding(db_session: AsyncSession, test_tenant: Tenant, test_instance: Instance, test_location: Location, test_user: User) -> Holding:
    """Create a test holding."""
    holding = Holding(
        instance_id=test_instance.id,
        permanent_location_id=test_location.id,
        call_number="123.45 TES",
        tenant_id=test_tenant.id,
        created_by_user_id=test_user.id,
    )
    db_session.add(holding)
    await db_session.commit()
    await db_session.refresh(holding)
    return holding


@pytest_asyncio.fixture
async def test_item(db_session: AsyncSession, test_tenant: Tenant, test_holding: Holding, test_location: Location, test_user: User) -> Item:
    """Create a test item."""
    item = Item(
        holding_id=test_holding.id,
        barcode="TEST123456",
        status="available",
        permanent_location_id=test_location.id,
        tenant_id=test_tenant.id,
        created_by_user_id=test_user.id,
    )
    db_session.add(item)
    await db_session.commit()
    await db_session.refresh(item)
    return item


@pytest_asyncio.fixture
async def test_vendor(db_session: AsyncSession, test_tenant: Tenant, test_user: User) -> Vendor:
    """Create a test vendor."""
    vendor = Vendor(
        name="Test Vendor",
        code="VENDOR1",
        status="active",
        tenant_id=test_tenant.id,
        created_by_user_id=test_user.id,
    )
    db_session.add(vendor)
    await db_session.commit()
    await db_session.refresh(vendor)
    return vendor


@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession, test_tenant: Tenant, test_user: User) -> Course:
    """Create a test course."""
    course = Course(
        name="Introduction to Testing",
        code="TEST101",
        term="Fall 2024",
        instructor="Prof. Test",
        is_active=True,
        tenant_id=test_tenant.id,
        created_by_user_id=test_user.id,
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course


# Helper functions
def assert_pagination_response(response_data: dict, expected_total: int = None):
    """Assert standard pagination response structure."""
    assert "items" in response_data
    assert "total" in response_data
    assert "page" in response_data
    assert "page_size" in response_data
    assert "total_pages" in response_data
    assert isinstance(response_data["items"], list)

    if expected_total is not None:
        assert response_data["total"] == expected_total


def assert_uuid_format(value: str):
    """Assert that a value is a valid UUID."""
    import uuid
    try:
        uuid.UUID(value)
    except ValueError:
        pytest.fail(f"{value} is not a valid UUID")
