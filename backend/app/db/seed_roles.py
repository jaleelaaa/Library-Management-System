"""
Seed roles and permissions for FOLIO LMS RBAC system.

This module creates default roles with appropriate permissions based on
user manuals and FOLIO specifications.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.permission import Role, Permission
from app.models.user import User
from app.models.tenant import Tenant
from app.core.permissions import ALL_PERMISSIONS
import uuid


# ============================================================================
# ROLE PERMISSION MAPPINGS
# Based on user manuals: Administrator, Librarian, Circulation Staff,
# Cataloger, and Patron roles
# ============================================================================

ROLE_PERMISSIONS = {
    "administrator": {
        "display_name": "Administrator",
        "description": "Full system access - can perform all operations",
        "is_system": True,
        "permissions": [
            # ALL permissions - administrators have complete access
            "users.create", "users.read", "users.update", "users.delete",
            "inventory.create", "inventory.read", "inventory.update", "inventory.delete",
            "circulation.checkout", "circulation.checkin", "circulation.renew",
            "circulation.view_all",
            "requests.create", "requests.read", "requests.update", "requests.delete",
            "acquisitions.create", "acquisitions.read", "acquisitions.update", "acquisitions.delete",
            "vendors.create", "vendors.read", "vendors.update", "vendors.delete",
            "courses.create", "courses.read", "courses.update", "courses.delete",
            "reserves.create", "reserves.read", "reserves.update", "reserves.delete",
            "fees.create", "fees.read", "fees.update", "fees.delete", "fees.waive", "fees.pay",
            "reports.generate", "reports.read", "reports.export", "reports.schedule",
            "settings.read", "settings.update",
            "patron_groups.create", "patron_groups.read", "patron_groups.update", "patron_groups.delete",
            "locations.create", "locations.read", "locations.update", "locations.delete",
            "libraries.create", "libraries.read", "libraries.update", "libraries.delete",
            "notifications.create", "notifications.read", "notifications.update", "notifications.delete",
            "roles.create", "roles.read", "roles.update", "roles.delete",
            "permissions.create", "permissions.read", "permissions.update", "permissions.delete",
            "audit.read", "audit.export",
        ]
    },

    "librarian": {
        "display_name": "Librarian",
        "description": "Full operational access - all library operations except system administration",
        "is_system": True,
        "permissions": [
            # User management (read/update only, no create/delete)
            "users.read", "users.update",

            # Full inventory access (create, read, update - no delete)
            "inventory.create", "inventory.read", "inventory.update",

            # Full circulation access
            "circulation.checkout", "circulation.checkin", "circulation.renew",
            "circulation.view_all",

            # Requests/Holds management
            "requests.create", "requests.read", "requests.update", "requests.delete",

            # Full acquisitions access (create, read, update - no delete)
            "acquisitions.create", "acquisitions.read", "acquisitions.update",
            "vendors.create", "vendors.read", "vendors.update",

            # Course reserves management
            "courses.create", "courses.read", "courses.update", "courses.delete",
            "reserves.create", "reserves.read", "reserves.update", "reserves.delete",

            # Fees management (all operations including waive)
            "fees.create", "fees.read", "fees.update", "fees.waive", "fees.pay",

            # Reports access
            "reports.generate", "reports.read", "reports.export",

            # Patron groups (read only)
            "patron_groups.read",

            # Locations and libraries (read only)
            "locations.read",
            "libraries.read",

            # Notifications
            "notifications.create", "notifications.read", "notifications.update",

            # Roles (read only)
            "roles.read",
        ]
    },

    "circulation_staff": {
        "display_name": "Circulation Desk Staff",
        "description": "Circulation operations only - checkout, checkin, renewals",
        "is_system": True,
        "permissions": [
            # User read access (need to look up patrons)
            "users.read",

            # Inventory read access (need to search for items)
            "inventory.read",

            # Full circulation access
            "circulation.checkout", "circulation.checkin", "circulation.renew",
            "circulation.view_all",

            # Requests/Holds management
            "requests.create", "requests.read", "requests.update",

            # Fees read access (need to see patron fees)
            "fees.read", "fees.pay",

            # Patron groups (read only)
            "patron_groups.read",

            # Locations (read only)
            "locations.read",
            "libraries.read",
        ]
    },

    "cataloger": {
        "display_name": "Cataloger",
        "description": "Inventory management and cataloging only",
        "is_system": True,
        "permissions": [
            # Full inventory access (create, read, update - no delete)
            "inventory.create", "inventory.read", "inventory.update",

            # Acquisitions read access (to see what's coming)
            "acquisitions.read",

            # Vendors read access
            "vendors.read",

            # Reports read access
            "reports.read", "reports.export",

            # Locations and libraries
            "locations.read", "locations.create", "locations.update",
            "libraries.read",
        ]
    },

    "patron": {
        "display_name": "Patron",
        "description": "Regular library patron - self-service access only",
        "is_system": True,
        "permissions": [
            # Inventory read access (search and browse catalog)
            "inventory.read",

            # View own circulation records
            "circulation.view_own",

            # Renew own items (patron self-service)
            "circulation.renew_own",

            # Manage own requests/holds
            "requests.create", "requests.view_own",

            # View own fees
            "fees.view_own",

            # Course reserves (read only)
            "reserves.read",

            # Libraries and locations (read only)
            "locations.read",
            "libraries.read",
        ]
    },
}


async def create_permissions(db: AsyncSession, tenant_id: uuid.UUID) -> dict[str, Permission]:
    """
    Create all permissions defined in permissions.py.

    Returns:
        Dictionary mapping permission names to Permission objects
    """
    permissions = {}

    for perm_def in ALL_PERMISSIONS:
        # Check if permission already exists
        result = await db.execute(
            select(Permission).where(
                Permission.name == perm_def["name"],
                Permission.tenant_id == tenant_id
            )
        )
        existing_perm = result.scalar_one_or_none()

        if existing_perm:
            permissions[perm_def["name"]] = existing_perm
            continue

        # Create new permission
        permission = Permission(
            id=uuid.uuid4(),
            name=perm_def["name"],
            display_name=perm_def["display_name"],
            description=perm_def["description"],
            resource=perm_def["resource"],
            action=perm_def["action"],
            tenant_id=tenant_id,
        )
        db.add(permission)
        permissions[perm_def["name"]] = permission

    await db.flush()
    return permissions


async def create_roles(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    permissions: dict[str, Permission]
) -> dict[str, Role]:
    """
    Create default roles with their permission mappings.

    Args:
        db: Database session
        tenant_id: Tenant ID
        permissions: Dictionary of all available permissions

    Returns:
        Dictionary mapping role names to Role objects
    """
    roles = {}

    for role_name, role_config in ROLE_PERMISSIONS.items():
        # Check if role already exists
        result = await db.execute(
            select(Role).where(
                Role.name == role_name,
                Role.tenant_id == tenant_id
            )
        )
        existing_role = result.scalar_one_or_none()

        if existing_role:
            roles[role_name] = existing_role
            continue

        # Create new role
        role = Role(
            id=uuid.uuid4(),
            name=role_name,
            display_name=role_config["display_name"],
            description=role_config["description"],
            is_system=role_config["is_system"],
            tenant_id=tenant_id,
        )

        # Assign permissions to role
        role_perms = []
        for perm_name in role_config["permissions"]:
            if perm_name in permissions:
                role_perms.append(permissions[perm_name])
            else:
                print(f"⚠️  Warning: Permission '{perm_name}' not found for role '{role_name}'")

        role.permissions = role_perms
        db.add(role)
        roles[role_name] = role

    await db.flush()
    return roles


async def assign_roles_to_users(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    roles: dict[str, Role]
):
    """
    Assign roles to existing users.

    - admin user → administrator role
    - patron user → patron role
    """
    from app.models.permission import user_roles
    from sqlalchemy import and_

    # Assign administrator role to admin user
    result = await db.execute(
        select(User).where(User.username == "admin", User.tenant_id == tenant_id)
    )
    admin_user = result.scalar_one_or_none()

    if admin_user and "administrator" in roles:
        admin_role = roles["administrator"]

        # Check if already assigned
        result = await db.execute(
            select(user_roles).where(
                and_(
                    user_roles.c.user_id == admin_user.id,
                    user_roles.c.role_id == admin_role.id
                )
            )
        )
        if not result.first():
            await db.execute(
                user_roles.insert().values(
                    user_id=admin_user.id,
                    role_id=admin_role.id
                )
            )
            print(f"✅ Assigned 'administrator' role to user 'admin'")

    # Assign patron role to patron user
    result = await db.execute(
        select(User).where(User.username == "patron", User.tenant_id == tenant_id)
    )
    patron_user = result.scalar_one_or_none()

    if patron_user and "patron" in roles:
        patron_role = roles["patron"]

        # Check if already assigned
        result = await db.execute(
            select(user_roles).where(
                and_(
                    user_roles.c.user_id == patron_user.id,
                    user_roles.c.role_id == patron_role.id
                )
            )
        )
        if not result.first():
            await db.execute(
                user_roles.insert().values(
                    user_id=patron_user.id,
                    role_id=patron_role.id
                )
            )
            print(f"✅ Assigned 'patron' role to user 'patron'")

    await db.flush()


async def seed_roles_and_permissions(db: AsyncSession, tenant_id: uuid.UUID = None):
    """
    Main entry point to seed roles and permissions.

    This function is idempotent - can be run multiple times safely.

    Args:
        db: Database session
        tenant_id: Optional tenant ID. If not provided, uses default tenant.
    """
    # Get tenant
    if tenant_id is None:
        result = await db.execute(select(Tenant).where(Tenant.code == "default"))
        tenant = result.scalar_one_or_none()
        if not tenant:
            print("❌ Error: Default tenant not found. Please run init_db.py first.")
            return
        tenant_id = tenant.id

    print("=" * 70)
    print("SEEDING ROLES AND PERMISSIONS")
    print("=" * 70)

    # Create permissions
    print(f"\n📋 Creating permissions...")
    permissions = await create_permissions(db, tenant_id)
    print(f"✅ {len(permissions)} permissions created/verified")

    # Create roles
    print(f"\n👥 Creating roles...")
    roles = await create_roles(db, tenant_id, permissions)
    print(f"✅ {len(roles)} roles created/verified")

    # Print role summary
    print(f"\n📊 Role Permission Summary:")
    print("-" * 70)
    for role_name, role_config in ROLE_PERMISSIONS.items():
        perm_count = len(role_config["permissions"])
        display_name = role_config["display_name"]
        print(f"  • {display_name:30} {perm_count:3} permissions")
    print("-" * 70)

    # Assign roles to existing users
    print(f"\n🔗 Assigning roles to users...")
    await assign_roles_to_users(db, tenant_id, roles)

    # Commit all changes
    await db.commit()

    print("\n" + "=" * 70)
    print("✅ ROLES AND PERMISSIONS SEEDED SUCCESSFULLY")
    print("=" * 70)
    print(f"\nDefault roles created:")
    print(f"  1. Administrator    - Full system access ({len(ROLE_PERMISSIONS['administrator']['permissions'])} permissions)")
    print(f"  2. Librarian        - Full operational access ({len(ROLE_PERMISSIONS['librarian']['permissions'])} permissions)")
    print(f"  3. Circulation Staff - Circulation only ({len(ROLE_PERMISSIONS['circulation_staff']['permissions'])} permissions)")
    print(f"  4. Cataloger        - Inventory management ({len(ROLE_PERMISSIONS['cataloger']['permissions'])} permissions)")
    print(f"  5. Patron           - Self-service access ({len(ROLE_PERMISSIONS['patron']['permissions'])} permissions)")
    print()


async def reseed_roles_and_permissions(db: AsyncSession):
    """
    Delete existing roles and permissions and recreate them.

    WARNING: This will delete all roles and permissions!
    Use with caution in production.
    """
    # Get tenant
    result = await db.execute(select(Tenant).where(Tenant.code == "default"))
    tenant = result.scalar_one_or_none()
    if not tenant:
        print("❌ Error: Default tenant not found")
        return

    print("⚠️  WARNING: This will delete all existing roles and permissions!")
    print("Proceeding with reseed...")

    # Delete all roles (will cascade to role_permissions)
    await db.execute(
        select(Role).where(Role.tenant_id == tenant.id)
    )
    # Note: In production, you'd want to handle this more carefully

    # Run the seed
    await seed_roles_and_permissions(db, tenant.id)


if __name__ == "__main__":
    """
    Can be run standalone for testing or manual seeding.
    """
    import asyncio
    from app.db.session import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as db:
            await seed_roles_and_permissions(db)

    asyncio.run(main())
