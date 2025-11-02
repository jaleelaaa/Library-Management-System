"""
Script to check for duplicate data before adding UNIQUE constraints.

This script checks for duplicate values in:
- users.email
- users.barcode
- items.barcode

Run this before applying the UNIQUE constraints migration.
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.user import User
from app.models.inventory import Item


async def check_duplicate_emails():
    """Check for duplicate email addresses in users table."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find duplicate emails
        query = (
            select(User.email, User.tenant_id, func.count(User.id).label('count'))
            .group_by(User.email, User.tenant_id)
            .having(func.count(User.id) > 1)
        )

        result = await session.execute(query)
        duplicates = result.all()

        if duplicates:
            print("\n❌ DUPLICATE EMAILS FOUND:")
            print("=" * 80)
            for email, tenant_id, count in duplicates:
                print(f"  Email: {email}")
                print(f"  Tenant ID: {tenant_id}")
                print(f"  Count: {count}")

                # Get the user IDs
                user_query = select(User.id, User.username, User.created_date).where(
                    User.email == email,
                    User.tenant_id == tenant_id
                ).order_by(User.created_date)

                users = await session.execute(user_query)
                print("  User IDs:")
                for user_id, username, created_date in users.scalars():
                    print(f"    - {user_id} (username: {username}, created: {created_date})")
                print()
            return len(duplicates)
        else:
            print("✅ No duplicate emails found")
            return 0

    await engine.dispose()


async def check_duplicate_user_barcodes():
    """Check for duplicate barcodes in users table."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find duplicate barcodes (excluding NULL)
        query = (
            select(User.barcode, User.tenant_id, func.count(User.id).label('count'))
            .where(User.barcode.isnot(None))
            .group_by(User.barcode, User.tenant_id)
            .having(func.count(User.id) > 1)
        )

        result = await session.execute(query)
        duplicates = result.all()

        if duplicates:
            print("\n❌ DUPLICATE USER BARCODES FOUND:")
            print("=" * 80)
            for barcode, tenant_id, count in duplicates:
                print(f"  Barcode: {barcode}")
                print(f"  Tenant ID: {tenant_id}")
                print(f"  Count: {count}")

                # Get the user IDs
                user_query = select(User.id, User.username, User.created_date).where(
                    User.barcode == barcode,
                    User.tenant_id == tenant_id
                ).order_by(User.created_date)

                users = await session.execute(user_query)
                print("  User IDs:")
                for user_id, username, created_date in users.scalars():
                    print(f"    - {user_id} (username: {username}, created: {created_date})")
                print()
            return len(duplicates)
        else:
            print("✅ No duplicate user barcodes found")
            return 0

    await engine.dispose()


async def check_duplicate_item_barcodes():
    """Check for duplicate barcodes in items table."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find duplicate barcodes (excluding NULL)
        query = (
            select(Item.barcode, Item.tenant_id, func.count(Item.id).label('count'))
            .where(Item.barcode.isnot(None))
            .group_by(Item.barcode, Item.tenant_id)
            .having(func.count(Item.id) > 1)
        )

        result = await session.execute(query)
        duplicates = result.all()

        if duplicates:
            print("\n❌ DUPLICATE ITEM BARCODES FOUND:")
            print("=" * 80)
            for barcode, tenant_id, count in duplicates:
                print(f"  Barcode: {barcode}")
                print(f"  Tenant ID: {tenant_id}")
                print(f"  Count: {count}")

                # Get the item IDs
                item_query = select(Item.id, Item.status, Item.created_date).where(
                    Item.barcode == barcode,
                    Item.tenant_id == tenant_id
                ).order_by(Item.created_date)

                items = await session.execute(item_query)
                print("  Item IDs:")
                for item_id, status, created_date in items.scalars():
                    print(f"    - {item_id} (status: {status}, created: {created_date})")
                print()
            return len(duplicates)
        else:
            print("✅ No duplicate item barcodes found")
            return 0

    await engine.dispose()


async def main():
    """Main function to check all duplicates."""
    print("=" * 80)
    print("CHECKING FOR DUPLICATE DATA")
    print("=" * 80)
    print()
    print("This script checks for duplicate values that would violate UNIQUE constraints.")
    print()

    try:
        # Check all three
        email_dupes = await check_duplicate_emails()
        user_barcode_dupes = await check_duplicate_user_barcodes()
        item_barcode_dupes = await check_duplicate_item_barcodes()

        print()
        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Duplicate emails: {email_dupes}")
        print(f"Duplicate user barcodes: {user_barcode_dupes}")
        print(f"Duplicate item barcodes: {item_barcode_dupes}")
        print()

        total_dupes = email_dupes + user_barcode_dupes + item_barcode_dupes

        if total_dupes > 0:
            print("❌ DUPLICATES FOUND!")
            print()
            print("ACTION REQUIRED:")
            print("1. Review the duplicate records above")
            print("2. Manually resolve duplicates (delete or update)")
            print("3. Re-run this script to verify")
            print("4. Then apply the UNIQUE constraints migration")
            print()
            return 1
        else:
            print("✅ NO DUPLICATES FOUND!")
            print()
            print("Safe to apply UNIQUE constraints migration.")
            print()
            return 0

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
