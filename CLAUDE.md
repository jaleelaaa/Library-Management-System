# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## System Overview

FOLIO LMS is a comprehensive library management system with a **FastAPI backend** and **React TypeScript frontend**. The system implements a **multi-tenant architecture** with **role-based access control (RBAC)**, real-time notifications via WebSocket, and supports library operations including cataloging, circulation, acquisitions, and course reserves.

## Architecture Overview

### Backend (FastAPI + Python 3.11+)
- **FastAPI** web framework with async/await support
- **SQLAlchemy 2.0** ORM with async engine (`AsyncSession`)
- **Alembic** for database migrations
- **PostgreSQL 15** as primary database
- **Redis** for caching and Celery task queue
- **Elasticsearch 8.11** for full-text search
- **Celery** for async tasks (with Celery Beat for scheduled tasks)
- **JWT** authentication with access/refresh tokens
- **Socket.IO** for real-time WebSocket communication

### Frontend (React + TypeScript)
- **React 18.2** with TypeScript 5.3
- **Vite 5.0** as build tool
- **Redux Toolkit 2.0** for global state management
- **React Query 5.14** for server state
- **React Router 6.21** for routing
- **Tailwind CSS 3.4** for styling
- **Framer Motion 12.23** for animations
- **React Hook Form 7.49** + **Zod 3.22** for forms and validation

### Multi-Tenancy System
- Enabled by default (`ENABLE_MULTI_TENANCY=true`)
- Each request must include tenant context
- All models inherit from `TenantMixin` which adds `tenant_id` field
- `TenantMiddleware` extracts tenant from headers/subdomain
- Default tenant is "default"

### RBAC Permission System
- **Permissions**: Granular permissions following pattern `{resource}.{action}` (e.g., `inventory.create`, `circulation.checkout`)
- **Roles**: Collections of permissions (Administrator, Librarian, Circulation Staff, Cataloger, Patron)
- **User Types**: `staff` or `patron` - controls base access level
- All permissions defined in `backend/app/core/permissions.py` (single source of truth)
- Role seeding handled by `backend/app/db/seed_roles.py`
- Many-to-many relationships: `user_roles` and `role_permissions` association tables
- **Self-service permissions**: Patrons have limited permissions (e.g., `circulation.view_own`, `circulation.renew_own`, `requests.view_own`, `fees.view_own`)

### Database Models Hierarchy

**Inventory** (Three-level hierarchy):
- `Instance` → `Holding` → `Item`
- Supports multiple cataloging standards (MARC, RDA, AACR2)
- JSON fields for flexible metadata storage

**Users**:
- `User` model with `user_type` field (`staff` or `patron`)
- Patrons belong to `PatronGroup` (e.g., Undergraduate, Graduate, Faculty)
- Many-to-many relationship with `Role`

**Circulation**:
- `Loan` for checked-out items
- `Request` for holds/requests with queue system
- Automated fine calculation via Celery tasks

**Acquisitions**:
- `PurchaseOrder`, `Invoice`, `Fund`, `Vendor`
- Budgeting and encumbrance tracking

**Courses**:
- `Course` and `CourseReserve` for course materials

**Fees**:
- `Fee` model with status tracking (open, paid, waived)
- Payment history in JSON field

## Development Commands

### Backend Setup & Running

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database migrations
alembic upgrade head                                    # Apply all migrations
alembic revision --autogenerate -m "description"        # Create new migration
alembic downgrade -1                                    # Rollback one version
alembic history                                         # View migration history

# Initialize database with seed data (roles, users, sample data)
python -m app.db.init_db

# Run development server (with hot reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run Celery worker (for async tasks)
celery -A app.core.celery_app worker --loglevel=info

# Run Celery beat (for scheduled tasks)
celery -A app.core.celery_app beat --loglevel=info

# Run Flower (Celery monitoring dashboard)
celery -A app.core.celery_app flower --port=5555
```

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test function
pytest tests/test_auth.py::test_login
```

### Frontend Setup & Running

```bash
cd frontend

# Install dependencies
npm install

# Run development server (http://localhost:3000 or 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

### Frontend Testing

```bash
cd frontend

# Run unit tests (Vitest)
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart specific service
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Access backend shell
docker-compose exec backend bash

