# Database Migration Guide

## Overview

This guide documents the database schema fixes for FOLIO LMS, specifically addressing:

- **BUG-009**: Missing Database Migrations System - Fixed
- **BUG-003**: Missing Database UNIQUE Constraints - Fixed
- **BUG-011**: Missing Database Tables - Verified (No tables missing)

## Migration Status

### Alembic Configuration (BUG-009)

**Status**: ✅ **RESOLVED**

Alembic is properly initialized and configured:
- Configuration file: `backend/alembic.ini`
- Environment: `backend/alembic/env.py`
- Migrations directory: `backend/alembic/versions/`

**Existing Migrations**:
1. `827104d5f215_initial_migration.py` - Initial database schema
2. `8dfaea897107_add_missing_acquisition_fields_and_fund_.py` - Acquisition updates
3. `40bee24ed2c9_add_unique_constraints_for_email_and_.py` - **NEW** UNIQUE constraints fix

### Database Tables (BUG-011)

**Status**: ✅ **ALL TABLES EXIST**

Verified that all 29 documented tables exist in SQLAlchemy models:

**Core Tables** (6):
- ✅ tenants
- ✅ users
- ✅ addresses
- ✅ patron_groups
- ✅ departments
- ✅ permissions

**Inventory Tables** (5):
- ✅ instances
- ✅ holdings
- ✅ items
- ✅ locations
- ✅ libraries

**Circulation Tables** (3):
- ✅ loans
- ✅ requests
- ✅ loan_policies

**Financial Tables** (3):
- ✅ fees
- ✅ payments
- ✅ fee_policies

**Acquisition Tables** (4):
- ✅ orders
- ✅ order_lines
- ✅ vendors
- ✅ funds

**Academic Tables** (2):
- ✅ courses
- ✅ reserves

**System Tables** (3):
- ✅ roles
- ✅ notifications
- ✅ audit_logs

**Junction Tables** (3):
- ✅ user_tenants
- ✅ user_roles
- ✅ role_permissions

**Result**: No missing tables. All documented tables are implemented.

### UNIQUE Constraints (BUG-003)

**Status**: ✅ **MIGRATION CREATED**

**Problem**:
- `users.email` had single-column UNIQUE constraint (not tenant-aware)
- `users.barcode` had single-column UNIQUE constraint (not tenant-aware)
- `items.barcode` had single-column UNIQUE constraint (not tenant-aware)

In a multi-tenant system, these should be unique **per tenant**, not globally unique.

**Solution**:
Created migration `40bee24ed2c9_add_unique_constraints_for_email_and_.py` that:

1. Drops single-column unique indexes
2. Creates composite UNIQUE constraints:
   - `uq_users_email_tenant` on (tenant_id, email)
   - `uq_users_barcode_tenant` on (tenant_id, barcode)
   - `uq_items_barcode_tenant` on (tenant_id, barcode)
3. Re-creates non-unique indexes for performance

