"""
Tests for Fee/Fine API endpoints.
"""

import pytest
from decimal import Decimal
from datetime import datetime, timedelta
from httpx import AsyncClient

from app.models.user import User
from app.models.tenant import Tenant
from app.models.fee import Fee, Payment, FeePolicy, FeeStatus, FeeType, PaymentMethod


@pytest.mark.asyncio
class TestFeeAPI:
    """Test Fee CRUD endpoints."""

    async def test_list_fees(self, client: AsyncClient, auth_headers, test_user):
        """Test listing fees."""
        response = await client.get("/api/v1/fees/fees", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_create_fee(self, client: AsyncClient, auth_headers, test_user):
        """Test creating a new fee."""
        fee_data = {
            "user_id": str(test_user.id),
            "fee_type": "manual",
            "amount": 10.50,
            "description": "Test fee",
            "reason": "Testing fee creation",
            "automated": False,
        }
        response = await client.post("/api/v1/fees/fees", json=fee_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 10.50
        assert data["remaining"] == 10.50
        assert data["paid_amount"] == 0.00
        assert data["status"] == "open"
        assert data["fee_type"] == "manual"

    async def test_create_fee_invalid_type(self, client: AsyncClient, auth_headers, test_user):
        """Test creating fee with invalid type."""
        fee_data = {
            "user_id": str(test_user.id),
            "fee_type": "invalid_type",
            "amount": 10.00,
        }
        response = await client.post("/api/v1/fees/fees", json=fee_data, headers=auth_headers)
        assert response.status_code == 422  # Validation error

    async def test_create_fee_nonexistent_user(self, client: AsyncClient, auth_headers):
        """Test creating fee for non-existent user."""
        fee_data = {
            "user_id": "00000000-0000-0000-0000-000000000000",
            "fee_type": "manual",
            "amount": 10.00,
        }
        response = await client.post("/api/v1/fees/fees", json=fee_data, headers=auth_headers)
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    async def test_get_fee(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test getting a specific fee."""
        # Create a fee
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.OVERDUE,
            amount=Decimal("15.00"),
            remaining=Decimal("15.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        response = await client.get(f"/api/v1/fees/fees/{fee.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(fee.id)
        assert data["amount"] == 15.00

    async def test_get_nonexistent_fee(self, client: AsyncClient, auth_headers):
        """Test getting non-existent fee."""
        response = await client.get("/api/v1/fees/fees/00000000-0000-0000-0000-000000000000", headers=auth_headers)
        assert response.status_code == 404

    async def test_update_fee(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test updating a fee."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("20.00"),
            remaining=Decimal("20.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        update_data = {
            "description": "Updated description",
            "reason": "Updated reason",
        }
        response = await client.put(f"/api/v1/fees/fees/{fee.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["reason"] == "Updated reason"

    async def test_delete_fee_without_payments(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test deleting a fee with no payments."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("10.00"),
            remaining=Decimal("10.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        response = await client.delete(f"/api/v1/fees/fees/{fee.id}", headers=auth_headers)
        assert response.status_code == 204

    async def test_delete_fee_with_payments(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test deleting a fee with payments (should fail)."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("10.00"),
            remaining=Decimal("5.00"),
            paid_amount=Decimal("5.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        payment = Payment(
            fee_id=fee.id,
            user_id=test_user.id,
            payment_method=PaymentMethod.CASH,
            amount=Decimal("5.00"),
            balance=Decimal("5.00"),
            tenant_id=test_user.tenant_id,
        )
        db_session.add(payment)
        await db_session.commit()

        response = await client.delete(f"/api/v1/fees/fees/{fee.id}", headers=auth_headers)
        assert response.status_code == 400
        assert "Cannot delete fee with existing payments" in response.json()["detail"]

    async def test_filter_fees_by_status(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test filtering fees by status."""
        # Create open and closed fees
        open_fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("10.00"),
            remaining=Decimal("10.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        closed_fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("20.00"),
            remaining=Decimal("0.00"),
            paid_amount=Decimal("20.00"),
            status=FeeStatus.CLOSED,
            tenant_id=test_user.tenant_id,
        )
        db_session.add_all([open_fee, closed_fee])
        await db_session.commit()

        response = await client.get("/api/v1/fees/fees?status=open", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert all(fee["status"] == "open" for fee in data["items"])


@pytest.mark.asyncio
class TestPaymentAPI:
    """Test Payment endpoints."""

    async def test_create_payment(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test recording a payment."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.OVERDUE,
            amount=Decimal("30.00"),
            remaining=Decimal("30.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        payment_data = {
            "fee_id": str(fee.id),
            "payment_method": "cash",
            "amount": 10.00,
            "comments": "Partial payment",
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/payments",
            json=payment_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 10.00
        assert data["balance"] == 20.00
        assert data["payment_method"] == "cash"

        # Verify fee was updated
        await db_session.refresh(fee)
        assert fee.paid_amount == Decimal("10.00")
        assert fee.remaining == Decimal("20.00")
        assert fee.status == FeeStatus.OPEN

    async def test_create_payment_full_amount(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test recording a payment for full amount (closes fee)."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("25.00"),
            remaining=Decimal("25.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        payment_data = {
            "fee_id": str(fee.id),
            "payment_method": "credit_card",
            "amount": 25.00,
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/payments",
            json=payment_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["balance"] == 0.00

        # Verify fee was closed
        await db_session.refresh(fee)
        assert fee.status == FeeStatus.CLOSED
        assert fee.remaining == Decimal("0.00")
        assert fee.closed_date is not None

    async def test_create_payment_exceeds_remaining(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test payment exceeding remaining balance."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("10.00"),
            remaining=Decimal("10.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        payment_data = {
            "fee_id": str(fee.id),
            "payment_method": "cash",
            "amount": 15.00,  # More than remaining
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/payments",
            json=payment_data,
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "exceeds remaining balance" in response.json()["detail"]

    async def test_create_payment_closed_fee(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test payment on closed fee."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("10.00"),
            remaining=Decimal("0.00"),
            paid_amount=Decimal("10.00"),
            status=FeeStatus.CLOSED,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        payment_data = {
            "fee_id": str(fee.id),
            "payment_method": "cash",
            "amount": 5.00,
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/payments",
            json=payment_data,
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "Cannot add payment to closed fee" in response.json()["detail"]

    async def test_list_fee_payments(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test listing payments for a fee."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("30.00"),
            remaining=Decimal("10.00"),
            paid_amount=Decimal("20.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        # Create payments
        payment1 = Payment(
            fee_id=fee.id,
            user_id=test_user.id,
            payment_method=PaymentMethod.CASH,
            amount=Decimal("10.00"),
            balance=Decimal("20.00"),
            tenant_id=test_user.tenant_id,
        )
        payment2 = Payment(
            fee_id=fee.id,
            user_id=test_user.id,
            payment_method=PaymentMethod.CHECK,
            amount=Decimal("10.00"),
            balance=Decimal("10.00"),
            tenant_id=test_user.tenant_id,
        )
        db_session.add_all([payment1, payment2])
        await db_session.commit()

        response = await client.get(f"/api/v1/fees/fees/{fee.id}/payments", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2


@pytest.mark.asyncio
class TestWaiveAPI:
    """Test waive/forgive endpoints."""

    async def test_waive_full_fee(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test waiving full fee amount."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.OVERDUE,
            amount=Decimal("15.00"),
            remaining=Decimal("15.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        waive_data = {
            "reason": "First offense waived",
            "payment_method": "waive",
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/waive",
            json=waive_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 15.00
        assert data["balance"] == 0.00

        # Verify fee was closed
        await db_session.refresh(fee)
        assert fee.status == FeeStatus.CLOSED
        assert fee.remaining == Decimal("0.00")

    async def test_waive_partial_fee(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test waiving partial fee amount."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("20.00"),
            remaining=Decimal("20.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        waive_data = {
            "amount": 10.00,
            "reason": "Partial waive approved",
            "payment_method": "forgive",
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/waive",
            json=waive_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 10.00
        assert data["balance"] == 10.00

        # Verify fee still open
        await db_session.refresh(fee)
        assert fee.status == FeeStatus.OPEN
        assert fee.remaining == Decimal("10.00")

    async def test_waive_closed_fee(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test waiving closed fee (should fail)."""
        fee = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("10.00"),
            remaining=Decimal("0.00"),
            paid_amount=Decimal("10.00"),
            status=FeeStatus.CLOSED,
            tenant_id=test_user.tenant_id,
        )
        db_session.add(fee)
        await db_session.commit()
        await db_session.refresh(fee)

        waive_data = {
            "reason": "Test waive",
            "payment_method": "waive",
        }
        response = await client.post(
            f"/api/v1/fees/fees/{fee.id}/waive",
            json=waive_data,
            headers=auth_headers
        )
        assert response.status_code == 400
        assert "Cannot waive closed fee" in response.json()["detail"]


@pytest.mark.asyncio
class TestUserFeesSummary:
    """Test user fees summary endpoint."""

    async def test_get_user_summary(self, client: AsyncClient, auth_headers, test_user, db_session):
        """Test getting fee summary for a user."""
        # Create multiple fees
        fee1 = Fee(
            user_id=test_user.id,
            fee_type=FeeType.OVERDUE,
            amount=Decimal("10.00"),
            remaining=Decimal("10.00"),
            paid_amount=Decimal("0.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        fee2 = Fee(
            user_id=test_user.id,
            fee_type=FeeType.LOST_ITEM,
            amount=Decimal("50.00"),
            remaining=Decimal("25.00"),
            paid_amount=Decimal("25.00"),
            status=FeeStatus.OPEN,
            tenant_id=test_user.tenant_id,
        )
        fee3 = Fee(
            user_id=test_user.id,
            fee_type=FeeType.MANUAL,
            amount=Decimal("15.00"),
            remaining=Decimal("0.00"),
            paid_amount=Decimal("15.00"),
            status=FeeStatus.CLOSED,
            tenant_id=test_user.tenant_id,
        )
        db_session.add_all([fee1, fee2, fee3])
        await db_session.commit()

        response = await client.get(f"/api/v1/fees/users/{test_user.id}/fees/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == str(test_user.id)
        assert data["total_fees"] == 3
        assert data["open_fees"] == 2
        assert data["total_owed"] == 35.00  # 10 + 25
        assert data["total_paid"] == 40.00  # 25 + 15


@pytest.mark.asyncio
class TestFeePolicyAPI:
    """Test Fee Policy CRUD endpoints."""

    async def test_list_fee_policies(self, client: AsyncClient, auth_headers):
        """Test listing fee policies."""
        response = await client.get("/api/v1/fees/fee-policies", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_create_fee_policy(self, client: AsyncClient, auth_headers):
        """Test creating a fee policy."""
        policy_data = {
            "name": "Standard Overdue",
            "code": "OVERDUE_STD",
            "description": "Standard overdue fee policy",
            "fee_type": "overdue",
            "initial_amount": 1.00,
            "per_day_amount": 0.25,
            "max_amount": 10.00,
            "grace_period_days": 1,
            "is_active": True,
        }
        response = await client.post("/api/v1/fees/fee-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Standard Overdue"
        assert data["code"] == "OVERDUE_STD"
        assert data["initial_amount"] == 1.00
        assert data["per_day_amount"] == 0.25

    async def test_create_duplicate_policy_code(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test creating policy with duplicate code."""
        policy = FeePolicy(
            name="Existing Policy",
            code="EXISTING",
            fee_type=FeeType.OVERDUE,
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()

        policy_data = {
            "name": "New Policy",
            "code": "EXISTING",  # Duplicate
            "fee_type": "overdue",
            "is_active": True,
        }
        response = await client.post("/api/v1/fees/fee-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    async def test_update_fee_policy(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test updating a fee policy."""
        policy = FeePolicy(
            name="Original Name",
            code="TEST_POLICY",
            fee_type=FeeType.LOST_ITEM,
            initial_amount=Decimal("50.00"),
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()
        await db_session.refresh(policy)

        update_data = {
            "name": "Updated Name",
            "initial_amount": 75.00,
        }
        response = await client.put(f"/api/v1/fees/fee-policies/{policy.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["initial_amount"] == 75.00

    async def test_delete_fee_policy(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test deleting a fee policy."""
        policy = FeePolicy(
            name="To Delete",
            code="DELETE_ME",
            fee_type=FeeType.MANUAL,
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()
        await db_session.refresh(policy)

        response = await client.delete(f"/api/v1/fees/fee-policies/{policy.id}", headers=auth_headers)
        assert response.status_code == 204
