"""
Audit logs API endpoints for viewing system activity logs.
"""

from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from pydantic import BaseModel
import uuid

from app.db.session import get_db
from app.models.audit import AuditLog, AuditAction, AuditStatus
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.core.deps import require_permission

router = APIRouter()


class AuditLogResponse(BaseModel):
    """Audit log response schema."""
    id: str
    timestamp: datetime
    actor: Optional[str]
    username: Optional[str]
    action: str
    target: Optional[str]
    resource_type: Optional[str]
    details: dict
    status: str
    ip_address: Optional[str]
    user_agent: Optional[str]

    class Config:
        from_attributes = True


class PaginatedAuditLogsResponse(BaseModel):
    """Paginated audit logs response."""
    data: List[AuditLogResponse]
    meta: dict


@router.get("/audit-logs", response_model=PaginatedAuditLogsResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None, description="Filter by action type"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    search: Optional[str] = Query(None, description="Search by resource ID or target"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("audit.read")),
):
    """
    Get audit logs with filtering and pagination.

    **Permissions Required:** audit.read

    **Query Parameters:**
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - action: Filter by action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
    - resource_type: Filter by resource type (User, Item, Loan, etc.)
    - user_id: Filter by actor user ID
    - start_date: Filter logs from this date (ISO format)
    - end_date: Filter logs until this date (ISO format)
    - search: Search by resource ID or target path

    **Returns:** Paginated list of audit logs
    """
    # Build query
    query = db.query(AuditLog)

    # Apply filters
    filters = []

    if action:
        try:
            filters.append(AuditLog.action == AuditAction[action.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid action type: {action}")

    if resource_type:
        filters.append(AuditLog.resource_type == resource_type)

    if user_id:
        try:
            filters.append(AuditLog.actor == uuid.UUID(user_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            filters.append(AuditLog.timestamp >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format.")

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            filters.append(AuditLog.timestamp <= end_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format.")

    if search:
        filters.append(AuditLog.target.ilike(f"%{search}%"))

    if filters:
        query = query.filter(and_(*filters))

    # Get total count
    total_items = query.count()

    # Apply pagination and ordering
    offset = (page - 1) * page_size
    audit_logs = query.order_by(desc(AuditLog.timestamp)).offset(offset).limit(page_size).all()

    # Join with users to get usernames
    enriched_logs = []
    for log in audit_logs:
        log_dict = {
            "id": str(log.id),
            "timestamp": log.timestamp,
            "actor": str(log.actor) if log.actor else None,
            "username": None,
            "action": log.action.value if log.action else None,
            "target": log.target,
            "resource_type": log.resource_type,
            "details": log.details or {},
            "status": log.status.value if log.status else None,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
        }

        # Get username if actor exists
        if log.actor:
            user = db.query(User).filter(User.id == log.actor).first()
            if user:
                log_dict["username"] = user.username

        enriched_logs.append(log_dict)

    # Calculate pagination metadata
    total_pages = (total_items + page_size - 1) // page_size

    return {
        "data": enriched_logs,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        }
    }


@router.post("/audit-logs/export")
async def export_audit_logs(
    format: str = Query("csv", description="Export format: csv or excel"),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("audit.read")),
):
    """
    Export audit logs to CSV or Excel format.

    **Permissions Required:** audit.read

    **Returns:** File download
    """
    from fastapi.responses import StreamingResponse
    import io
    import csv

    # Build query (same as get_audit_logs)
    query = db.query(AuditLog)
    filters = []

    if action:
        try:
            filters.append(AuditLog.action == AuditAction[action.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid action type: {action}")

    if resource_type:
        filters.append(AuditLog.resource_type == resource_type)

    if user_id:
        try:
            filters.append(AuditLog.actor == uuid.UUID(user_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            filters.append(AuditLog.timestamp >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            filters.append(AuditLog.timestamp <= end_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")

    if search:
        filters.append(AuditLog.target.ilike(f"%{search}%"))

    if filters:
        query = query.filter(and_(*filters))

    # Get all logs (limited to 10000 for safety)
    audit_logs = query.order_by(desc(AuditLog.timestamp)).limit(10000).all()

    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(['Timestamp', 'Username', 'Action', 'Resource Type', 'Resource ID', 'Status', 'IP Address', 'Details'])

    # Write rows
    for log in audit_logs:
        username = None
        if log.actor:
            user = db.query(User).filter(User.id == log.actor).first()
            if user:
                username = user.username

        writer.writerow([
            log.timestamp.isoformat() if log.timestamp else '',
            username or 'System',
            log.action.value if log.action else '',
            log.resource_type or '',
            log.target or '',
            log.status.value if log.status else '',
            log.ip_address or '',
            str(log.details) if log.details else '{}'
        ])

    # Prepare response
    output.seek(0)

    if format.lower() == 'excel':
        # For Excel, we'd need openpyxl or xlsxwriter
        # For now, return CSV with different content type
        filename = f"audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        media_type = "text/csv"
    else:
        filename = f"audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        media_type = "text/csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
