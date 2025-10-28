"""
Report schemas for reporting and analytics
"""

from datetime import date, datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID


class ReportType(str, Enum):
    """Types of available reports"""
    CIRCULATION = "circulation"
    COLLECTION = "collection"
    ACQUISITIONS = "acquisitions"
    USERS = "users"
    OVERDUE = "overdue"
    HOLDS = "holds"
    FINANCIAL = "financial"
    CUSTOM = "custom"


class ExportFormat(str, Enum):
    """Export format options"""
    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"
    JSON = "json"


class DateRange(BaseModel):
    """Date range for report filtering"""
    start_date: Optional[date] = Field(None, description="Start date for report")
    end_date: Optional[date] = Field(None, description="End date for report")


class ReportFilters(BaseModel):
    """Common filters for reports"""
    date_range: Optional[DateRange] = None
    user_id: Optional[UUID] = None
    patron_group_id: Optional[UUID] = None
    item_id: Optional[UUID] = None
    instance_id: Optional[UUID] = None
    vendor_id: Optional[UUID] = None
    fund_id: Optional[UUID] = None
    status: Optional[str] = None
    limit: int = Field(1000, ge=1, le=10000, description="Maximum number of records")
    offset: int = Field(0, ge=0, description="Offset for pagination")


class CirculationReportRequest(BaseModel):
    """Request schema for circulation report"""
    report_type: ReportType = ReportType.CIRCULATION
    filters: Optional[ReportFilters] = Field(default_factory=ReportFilters)
    export_format: ExportFormat = ExportFormat.CSV
    include_charts: bool = Field(False, description="Include charts in PDF export")
    group_by: Optional[str] = Field(None, description="Group by field (patron_group, month, etc.)")


class CollectionReportRequest(BaseModel):
    """Request schema for collection/inventory report"""
    report_type: ReportType = ReportType.COLLECTION
    filters: Optional[ReportFilters] = Field(default_factory=ReportFilters)
    export_format: ExportFormat = ExportFormat.CSV
    include_statistics: bool = Field(True, description="Include statistical summary")
    group_by: Optional[str] = Field(None, description="Group by field (type, language, subject)")


class FinancialReportRequest(BaseModel):
    """Request schema for financial/acquisitions report"""
    report_type: ReportType = ReportType.FINANCIAL
    filters: Optional[ReportFilters] = Field(default_factory=ReportFilters)
    export_format: ExportFormat = ExportFormat.CSV
    include_charts: bool = Field(False, description="Include charts in PDF export")
    summary_only: bool = Field(False, description="Only show summary totals")


class OverdueReportRequest(BaseModel):
    """Request schema for overdue items report"""
    report_type: ReportType = ReportType.OVERDUE
    filters: Optional[ReportFilters] = Field(default_factory=ReportFilters)
    export_format: ExportFormat = ExportFormat.CSV
    min_days_overdue: int = Field(1, ge=1, description="Minimum days overdue")
    include_fines: bool = Field(True, description="Include fine calculations")


class ReportData(BaseModel):
    """Report data response"""
    report_type: ReportType
    title: str
    description: Optional[str] = None
    generated_at: datetime
    filters_applied: Dict[str, Any]
    total_records: int
    data: List[Dict[str, Any]]
    summary: Optional[Dict[str, Any]] = None
    charts: Optional[List[Dict[str, Any]]] = None


class ReportMetadata(BaseModel):
    """Metadata about a generated report"""
    report_id: str
    report_type: ReportType
    title: str
    generated_at: datetime
    generated_by: UUID
    filters_applied: Dict[str, Any]
    export_format: ExportFormat
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    record_count: int


class CirculationStats(BaseModel):
    """Circulation statistics summary"""
    total_checkouts: int = 0
    total_checkins: int = 0
    total_renewals: int = 0
    active_loans: int = 0
    overdue_loans: int = 0
    holds_placed: int = 0
    holds_filled: int = 0
    average_loan_period: Optional[float] = None
    top_borrowed_items: Optional[List[Dict[str, Any]]] = None
    busiest_days: Optional[List[Dict[str, Any]]] = None


class CollectionStats(BaseModel):
    """Collection statistics summary"""
    total_instances: int = 0
    total_items: int = 0
    items_available: int = 0
    items_checked_out: int = 0
    items_on_hold: int = 0
    items_in_transit: int = 0
    by_type: Optional[Dict[str, int]] = None
    by_language: Optional[Dict[str, int]] = None
    by_subject: Optional[Dict[str, int]] = None
    top_circulating: Optional[List[Dict[str, Any]]] = None
    least_circulating: Optional[List[Dict[str, Any]]] = None


class FinancialStats(BaseModel):
    """Financial statistics summary"""
    total_allocated: float = 0.0
    total_expended: float = 0.0
    total_encumbered: float = 0.0
    total_available: float = 0.0
    total_invoices: int = 0
    total_invoice_amount: float = 0.0
    paid_invoices: int = 0
    paid_amount: float = 0.0
    pending_invoices: int = 0
    pending_amount: float = 0.0
    by_fund: Optional[Dict[str, Dict[str, float]]] = None
    by_vendor: Optional[Dict[str, float]] = None
    top_expenditures: Optional[List[Dict[str, Any]]] = None


class UserStats(BaseModel):
    """User statistics summary"""
    total_users: int = 0
    active_users: int = 0
    by_patron_group: Optional[Dict[str, int]] = None
    users_with_overdues: int = 0
    users_with_holds: int = 0
    users_with_fines: int = 0
    average_items_per_user: Optional[float] = None
    top_borrowers: Optional[List[Dict[str, Any]]] = None


class DashboardStats(BaseModel):
    """Combined dashboard statistics"""
    circulation: CirculationStats
    collection: CollectionStats
    financial: FinancialStats
    users: UserStats
    generated_at: datetime
