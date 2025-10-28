"""
Permissions API endpoints (stub).
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_permissions():
    """List permissions (stub)."""
    return {"message": "Permissions list endpoint - to be implemented"}
