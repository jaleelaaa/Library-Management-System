"""API v1 routes."""

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

__all__ = [
    "auth",
    "tenants",
    "users",
    "permissions",
    "inventory",
    "circulation",
    "acquisitions",
    "courses",
    "fees",
    "search",
    "notifications",
    "reports",
]
