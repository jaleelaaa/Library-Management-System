"""
Export Service
Generate reports in various formats (CSV, Excel, PDF)
"""

import io
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from uuid import uuid4

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.schemas.report import ReportType, ExportFormat, ReportData

logger = logging.getLogger(__name__)


class ExportService:
    """Service for exporting data to various formats"""

    def __init__(self):
        """Initialize export service"""
        self.temp_dir = Path("/tmp/folio_reports")
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def export_to_csv(self, data: List[Dict[str, Any]], filename: Optional[str] = None) -> bytes:
        """
        Export data to CSV format

        Args:
            data: List of dictionaries containing data
            filename: Optional filename (not used, for interface consistency)

        Returns:
            CSV file content as bytes
        """
        try:
            df = pd.DataFrame(data)

            # Create CSV in memory
            output = io.StringIO()
            df.to_csv(output, index=False, encoding='utf-8')

            csv_content = output.getvalue()
            output.close()

            return csv_content.encode('utf-8')

        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            raise

    def export_to_excel(
        self,
        data: List[Dict[str, Any]],
        filename: Optional[str] = None,
        sheet_name: str = "Report",
        summary: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Export data to Excel format with formatting

        Args:
            data: List of dictionaries containing data
            filename: Optional filename (not used, for interface consistency)
            sheet_name: Name of the worksheet
            summary: Optional summary statistics to include

        Returns:
            Excel file content as bytes
        """
        try:
            df = pd.DataFrame(data)

            # Create Excel file in memory
            output = io.BytesIO()

            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                # Write main data
                df.to_excel(writer, sheet_name=sheet_name, index=False, startrow=0)

                # Get workbook and worksheet objects
                workbook = writer.book
                worksheet = writer.sheets[sheet_name]

                # Add formats
                header_format = workbook.add_format({
                    'bold': True,
                    'text_wrap': True,
                    'valign': 'top',
                    'fg_color': '#106BA3',
                    'font_color': 'white',
                    'border': 1
                })

                # Format header row
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                    # Auto-adjust column width
                    column_len = max(df[value].astype(str).map(len).max(), len(value))
                    worksheet.set_column(col_num, col_num, min(column_len + 2, 50))

                # Add summary sheet if provided
                if summary:
                    summary_df = pd.DataFrame([summary])
                    summary_df.to_excel(writer, sheet_name='Summary', index=False)

                    summary_sheet = writer.sheets['Summary']
                    for col_num, value in enumerate(summary_df.columns.values):
                        summary_sheet.write(0, col_num, value, header_format)

            excel_content = output.getvalue()
            output.close()

            return excel_content

        except Exception as e:
            logger.error(f"Error exporting to Excel: {e}")
            raise

    def export_to_pdf(
        self,
        report_data: ReportData,
        filename: Optional[str] = None,
        include_charts: bool = False
    ) -> bytes:
        """
        Export data to PDF format with formatting

        Args:
            report_data: ReportData object containing all report information
            filename: Optional filename (not used, for interface consistency)
            include_charts: Whether to include charts (if available)

        Returns:
            PDF file content as bytes
        """
        try:
            # Create PDF in memory
            output = io.BytesIO()

            # Create document
            doc = SimpleDocTemplate(
                output,
                pagesize=letter,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.75*inch,
                bottomMargin=0.5*inch
            )

            # Container for PDF elements
            elements = []

            # Styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#106BA3'),
                spaceAfter=30,
                alignment=TA_CENTER
            )

            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#106BA3'),
                spaceAfter=12,
                spaceBefore=12
            )

            # Title
            title = Paragraph(report_data.title, title_style)
            elements.append(title)

            # Description
            if report_data.description:
                desc = Paragraph(report_data.description, styles['Normal'])
                elements.append(desc)

            elements.append(Spacer(1, 0.2*inch))

            # Report metadata
            metadata_data = [
                ['Report Type:', report_data.report_type.value.title()],
                ['Generated:', report_data.generated_at.strftime('%Y-%m-%d %H:%M:%S')],
                ['Total Records:', str(report_data.total_records)]
            ]

            metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
            metadata_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#106BA3')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))

            elements.append(metadata_table)
            elements.append(Spacer(1, 0.3*inch))

            # Summary section
            if report_data.summary:
                summary_heading = Paragraph('Summary', heading_style)
                elements.append(summary_heading)

                summary_data = [[k.replace('_', ' ').title(), str(v)] for k, v in report_data.summary.items()]

                summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
                summary_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F4F4F4')),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#106BA3')),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))

                elements.append(summary_table)
                elements.append(Spacer(1, 0.3*inch))

            # Data table
            if report_data.data:
                data_heading = Paragraph('Report Data', heading_style)
                elements.append(data_heading)

                # Limit data for PDF (first 100 records)
                data_subset = report_data.data[:100]

                # Convert data to table format
                if data_subset:
                    # Get column headers
                    headers = list(data_subset[0].keys())

                    # Prepare table data
                    table_data = [headers]
                    for row in data_subset:
                        table_data.append([str(row.get(h, '')) for h in headers])

                    # Calculate column widths based on number of columns
                    num_cols = len(headers)
                    col_width = 6.5*inch / num_cols

                    data_table = Table(table_data, colWidths=[col_width] * num_cols, repeatRows=1)
                    data_table.setStyle(TableStyle([
                        # Header row
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#106BA3')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 9),
                        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                        # Data rows
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 8),
                        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        # Grid
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        # Alternating row colors
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9F9F9')]),
                    ]))

                    elements.append(data_table)

                    # Add note if data was truncated
                    if len(report_data.data) > 100:
                        note = Paragraph(
                            f"<i>Note: Showing first 100 of {report_data.total_records} records. "
                            f"Download CSV or Excel for complete data.</i>",
                            styles['Italic']
                        )
                        elements.append(Spacer(1, 0.1*inch))
                        elements.append(note)

            # Build PDF
            doc.build(elements)

            pdf_content = output.getvalue()
            output.close()

            return pdf_content

        except Exception as e:
            logger.error(f"Error exporting to PDF: {e}")
            raise

    def export_report(
        self,
        report_data: ReportData,
        export_format: ExportFormat,
        filename: Optional[str] = None
    ) -> bytes:
        """
        Export report data to specified format

        Args:
            report_data: ReportData object
            export_format: Format to export to
            filename: Optional custom filename

        Returns:
            Exported file content as bytes
        """
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{report_data.report_type.value}_report_{timestamp}"

        if export_format == ExportFormat.CSV:
            return self.export_to_csv(report_data.data, filename)
        elif export_format == ExportFormat.EXCEL:
            return self.export_to_excel(
                report_data.data,
                filename,
                sheet_name=report_data.title[:31],  # Excel sheet name limit
                summary=report_data.summary
            )
        elif export_format == ExportFormat.PDF:
            return self.export_to_pdf(report_data, filename)
        else:
            raise ValueError(f"Unsupported export format: {export_format}")


# Singleton instance
_export_service = None


def get_export_service() -> ExportService:
    """Get singleton export service instance"""
    global _export_service
    if _export_service is None:
        _export_service = ExportService()
    return _export_service
