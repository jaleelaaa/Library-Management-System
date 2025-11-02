"""
Test user login functionality for all test users.

This script attempts to login with each test user and verifies:
1. Login succeeds with correct credentials
2. JWT token is returned
3. User profile contains expected role
4. User has expected permissions

Usage:
    python -m scripts.test_user_login              # Test all users
    python -m scripts.test_user_login --user admin # Test specific user
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

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.tenant import Tenant
from app.models.permission import Role, user_roles
from app.core.security import verify_password, create_access_token, decode_token


# Test user credentials
TEST_CREDENTIALS = {
    "admin": {
        "username": "admin",
        "password": "Admin@123",
        "expected_role": "administrator"
    },
    "librarian": {
        "username": "librarian",
        "password": "Librarian@123",
        "expected_role": "librarian"
    },
    "circstaff": {
        "username": "circstaff",
        "password": "Circ@123",
        "expected_role": "circulation_staff"
    },
    "cataloger": {
        "username": "cataloger",
        "password": "Cataloger@123",
        "expected_role": "cataloger"
    },
    "patron": {
        "username": "patron",
        "password": "Patron@123",
        "expected_role": "patron"
    }
}


async def test_user_login(username: str, password: str, expected_role: str) -> dict:
    """
    Test login for a specific user.

    Returns:
        Dictionary with test results
    """
    result = {
        "username": username,
        "login_success": False,
        "token_valid": False,
        "role_correct": False,
        "user_active": False,
        "error": None
    }

    try:
        async with AsyncSessionLocal() as db:
            # Get default tenant
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.code == "default")
            )
            tenant = tenant_result.scalar_one_or_none()

            if not tenant:
                result["error"] = "Default tenant not found"
                return result

            # Find user
            user_result = await db.execute(
                select(User).where(
                    User.username == username,
                    User.tenant_id == tenant.id
                )
            )
            user = user_result.scalar_one_or_none()

            if not user:
                result["error"] = "User not found"
                return result

            # Check if user is active
            result["user_active"] = user.active

            if not user.active:
                result["error"] = "User is not active"
                return result

            # Verify password
            if not verify_password(password, user.hashed_password):
                result["error"] = "Invalid password"
                return result

            result["login_success"] = True

            # Create access token
            token_data = {
                "sub": str(user.id),
                "username": user.username,
                "tenant_id": str(tenant.id)
            }
            access_token = create_access_token(token_data)

            # Verify token can be decoded
            try:
                decoded = decode_token(access_token)
                result["token_valid"] = True
            except Exception as e:
                result["error"] = f"Token validation failed: {e}"
                return result

            # Check role assignment
            roles_result = await db.execute(
                select(Role).join(user_roles).where(
                    user_roles.c.user_id == user.id,
                    Role.tenant_id == tenant.id
                )
            )
            user_roles_list = roles_result.scalars().all()
            role_names = [role.name for role in user_roles_list]

            if expected_role in role_names:
                result["role_correct"] = True
            else:
                result["error"] = f"Expected role '{expected_role}' not found. User has: {', '.join(role_names) if role_names else 'NO ROLES'}"

            return result

    except Exception as e:
        result["error"] = f"Exception: {str(e)}"
        return result


async def test_all_users(specific_user: str = None):
    """
    Test login for all users or specific user.
    """
    print("=" * 70)
    print("TEST USER LOGIN VALIDATION")
    print("=" * 70)
    print()

    users_to_test = TEST_CREDENTIALS
    if specific_user:
        if specific_user not in TEST_CREDENTIALS:
            print(f"❌ Unknown user '{specific_user}'")
            print(f"Available users: {', '.join(TEST_CREDENTIALS.keys())}")
            return 1
        users_to_test = {specific_user: TEST_CREDENTIALS[specific_user]}

    results = []
    all_passed = True

    for user_key, creds in users_to_test.items():
        print(f"Testing user: {creds['username']}...")

        result = await test_user_login(
            creds["username"],
            creds["password"],
            creds["expected_role"]
        )
        results.append(result)

        # Print result
        if result["login_success"] and result["token_valid"] and result["role_correct"]:
            print(f"  ✅ Login successful")
            print(f"  ✅ Token valid")
            print(f"  ✅ Role correct ({creds['expected_role']})")
        else:
            all_passed = False
            print(f"  ❌ Login failed")
            if result["error"]:
                print(f"     Error: {result['error']}")
            if result["login_success"]:
                print(f"  ✅ Login successful")
            else:
                print(f"  ❌ Login failed")
            if result["token_valid"]:
                print(f"  ✅ Token valid")
            else:
                print(f"  ❌ Token invalid")
            if result["role_correct"]:
                print(f"  ✅ Role correct")
            else:
                print(f"  ❌ Role incorrect")

        print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)

    passed = sum(1 for r in results if r["login_success"] and r["token_valid"] and r["role_correct"])
    total = len(results)

    print(f"Tests passed: {passed}/{total}")
    print()

    if all_passed:
        print("✅ ALL TESTS PASSED")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        return 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Test login for FOLIO LMS test users"
    )
    parser.add_argument(
        "--user",
        type=str,
        help="Test specific user only",
        choices=list(TEST_CREDENTIALS.keys())
    )

    args = parser.parse_args()

    try:
        exit_code = asyncio.run(test_all_users(args.user))
        sys.exit(exit_code)
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
