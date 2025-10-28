# Multi-Tenancy Guide

## Overview

FOLIO LMS supports multi-tenancy, allowing multiple independent organizations to use the same system while keeping their data completely isolated.

## Multi-Tenancy Approach

**Type**: Shared Database with Schema Isolation

Each tenant shares the same database and tables, but data is isolated using a `tenant_id` column on all tables.

### Pros
- Cost-effective
- Easy to maintain
- Simple backups
- Efficient resource usage

### Cons
- Requires careful query filtering
- Schema changes affect all tenants
- Less flexible per-tenant customization

## Implementation

### Database Level

All core tables include a `tenant_id` column:

```sql
CREATE TABLE instances (
    id UUID PRIMARY KEY,
    title VARCHAR(500),
    tenant_id UUID NOT NULL,
    -- other columns...
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_instances_tenant ON instances(tenant_id);
```

### Application Level

#### 1. Tenant Middleware

Every request includes tenant information:

```python
# Request Header
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000

# Middleware extracts and validates
request.state.tenant_id = tenant_id
```

#### 2. Query Filtering

All queries automatically filter by tenant:

```python
async def list_instances(tenant_id: UUID):
    query = select(Instance).where(Instance.tenant_id == tenant_id)
    return await db.execute(query)
```

## Configuration

### Enable Multi-Tenancy

In `backend/.env`:

```ini
ENABLE_MULTI_TENANCY=true
DEFAULT_TENANT=default
```

### Create Tenants

```bash
# Via API
POST /api/v1/tenants
{
  "name": "Public Library",
  "code": "public-lib",
  "active": true
}

# Response
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Public Library",
  "code": "public-lib",
  "active": true
}
```

## Usage

### Frontend

```typescript
// Include tenant ID in requests
axios.get('/api/v1/inventory/instances', {
  headers: {
    'X-Tenant-ID': '550e8400-e29b-41d4-a716-446655440000'
  }
})
```

### Backend API

Tenant ID extracted automatically:

```python
@router.get("/instances")
async def list_instances(
    current_tenant: str = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    # Queries automatically scoped to tenant
    instances = await inventory_service.list_instances(
        db, tenant_id=current_tenant
    )
    return instances
```

## User-Tenant Relationships

Users can belong to multiple tenants:

```python
# User model
users = relationship("Tenant", secondary="user_tenants")

# Assigning user to tenant
user.tenants.append(tenant)
```

## Best Practices

### 1. Always Filter by Tenant

```python
# Good
SELECT * FROM instances WHERE tenant_id = ?

# Bad (exposes all tenant data!)
SELECT * FROM instances
```

### 2. Validate Tenant Access

```python
def get_current_tenant(user: User, tenant_id: str):
    if tenant_id not in [str(t.id) for t in user.tenants]:
        raise HTTPException(403, "Access denied")
    return tenant_id
```

### 3. Index tenant_id Columns

```sql
CREATE INDEX idx_table_tenant ON table_name(tenant_id);
```

### 4. Include in All Queries

```python
# ORM automatically handles this with mixins
class Instance(Base, TenantMixin):
    # tenant_id automatically added
    pass
```

## Monitoring

### Tenant Usage Metrics

Track per-tenant:
- Storage used
- API requests
- Active users
- Data volume

```sql
-- Get tenant statistics
SELECT
    t.name,
    COUNT(DISTINCT i.id) as total_instances,
    COUNT(DISTINCT u.id) as total_users
FROM tenants t
LEFT JOIN instances i ON i.tenant_id = t.id
LEFT JOIN users u ON u.tenant_id = t.id
GROUP BY t.id;
```

## Migration Guide

### Single Tenant to Multi-Tenant

1. **Add tenant table**:
```sql
CREATE TABLE tenants (...);
```

2. **Create default tenant**:
```sql
INSERT INTO tenants (id, name, code)
VALUES ('default-uuid', 'Default', 'default');
```

3. **Add tenant_id to tables**:
```sql
ALTER TABLE instances
ADD COLUMN tenant_id UUID
DEFAULT 'default-uuid';
```

4. **Add constraints**:
```sql
ALTER TABLE instances
ADD CONSTRAINT fk_tenant
FOREIGN KEY (tenant_id) REFERENCES tenants(id);
```

5. **Update application code** to use tenant middleware

## Troubleshooting

### Issue: Data Leakage

**Problem**: Queries returning data from wrong tenant

**Solution**:
- Check all queries include tenant filter
- Review middleware configuration
- Enable query logging

### Issue: Tenant Not Found

**Problem**: User can't access tenant

**Solution**:
- Verify user-tenant relationship
- Check tenant is active
- Validate tenant ID format

## Security Considerations

1. **Always validate tenant access**
2. **Use parameterized queries**
3. **Log tenant switching**
4. **Audit cross-tenant access attempts**
5. **Implement rate limiting per tenant**

## Future Enhancements

- [ ] Per-tenant database isolation option
- [ ] Tenant-specific configuration
- [ ] Usage-based billing
- [ ] Tenant analytics dashboard
- [ ] Automated tenant provisioning
