"""
Tests for RBAC (Role-Based Access Control) system.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.permission import Role, Permission
from app.models.user import User
from app.models.tenant import Tenant
from app.db.seed_roles import (
    seed_roles_and_permissions,
    create_permissions,
    create_roles,
    ROLE_PERMISSIONS
)
from app.core.permissions import ALL_PERMISSIONS
import uuid


@pytest.mark.asyncio
async def test_all_permissions_created(db_session: AsyncSession, default_tenant):
    """Test that all permissions defined in permissions.py are created."""
    # Seed the database
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Fetch all permissions
    result = await db_session.execute(
        select(Permission).where(Permission.tenant_id == default_tenant.id)
    )
    permissions = result.scalars().all()

    # Convert to dict for easy lookup
    perm_dict = {p.name: p for p in permissions}

    # Check that all defined permissions exist
    for perm_def in ALL_PERMISSIONS:
        assert perm_def["name"] in perm_dict, f"Permission '{perm_def['name']}' not found"
        perm = perm_dict[perm_def["name"]]
        assert perm.display_name == perm_def["display_name"]
        assert perm.resource == perm_def["resource"]
        assert perm.action == perm_def["action"]

    # Check total count
    assert len(permissions) == len(ALL_PERMISSIONS), \
        f"Expected {len(ALL_PERMISSIONS)} permissions, got {len(permissions)}"


@pytest.mark.asyncio
async def test_all_roles_created(db_session: AsyncSession, default_tenant):
    """Test that all default roles are created."""
    # Seed the database
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Fetch all roles
    result = await db_session.execute(
        select(Role).where(Role.tenant_id == default_tenant.id)
    )
    roles = result.scalars().all()

    # Convert to dict for easy lookup
    role_dict = {r.name: r for r in roles}

    # Check that all defined roles exist
    expected_roles = ["administrator", "librarian", "circulation_staff", "cataloger", "patron"]
    for role_name in expected_roles:
        assert role_name in role_dict, f"Role '{role_name}' not found"
        role = role_dict[role_name]
        assert role.is_system is True, f"Role '{role_name}' should be a system role"

    # Check total count
    assert len(roles) == len(expected_roles), \
        f"Expected {len(expected_roles)} roles, got {len(roles)}"


@pytest.mark.asyncio
async def test_administrator_has_all_permissions(db_session: AsyncSession, default_tenant):
    """Test that administrator role has all permissions."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Get administrator role
    result = await db_session.execute(
        select(Role).where(
            Role.name == "administrator",
            Role.tenant_id == default_tenant.id
        )
    )
    admin_role = result.scalar_one()

    # Get all permissions
    result = await db_session.execute(
        select(Permission).where(Permission.tenant_id == default_tenant.id)
    )
    all_permissions = result.scalars().all()

    # Administrator should have all permissions
    admin_perm_names = {p.name for p in admin_role.permissions}
    all_perm_names = {p.name for p in all_permissions}

    # Check that administrator has every permission
    missing_perms = all_perm_names - admin_perm_names
    assert len(missing_perms) == 0, \
        f"Administrator missing permissions: {missing_perms}"


@pytest.mark.asyncio
async def test_librarian_permissions(db_session: AsyncSession, default_tenant):
    """Test that librarian role has correct permissions."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Get librarian role
    result = await db_session.execute(
        select(Role).where(
            Role.name == "librarian",
            Role.tenant_id == default_tenant.id
        )
    )
    librarian_role = result.scalar_one()

    # Get permission names
    librarian_perms = {p.name for p in librarian_role.permissions}

    # Librarian should have these permissions
    expected_perms = set(ROLE_PERMISSIONS["librarian"]["permissions"])

    assert librarian_perms == expected_perms, \
        f"Librarian permissions mismatch.\nExpected: {expected_perms}\nGot: {librarian_perms}"

    # Librarian should NOT have these permissions
    forbidden_perms = {
        "users.create", "users.delete",
        "inventory.delete",
        "settings.update",
        "roles.create", "roles.delete",
    }

    has_forbidden = librarian_perms & forbidden_perms
    assert len(has_forbidden) == 0, \
        f"Librarian should not have these permissions: {has_forbidden}"


@pytest.mark.asyncio
async def test_circulation_staff_permissions(db_session: AsyncSession, default_tenant):
    """Test that circulation staff role has correct permissions."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Role).where(
            Role.name == "circulation_staff",
            Role.tenant_id == default_tenant.id
        )
    )
    circ_role = result.scalar_one()

    circ_perms = {p.name for p in circ_role.permissions}

    # Must have circulation permissions
    required_perms = {
        "circulation.checkout",
        "circulation.checkin",
        "circulation.renew",
        "circulation.view_all",
    }
    assert required_perms.issubset(circ_perms), \
        f"Circulation staff missing required permissions: {required_perms - circ_perms}"

    # Should NOT have inventory create/update/delete
    forbidden_perms = {
        "inventory.create",
        "inventory.update",
        "inventory.delete",
        "users.create",
        "users.update",
    }
    has_forbidden = circ_perms & forbidden_perms
    assert len(has_forbidden) == 0, \
        f"Circulation staff should not have: {has_forbidden}"