# Run migrations in container
docker-compose exec backend alembic upgrade head
```

## Code Architecture Patterns

### Backend API Structure

All API routes follow the pattern:
- Location: `backend/app/api/v1/{resource}.py`
- Router prefix: `/api/v1/{resource}`
- Main app: `backend/app/main.py` includes all routers

**Key API modules**:
- `auth.py` - Authentication (login, register, token refresh)
- `users.py` - User management
- `permissions.py` - Roles and permissions management
- `inventory.py` - Instances, Holdings, Items
- `circulation.py` - Check-out, check-in, renewals, requests
- `acquisitions.py` - Purchase orders, invoices, vendors
- `fees.py` - Fee and fine management
- `reports.py` - Report generation and export
- `audit_logs.py` - Audit trail viewing

### Backend Dependencies & Security

**Authentication Flow**:
1. User logs in via `/api/v1/auth/login` with username/password
2. Backend validates credentials and returns JWT access token + refresh token
3. Frontend stores tokens (access token in memory, refresh token in httpOnly cookie)
4. All protected endpoints require `Authorization: Bearer {token}` header
5. Token payload includes `user_id`, `tenant_id`, `user_type`
6. Refresh token can be used to obtain new access token via `/api/v1/auth/refresh`

**Permission Checking**:
- Use `require_permissions` dependency in route parameters
- Example: `require_permissions([INVENTORY_CREATE])`
- Checks if current user has required permissions via their roles
- Defined in `backend/app/api/v1/auth.py` (dependencies)

**Password Policy** (`backend/app/core/security.py`):
- Minimum 8 characters
- At least one uppercase, lowercase, number, special character
- Validated via `validate_password_strength()` function

### Frontend State Management

**Redux Store** (`frontend/src/store/index.ts`):
- Slices: auth, inventory, users, roles, circulation, acquisitions, dashboard, courses, search, notifications
- Each slice in `frontend/src/store/slices/`

**Protected Routes**:
- Wrapped with `<ProtectedRoute>` component
- Checks authentication state
- Redirects to login if not authenticated

**Permission-Based UI**:
- `<PermissionGate>` component checks user permissions
- Conditionally renders UI elements based on permissions
- `PermissionContext` provides permission checking utilities

### Frontend API Communication

**Service Pattern** (`frontend/src/services/`):
- Centralized API calls using Axios
- Services: `authService.ts`, `inventoryService.ts`, `usersService.ts`, etc.
- Base URL configured via `VITE_API_URL` environment variable
- Axios interceptors handle token refresh and error handling

## Important Implementation Notes

### Database Sessions

**Backend uses async SQLAlchemy**:
- Always use `AsyncSession` from `app.db.session.AsyncSessionLocal`
- Use `async with AsyncSessionLocal() as db:` pattern
- All database operations must be `await`ed
- Models use `async` relationships

### Multi-Tenant Queries

When querying, always filter by `tenant_id`:
```python
result = await db.execute(
    select(Instance).where(Instance.tenant_id == tenant_id)
)
```

### Frontend Routing

Routes use nested structure with `MainLayout`:
```
/ (MainLayout wrapper)
  /dashboard
  /inventory/*
  /circulation/*
  /users/*
  etc.
```

### Real-Time Updates

WebSocket connection via Socket.IO:
- Backend: Mounted at `/socket.io` in `app/main.py`
- Frontend: `socket.io-client` connects on login
- Events: `notification`, `loan_updated`, `request_created`, etc.
- Used for real-time notifications and live updates

### Celery Tasks

Background tasks in `backend/app/tasks/`:
- Overdue fine calculation
- Email notifications
- Report generation
- Data exports
- Scheduled via Celery Beat

## Default Test Users

After running `python -m app.db.init_db`:

| Role | Username | Password | User Type |
|------|----------|----------|-----------|
| Administrator | `admin` | `Admin@123` | staff |
| Librarian | `librarian` | `Librarian@123` | staff |
| Circulation Staff | `circulation` | `Circulation@123` | staff |
| Cataloger | `cataloger` | `Cataloger@123` | staff |
| Patron | `patron` | `Patron@123` | patron |

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://folio:password@localhost:5432/folio_lms
REDIS_URL=redis://localhost:6379/0
ELASTICSEARCH_URL=http://localhost:9200
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
ENABLE_MULTI_TENANCY=true
DEFAULT_TENANT=default
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Common Gotchas

1. **Async/Await Required**: Backend uses async SQLAlchemy - all DB operations must be awaited
2. **Tenant Context**: All queries must include tenant filtering (except for superadmin operations)
3. **Permission Format**: Use constants from `backend/app/core/permissions.py`, not hardcoded strings
4. **JSON Fields**: Models use PostgreSQL JSONB for flexible metadata (e.g., `Instance.contributors`, `User.personal`)
5. **Password Validation**: Always call `validate_password_strength()` before hashing passwords
6. **Token Refresh**: Frontend must implement automatic token refresh before access token expires
7. **WebSocket Auth**: WebSocket connections require authentication via token in handshake
8. **Migrations**: Always review auto-generated Alembic migrations before applying - may need manual adjustments
9. **Test Database**: Tests use separate database (`folio_lms_test`) configured in `backend/tests/conftest.py`
10. **Vite Proxy**: Frontend dev server proxies `/api` requests to backend - check `frontend/vite.config.ts`

## API Documentation

When backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Additional Resources

- User Manuals: `docs/user-manuals/` (English/Arabic)
- Database Schema: Check Alembic migrations in `backend/alembic/versions/`
- Seed Data: `backend/seed_data/instances.json`
- Frontend Components: `frontend/src/components/`
- TypeScript Types: `frontend/src/types/`
