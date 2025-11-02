"""
Create test users for all roles in the FOLIO LMS system.

This script creates test user accounts for librarian, circulation staff, and cataloger roles
to enable full system validation and testing.

Usage:
    python -m scripts.create_test_users           # Create all missing test users
    python -m scripts.create_test_users --role librarian  # Create specific role only
"""

import sys
import asyncio
import argparse
from pathlib import Path
import os

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Add parent directory to path so we can import app modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.db.session import AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import User
from app.models.permission import Role, user_roles
from app.core.security import get_password_hash
import uuid


# Test user configurations
TEST_USERS = {
    "librarian": {
        "username": "librarian",
        "password": "Librarian@123",
        "email": "librarian@default.folio",
        "first_name": "Test",
        "last_name": "Librarian",
        "user_type": "staff",
        "role": "librarian"
    },
    "circstaff": {
        "username": "circstaff",
        "password": "Circ@123",
        "email": "circstaff@default.folio",
        "first_name": "Circulation",
        "last_name": "Staff",
        "user_type": "staff",
        "role": "circulation_staff"
    },
    "cataloger": {
        "username": "cataloger",
        "password": "Cataloger@123",
        "email": "cataloger@default.folio",
        "first_name": "Test",
        "last_name": "Cataloger",
        "user_type": "staff",
        "role": "cataloger"
    }
}


async def create_test_user(
    db: AsyncSession,
    tenant_id: uuid.UUID,
    user_config: dict,
    role_name: str
) -> bool:
    """
    Create a test user with specified role.

    Args:
        db: Database session
        tenant_id: Tenant ID to assign user to
        user_config: User configuration dictionary
        role_name: Role name to assign to user

    Returns:
        True if user was created, False if already exists
    """
    username = user_config["username"]

    # Check if user already exists
    result = await db.execute(
        select(User).where(
            User.username == username,
            User.tenant_id == tenant_id
        )
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        print(f"ℹ️  User '{username}' already exists")
        return False

    # Look up role by name
    result = await db.execute(
        select(Role).where(
            Role.name == role_name,
            Role.tenant_id == tenant_id
        )
    )
    role = result.scalar_one_or_none()

    if not role:
        print(f"❌ Error: Role '{role_name}' not found. Please run init_db.py first.")
        return False

    # Create user
    new_user = User(
        id=uuid.uuid4(),
        username=username,
        email=user_config["email"],
        hashed_password=get_password_hash(user_config["password"]),
        active=True,
        user_type=user_config["user_type"],
        tenant_id=tenant_id,
        personal={
            "firstName": user_config["first_name"],
            "lastName": user_config["last_name"],
            "email": user_config["email"],
        },
    )

    db.add(new_user)
    await db.flush()

    # Assign role to user
    await db.execute(
        user_roles.insert().values(
            user_id=new_user.id,
            role_id=role.id
        )
    )

    await db.flush()
    print(f"✅ Created user '{username}' with role '{role_name}'")
    return True


async def create_all_test_users(specific_role: str = None):
    """
    Create all missing test users or a specific role user.

    Args:
        specific_role: Optional role key to create only that user
    """
    async with AsyncSessionLocal() as db:
        try:
            # Get default tenant
            result = await db.execute(select(Tenant).where(Tenant.code == "default"))
            default_tenant = result.scalar_one_or_none()

            if not default_tenant:
                print("❌ Error: Default tenant not found. Please run init_db.py first.")
                return 1

            print("=" * 70)
            print("CREATING TEST USERS")
            print("=" * 70)
            print(f"Tenant: {default_tenant.name} ({default_tenant.code})")
            print()

            created_count = 0
            users_to_create = TEST_USERS

            # Filter to specific role if requested
            if specific_role:
                if specific_role not in TEST_USERS:
                    print(f"❌ Error: Unknown role '{specific_role}'")
                    print(f"Available roles: {', '.join(TEST_USERS.keys())}")
                    return 1
                users_to_create = {specific_role: TEST_USERS[specific_role]}

            # Create each test user
            for user_key, user_config in users_to_create.items():
                role_name = user_config["role"]
                if await create_test_user(db, default_tenant.id, user_config, role_name):
                    created_count += 1

            # Commit all changes
            await db.commit()

            print()
            print("=" * 70)
            if created_count > 0:
                print(f"✅ SUCCESS: {created_count} test user(s) created")
            else:
                print("ℹ️  All test users already exist")
            print("=" * 70)
            print()

            # Display credentials
            print("Test User Credentials:")
            print("-" * 70)
            for user_key, user_config in users_to_create.items():
                print(f"  {user_config['first_name']} {user_config['last_name']:15} "
                      f"username: {user_config['username']:15} "
                      f"password: {user_config['password']}")
            print("-" * 70)
            print()

            return 0

        except Exception as e:
            await db.rollback()
            print(f"❌ Error creating test users: {e}")
            import traceback
            traceback.print_exc()
            return 1


async def verify_test_users():
    """
    Verify that all test users exist and have correct role assignments.
    """
    async with AsyncSessionLocal() as db:
        print("=" * 70)
        print("VERIFYING TEST USERS")
        print("=" * 70)

        # Get default tenant
        result = await db.execute(select(Tenant).where(Tenant.code == "default"))
        default_tenant = result.scalar_one_or_none()

        if not default_tenant:
            print("❌ Error: Default tenant not found")
            return

        print(f"Tenant: {default_tenant.name} ({default_tenant.code})")
        print()

        all_valid = True

        for user_key, user_config in TEST_USERS.items():
            username = user_config["username"]
            expected_role = user_config["role"]

            # Check if user exists
            result = await db.execute(
                select(User).where(
                    User.username == username,
                    User.tenant_id == default_tenant.id
                )
            )
            user = result.scalar_one_or_none()

            if not user:
                print(f"❌ User '{username}' NOT FOUND")
                all_valid = False
                continue

            # Check role assignment
            result = await db.execute(
                select(Role).join(user_roles).where(
                    user_roles.c.user_id == user.id,
                    Role.tenant_id == default_tenant.id
                )
            )
            user_roles_list = result.scalars().all()
            role_names = [role.name for role in user_roles_list]

            if expected_role in role_names:
                print(f"✅ User '{username:15}' - Role: {expected_role:20} - Active: {user.active}")
            else:
                print(f"❌ User '{username:15}' - Expected role '{expected_role}' not assigned")
                print(f"   Current roles: {', '.join(role_names) if role_names else 'NONE'}")
                all_valid = False

        print()
        print("=" * 70)
        if all_valid:
            print("✅ ALL TEST USERS VERIFIED SUCCESSFULLY")
        else:
            print("❌ SOME TEST USERS HAVE ISSUES")
        print("=" * 70)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Create test users for FOLIO LMS role validation"
    )
    parser.add_argument(
        "--role",
        type=str,
        help="Create only user for specific role (librarian, circstaff, or cataloger)",
        choices=list(TEST_USERS.keys())
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Verify existing test users instead of creating new ones"
    )

    args = parser.parse_args()

    if args.verify:
        asyncio.run(verify_test_users())
    else:
        exit_code = asyncio.run(create_all_test_users(args.role))
        sys.exit(exit_code)


if __name__ == "__main__":
    main()