@pytest.mark.asyncio
async def test_cataloger_permissions(db_session: AsyncSession, default_tenant):
    """Test that cataloger role has correct permissions."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Role).where(
            Role.name == "cataloger",
            Role.tenant_id == default_tenant.id
        )
    )
    cataloger_role = result.scalar_one()

    cataloger_perms = {p.name for p in cataloger_role.permissions}

    # Must have inventory permissions
    required_perms = {
        "inventory.create",
        "inventory.read",
        "inventory.update",
    }
    assert required_perms.issubset(cataloger_perms), \
        f"Cataloger missing required permissions: {required_perms - cataloger_perms}"

    # Should NOT have circulation or user management
    forbidden_perms = {
        "circulation.checkout",
        "circulation.checkin",
        "users.create",
        "users.update",
        "fees.waive",
    }
    has_forbidden = cataloger_perms & forbidden_perms
    assert len(has_forbidden) == 0, \
        f"Cataloger should not have: {has_forbidden}"


@pytest.mark.asyncio
async def test_patron_permissions(db_session: AsyncSession, default_tenant):
    """Test that patron role has minimal, self-service permissions only."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Role).where(
            Role.name == "patron",
            Role.tenant_id == default_tenant.id
        )
    )
    patron_role = result.scalar_one()

    patron_perms = {p.name for p in patron_role.permissions}

    # Patron should have very limited permissions
    expected_perms = set(ROLE_PERMISSIONS["patron"]["permissions"])
    assert patron_perms == expected_perms, \
        f"Patron permissions mismatch.\nExpected: {expected_perms}\nGot: {patron_perms}"

    # Patron should NOT have any administrative permissions
    forbidden_perms = {
        "users.create", "users.update", "users.delete",
        "inventory.create", "inventory.update", "inventory.delete",
        "circulation.checkout", "circulation.checkin",
        "fees.waive", "fees.create",
        "settings.read", "settings.update",
    }
    has_forbidden = patron_perms & forbidden_perms
    assert len(has_forbidden) == 0, \
        f"Patron should not have: {has_forbidden}"


@pytest.mark.asyncio
async def test_role_seeding_is_idempotent(db_session: AsyncSession, default_tenant):
    """Test that seeding can be run multiple times without errors."""
    # Seed once
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Count roles and permissions
    result = await db_session.execute(
        select(Role).where(Role.tenant_id == default_tenant.id)
    )
    roles_count_1 = len(result.scalars().all())

    result = await db_session.execute(
        select(Permission).where(Permission.tenant_id == default_tenant.id)
    )
    perms_count_1 = len(result.scalars().all())

    # Seed again
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Count again
    result = await db_session.execute(
        select(Role).where(Role.tenant_id == default_tenant.id)
    )
    roles_count_2 = len(result.scalars().all())

    result = await db_session.execute(
        select(Permission).where(Permission.tenant_id == default_tenant.id)
    )
    perms_count_2 = len(result.scalars().all())

    # Counts should be the same
    assert roles_count_1 == roles_count_2, "Roles count changed after re-seeding"
    assert perms_count_1 == perms_count_2, "Permissions count changed after re-seeding"


