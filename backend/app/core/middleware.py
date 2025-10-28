"""
Custom middleware for the application.
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings
from app.services.audit_service import AuditService
import time
import uuid


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware to handle multi-tenancy."""

    async def dispatch(self, request: Request, call_next):
        # Skip tenant checking for certain paths
        skip_paths = ["/docs", "/redoc", "/openapi.json", "/health", "/", "/api/v1/auth"]
        if any(request.url.path.startswith(path) for path in skip_paths):
            return await call_next(request)

        # Get tenant ID from header
        tenant_id = request.headers.get("X-Tenant-ID")

        if not tenant_id and settings.ENABLE_MULTI_TENANCY:
            tenant_id = settings.DEFAULT_TENANT

        # Store tenant_id in request state
        request.state.tenant_id = tenant_id

        response = await call_next(request)
        return response


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware to log all API requests for audit purposes."""

    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Skip audit for health checks and docs
        skip_paths = ["/docs", "/redoc", "/openapi.json", "/health", "/"]
        if any(request.url.path.startswith(path) for path in skip_paths):
            return await call_next(request)

        # Record start time
        start_time = time.time()

        # Get user info if available
        user_id = None
        try:
            # This would require access to the decoded JWT token
            # Implementation depends on your auth setup
            pass
        except:
            pass

        # Process request
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Log audit trail (async, don't wait)
        # audit_service = AuditService()
        # await audit_service.log_request(
        #     request_id=request_id,
        #     method=request.method,
        #     path=request.url.path,
        #     user_id=user_id,
        #     tenant_id=getattr(request.state, "tenant_id", None),
        #     status_code=response.status_code,
        #     process_time=process_time,
        # )

        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = str(process_time)

        return response
