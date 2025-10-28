"""
Main FastAPI application entry point for FOLIO LMS.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.middleware import TenantMiddleware, AuditMiddleware
from app.db.session import init_db, close_db
from app.services.elasticsearch_service import init_elasticsearch, close_elasticsearch
from app.api.v1 import (
    auth,
    tenants,
    users,
    permissions,
    inventory,
    circulation,
    acquisitions,
    courses,
    fees,
    search,
    notifications,
    reports,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    await init_db()
    print("Database initialized!")

    # Initialize Elasticsearch (optional - won't fail if not available)
    try:
        es_initialized = await init_elasticsearch()
        if es_initialized:
            print("Elasticsearch initialized!")
        else:
            print("Elasticsearch not available - search features disabled")
    except Exception as e:
        print(f"Warning: Elasticsearch initialization failed: {e}")

    # Initialize WebSocket service
    try:
        from app.services.websocket_service import init_websocket
        await init_websocket()
        print("WebSocket service initialized!")
    except Exception as e:
        print(f"Warning: WebSocket initialization failed: {e}")

    yield
    # Shutdown
    await close_db()
    await close_elasticsearch()

    from app.services.websocket_service import close_websocket
    await close_websocket()

    print("Application shutdown complete.")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Comprehensive Library Management System inspired by FOLIO",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
if settings.ENABLE_MULTI_TENANCY:
    app.add_middleware(TenantMiddleware)
app.add_middleware(AuditMiddleware)

# Mount Socket.IO
from app.services.websocket_service import get_websocket_service
ws_service = get_websocket_service()
socket_app = ws_service.get_asgi_app()

# Mount Socket.IO app at /socket.io (standard Socket.IO path)
app.mount("/socket.io", socket_app)


# Health check endpoints
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - health check."""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Return a simple SVG favicon."""
    # Simple book icon as SVG favicon
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#2563eb"/>
        <path d="M30 20 L30 80 L70 80 L70 20 Z" fill="#fff" stroke="#2563eb" stroke-width="2"/>
        <line x1="30" y1="35" x2="70" y2="35" stroke="#2563eb" stroke-width="2"/>
        <line x1="30" y1="50" x2="70" y2="50" stroke="#2563eb" stroke-width="2"/>
        <line x1="30" y1="65" x2="70" y2="65" stroke="#2563eb" stroke-width="2"/>
    </svg>'''
    return Response(content=svg_content, media_type="image/svg+xml")


# Include routers
app.include_router(
    auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication"]
)

if settings.ENABLE_MULTI_TENANCY:
    app.include_router(
        tenants.router, prefix=f"{settings.API_V1_PREFIX}/tenants", tags=["Tenants"]
    )

app.include_router(
    users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["Users"]
)

app.include_router(
    permissions.router,
    prefix=f"{settings.API_V1_PREFIX}/permissions",
    tags=["Permissions"],
)

app.include_router(
    inventory.router,
    prefix=f"{settings.API_V1_PREFIX}/inventory",
    tags=["Inventory"],
)

app.include_router(
    circulation.router,
    prefix=f"{settings.API_V1_PREFIX}/circulation",
    tags=["Circulation"],
)

app.include_router(
    acquisitions.router,
    prefix=f"{settings.API_V1_PREFIX}/acquisitions",
    tags=["Acquisitions"],
)

app.include_router(
    courses.router, prefix=f"{settings.API_V1_PREFIX}/courses", tags=["Courses"]
)

app.include_router(
    fees.router, prefix=f"{settings.API_V1_PREFIX}/fees", tags=["Fees & Fines"]
)

app.include_router(
    search.router, prefix=f"{settings.API_V1_PREFIX}/search", tags=["Search"]
)

app.include_router(
    notifications.router,
    prefix=f"{settings.API_V1_PREFIX}/notifications",
    tags=["Notifications"],
)

app.include_router(
    reports.router,
    prefix=f"{settings.API_V1_PREFIX}/reports",
    tags=["Reports"],
)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG
    )