**Benefits**:
- ✅ Same email can exist in different tenants
- ✅ Same barcode can exist in different tenants
- ✅ Within a tenant, email/barcode must be unique
- ✅ NULL barcodes are allowed (don't violate uniqueness)
- ✅ Multi-tenancy support maintained

## How to Apply Migrations

### Prerequisites

1. **Backup your database** before running migrations:
   ```bash
   pg_dump -U folio folio_lms > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Check for duplicate data**:
   ```bash
   cd backend
   python scripts/check_duplicates.py
   ```

   If duplicates are found, you must resolve them manually before proceeding.

### Step 1: Check Current Migration Status

```bash
cd backend
python -m alembic current
```

This shows the currently applied migration revision.

### Step 2: Review Pending Migrations

```bash
python -m alembic history
```

This shows all available migrations.

### Step 3: Apply All Migrations

```bash
python -m alembic upgrade head
```

This will apply all pending migrations, including the UNIQUE constraints fix.

### Step 4: Verify Database State

```bash
# Check constraints
psql -U folio -d folio_lms -c "\d users"
psql -U folio -d folio_lms -c "\d items"
```

Look for:
- `uq_users_email_tenant UNIQUE CONSTRAINT, btree (tenant_id, email)`
- `uq_users_barcode_tenant UNIQUE CONSTRAINT, btree (tenant_id, barcode)`
- `uq_items_barcode_tenant UNIQUE CONSTRAINT, btree (tenant_id, barcode)`

### Step 5: Test Constraints

Run the test suite:
```bash
pytest tests/test_unique_constraints.py -v
```

## Rollback Procedure

If you need to rollback the UNIQUE constraints migration:

```bash
cd backend
python -m alembic downgrade -1
```

This will:
1. Remove composite UNIQUE constraints
2. Restore original single-column unique indexes

**Warning**: Only rollback if absolutely necessary, as the original constraints were incorrect for multi-tenancy.

## Migration Details

### Migration: 40bee24ed2c9 - Add UNIQUE Constraints

**File**: `backend/alembic/versions/40bee24ed2c9_add_unique_constraints_for_email_and_.py`

**Changes**:

```sql
-- Drop single-column unique indexes
DROP INDEX ix_users_email;
DROP INDEX ix_users_barcode;
DROP INDEX ix_items_barcode;

-- Add composite UNIQUE constraints
ALTER TABLE users
  ADD CONSTRAINT uq_users_email_tenant UNIQUE (tenant_id, email);

ALTER TABLE users
  ADD CONSTRAINT uq_users_barcode_tenant UNIQUE (tenant_id, barcode);

ALTER TABLE items
  ADD CONSTRAINT uq_items_barcode_tenant UNIQUE (tenant_id, barcode);

-- Re-create non-unique indexes
CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_barcode ON users(barcode);
CREATE INDEX ix_items_barcode ON items(barcode);
```

## Updated Models

### User Model

**File**: `backend/app/models/user.py`

```python
class User(Base, TimestampMixin, TenantMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), index=True, nullable=False)
    barcode = Column(String(255), index=True)

    # Composite unique constraints
    __table_args__ = (
        UniqueConstraint('tenant_id', 'email', name='uq_users_email_tenant'),
        UniqueConstraint('tenant_id', 'barcode', name='uq_users_barcode_tenant'),
    )
```

### Item Model

**File**: `backend/app/models/inventory.py`

```python
class Item(Base, TimestampMixin, UserTrackingMixin, TenantMixin):
    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    holding_id = Column(UUID(as_uuid=True), ForeignKey("holdings.id"), nullable=False)
    barcode = Column(String(255), index=True)

    # Composite unique constraint
    __table_args__ = (
        UniqueConstraint('tenant_id', 'barcode', name='uq_items_barcode_tenant'),
    )
```

## Testing

### Automated Tests

Run the full test suite:
```bash
cd backend
pytest tests/test_unique_constraints.py -v
```

**Test Coverage**:
- ✅ Email uniqueness within tenant
- ✅ Email allowed across tenants
- ✅ User barcode uniqueness within tenant
- ✅ User barcode allowed across tenants
- ✅ Item barcode uniqueness within tenant
- ✅ Item barcode allowed across tenants
- ✅ NULL barcodes allowed (no conflict)

### Manual Testing

#### Test 1: Duplicate Email in Same Tenant (Should Fail)

```bash
psql -U folio -d folio_lms
```

```sql
-- Get a tenant ID
SELECT id FROM tenants LIMIT 1;

-- Try to insert duplicate email
INSERT INTO users (id, tenant_id, username, email, hashed_password, active, user_type, personal, created_date, updated_date)
VALUES
  (uuid_generate_v4(), '<tenant_id>', 'user1', 'test@example.com', 'hash1', true, 'patron', '{}'::jsonb, NOW(), NOW()),
  (uuid_generate_v4(), '<tenant_id>', 'user2', 'test@example.com', 'hash2', true, 'patron', '{}'::jsonb, NOW(), NOW());

