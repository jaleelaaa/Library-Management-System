# Backend Scripts

This directory contains utility scripts for managing and validating the FOLIO LMS system.

## User Management Scripts

### 1. `create_test_users.py`

Creates test user accounts for all 5 roles in the system.

**Purpose:**
- Creates missing test users (librarian, circulation staff, cataloger)
- Admin and patron users are created by `init_db.py`
- Enables full system validation across all role types

**Usage:**

```bash
# Create all missing test users
python -m scripts.create_test_users

# Create specific role only
python -m scripts.create_test_users --role librarian
python -m scripts.create_test_users --role circstaff
python -m scripts.create_test_users --role cataloger

# Verify existing test users
python -m scripts.create_test_users --verify
```

**Test Users Created:**
- `librarian` / `Librarian@123` - Full operational access
- `circstaff` / `Circ@123` - Circulation operations only
- `cataloger` / `Cataloger@123` - Inventory management only

---

### 2. `test_user_login.py`

Tests login functionality for all test users.

**Usage:**

```bash
# Test all users
python -m scripts.test_user_login

# Test specific user
python -m scripts.test_user_login --user admin
python -m scripts.test_user_login --user librarian
```

**Tests:**
- User authentication
- JWT token generation
- Role assignments
- Account status

---

## Validation Scripts

### 3. `validate_api_endpoints.py`
Compares documented API endpoints with actual FastAPI implementation.

**Usage:**
```bash
cd backend
python scripts/validate_api_endpoints.py
```

**Output:**
- List of matching endpoints
- Undocumented endpoints (implemented but not in docs)
- Missing implementations (documented but not implemented)
- JSON report: `api_validation_report.json`

**Example Output:**
```
📊 SUMMARY
────────────────────────────────────────────────────────────────────────────────
✅ Documented Endpoints:    25
✅ Implemented Endpoints:   30
✅ Matching:                20 (80.0%)
⚠️  Undocumented:            10
❌ Missing Implementation:  5
```

---

### 2. `validate_database_schema.py`
Compares `DATABASE_SCHEMA.md` with actual PostgreSQL schema and SQLAlchemy models.

**Usage:**
```bash
cd backend
python scripts/validate_database_schema.py
```

**Output:**
- Tables in all sources (docs, database, models)
- Missing tables
- Undocumented tables
- Column-level discrepancies

**Example Output:**
```
📊 SUMMARY
────────────────────────────────────────────────────────────────────────────────
📄 Documented Tables:    25
🗄️  Database Tables:      28
🐍 SQLAlchemy Models:    26

✅ TABLES IN ALL SOURCES (24)
```

---

### 4. `check_duplicates.py`

Checks for duplicate records in the database.

---

## Setup Instructions

### Prerequisites

1. **PostgreSQL Database**
   - PostgreSQL 12 or higher
   - Database: `folio_lms`
   - User: `folio` / Password: `folio_password`
   - Or update `.env` with your credentials

2. **Python Environment**
   - Python 3.11+
   - Dependencies: `pip install -r requirements.txt`

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update database connection string
   - Set SECRET_KEY

### Initial Setup Workflow

```bash
# 1. Start PostgreSQL database
# (varies by platform)

# 2. Initialize database schema
python -m app.db.init_db
# Creates: tables, roles, permissions, admin user, patron user

# 3. Create test users for remaining roles
python -m scripts.create_test_users
# Creates: librarian, circstaff, cataloger users

# 4. Verify all test users
python -m scripts.create_test_users --verify

# 5. Test user login
python -m scripts.test_user_login

# 6. Validate schema
python -m scripts.validate_database_schema
```

### Test User Credentials

See `TEST_USERS.md` in root directory for complete documentation.

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Administrator |
| librarian | Librarian@123 | Librarian |
| circstaff | Circ@123 | Circulation Staff |
| cataloger | Cataloger@123 | Cataloger |
| patron | Patron@123 | Patron |

---

## Prerequisites for Validation Scripts

1. **Backend running** (for API validation)
2. **Database accessible** (for schema validation)
3. **Environment configured** (.env file with DATABASE_URL)

---

## CI/CD Integration

Add to `.github/workflows/validation.yml`:

```yaml
name: Documentation Validation

on: [push, pull_request]

jobs:
  validate-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Validate API Endpoints
        run: |
          cd backend
          python scripts/validate_api_endpoints.py

  validate-database:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: folio_lms_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run migrations
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/folio_lms_test
        run: |
          cd backend
          alembic upgrade head

      - name: Validate Database Schema
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/folio_lms_test
        run: |
          cd backend
          python scripts/validate_database_schema.py
```

---

## Interpreting Results

### Exit Codes
- `0`: Validation passed (all good!)
- `1`: Validation failed (discrepancies found)

### Priority Levels

**❌ Critical (Fix Immediately)**
- Missing implementations for documented features
- Tables missing from database
- Security-critical endpoints not implemented

**⚠️ Warning (Fix Soon)**
- Undocumented endpoints (add to docs)
- Extra columns (update docs or remove)
- Missing models (create SQLAlchemy models)

**✅ Success**
- All documented items implemented
- All implementations documented
- Schema consistent across sources

---

## Adding New Validations

### To validate a new endpoint:

1. Add to `validate_api_endpoints.py`:
```python
documented = {
    # ... existing ...
    "GET /api/v1/your-new-endpoint": "Description of endpoint",
}
```

2. Run validation
3. If missing, implement the endpoint
4. Run again until it passes

### To validate a new table:

1. Add to `validate_database_schema.py`:
```python
return {
    # ... existing ...
    "your_new_table": ["id", "column1", "column2", ...],
}
```

2. Run validation
3. Create model/migration if needed
4. Run again until it passes

---

## Troubleshooting

**Error: "No module named 'app'"**
- Make sure you're running from `backend/` directory
- Check PYTHONPATH includes backend directory

**Error: "Cannot connect to database"**
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify credentials

**Error: "Table doesn't exist"**
- Run migrations: `alembic upgrade head`
- Check database name in connection string

---

## Future Enhancements

- [ ] Validate request/response schemas
- [ ] Validate database constraints (unique, foreign keys)
- [ ] Validate permissions on endpoints
- [ ] Validate frontend components against user manuals
- [ ] Generate HTML reports
- [ ] Compare database indexes with documentation
- [ ] Validate enum values
- [ ] Check for deprecated endpoints

---

## See Also

- `/DOCUMENTATION_VALIDATION_PLAN.md` - Complete validation methodology
- `/Database/DATABASE_SCHEMA.md` - Database documentation
- `/docs/ARCHITECTURE.md` - System architecture
- `/E2E_TESTING_GUIDE.md` - End-to-end testing guide