@pytest.mark.asyncio
async def test_user_role_assignment(db_session: AsyncSession, default_tenant):
    """Test that users are assigned correct roles."""
    from app.core.security import get_password_hash

    # Create users first
    admin_user = User(
        id=uuid.uuid4(),
        username="admin",
        email="admin@test.com",
        hashed_password=get_password_hash("Admin@123"),
        active=True,
        user_type="staff",
        tenant_id=default_tenant.id,
        personal={"firstName": "Admin", "lastName": "User"},
    )
    db_session.add(admin_user)

    patron_user = User(
        id=uuid.uuid4(),
        username="patron",
        email="patron@test.com",
        hashed_password=get_password_hash("Patron@123"),
        active=True,
        user_type="patron",
        tenant_id=default_tenant.id,
        personal={"firstName": "Test", "lastName": "Patron"},
    )
    db_session.add(patron_user)
    await db_session.commit()

    # Now seed roles
    await seed_roles_and_permissions(db_session, default_tenant.id)

    # Refresh users to load relationships
    await db_session.refresh(admin_user)
    await db_session.refresh(patron_user)

    # Check admin has administrator role
    admin_role_names = {r.name for r in admin_user.roles}
    assert "administrator" in admin_role_names, \
        f"Admin user should have administrator role, has: {admin_role_names}"

    # Check patron has patron role
    patron_role_names = {r.name for r in patron_user.roles}
    assert "patron" in patron_role_names, \
        f"Patron user should have patron role, has: {patron_role_names}"


@pytest.mark.asyncio
async def test_permission_structure(db_session: AsyncSession, default_tenant):
    """Test that permissions have correct structure and naming."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Permission).where(Permission.tenant_id == default_tenant.id)
    )
    permissions = result.scalars().all()

    for perm in permissions:
        # Permission name should follow pattern: resource.action
        assert "." in perm.name, f"Permission '{perm.name}' doesn't follow naming pattern"
        parts = perm.name.split(".")
        assert len(parts) == 2, f"Permission '{perm.name}' should have exactly 2 parts"

        # Resource and action should match the name parts
        resource, action = parts
        assert perm.resource == resource, \
            f"Permission '{perm.name}' has mismatched resource"
        assert perm.action == action, \
            f"Permission '{perm.name}' has mismatched action"

        # Should have display name
        assert perm.display_name, f"Permission '{perm.name}' missing display name"
        assert len(perm.display_name) > 0, \
            f"Permission '{perm.name}' has empty display name"


@pytest.mark.asyncio
async def test_system_roles_cannot_be_deleted(db_session: AsyncSession, default_tenant):
    """Test that system roles are marked correctly."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Role).where(Role.tenant_id == default_tenant.id)
    )
    roles = result.scalars().all()

    # All default roles should be system roles
    for role in roles:
        assert role.is_system is True, \
            f"Role '{role.name}' should be a system role"


@pytest.mark.asyncio
async def test_role_permission_counts(db_session: AsyncSession, default_tenant):
    """Test that each role has the expected number of permissions."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Role).where(Role.tenant_id == default_tenant.id)
    )
    roles = {r.name: r for r in result.scalars().all()}

    # Check counts match definitions
    for role_name, role_config in ROLE_PERMISSIONS.items():
        role = roles[role_name]
        expected_count = len(role_config["permissions"])
        actual_count = len(role.permissions)

        assert actual_count == expected_count, \
            f"Role '{role_name}' should have {expected_count} permissions, has {actual_count}"


@pytest.mark.asyncio
async def test_no_duplicate_permissions(db_session: AsyncSession, default_tenant):
    """Test that there are no duplicate permissions."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Permission).where(Permission.tenant_id == default_tenant.id)
    )
    permissions = result.scalars().all()

    # Check for duplicate names
    perm_names = [p.name for p in permissions]
    unique_names = set(perm_names)

    assert len(perm_names) == len(unique_names), \
        "Found duplicate permissions in database"


@pytest.mark.asyncio
async def test_no_duplicate_roles(db_session: AsyncSession, default_tenant):
    """Test that there are no duplicate roles."""
    await seed_roles_and_permissions(db_session, default_tenant.id)

    result = await db_session.execute(
        select(Role).where(Role.tenant_id == default_tenant.id)
    )
    roles = result.scalars().all()

    # Check for duplicate names
    role_names = [r.name for r in roles]
    unique_names = set(role_names)

    assert len(role_names) == len(unique_names), \
        "Found duplicate roles in database"


# Fixtures for tests
@pytest.fixture
async def default_tenant(db_session: AsyncSession):
    """Create and return a default tenant for testing."""
    tenant = Tenant(
        id=uuid.uuid4(),
        name="Test Tenant",
        code="test",
        active=True,
    )
    db_session.add(tenant)
    await db_session.commit()
    await db_session.refresh(tenant)
    return tenant