-- Should fail with: ERROR: duplicate key value violates unique constraint "uq_users_email_tenant"
```

#### Test 2: Same Email in Different Tenants (Should Succeed)

```sql
-- Get two tenant IDs
SELECT id FROM tenants LIMIT 2;

-- Insert same email in different tenants
INSERT INTO users (id, tenant_id, username, email, hashed_password, active, user_type, personal, created_date, updated_date)
VALUES
  (uuid_generate_v4(), '<tenant_id_1>', 'user1', 'test@example.com', 'hash1', true, 'patron', '{}'::jsonb, NOW(), NOW()),
  (uuid_generate_v4(), '<tenant_id_2>', 'user2', 'test@example.com', 'hash2', true, 'patron', '{}'::jsonb, NOW(), NOW());

-- Should succeed
```

## Troubleshooting

### Issue: Migration Fails with "relation already exists"

**Solution**: The table already exists. Check migration history:
```bash
python -m alembic history
python -m alembic current
```

If migrations are out of sync, you may need to stamp the database:
```bash
python -m alembic stamp head
```

### Issue: Migration Fails with "duplicate key violates unique constraint"

**Solution**: You have duplicate data. Run the duplicate checker:
```bash
python scripts/check_duplicates.py
```

Resolve duplicates manually before applying migration.

### Issue: Alembic can't connect to database

**Solution**: Check `DATABASE_URL` in `.env` file:
```bash
DATABASE_URL=postgresql+asyncpg://folio:folio_password@localhost:5432/folio_lms
```

For Alembic (which uses psycopg2, not asyncpg), the URL is auto-converted in `alembic/env.py`.

### Issue: "Can't load plugin: sqlalchemy.dialects:driver"

**Solution**: Install psycopg2:
```bash
pip install psycopg2-binary
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Backup database
- [ ] Run duplicate checker script
- [ ] Test migration on staging environment
- [ ] Review migration SQL (use `--sql` flag)
- [ ] Plan maintenance window (minimal downtime)
- [ ] Notify users of maintenance
- [ ] Apply migration during low-traffic period
- [ ] Verify constraints after migration
- [ ] Run test suite
- [ ] Monitor application logs
- [ ] Have rollback plan ready

### Generate SQL for Review

```bash
python -m alembic upgrade 40bee24ed2c9 --sql > migration_040bee24ed2c9.sql
```

Review the SQL before applying.

## Summary of Fixes

### BUG-009: Missing Database Migrations System
**Status**: ✅ **RESOLVED**
- Alembic is properly configured
- Migration history is clean
- Can create new migrations
- Can apply/rollback migrations

### BUG-003: Missing Database UNIQUE Constraints
**Status**: ✅ **RESOLVED**
- Created migration for composite UNIQUE constraints
- Updated SQLAlchemy models
- Added comprehensive test coverage
- Documented migration procedure
- Multi-tenancy support maintained

### BUG-011: Missing Database Tables
**Status**: ✅ **NO ACTION NEEDED**
- Verified all 29 documented tables exist
- No missing tables found
- Schema matches documentation

## Next Steps

1. **For Development**: Apply migrations immediately
   ```bash
   cd backend
   python scripts/check_duplicates.py
   python -m alembic upgrade head
   pytest tests/test_unique_constraints.py
   ```

2. **For Production**: Follow deployment checklist above

3. **For New Migrations**: Use Alembic to create new migrations
   ```bash
   python -m alembic revision --autogenerate -m "description"
   ```

## Support

For issues or questions:
1. Check migration history: `python -m alembic history`
2. Check current state: `python -m alembic current`
3. Review logs in `backend/alembic.log` (if configured)
4. Check database constraints: `\d tablename` in psql

---

**Last Updated**: 2025-10-31
**Migration Version**: 40bee24ed2c9
**Database Schema Version**: 1.0.0
