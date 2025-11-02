"""
Database Schema Validation Script
Compares DATABASE_SCHEMA.md documentation with actual PostgreSQL schema
"""
import asyncio
import sys
from pathlib import Path
from typing import Dict, List, Set

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import inspect, text
from app.db.session import engine, get_db
from app.models.base import Base


async def get_documented_tables() -> Dict[str, List[str]]:
    """
    Tables documented in Database/DATABASE_SCHEMA.md
    This is a subset - update as you validate more tables
    """
    return {
        "tenants": ["id", "name", "code", "active", "created_date", "updated_date"],
        "users": [
            "id", "tenant_id", "username", "email", "barcode", "active",
            "user_type", "hashed_password", "first_name", "last_name",
            "middle_name", "date_of_birth", "phone", "mobile_phone",
            "patron_group_id", "enrollment_date", "expiration_date",
            "external_system_id", "preferred_contact", "created_date",
            "updated_date", "created_by_user_id", "updated_by_user_id"
        ],
        "patron_groups": [
            "id", "tenant_id", "name", "code", "description", "loan_limit",
            "is_default", "created_date", "updated_date"
        ],
        "instances": [
            "id", "tenant_id", "title", "subtitle", "edition", "series",
            "publication", "physical_description", "languages", "instance_type_id",
            "subjects", "classifications", "contributors", "identifiers",
            "notes", "electronic_access", "tags", "staff_suppress",
            "discovery_suppress", "cataloged_date", "source",
            "created_date", "updated_date", "created_by_user_id", "updated_by_user_id"
        ],
        "holdings": [
            "id", "tenant_id", "instance_id", "location_id", "call_number",
            "call_number_type", "notes", "electronic_access", "acquisition_method",
            "receipt_status", "created_date", "updated_date"
        ],
        "items": [
            "id", "tenant_id", "holding_id", "barcode", "accession_number",
            "item_level_call_number", "status", "material_type_id",
            "permanent_loan_type_id", "temporary_loan_type_id",
            "enumeration", "chronology", "volume", "copy_number",
            "number_of_pieces", "notes", "circulation_notes",
            "missing_pieces", "damaged_status", "created_date", "updated_date"
        ],
        "loans": [
            "id", "tenant_id", "user_id", "item_id", "checkout_date",
            "due_date", "return_date", "status", "renewal_count",
            "checkout_service_point_id", "checkin_service_point_id",
            "loan_policy_id", "overdue_fine_policy_id", "lost_item_policy_id",
            "created_date", "updated_date"
        ],
        "requests": [
            "id", "tenant_id", "user_id", "item_id", "instance_id",
            "request_type", "request_date", "fulfillment_preference",
            "request_expiration_date", "hold_shelf_expiration_date",
            "pickup_service_point_id", "status", "position",
            "created_date", "updated_date"
        ],
        # Add more tables as documented...
    }


async def get_actual_schema() -> Dict[str, List[str]]:
    """Query PostgreSQL to get actual schema"""
    inspector = inspect(engine)
    schema = {}

    for table_name in inspector.get_table_names():
        columns = inspector.get_columns(table_name)
        schema[table_name] = [col['name'] for col in columns]

    return schema


async def get_sqlalchemy_models() -> Dict[str, List[str]]:
    """Get tables from SQLAlchemy models"""
    models = {}

    for mapper in Base.registry.mappers:
        table = mapper.class_.__table__
        table_name = table.name
        columns = [col.name for col in table.columns]
        models[table_name] = columns

    return models


