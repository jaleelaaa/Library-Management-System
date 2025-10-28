"""
Comprehensive tests for Acquisitions API endpoints.
Tests vendors, purchase orders, order lines, invoices, funds, and budgets.
"""

import pytest
from uuid import uuid4
from datetime import datetime, date
from decimal import Decimal
from httpx import AsyncClient

# ============================================================================
# Vendor Tests
# ============================================================================

@pytest.mark.asyncio
async def test_create_vendor(client: AsyncClient, auth_headers: dict, test_tenant):
    """Test creating a new vendor"""
    vendor_data = {
        "name": "Test Book Distributor",
        "code": "TBD001",
        "vendor_status": "active",
        "contact_name": "John Doe",
        "contact_email": "john@testdist.com",
        "contact_phone": "+1-555-0123",
        "address": {
            "street": "123 Main St",
            "city": "Boston",
            "state": "MA",
            "postal_code": "02101",
            "country": "USA"
        },
        "payment_terms": "Net 30",
        "discount_percentage": 10.5,
        "currency": "USD"
    }

    response = await client.post(
        "/api/v1/acquisitions/vendors",
        json=vendor_data,
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == vendor_data["name"]
    assert data["code"] == vendor_data["code"]
    assert data["vendor_status"] == "active"
    assert data["contact_email"] == vendor_data["contact_email"]
    assert "id" in data
    assert "created_date" in data


@pytest.mark.asyncio
async def test_get_vendors(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test listing all vendors"""
    response = await client.get(
        "/api/v1/acquisitions/vendors",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) > 0
    assert data["items"][0]["name"] == test_vendor.name


@pytest.mark.asyncio
async def test_get_vendor_by_id(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test getting a specific vendor"""
    response = await client.get(
        f"/api/v1/acquisitions/vendors/{test_vendor.id}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_vendor.id)
    assert data["name"] == test_vendor.name


@pytest.mark.asyncio
async def test_update_vendor(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test updating a vendor"""
    update_data = {
        "name": "Updated Book Distributor",
        "contact_phone": "+1-555-9999"
    }

    response = await client.put(
        f"/api/v1/acquisitions/vendors/{test_vendor.id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["contact_phone"] == update_data["contact_phone"]


@pytest.mark.asyncio
async def test_delete_vendor(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test deleting a vendor"""
    response = await client.delete(
        f"/api/v1/acquisitions/vendors/{test_vendor.id}",
        headers=auth_headers
    )

    assert response.status_code == 204

    # Verify vendor is deleted
    get_response = await client.get(
        f"/api/v1/acquisitions/vendors/{test_vendor.id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_create_vendor_duplicate_code(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test creating vendor with duplicate code fails"""
    vendor_data = {
        "name": "Another Vendor",
        "code": test_vendor.code,  # Duplicate code
        "vendor_status": "active"
    }

    response = await client.post(
        "/api/v1/acquisitions/vendors",
        json=vendor_data,
        headers=auth_headers
    )

    assert response.status_code == 400


# ============================================================================
# Purchase Order Tests
# ============================================================================

@pytest.mark.asyncio
async def test_create_purchase_order(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test creating a purchase order"""
    po_data = {
        "po_number": f"PO-{datetime.now().strftime('%Y%m%d')}-001",
        "vendor_id": str(test_vendor.id),
        "order_date": date.today().isoformat(),
        "status": "pending",
        "total_amount": 1500.00,
        "currency": "USD",
        "notes": "Initial test order"
    }

    response = await client.post(
        "/api/v1/acquisitions/purchase-orders",
        json=po_data,
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["po_number"] == po_data["po_number"]
    assert data["vendor_id"] == str(test_vendor.id)
    assert data["status"] == "pending"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_purchase_orders(client: AsyncClient, auth_headers: dict):
    """Test listing purchase orders"""
    response = await client.get(
        "/api/v1/acquisitions/purchase-orders",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_filter_purchase_orders_by_vendor(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test filtering purchase orders by vendor"""
    response = await client.get(
        f"/api/v1/acquisitions/purchase-orders?vendor_id={test_vendor.id}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["vendor_id"] == str(test_vendor.id)


@pytest.mark.asyncio
async def test_filter_purchase_orders_by_status(client: AsyncClient, auth_headers: dict):
    """Test filtering purchase orders by status"""
    response = await client.get(
        "/api/v1/acquisitions/purchase-orders?status=pending",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["status"] == "pending"


@pytest.mark.asyncio
async def test_update_purchase_order_status(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test updating purchase order status"""
    # First create a PO
    po_data = {
        "po_number": f"PO-{datetime.now().strftime('%Y%m%d')}-002",
        "vendor_id": str(test_vendor.id),
        "order_date": date.today().isoformat(),
        "status": "pending",
        "total_amount": 500.00
    }

    create_response = await client.post(
        "/api/v1/acquisitions/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    po_id = create_response.json()["id"]

    # Update status
    update_data = {"status": "approved"}
    response = await client.put(
        f"/api/v1/acquisitions/purchase-orders/{po_id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved"


# ============================================================================
# Order Line Tests
# ============================================================================

@pytest.mark.asyncio
async def test_create_order_line(client: AsyncClient, auth_headers: dict, test_vendor, test_instance):
    """Test creating an order line"""
    # First create a PO
    po_data = {
        "po_number": f"PO-{datetime.now().strftime('%Y%m%d')}-003",
        "vendor_id": str(test_vendor.id),
        "order_date": date.today().isoformat(),
        "status": "pending",
        "total_amount": 100.00
    }
    po_response = await client.post(
        "/api/v1/acquisitions/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    po_id = po_response.json()["id"]

    # Create order line
    line_data = {
        "purchase_order_id": po_id,
        "instance_id": str(test_instance.id),
        "quantity": 5,
        "unit_price": 20.00,
        "total_price": 100.00,
        "currency": "USD",
        "notes": "Test order line"
    }

    response = await client.post(
        f"/api/v1/acquisitions/purchase-orders/{po_id}/lines",
        json=line_data,
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["quantity"] == 5
    assert float(data["unit_price"]) == 20.00


@pytest.mark.asyncio
async def test_get_order_lines(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test listing order lines for a purchase order"""
    # Create PO
    po_data = {
        "po_number": f"PO-{datetime.now().strftime('%Y%m%d')}-004",
        "vendor_id": str(test_vendor.id),
        "order_date": date.today().isoformat(),
        "status": "pending",
        "total_amount": 100.00
    }
    po_response = await client.post(
        "/api/v1/acquisitions/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    po_id = po_response.json()["id"]

    # Get order lines
    response = await client.get(
        f"/api/v1/acquisitions/purchase-orders/{po_id}/lines",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


# ============================================================================
# Invoice Tests
# ============================================================================

@pytest.mark.asyncio
async def test_create_invoice(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test creating an invoice"""
    invoice_data = {
        "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d')}-001",
        "vendor_id": str(test_vendor.id),
        "invoice_date": date.today().isoformat(),
        "status": "open",
        "total_amount": 1000.00,
        "currency": "USD",
        "payment_due_date": "2025-12-31"
    }

    response = await client.post(
        "/api/v1/acquisitions/invoices",
        json=invoice_data,
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["invoice_number"] == invoice_data["invoice_number"]
    assert data["status"] == "open"


@pytest.mark.asyncio
async def test_get_invoices(client: AsyncClient, auth_headers: dict):
    """Test listing invoices"""
    response = await client.get(
        "/api/v1/acquisitions/invoices",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_update_invoice_status(client: AsyncClient, auth_headers: dict, test_vendor):
    """Test updating invoice status to paid"""
    # Create invoice
    invoice_data = {
        "invoice_number": f"INV-{datetime.now().strftime('%Y%m%d')}-002",
        "vendor_id": str(test_vendor.id),
        "invoice_date": date.today().isoformat(),
        "status": "open",
        "total_amount": 500.00
    }
    create_response = await client.post(
        "/api/v1/acquisitions/invoices",
        json=invoice_data,
        headers=auth_headers
    )
    invoice_id = create_response.json()["id"]

    # Update to paid
    update_data = {"status": "paid"}
    response = await client.put(
        f"/api/v1/acquisitions/invoices/{invoice_id}",
        json=update_data,
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "paid"


@pytest.mark.asyncio
async def test_filter_invoices_by_status(client: AsyncClient, auth_headers: dict):
    """Test filtering invoices by status"""
    response = await client.get(
        "/api/v1/acquisitions/invoices?status=open",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["status"] == "open"


# ============================================================================
# Fund Tests
# ============================================================================

@pytest.mark.asyncio
async def test_create_fund(client: AsyncClient, auth_headers: dict):
    """Test creating a fund"""
    fund_data = {
        "code": "GEN2025",
        "name": "General Fund 2025",
        "description": "Main library fund for 2025",
        "fund_status": "active",
        "allocated_amount": 50000.00,
        "available_amount": 50000.00,
        "currency": "USD"
    }

    response = await client.post(
        "/api/v1/acquisitions/funds",
        json=fund_data,
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["code"] == fund_data["code"]
    assert float(data["allocated_amount"]) == 50000.00


@pytest.mark.asyncio
async def test_get_funds(client: AsyncClient, auth_headers: dict):
    """Test listing funds"""
    response = await client.get(
        "/api/v1/acquisitions/funds",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data


# ============================================================================
# Error Handling Tests
# ============================================================================

@pytest.mark.asyncio
async def test_get_nonexistent_vendor(client: AsyncClient, auth_headers: dict):
    """Test getting a vendor that doesn't exist"""
    fake_id = uuid4()
    response = await client.get(
        f"/api/v1/acquisitions/vendors/{fake_id}",
        headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_vendor_missing_required_fields(client: AsyncClient, auth_headers: dict):
    """Test creating vendor with missing required fields"""
    vendor_data = {
        "name": "Incomplete Vendor"
        # Missing code
    }

    response = await client.post(
        "/api/v1/acquisitions/vendors",
        json=vendor_data,
        headers=auth_headers
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """Test accessing vendors without authentication"""
    response = await client.get("/api/v1/acquisitions/vendors")
    assert response.status_code == 401


# ============================================================================
# Pagination Tests
# ============================================================================

@pytest.mark.asyncio
async def test_vendors_pagination(client: AsyncClient, auth_headers: dict):
    """Test vendor pagination"""
    response = await client.get(
        "/api/v1/acquisitions/vendors?skip=0&limit=10",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "skip" in data
    assert "limit" in data
    assert len(data["items"]) <= 10


# ============================================================================
# Integration Tests
# ============================================================================

@pytest.mark.asyncio
async def test_complete_acquisition_workflow(client: AsyncClient, auth_headers: dict, test_instance):
    """Test complete workflow: vendor -> PO -> order line -> invoice"""

    # 1. Create vendor
    vendor_data = {
        "name": "Complete Test Vendor",
        "code": "CTV001",
        "vendor_status": "active"
    }
    vendor_response = await client.post(
        "/api/v1/acquisitions/vendors",
        json=vendor_data,
        headers=auth_headers
    )
    assert vendor_response.status_code == 201
    vendor_id = vendor_response.json()["id"]

    # 2. Create Purchase Order
    po_data = {
        "po_number": f"PO-WORKFLOW-{datetime.now().strftime('%Y%m%d')}",
        "vendor_id": vendor_id,
        "order_date": date.today().isoformat(),
        "status": "pending",
        "total_amount": 200.00
    }
    po_response = await client.post(
        "/api/v1/acquisitions/purchase-orders",
        json=po_data,
        headers=auth_headers
    )
    assert po_response.status_code == 201
    po_id = po_response.json()["id"]

    # 3. Create order line
    line_data = {
        "purchase_order_id": po_id,
        "instance_id": str(test_instance.id),
        "quantity": 10,
        "unit_price": 20.00,
        "total_price": 200.00
    }
    line_response = await client.post(
        f"/api/v1/acquisitions/purchase-orders/{po_id}/lines",
        json=line_data,
        headers=auth_headers
    )
    assert line_response.status_code == 201

    # 4. Create invoice
    invoice_data = {
        "invoice_number": f"INV-WORKFLOW-{datetime.now().strftime('%Y%m%d')}",
        "vendor_id": vendor_id,
        "invoice_date": date.today().isoformat(),
        "status": "open",
        "total_amount": 200.00
    }
    invoice_response = await client.post(
        "/api/v1/acquisitions/invoices",
        json=invoice_data,
        headers=auth_headers
    )
    assert invoice_response.status_code == 201

    # Verify entire workflow
    final_po = await client.get(
        f"/api/v1/acquisitions/purchase-orders/{po_id}",
        headers=auth_headers
    )
    assert final_po.status_code == 200
    assert final_po.json()["vendor_id"] == vendor_id
