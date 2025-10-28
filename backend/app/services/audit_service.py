"""
Audit logging service.
"""

from typing import Optional
from uuid import UUID
from app.models.audit import AuditLog, AuditAction, AuditStatus
from sqlalchemy.ext.asyncio import AsyncSession


class AuditService:
    """Service for audit logging."""

    @staticmethod
    async def log_action(
        db: AsyncSession,
        action: AuditAction,
        actor: Optional[UUID],
        target: str,
        resource_type: str,
        status: AuditStatus = AuditStatus.SUCCESS,
        details: dict = None,
        tenant_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
    ):
        """Log an audit event."""
        audit_log = AuditLog(
            action=action,
            actor=actor,
            target=target,
            resource_type=resource_type,
            status=status,
            details=details or {},
            tenant_id=tenant_id,
            ip_address=ip_address,
        )
        db.add(audit_log)
        await db.commit()