async def validate_schema():
    """Main validation function"""
    print("=" * 80)
    print("DATABASE SCHEMA VALIDATION REPORT")
    print("=" * 80)
    print()

    # Get data from three sources
    documented = await get_documented_tables()
    actual = await get_actual_schema()
    models = await get_sqlalchemy_models()

    documented_tables = set(documented.keys())
    actual_tables = set(actual.keys())
    model_tables = set(models.keys())

    print(f"📊 SUMMARY")
    print(f"{'─' * 80}")
    print(f"📄 Documented Tables:    {len(documented_tables)}")
    print(f"🗄️  Database Tables:      {len(actual_tables)}")
    print(f"🐍 SQLAlchemy Models:    {len(model_tables)}")
    print()

    # Tables in all three
    in_all = documented_tables & actual_tables & model_tables

    # Tables missing from database
    missing_in_db = documented_tables - actual_tables

    # Tables missing from models
    missing_in_models = documented_tables - model_tables

    # Tables in DB but not documented
    undocumented_tables = actual_tables - documented_tables

    # Tables in models but not in DB
    not_migrated = model_tables - actual_tables

    # Print results
    if in_all:
        print(f"✅ TABLES IN ALL SOURCES ({len(in_all)})")
        print(f"{'─' * 80}")
        for table in sorted(in_all):
            print(f"  ✓ {table}")
        print()

    if missing_in_db:
        print(f"❌ TABLES MISSING FROM DATABASE ({len(missing_in_db)})")
        print(f"{'─' * 80}")
        for table in sorted(missing_in_db):
            print(f"  ✗ {table} (documented but not in PostgreSQL)")
        print()
        print("⚡ ACTION: Run migrations or create these tables")
        print()

    if missing_in_models:
        print(f"⚠️  TABLES MISSING FROM MODELS ({len(missing_in_models)})")
        print(f"{'─' * 80}")
        for table in sorted(missing_in_models):
            print(f"  ⚠ {table} (documented but no SQLAlchemy model)")
        print()
        print("⚡ ACTION: Create SQLAlchemy models for these tables")
        print()

    if undocumented_tables:
        print(f"⚠️  UNDOCUMENTED TABLES ({len(undocumented_tables)})")
        print(f"{'─' * 80}")
        for table in sorted(undocumented_tables):
            print(f"  ⚠ {table} (exists in DB but not documented)")
        print()
        print("⚡ ACTION: Add these tables to DATABASE_SCHEMA.md")
        print()

    if not_migrated:
        print(f"⚠️  MODELS NOT MIGRATED ({len(not_migrated)})")
        print(f"{'─' * 80}")
        for table in sorted(not_migrated):
            print(f"  ⚠ {table} (model exists but table not in DB)")
        print()
        print("⚡ ACTION: Run alembic migrations")
        print()

    # Column-level validation for tables that exist in all sources
    print(f"🔍 COLUMN-LEVEL VALIDATION")
    print(f"{'─' * 80}")

    issues_found = 0

    for table in sorted(in_all):
        documented_cols = set(documented[table])
        actual_cols = set(actual[table])
        model_cols = set(models[table])

        # Missing columns in database
        missing_cols = documented_cols - actual_cols

        # Extra columns in database
        extra_cols = actual_cols - documented_cols

        # Missing columns in model
        missing_in_model = documented_cols - model_cols

        # Extra columns in model
        extra_in_model = model_cols - documented_cols

        if missing_cols or extra_cols or missing_in_model or extra_in_model:
            print(f"\n  Table: {table}")

            if missing_cols:
                print(f"    ❌ Missing in DB: {', '.join(sorted(missing_cols))}")
                issues_found += 1

            if extra_cols:
                print(f"    ⚠️  Extra in DB (not documented): {', '.join(sorted(extra_cols))}")
                issues_found += 1

            if missing_in_model:
                print(f"    ❌ Missing in Model: {', '.join(sorted(missing_in_model))}")
                issues_found += 1

            if extra_in_model:
                print(f"    ⚠️  Extra in Model: {', '.join(sorted(extra_in_model))}")
                issues_found += 1

    if issues_found == 0:
        print("  ✅ All column definitions match!")

    print()

    # Final status
    print("=" * 80)
    total_issues = (
        len(missing_in_db) +
        len(missing_in_models) +
        len(undocumented_tables) +
        len(not_migrated) +
        issues_found
    )

    if total_issues == 0:
        print("✅ VALIDATION PASSED: Schema is consistent across all sources!")
        return 0
    else:
        print(f"⚠️  VALIDATION FAILED: {total_issues} issue(s) found")
        print()
        print("Next steps:")
        if missing_in_db or not_migrated:
            print("  1. Run database migrations: alembic upgrade head")
        if missing_in_models:
            print("  2. Create missing SQLAlchemy models")
        if undocumented_tables:
            print("  3. Update DATABASE_SCHEMA.md with missing tables")
        if issues_found:
            print("  4. Fix column discrepancies in models/migrations")
        return 1


async def main():
    """Entry point"""
    try:
        exit_code = await validate_schema()
        return exit_code
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
