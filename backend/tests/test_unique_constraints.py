"""
Test cases for UNIQUE constraints on email and barcode fields.

Tests for BUG-003: Missing Database UNIQUE Constraints
"""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.user import User, PatronGroup
from app.models.inventory import Item, Holding, Instance
from app.models.tenant import Tenant


@pytest.mark.asyncio
async def test_email_unique_within_tenant(db_session: AsyncSession):
    """Test that email must be unique within a tenant."""

    # Create tenant
    tenant = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant",
        code="test",
        active=True
    )
    db_session.add(tenant)
    await db_session.commit()

    # Create first user with email
    user1 = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        username="user1",
        email="test@example.com",
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User1"}
    )
    db_session.add(user1)
    await db_session.commit()

    # Try to create second user with same email in same tenant
    user2 = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        username="user2",
        email="test@example.com",  # Duplicate email!
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User2"}
    )
    db_session.add(user2)

    # Should raise IntegrityError
    with pytest.raises(IntegrityError) as exc_info:
        await db_session.commit()

    assert "uq_users_email_tenant" in str(exc_info.value) or "unique" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_email_not_unique_across_tenants(db_session: AsyncSession):
    """Test that same email can exist in different tenants."""

    # Create two tenants
    tenant1 = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant 1",
        code="test1",
        active=True
    )
    tenant2 = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant 2",
        code="test2",
        active=True
    )
    db_session.add_all([tenant1, tenant2])
    await db_session.commit()

    # Create user with email in tenant1
    user1 = User(
        id=uuid.uuid4(),
        tenant_id=tenant1.id,
        username="user1",
        email="test@example.com",
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User1"}
    )
    db_session.add(user1)
    await db_session.commit()

    # Create user with same email in tenant2 - should succeed
    user2 = User(
        id=uuid.uuid4(),
        tenant_id=tenant2.id,
        username="user2",
        email="test@example.com",  # Same email, different tenant
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User2"}
    )
    db_session.add(user2)
    await db_session.commit()

    # Both should exist
    assert user1.id is not None
    assert user2.id is not None
    assert user1.email == user2.email
    assert user1.tenant_id != user2.tenant_id


@pytest.mark.asyncio
async def test_user_barcode_unique_within_tenant(db_session: AsyncSession):
    """Test that user barcode must be unique within a tenant."""

    # Create tenant
    tenant = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant",
        code="test",
        active=True
    )
    db_session.add(tenant)
    await db_session.commit()

    # Create first user with barcode
    user1 = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        username="user1",
        email="user1@example.com",
        barcode="12345",
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User1"}
    )
    db_session.add(user1)
    await db_session.commit()

    # Try to create second user with same barcode in same tenant
    user2 = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        username="user2",
        email="user2@example.com",
        barcode="12345",  # Duplicate barcode!
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User2"}
    )
    db_session.add(user2)

    # Should raise IntegrityError
    with pytest.raises(IntegrityError) as exc_info:
        await db_session.commit()

    assert "uq_users_barcode_tenant" in str(exc_info.value) or "unique" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_item_barcode_unique_within_tenant(db_session: AsyncSession):
    """Test that item barcode must be unique within a tenant."""

    # Create tenant
    tenant = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant",
        code="test",
        active=True
    )
    db_session.add(tenant)
    await db_session.commit()

    # Create instance and holding (required for item)
    instance = Instance(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        title="Test Book"
    )
    db_session.add(instance)
    await db_session.commit()

    holding = Holding(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        instance_id=instance.id
    )
    db_session.add(holding)
    await db_session.commit()

    # Create first item with barcode
    item1 = Item(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        holding_id=holding.id,
        barcode="ITEM12345"
    )
    db_session.add(item1)
    await db_session.commit()

    # Try to create second item with same barcode in same tenant
    item2 = Item(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        holding_id=holding.id,
        barcode="ITEM12345"  # Duplicate barcode!
    )
    db_session.add(item2)

    # Should raise IntegrityError
    with pytest.raises(IntegrityError) as exc_info:
        await db_session.commit()

    assert "uq_items_barcode_tenant" in str(exc_info.value) or "unique" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_null_barcodes_allowed(db_session: AsyncSession):
    """Test that NULL barcodes are allowed (they don't violate uniqueness)."""

    # Create tenant
    tenant = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant",
        code="test",
        active=True
    )
    db_session.add(tenant)
    await db_session.commit()

    # Create two users with NULL barcodes - should both succeed
    user1 = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        username="user1",
        email="user1@example.com",
        barcode=None,  # NULL barcode
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User1"}
    )
    user2 = User(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        username="user2",
        email="user2@example.com",
        barcode=None,  # NULL barcode
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User2"}
    )
    db_session.add_all([user1, user2])
    await db_session.commit()

    # Both should exist with NULL barcodes
    assert user1.barcode is None
    assert user2.barcode is None


@pytest.mark.asyncio
async def test_barcode_not_unique_across_tenants(db_session: AsyncSession):
    """Test that same barcode can exist in different tenants."""

    # Create two tenants
    tenant1 = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant 1",
        code="test1",
        active=True
    )
    tenant2 = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant 2",
        code="test2",
        active=True
    )
    db_session.add_all([tenant1, tenant2])
    await db_session.commit()

    # Create user with barcode in tenant1
    user1 = User(
        id=uuid.uuid4(),
        tenant_id=tenant1.id,
        username="user1",
        email="user1@example.com",
        barcode="12345",
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User1"}
    )
    db_session.add(user1)
    await db_session.commit()

    # Create user with same barcode in tenant2 - should succeed
    user2 = User(
        id=uuid.uuid4(),
        tenant_id=tenant2.id,
        username="user2",
        email="user2@example.com",
        barcode="12345",  # Same barcode, different tenant
        hashed_password="hashed",
        personal={"firstName": "Test", "lastName": "User2"}
    )
    db_session.add(user2)
    await db_session.commit()

    # Both should exist
    assert user1.barcode == user2.barcode
    assert user1.tenant_id != user2.tenant_id
