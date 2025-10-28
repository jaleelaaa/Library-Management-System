"""
Comprehensive tests for Reports API endpoints.
Tests dashboard stats, circulation reports, collection reports, and exports.
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

# ============================================================================
# Dashboard Statistics Tests
# ============================================================================

@pytest.mark.asyncio
async def test_get_dashboard_stats(client: AsyncClient, auth_headers: dict):
    """Test getting dashboard statistics"""
    response = await client.get(
        "/api/v1/reports/dashboard-stats",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "circulation" in data
    assert "collection" in data
    assert "financial" in data
    assert "users" in data


# ============================================================================
# Circulation Report Tests
# ============================================================================

@pytest.mark.asyncio
async def test_circulation_report_json(client: AsyncClient, auth_headers: dict):
    """Test circulation report in JSON format"""
    report_data = {
        "start_date": (datetime.now() - timedelta(days=30)).isoformat(),
        "end_date": datetime.now().isoformat(),
        "format": "json"
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "report_type" in data
    assert "data" in data
    assert "summary" in data


@pytest.mark.asyncio
async def test_circulation_report_csv(client: AsyncClient, auth_headers: dict):
    """Test circulation report in CSV format"""
    report_data = {
        "start_date": (datetime.now() - timedelta(days=7)).isoformat(),
        "end_date": datetime.now().isoformat(),
        "format": "csv"
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv"


@pytest.mark.asyncio
async def test_circulation_report_excel(client: AsyncClient, auth_headers: dict):
    """Test circulation report in Excel format"""
    report_data = {
        "start_date": (datetime.now() - timedelta(days=7)).isoformat(),
        "end_date": datetime.now().isoformat(),
        "format": "excel"
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    assert "application/vnd.openxmlformats" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_circulation_report_pdf(client: AsyncClient, auth_headers: dict):
    """Test circulation report in PDF format"""
    report_data = {
        "start_date": (datetime.now() - timedelta(days=7)).isoformat(),
        "end_date": datetime.now().isoformat(),
        "format": "pdf"
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


# ============================================================================
# Collection Report Tests
# ============================================================================

@pytest.mark.asyncio
async def test_collection_report(client: AsyncClient, auth_headers: dict):
    """Test collection report"""
    report_data = {
        "include_statistics": True,
        "format": "json"
    }

    response = await client.post(
        "/api/v1/reports/collection",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "report_type" in data
    assert data["report_type"] == "collection"


# ============================================================================
# Overdue Report Tests
# ============================================================================

@pytest.mark.asyncio
async def test_overdue_report(client: AsyncClient, auth_headers: dict):
    """Test overdue items report"""
    report_data = {
        "min_days_overdue": 1,
        "include_fines": True,
        "format": "json"
    }

    response = await client.post(
        "/api/v1/reports/overdue",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "report_type" in data
    assert data["report_type"] == "overdue"


@pytest.mark.asyncio
async def test_overdue_report_min_days_filter(client: AsyncClient, auth_headers: dict):
    """Test overdue report with minimum days filter"""
    report_data = {
        "min_days_overdue": 7,
        "format": "json"
    }

    response = await client.post(
        "/api/v1/reports/overdue",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200


# ============================================================================
# Financial Report Tests
# ============================================================================

@pytest.mark.asyncio
async def test_financial_report(client: AsyncClient, auth_headers: dict):
    """Test financial/acquisitions report"""
    report_data = {
        "start_date": (datetime.now() - timedelta(days=90)).isoformat(),
        "end_date": datetime.now().isoformat(),
        "format": "json"
    }

    response = await client.post(
        "/api/v1/reports/financial",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "report_type" in data
    assert data["report_type"] == "financial"


# ============================================================================
# Error Handling Tests
# ============================================================================

@pytest.mark.asyncio
async def test_report_invalid_date_range(client: AsyncClient, auth_headers: dict):
    """Test report with invalid date range (end before start)"""
    report_data = {
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() - timedelta(days=30)).isoformat(),
        "format": "json"
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    # Should return validation error
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_report_invalid_format(client: AsyncClient, auth_headers: dict):
    """Test report with invalid format"""
    report_data = {
        "start_date": (datetime.now() - timedelta(days=7)).isoformat(),
        "end_date": datetime.now().isoformat(),
        "format": "invalid_format"
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_report_missing_required_fields(client: AsyncClient, auth_headers: dict):
    """Test report with missing required fields"""
    report_data = {
        "format": "json"
        # Missing dates
    }

    response = await client.post(
        "/api/v1/reports/circulation",
        json=report_data,
        headers=auth_headers
    )

    # Depending on implementation, might use defaults or require fields
    assert response.status_code in [200, 400, 422]


@pytest.mark.asyncio
async def test_unauthorized_report_access(client: AsyncClient):
    """Test accessing reports without authentication"""
    response = await client.get("/api/v1/reports/dashboard-stats")
    assert response.status_code == 401


# ============================================================================
# Export Format Tests
# ============================================================================

@pytest.mark.asyncio
async def test_all_export_formats(client: AsyncClient, auth_headers: dict):
    """Test all export formats are supported"""
    formats = ["json", "csv", "excel", "pdf"]

    for fmt in formats:
        report_data = {
            "start_date": (datetime.now() - timedelta(days=7)).isoformat(),
            "end_date": datetime.now().isoformat(),
            "format": fmt
        }

        response = await client.post(
            "/api/v1/reports/circulation",
            json=report_data,
            headers=auth_headers
        )

        assert response.status_code == 200, f"Format {fmt} failed"
