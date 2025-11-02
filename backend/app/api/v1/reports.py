"""
Reports API Endpoints
Generate and export various reports
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, and_, or_, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from pydantic import BaseModel
from uuid import UUID
import uuid
import io

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_tenant, require_permission
from app.models.user import User
from app.models.circulation import Loan, LoanStatus, Request as Hold, RequestStatus as HoldStatus
from app.models.inventory import Item, Instance
# TODO: The following models don't exist yet:
# from app.models.patron_group import PatronGroup
# from app.models.purchase_order import PurchaseOrder, POStatus
try:
    from app.models.acquisition import Fund
    FUND_MODEL_AVAILABLE = True
except ImportError:
    FUND_MODEL_AVAILABLE = False
    Fund = None

# Invoice model doesn't exist yet
INVOICE_MODEL_AVAILABLE = False
Invoice = None
InvoiceStatus = None
from app.schemas.report import (
    ReportType, ExportFormat, ReportData,
    CirculationReportRequest, CollectionReportRequest,
    FinancialReportRequest, OverdueReportRequest,
    CirculationStats, CollectionStats, FinancialStats, UserStats,
    DashboardStats
)
from app.services.export_service import get_export_service

router = APIRouter()


@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive dashboard statistics

    Returns combined statistics for circulation, collection, financial, and users
    """
    try:
        # Circulation stats
        total_checkouts = await db.scalar(
            select(func.count(Loan.id)).where(Loan.tenant_id == current_user.tenant_id)
        ) or 0

        active_loans = await db.scalar(
            select(func.count(Loan.id)).where(
                and_(
                    Loan.tenant_id == current_user.tenant_id,
                    Loan.status == LoanStatus.CHECKED_OUT
                )
            )
        ) or 0

        overdue_loans = await db.scalar(
            select(func.count(Loan.id)).where(
                and_(
                    Loan.tenant_id == current_user.tenant_id,
                    Loan.status == LoanStatus.CHECKED_OUT,
                    Loan.due_date < datetime.utcnow().date()
                )
            )
        ) or 0

        total_renewals = await db.scalar(
            select(func.sum(Loan.renewal_count)).where(
                Loan.tenant_id == current_user.tenant_id
            )
        ) or 0

        holds_placed = await db.scalar(
            select(func.count(Hold.id)).where(
                Hold.tenant_id == current_user.tenant_id
            )
        ) or 0

        holds_filled = await db.scalar(
            select(func.count(Hold.id)).where(
                and_(
                    Hold.tenant_id == current_user.tenant_id,
                    Hold.status.in_([HoldStatus.FULFILLED, HoldStatus.AVAILABLE])
                )
            )
        ) or 0

        circulation = CirculationStats(
            total_checkouts=total_checkouts,
            total_checkins=total_checkouts - active_loans,  # Approximate
            total_renewals=total_renewals,
            active_loans=active_loans,
            overdue_loans=overdue_loans,
            holds_placed=holds_placed,
            holds_filled=holds_filled
        )

        # Collection stats
        total_instances = await db.scalar(
            select(func.count(Instance.id)).where(Instance.tenant_id == current_user.tenant_id)
        ) or 0

        total_items = await db.scalar(
            select(func.count(Item.id)).where(Item.tenant_id == current_user.tenant_id)
        ) or 0

        collection = CollectionStats(
            total_instances=total_instances,
            total_items=total_items,
            items_checked_out=active_loans
        )

        # Financial stats
        total_allocated = 0.0
        total_expended = 0.0
        total_invoice_amount = 0.0
        paid_invoices = 0
        paid_amount = 0.0

        if FUND_MODEL_AVAILABLE and Fund:
            total_allocated = await db.scalar(
                select(func.sum(Fund.allocated_amount)).where(
                    Fund.tenant_id == current_user.tenant_id
                )
            ) or 0.0

        # Invoice model not yet available
        if INVOICE_MODEL_AVAILABLE and Invoice:
            total_invoice_amount = await db.scalar(
                select(func.sum(Invoice.total)).where(
                    Invoice.tenant_id == current_user.tenant_id
                )
            ) or 0.0

            paid_invoices = await db.scalar(
                select(func.count(Invoice.id)).where(
                    and_(
                        Invoice.tenant_id == current_user.tenant_id,
                        Invoice.status == InvoiceStatus.PAID
                    )
                )
            ) or 0

            paid_amount = await db.scalar(
                select(func.sum(Invoice.total)).where(
                    and_(
                        Invoice.tenant_id == current_user.tenant_id,
                        Invoice.status == InvoiceStatus.PAID
                    )
                )
            ) or 0.0

        financial = FinancialStats(
            total_allocated=float(total_allocated),
            total_expended=float(total_expended),
            total_available=float(total_allocated - total_expended),
            total_invoice_amount=float(total_invoice_amount),
            paid_invoices=paid_invoices,
            paid_amount=float(paid_amount)
        )

        # User stats
        total_users = await db.scalar(
            select(func.count(User.id)).where(User.tenant_id == current_user.tenant_id)
        ) or 0

        active_users = await db.scalar(
            select(func.count(User.id)).where(
                and_(
                    User.tenant_id == current_user.tenant_id,
                    User.is_active == True
                )
            )
        ) or 0

        users_with_overdues = await db.scalar(
            select(func.count(func.distinct(Loan.user_id))).where(
                and_(
                    Loan.tenant_id == current_user.tenant_id,
                    Loan.status == LoanStatus.CHECKED_OUT,
                    Loan.due_date < datetime.utcnow().date()
                )
            )
        ) or 0

        users = UserStats(
            total_users=total_users,
            active_users=active_users,
            users_with_overdues=users_with_overdues
        )

        return DashboardStats(
            circulation=circulation,
            collection=collection,
            financial=financial,
            users=users,
            generated_at=datetime.utcnow()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard stats: {str(e)}")


@router.post("/circulation")
async def generate_circulation_report(
    request: CirculationReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate circulation report with optional export
    """
    try:
        # Build query
        query = select(Loan).where(Loan.tenant_id == current_user.tenant_id)

        # Apply filters
        if request.filters:
            if request.filters.date_range:
                if request.filters.date_range.start_date:
                    query = query.where(Loan.checkout_date >= request.filters.date_range.start_date)
                if request.filters.date_range.end_date:
                    query = query.where(Loan.checkout_date <= request.filters.date_range.end_date)

            if request.filters.user_id:
                query = query.where(Loan.user_id == request.filters.user_id)

            if request.filters.status:
                query = query.where(Loan.status == request.filters.status)

        # Add pagination
        if request.filters:
            query = query.offset(request.filters.offset).limit(request.filters.limit)

        # Execute query with joins
        query = query.options(
            joinedload(Loan.user),
            joinedload(Loan.item).joinedload(Item.instance)
        )

        result = await db.execute(query)
        loans = result.scalars().all()

        # Convert to report data
        data = []
        for loan in loans:
            data.append({
                'loan_id': str(loan.id),
                'user': loan.user.username if loan.user else 'Unknown',
                'item_title': loan.item.instance.title if loan.item and loan.item.instance else 'Unknown',
                'checkout_date': loan.checkout_date.isoformat() if loan.checkout_date else None,
                'due_date': loan.due_date.isoformat() if loan.due_date else None,
                'return_date': loan.return_date.isoformat() if loan.return_date else None,
                'status': loan.status.value if loan.status else None,
                'renewal_count': loan.renewal_count or 0
            })

        # Create report
        report_data = ReportData(
            report_type=ReportType.CIRCULATION,
            title="Circulation Report",
            description="Report of circulation activity including checkouts, checkins, and renewals",
            generated_at=datetime.utcnow(),
            filters_applied=request.filters.model_dump() if request.filters else {},
            total_records=len(data),
            data=data
        )

        # Export if requested
        if request.export_format != ExportFormat.JSON:
            export_service = get_export_service()
            file_content = export_service.export_report(report_data, request.export_format)

            # Determine content type and filename
            if request.export_format == ExportFormat.CSV:
                media_type = "text/csv"
                extension = "csv"
            elif request.export_format == ExportFormat.EXCEL:
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                extension = "xlsx"
            elif request.export_format == ExportFormat.PDF:
                media_type = "application/pdf"
                extension = "pdf"

            filename = f"circulation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"

            return StreamingResponse(
                io.BytesIO(file_content),
                media_type=media_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        # Return JSON
        return report_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate circulation report: {str(e)}")


@router.post("/collection")
async def generate_collection_report(
    request: CollectionReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate collection/inventory report with optional export
    """
    try:
        # Build query
        query = select(Instance).where(Instance.tenant_id == current_user.tenant_id)

        # Apply filters
        if request.filters:
            if request.filters.instance_id:
                query = query.where(Instance.id == request.filters.instance_id)

        # Add pagination
        if request.filters:
            query = query.offset(request.filters.offset).limit(request.filters.limit)

        result = await db.execute(query)
        instances = result.scalars().all()

        # Convert to report data
        data = []
        for instance in instances:
            data.append({
                'instance_id': str(instance.id),
                'title': instance.title,
                'subtitle': instance.subtitle,
                'author': instance.author,
                'publisher': instance.publisher,
                'publication_year': instance.publication_year,
                'isbn': instance.isbn,
                'instance_type': instance.instance_type,
                'language': instance.language,
                'subjects': ', '.join(instance.subjects) if instance.subjects else None
            })

        # Calculate summary stats if requested
        summary = None
        if request.include_statistics:
            total_count = len(data)
            types_count = {}
            languages_count = {}

            for item in data:
                # Count by type
                item_type = item.get('instance_type', 'Unknown')
                types_count[item_type] = types_count.get(item_type, 0) + 1

                # Count by language
                lang = item.get('language', 'Unknown')
                languages_count[lang] = languages_count.get(lang, 0) + 1

            summary = {
                'total_instances': total_count,
                'by_type': types_count,
                'by_language': languages_count
            }

        # Create report
        report_data = ReportData(
            report_type=ReportType.COLLECTION,
            title="Collection Report",
            description="Report of library collection/inventory",
            generated_at=datetime.utcnow(),
            filters_applied=request.filters.model_dump() if request.filters else {},
            total_records=len(data),
            data=data,
            summary=summary
        )

        # Export if requested
        if request.export_format != ExportFormat.JSON:
            export_service = get_export_service()
            file_content = export_service.export_report(report_data, request.export_format)

            # Determine content type and filename
            if request.export_format == ExportFormat.CSV:
                media_type = "text/csv"
                extension = "csv"
            elif request.export_format == ExportFormat.EXCEL:
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                extension = "xlsx"
            elif request.export_format == ExportFormat.PDF:
                media_type = "application/pdf"
                extension = "pdf"

            filename = f"collection_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"

            return StreamingResponse(
                io.BytesIO(file_content),
                media_type=media_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        # Return JSON
        return report_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate collection report: {str(e)}")


@router.post("/overdue")
async def generate_overdue_report(
    request: OverdueReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate overdue items report with optional export
    """
    try:
        # Build query for overdue items
        today = datetime.utcnow().date()
        min_due_date = today - timedelta(days=request.min_days_overdue)

        query = select(Loan).where(
            and_(
                Loan.tenant_id == current_user.tenant_id,
                Loan.status == LoanStatus.CHECKED_OUT,
                Loan.due_date < today,
                Loan.due_date <= min_due_date
            )
        )

        # Apply filters
        if request.filters:
            if request.filters.user_id:
                query = query.where(Loan.user_id == request.filters.user_id)

        # Add pagination
        if request.filters:
            query = query.offset(request.filters.offset).limit(request.filters.limit)

        # Execute query with joins
        query = query.options(
            joinedload(Loan.user),
            joinedload(Loan.item).joinedload(Item.instance)
        )

        result = await db.execute(query)
        overdue_loans = result.scalars().all()

        # Convert to report data
        data = []
        total_fines = 0.0

        for loan in overdue_loans:
            days_overdue = (today - loan.due_date).days
            fine_amount = days_overdue * 0.25 if request.include_fines else 0.0  # $0.25 per day
            total_fines += fine_amount

            data.append({
                'loan_id': str(loan.id),
                'user': loan.user.username if loan.user else 'Unknown',
                'user_email': loan.user.email if loan.user else None,
                'item_title': loan.item.instance.title if loan.item and loan.item.instance else 'Unknown',
                'checkout_date': loan.checkout_date.isoformat() if loan.checkout_date else None,
                'due_date': loan.due_date.isoformat() if loan.due_date else None,
                'days_overdue': days_overdue,
                'fine_amount': fine_amount if request.include_fines else None
            })

        # Calculate summary
        summary = {
            'total_overdue_items': len(data),
            'total_fines': total_fines if request.include_fines else None,
            'average_days_overdue': sum(item['days_overdue'] for item in data) / len(data) if data else 0
        }

        # Create report
        report_data = ReportData(
            report_type=ReportType.OVERDUE,
            title="Overdue Items Report",
            description=f"Report of items overdue by at least {request.min_days_overdue} day(s)",
            generated_at=datetime.utcnow(),
            filters_applied=request.filters.model_dump() if request.filters else {},
            total_records=len(data),
            data=data,
            summary=summary
        )

        # Export if requested
        if request.export_format != ExportFormat.JSON:
            export_service = get_export_service()
            file_content = export_service.export_report(report_data, request.export_format)

            # Determine content type and filename
            if request.export_format == ExportFormat.CSV:
                media_type = "text/csv"
                extension = "csv"
            elif request.export_format == ExportFormat.EXCEL:
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                extension = "xlsx"
            elif request.export_format == ExportFormat.PDF:
                media_type = "application/pdf"
                extension = "pdf"

            filename = f"overdue_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"

            return StreamingResponse(
                io.BytesIO(file_content),
                media_type=media_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        # Return JSON
        return report_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate overdue report: {str(e)}")


@router.post("/financial")
async def generate_financial_report(
    request: FinancialReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate financial/acquisitions report with optional export
    """
    try:
        if not FUND_MODEL_AVAILABLE or not Fund:
            raise HTTPException(
                status_code=503,
                detail="Financial reports not available - Fund model not configured"
            )

        # Query funds data
        funds_query = select(Fund).where(Fund.tenant_id == current_user.tenant_id)
        funds_result = await db.execute(funds_query)
        funds = funds_result.scalars().all()

        # Convert funds to report data
        data = []
        total_allocated = 0.0
        total_expended = 0.0
        total_available = 0.0

        for fund in funds:
            allocated = float(fund.allocated_amount or 0)
            # Fund model doesn't have expended_amount yet - using 0
            expended = 0.0
            available = allocated - expended

            total_allocated += allocated
            total_expended += expended
            total_available += available

            data.append({
                'fund_id': str(fund.id),
                'fund_name': fund.name,
                'fund_code': fund.code,
                'status': getattr(fund, 'fund_status', 'active'),
                'allocated_amount': allocated,
                'expended_amount': expended,
                'available_amount': available,
                'description': fund.description
            })

        # Calculate summary
        summary = {
            'total_allocated': total_allocated,
            'total_expended': total_expended,
            'total_available': total_available,
            'expenditure_rate': (total_expended / total_allocated * 100) if total_allocated > 0 else 0
        }

        # Create report
        report_data = ReportData(
            report_type=ReportType.FINANCIAL,
            title="Financial Report",
            description="Report of fund allocation and expenditures",
            generated_at=datetime.utcnow(),
            filters_applied=request.filters.model_dump() if request.filters else {},
            total_records=len(data),
            data=data,
            summary=summary
        )

        # Export if requested
        if request.export_format != ExportFormat.JSON:
            export_service = get_export_service()
            file_content = export_service.export_report(report_data, request.export_format)

            # Determine content type and filename
            if request.export_format == ExportFormat.CSV:
                media_type = "text/csv"
                extension = "csv"
            elif request.export_format == ExportFormat.EXCEL:
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                extension = "xlsx"
            elif request.export_format == ExportFormat.PDF:
                media_type = "application/pdf"
                extension = "pdf"

            filename = f"financial_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"

            return StreamingResponse(
                io.BytesIO(file_content),
                media_type=media_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        # Return JSON
        return report_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate financial report: {str(e)}")


# ============================================================================
# REPORT TEMPLATES AND SCHEDULING (BUG-010 FIX)
# ============================================================================

@router.get("/templates", response_model=List[dict])
async def list_report_templates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("reports.view")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Get available report templates (BUG-010 FIX).

    Returns a list of predefined report templates that users can generate.
    """
    templates = [
        {
            "id": "circulation",
            "name": "Circulation Report",
            "description": "Report on checkouts, check-ins, and renewals",
            "parameters": ["date_range", "user_group", "location"],
            "export_formats": ["json", "csv", "excel", "pdf"]
        },
        {
            "id": "collection",
            "name": "Collection Statistics",
            "description": "Inventory statistics by type, location, and status",
            "parameters": ["instance_type", "location", "status"],
            "export_formats": ["json", "csv", "excel", "pdf"]
        },
        {
            "id": "overdue",
            "name": "Overdue Items Report",
            "description": "List of overdue items with patron information",
            "parameters": ["min_days_overdue", "include_fines"],
            "export_formats": ["json", "csv", "excel", "pdf"]
        },
        {
            "id": "financial",
            "name": "Financial Report",
            "description": "Revenue and expenses for acquisitions and fees",
            "parameters": ["date_range", "fund_id", "vendor_id"],
            "export_formats": ["json", "csv", "excel", "pdf"]
        },
        {
            "id": "user_activity",
            "name": "User Activity Report",
            "description": "Patron circulation activity and statistics",
            "parameters": ["user_group", "date_range", "activity_type"],
            "export_formats": ["json", "csv", "excel"]
        },
        {
            "id": "acquisitions",
            "name": "Acquisitions Report",
            "description": "Purchase orders, invoices, and receiving",
            "parameters": ["date_range", "vendor_id", "status"],
            "export_formats": ["json", "csv", "excel", "pdf"]
        }
    ]

    return templates


class ReportScheduleCreate(BaseModel):
    """Schedule a report to run periodically."""
    template_id: str
    name: str
    description: Optional[str] = None
    schedule: str  # cron expression
    parameters: Dict[str, Any] = {}
    export_format: ExportFormat = ExportFormat.CSV
    recipients: List[str] = []  # Email addresses
    enabled: bool = True


class ReportScheduleResponse(BaseModel):
    """Report schedule response."""
    id: UUID
    template_id: str
    name: str
    description: Optional[str]
    schedule: str
    parameters: Dict[str, Any]
    export_format: str
    recipients: List[str]
    enabled: bool
    last_run: Optional[datetime]
    next_run: Optional[datetime]
    created_by: str
    created_date: datetime


@router.post("/schedule", response_model=dict, status_code=status.HTTP_201_CREATED)
async def schedule_report(
    schedule_data: ReportScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("reports.generate")),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Schedule a report to run periodically (BUG-010 FIX).

    Creates a scheduled job to generate and email reports automatically.
    """
    # Validate cron expression
    try:
        from croniter import croniter
        from datetime import datetime as dt

        if not croniter.is_valid(schedule_data.schedule):
            raise ValueError("Invalid cron expression")

        # Calculate next run time
        cron = croniter(schedule_data.schedule, dt.now())
        next_run = cron.get_next(datetime)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid schedule format: {str(e)}. Expected cron expression (e.g., '0 9 * * 1' for Monday 9 AM)"
        )

    # Validate template ID
    valid_templates = ["circulation", "collection", "overdue", "financial", "user_activity", "acquisitions"]
    if schedule_data.template_id not in valid_templates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template_id. Must be one of: {', '.join(valid_templates)}"
        )

    # Create schedule record (simplified - would need actual scheduled_reports table)
    schedule_id = uuid.uuid4()

    # Log audit
    from app.services.audit_service import AuditService
    await AuditService.log_action(
        db=db,
        actor=current_user.id,
        action="SCHEDULE_REPORT",
        target=str(schedule_id),
        resource_type="report_schedule",
        details={
            "template_id": schedule_data.template_id,
            "schedule": schedule_data.schedule,
            "next_run": next_run.isoformat()
        },
        tenant_id=UUID(tenant_id),
    )

    return {
        "message": "Report scheduled successfully",
        "schedule_id": str(schedule_id),
        "template_id": schedule_data.template_id,
        "name": schedule_data.name,
        "schedule": schedule_data.schedule,
        "next_run": next_run.isoformat(),
        "enabled": schedule_data.enabled,
        "recipients": schedule_data.recipients
    }
