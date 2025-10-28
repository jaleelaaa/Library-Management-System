# FOLIO LMS Architecture

## System Overview

FOLIO LMS is a modern, cloud-ready library management system built with a decoupled architecture:

- **Backend**: FastAPI (Python) providing RESTful APIs
- **Frontend**: React with TypeScript for the user interface
- **Database**: PostgreSQL with full-text search capabilities
- **Cache**: Redis for session management and caching
- **Search**: Elasticsearch for advanced search features

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                    │
│  - Redux Toolkit (State Management)             │
│  - React Router (Routing)                       │
│  - Axios (HTTP Client)                           │
│  - Tailwind CSS (Styling)                        │
└────────────────┬────────────────────────────────┘
                 │ HTTP/REST (JSON)
                 ▼
┌─────────────────────────────────────────────────┐
│          API Gateway / Load Balancer            │
│            (Kong / Nginx - Optional)            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Backend API (FastAPI)                   │
│  ┌───────────────────────────────────────────┐ │
│  │         Application Layer                  │ │
│  │  - Request/Response handling               │ │
│  │  - Authentication middleware               │ │
│  │  - Tenant isolation middleware             │ │
│  │  - Audit logging                           │ │
│  └───────────────┬───────────────────────────┘ │
│                  │                              │
│  ┌───────────────▼───────────────────────────┐ │
│  │         Business Logic Layer               │ │
│  │  - Service classes                         │ │
│  │  - Business rules validation               │ │
│  │  - Transaction management                  │ │
│  └───────────────┬───────────────────────────┘ │
│                  │                              │
│  ┌───────────────▼───────────────────────────┐ │
│  │         Data Access Layer                  │ │
│  │  - SQLAlchemy ORM                          │ │
│  │  - Database models                         │ │
│  │  - Query optimization                      │ │
│  └───────────────┬───────────────────────────┘ │
└──────────────────┼───────────────────────────┬┘
                   │                           │
        ┌──────────▼──────────┐    ┌──────────▼─────────┐
        │   PostgreSQL 15+    │    │    Redis Cache     │
        │                     │    │                    │
        │ - User data         │    │ - Session data     │
        │ - Inventory         │    │ - Temporary data   │
        │ - Circulation       │    │ - Rate limiting    │
        │ - Acquisitions      │    └────────────────────┘
        │ - Multi-tenant      │
        └─────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Elasticsearch     │
        │                     │
        │ - Full-text search  │
        │ - Faceted search    │
        │ - Advanced queries  │
        └─────────────────────┘
```

## Core Design Patterns

### 1. Layered Architecture

The backend follows a clean layered architecture:

**Presentation Layer** (API Routes)
- FastAPI routers
- Request validation
- Response formatting
- OpenAPI documentation

**Business Logic Layer** (Services)
- Domain logic
- Business rules
- Cross-cutting concerns
- Transaction orchestration

**Data Access Layer** (Models & Repositories)
- SQLAlchemy models
- Database queries
- Data persistence
- Cache management

### 2. Multi-Tenancy Pattern

**Schema**: Single database with tenant_id column isolation

**Benefits**:
- Resource efficiency
- Easier maintenance
- Cost-effective

**Implementation**:
```python
# Middleware intercepts requests
X-Tenant-ID: <tenant-uuid>

# All queries automatically filtered
SELECT * FROM instances WHERE tenant_id = '<tenant-uuid>'
```

### 3. RBAC (Role-Based Access Control)

**Structure**:
```
Users → Roles → Permissions
```

**Example**:
```
User: john_doe
├── Role: Cataloger
│   ├── Permission: inventory.create
│   ├── Permission: inventory.update
│   └── Permission: inventory.read
└── Role: Viewer
    └── Permission: inventory.read
```

### 4. Repository Pattern

Encapsulates data access logic:

```python
class InventoryService:
    async def get_instance(self, id: UUID):
        # Business logic
        instance = await self.repository.find_by_id(id)
        return instance
```

## Database Schema Design

### Core Tables

1. **tenants** - Multi-tenancy support
2. **users** - User accounts
3. **roles** - Role definitions
4. **permissions** - Permission definitions
5. **role_permissions** - Many-to-many
6. **user_roles** - Many-to-many

### Inventory Module

1. **instances** - Bibliographic records
2. **holdings** - Holdings information
3. **items** - Physical items
4. **locations** - Library locations
5. **libraries** - Library definitions

### Circulation Module

1. **loans** - Checkout records
2. **requests** - Hold/recall requests

### Acquisitions Module

1. **orders** - Purchase orders
2. **order_lines** - Order line items
3. **vendors** - Vendor information

### Audit Module

1. **audit_logs** - Complete activity log

## API Design Principles

### RESTful Conventions

```
GET    /api/v1/inventory/instances      # List
POST   /api/v1/inventory/instances      # Create
GET    /api/v1/inventory/instances/{id} # Get
PUT    /api/v1/inventory/instances/{id} # Update
DELETE /api/v1/inventory/instances/{id} # Delete
```

### Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total_items": 100,
    "total_pages": 10
  }
}
```

### Error Handling

Consistent error format:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "issue": "Invalid format"
  }
}
```

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Backend validates against database
3. JWT tokens generated (access + refresh)
4. Frontend stores tokens
5. All subsequent requests include token
6. Backend validates token on each request

### Authorization

- Permission-based access control
- Middleware checks permissions before endpoint execution
- Tenant isolation enforced at database query level

### Data Protection

- Passwords hashed with bcrypt
- JWT tokens for stateless auth
- HTTPS required in production
- SQL injection prevention via ORM
- XSS protection via input sanitization

## Scalability Considerations

### Horizontal Scaling

- Stateless API design
- Session data in Redis
- Load balancer distribution

### Database Optimization

- Indexed columns for frequent queries
- Connection pooling
- Query optimization
- Async operations

### Caching Strategy

**Redis Cache**:
- Session data (30 min TTL)
- Frequently accessed data (5 min TTL)
- Search results (1 min TTL)

## Deployment Architecture

### Production Stack

```
┌─────────────────┐
│   Load Balancer │
│     (Nginx)     │
└────────┬────────┘
         │
    ┌────▼────┐
    │  API 1  │
    │  API 2  │ (Auto-scaled)
    │  API 3  │
    └────┬────┘
         │
    ┌────▼──────────┐
    │  PostgreSQL   │
    │  (Primary +   │
    │   Replicas)   │
    └───────────────┘
```

### Containerization

- Docker containers for all services
- Docker Compose for local development
- Kubernetes-ready architecture

## Future Enhancements

1. **Microservices**: Break into smaller services
2. **Event Sourcing**: Track all state changes
3. **GraphQL**: Alternative to REST
4. **WebSockets**: Real-time updates
5. **Message Queue**: Async processing (Celery/RabbitMQ)
