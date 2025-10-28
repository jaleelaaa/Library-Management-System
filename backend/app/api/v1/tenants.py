"""
Tenants API endpoints (stub).
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_tenants():
    """List tenants (stub)."""
    return {"message": "Tenants list endpoint - to be implemented"}
