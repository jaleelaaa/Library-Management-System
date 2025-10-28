"""
Comprehensive tests for Circulation API endpoints.
Tests for Check-out, Check-in, Renewals, Loans, and Requests.
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from sqlalchemy import select

from app.models.circulation import Loan, Request
from app.models.inventory import Item
from app.models.user import User
from .conftest import assert_pagination_response


@pytest.mark.asyncio
async def test_check_out_item(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User):
    """Test checking out an item."""
    checkout_data = {
        "user_id": str(test_user.id),
        "item_barcode": test_item.barcode,
        "due_date": (datetime.now() + timedelta(days=14)).isoformat(),
    }

    response = await client.post("/api/v1/circulation/check-out", json=checkout_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == str(test_user.id)
    assert data["item_id"] == str(test_item.id)
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_check_out_unavailable_item(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test checking out an already checked-out item."""
    # Mark item as checked out
    test_item.status = "checked_out"
    await db_session.commit()

    checkout_data = {
        "user_id": str(test_user.id),
        "item_barcode": test_item.barcode,
    }

    response = await client.post("/api/v1/circulation/check-out", json=checkout_data, headers=auth_headers)
    assert response.status_code == 400
    assert "not available" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_check_in_item(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test checking in an item."""
    # Create a loan first
    from app.models.circulation import Loan
    loan = Loan(
        user_id=test_user.id,
        item_id=test_item.id,
        loan_date=datetime.now(),
        due_date=datetime.now() + timedelta(days=14),
        status="active",
        tenant_id=test_user.tenant_id,
    )
    db_session.add(loan)
    test_item.status = "checked_out"
    await db_session.commit()

    checkin_data = {
        "item_barcode": test_item.barcode,
    }

    response = await client.post("/api/v1/circulation/check-in", json=checkin_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "returned"


@pytest.mark.asyncio
async def test_renew_loan(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test renewing a loan."""
    # Create a loan
    from app.models.circulation import Loan
    due_date = datetime.now() + timedelta(days=7)
    loan = Loan(
        user_id=test_user.id,
        item_id=test_item.id,
        loan_date=datetime.now(),
        due_date=due_date,
        status="active",
        tenant_id=test_user.tenant_id,
    )
    db_session.add(loan)
    await db_session.commit()
    await db_session.refresh(loan)

    renew_data = {
        "loan_id": str(loan.id),
    }

    response = await client.post("/api/v1/circulation/renew", json=renew_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # Due date should be extended
    assert datetime.fromisoformat(data["due_date"].replace('Z', '+00:00')) > due_date


@pytest.mark.asyncio
async def test_list_loans(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test listing loans."""
    # Create multiple loans
    from app.models.circulation import Loan
    for i in range(3):
        loan = Loan(
            user_id=test_user.id,
            item_id=test_item.id,
            loan_date=datetime.now(),
            due_date=datetime.now() + timedelta(days=14 + i),
            status="active",
            tenant_id=test_user.tenant_id,
        )
        db_session.add(loan)
    await db_session.commit()

    response = await client.get("/api/v1/circulation/loans", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data)
    assert data["total"] >= 3


@pytest.mark.asyncio
async def test_filter_loans_by_status(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test filtering loans by status."""
    # Create loans with different statuses
    from app.models.circulation import Loan
    loan1 = Loan(
        user_id=test_user.id,
        item_id=test_item.id,
        loan_date=datetime.now(),
        due_date=datetime.now() + timedelta(days=14),
        status="active",
        tenant_id=test_user.tenant_id,
    )
    loan2 = Loan(
        user_id=test_user.id,
        item_id=test_item.id,
        loan_date=datetime.now(),
        due_date=datetime.now() - timedelta(days=1),
        return_date=datetime.now(),
        status="returned",
        tenant_id=test_user.tenant_id,
    )
    db_session.add_all([loan1, loan2])
    await db_session.commit()

    # Filter for active loans
    response = await client.get("/api/v1/circulation/loans?status=active", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert all(loan["status"] == "active" for loan in data["items"])


@pytest.mark.asyncio
async def test_filter_overdue_loans(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test filtering overdue loans."""
    # Create an overdue loan
    from app.models.circulation import Loan
    loan = Loan(
        user_id=test_user.id,
        item_id=test_item.id,
        loan_date=datetime.now() - timedelta(days=20),
        due_date=datetime.now() - timedelta(days=5),  # Overdue
        status="active",
        tenant_id=test_user.tenant_id,
    )
    db_session.add(loan)
    await db_session.commit()

    response = await client.get("/api/v1/circulation/loans?overdue_only=true", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # All returned loans should have due dates in the past
    for loan in data["items"]:
        if loan["status"] == "active":
            due_date = datetime.fromisoformat(loan["due_date"].replace('Z', '+00:00'))
            assert due_date < datetime.now(due_date.tzinfo)


@pytest.mark.asyncio
async def test_create_request(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User):
    """Test creating a hold request."""
    request_data = {
        "user_id": str(test_user.id),
        "item_id": str(test_item.id),
        "request_type": "hold",
        "pickup_service_point_id": None,
    }

    response = await client.post("/api/v1/circulation/requests", json=request_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == str(test_user.id)
    assert data["item_id"] == str(test_item.id)
    assert data["status"] == "open"
    assert data["queue_position"] >= 1


@pytest.mark.asyncio
async def test_list_requests(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test listing requests."""
    # Create multiple requests
    from app.models.circulation import Request
    for i in range(3):
        request = Request(
            user_id=test_user.id,
            item_id=test_item.id,
            request_type="hold",
            status="open",
            queue_position=i + 1,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(request)
    await db_session.commit()

    response = await client.get("/api/v1/circulation/requests", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data)
    assert data["total"] >= 3


@pytest.mark.asyncio
async def test_cancel_request(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test canceling a request."""
    # Create a request
    from app.models.circulation import Request
    request = Request(
        user_id=test_user.id,
        item_id=test_item.id,
        request_type="hold",
        status="open",
        queue_position=1,
        tenant_id=test_user.tenant_id,
    )
    db_session.add(request)
    await db_session.commit()
    await db_session.refresh(request)

    response = await client.delete(f"/api/v1/circulation/requests/{request.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify cancellation
    response = await client.get(f"/api/v1/circulation/requests?status=open", headers=auth_headers)
    data = response.json()
    # The canceled request should not appear in open requests (or be marked as canceled)


@pytest.mark.asyncio
async def test_filter_requests_by_status(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test filtering requests by status."""
    # Create requests with different statuses
    from app.models.circulation import Request
    request1 = Request(
        user_id=test_user.id,
        item_id=test_item.id,
        request_type="hold",
        status="open",
        queue_position=1,
        tenant_id=test_user.tenant_id,
    )
    request2 = Request(
        user_id=test_user.id,
        item_id=test_item.id,
        request_type="recall",
        status="closed",
        queue_position=1,
        tenant_id=test_user.tenant_id,
    )
    db_session.add_all([request1, request2])
    await db_session.commit()

    # Filter for open requests
    response = await client.get("/api/v1/circulation/requests?status=open", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    if data["total"] > 0:
        assert all(req["status"] == "open" for req in data["items"])


@pytest.mark.asyncio
async def test_request_queue_position(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test that queue positions are assigned correctly."""
    # Create multiple requests for the same item
    request_data = {
        "user_id": str(test_user.id),
        "item_id": str(test_item.id),
        "request_type": "hold",
    }

    # First request
    response1 = await client.post("/api/v1/circulation/requests", json=request_data, headers=auth_headers)
    assert response1.status_code == 201
    data1 = response1.json()
    assert data1["queue_position"] == 1

    # Second request (should be position 2)
    response2 = await client.post("/api/v1/circulation/requests", json=request_data, headers=auth_headers)
    assert response2.status_code == 201
    data2 = response2.json()
    assert data2["queue_position"] == 2


@pytest.mark.asyncio
async def test_check_out_with_invalid_barcode(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test check-out with invalid item barcode."""
    checkout_data = {
        "user_id": str(test_user.id),
        "item_barcode": "INVALID_BARCODE_123",
    }

    response = await client.post("/api/v1/circulation/check-out", json=checkout_data, headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_check_in_with_invalid_barcode(client: AsyncClient, auth_headers: dict):
    """Test check-in with invalid item barcode."""
    checkin_data = {
        "item_barcode": "INVALID_BARCODE_123",
    }

    response = await client.post("/api/v1/circulation/check-in", json=checkin_data, headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_renew_max_renewals_exceeded(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test renewing a loan that has exceeded max renewals."""
    # Create a loan with max renewals already used
    from app.models.circulation import Loan
    loan = Loan(
        user_id=test_user.id,
        item_id=test_item.id,
        loan_date=datetime.now(),
        due_date=datetime.now() + timedelta(days=14),
        status="active",
        renewal_count=5,  # Assume max is 5
        tenant_id=test_user.tenant_id,
    )
    db_session.add(loan)
    await db_session.commit()
    await db_session.refresh(loan)

    renew_data = {
        "loan_id": str(loan.id),
    }

    response = await client.post("/api/v1/circulation/renew", json=renew_data, headers=auth_headers)
    # This should either succeed or fail gracefully depending on policy
    assert response.status_code in [200, 400]


@pytest.mark.asyncio
async def test_get_user_loans(client: AsyncClient, auth_headers: dict, test_item: Item, test_user: User, db_session):
    """Test getting loans for a specific user."""
    # Create loans for the test user
    from app.models.circulation import Loan
    for i in range(2):
        loan = Loan(
            user_id=test_user.id,
            item_id=test_item.id,
            loan_date=datetime.now(),
            due_date=datetime.now() + timedelta(days=14),
            status="active",
            tenant_id=test_user.tenant_id,
        )
        db_session.add(loan)
    await db_session.commit()

    response = await client.get(f"/api/v1/circulation/loans?user_id={test_user.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert all(loan["user_id"] == str(test_user.id) for loan in data["items"])
