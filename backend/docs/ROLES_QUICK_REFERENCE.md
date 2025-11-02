# Roles & Permissions Quick Reference

## Quick Role Comparison

| Feature | Administrator | Librarian | Circulation Staff | Cataloger | Patron |
|---------|--------------|-----------|-------------------|-----------|--------|
| **Users** | ✓ Full | View/Edit | View | ✗ | ✗ |
| **Inventory** | ✓ Full | Create/Edit/View | View | Create/Edit/View | View |
| **Circulation** | ✓ Full | ✓ Full | ✓ Full | ✗ | View Own |
| **Acquisitions** | ✓ Full | Create/Edit/View | ✗ | View | ✗ |
| **Fees** | ✓ Full | ✓ Full + Waive | View/Pay | ✗ | View Own |
| **Reports** | ✓ Full | Generate/Export | ✗ | View/Export | ✗ |
| **Settings** | ✓ Full | ✗ | ✗ | ✗ | ✗ |
| **Roles** | ✓ Full | View | ✗ | ✗ | ✗ |

## Use Cases

### "I need to..."

#### Check out books to patrons
**Roles that can do this**: Administrator, Librarian, Circulation Staff

#### Add new books to the catalog
**Roles that can do this**: Administrator, Librarian, Cataloger

#### Create new user accounts
**Roles that can do this**: Administrator only

#### Waive overdue fines
**Roles that can do this**: Administrator, Librarian

#### Generate circulation reports
**Roles that can do this**: Administrator, Librarian

#### View my own loan history (as a patron)
**Roles that can do this**: Patron (own records), Administrator/Librarian/Circulation Staff (all records)

#### Manage course reserves
**Roles that can do this**: Administrator, Librarian

#### Update item locations
**Roles that can do this**: Administrator, Cataloger

## CLI Commands Cheat Sheet

```bash
# Seed roles (idempotent - safe to run multiple times)
python -m app.cli seed-roles

# List all roles
python -m app.cli list-roles

# List all permissions
python -m app.cli list-permissions

# Show specific role
python -m app.cli show-role administrator
python -m app.cli show-role librarian
python -m app.cli show-role circulation_staff
python -m app.cli show-role cataloger
python -m app.cli show-role patron

# Verify RBAC is configured correctly
python -m app.cli verify-rbac

# Initialize entire database (includes role seeding)
python -m app.cli init-db
```

## Permission Counts by Role

| Role | Permission Count | Notes |
|------|------------------|-------|
| Administrator | 82 | All permissions |
| Librarian | 50 | Operational access |
| Circulation Staff | 13 | Circulation only |
| Cataloger | 11 | Inventory management |
| Patron | 7 | Self-service only |

## Common Permission Patterns

### User Management
```
users.create    → Create new users
users.read      → View user information
users.update    → Edit user information
users.delete    → Delete users
```

### Inventory Management
```
inventory.create → Add new items/instances/holdings
inventory.read   → View catalog
inventory.update → Edit catalog records
inventory.delete → Remove items from system
```

### Circulation
```
circulation.checkout   → Check out items
circulation.checkin    → Check in items
circulation.renew      → Renew loans
circulation.view_all   → View all patron loans
circulation.view_own   → View own loans only
```

### Fees
```
fees.create     → Create fee records
fees.read       → View fees
fees.update     → Update fee status
fees.waive      → Waive/forgive fees
fees.pay        → Record payments
fees.view_own   → View own fees only
```

## Assigning Roles to Users

### During User Creation (Admin UI)
1. Navigate to Users → Create New User
2. Fill in user details
3. Select role from "Role" dropdown
4. Save user

### Programmatically
```python
from app.models.permission import user_roles

# Get user and role
user = await db.get(User, user_id)
role = await db.execute(
    select(Role).where(Role.name == "librarian")
)
role = role.scalar_one()

# Assign role
await db.execute(
    user_roles.insert().values(
        user_id=user.id,
        role_id=role.id
    )
)
await db.commit()
```

## Checking User Permissions

### In Code
```python
# Get user with roles and permissions
user = await db.get(User, user_id)

# Get all user's permissions
user_permissions = set()
for role in user.roles:
    for perm in role.permissions:
        user_permissions.add(perm.name)

# Check specific permission
if "users.create" in user_permissions:
    # User can create users
    pass
```

### Using Dependency
```python
from app.core.deps import require_permission
from app.core.permissions import USERS_CREATE

@router.post("/users")
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_permission(USERS_CREATE))
):
    # Only users with users.create permission can execute this
    pass
```

## Default User Credentials

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| admin | Admin@123 | Administrator | Full system access |
| patron | Patron@123 | Patron | Test patron account |

**⚠️ Important**: Change default passwords in production!

## Troubleshooting

### User can't access a feature
1. Check user's role assignment: `SELECT * FROM user_roles WHERE user_id = '<user-id>'`
2. Check role's permissions: `python -m app.cli show-role <role-name>`
3. Verify required permission exists: `python -m app.cli list-permissions | grep <permission>`

### Roles not showing up
1. Run: `python -m app.cli verify-rbac`
2. If missing, re-seed: `python -m app.cli seed-roles`
3. Check database: `SELECT * FROM roles`

### Permission denied errors
1. Verify endpoint requires correct permission
2. Check user has role with that permission
3. Verify permission exists in database

## Best Practices

### ✅ Do
- Use predefined roles for standard users
- Assign minimum necessary permissions
- Regularly audit user role assignments
- Test permission changes in development first

### ❌ Don't
- Give everyone administrator role
- Modify system roles (create custom roles instead)
- Delete users with role assignments (deactivate instead)
- Bypass permission checks in code

## Need More Info?

- **Full Documentation**: `backend/docs/RBAC_IMPLEMENTATION.md`
- **User Manuals**: `docs/user-manuals/`
- **Tests**: `backend/tests/test_rbac.py`
- **Source Code**:
  - Permissions: `backend/app/core/permissions.py`
  - Seeding: `backend/app/db/seed_roles.py`
  - CLI: `backend/app/cli.py`
