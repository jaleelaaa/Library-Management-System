"""
Tests for Loan Policy API endpoints.
"""

import pytest
from httpx import AsyncClient

from app.models.circulation import LoanPolicy


@pytest.mark.asyncio
class TestLoanPolicyAPI:
    """Test Loan Policy CRUD endpoints."""

    async def test_list_loan_policies(self, client: AsyncClient, auth_headers):
        """Test listing loan policies."""
        response = await client.get("/api/v1/circulation/loan-policies", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_create_loan_policy(self, client: AsyncClient, auth_headers):
        """Test creating a loan policy."""
        policy_data = {
            "name": "Standard Loan",
            "code": "STANDARD",
            "description": "Standard 2-week loan",
            "loan_period_duration": 14,
            "loan_period_interval": "Days",
            "renewable": True,
            "number_of_renewals_allowed": 3,
            "renewal_period_duration": 14,
            "renewal_period_interval": "Days",
            "grace_period_duration": 0,
            "grace_period_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Standard Loan"
        assert data["code"] == "STANDARD"
        assert data["loan_period_duration"] == 14
        assert data["renewable"] is True
        assert data["number_of_renewals_allowed"] == 3

    async def test_create_loan_policy_short_term(self, client: AsyncClient, auth_headers):
        """Test creating a short-term loan policy."""
        policy_data = {
            "name": "Short Term Loan",
            "code": "SHORT_TERM",
            "description": "2-hour reserve item loan",
            "loan_period_duration": 2,
            "loan_period_interval": "Days",  # In real scenario could be "Hours"
            "renewable": False,
            "number_of_renewals_allowed": 0,
            "renewal_period_duration": 1,
            "renewal_period_interval": "Days",
            "grace_period_duration": 0,
            "grace_period_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Short Term Loan"
        assert data["renewable"] is False
        assert data["loan_period_duration"] == 2

    async def test_create_loan_policy_with_grace_period(self, client: AsyncClient, auth_headers):
        """Test creating a loan policy with grace period."""
        policy_data = {
            "name": "With Grace Period",
            "code": "WITH_GRACE",
            "loan_period_duration": 21,
            "loan_period_interval": "Days",
            "renewable": True,
            "number_of_renewals_allowed": 2,
            "renewal_period_duration": 21,
            "renewal_period_interval": "Days",
            "grace_period_duration": 3,
            "grace_period_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["grace_period_duration"] == 3

    async def test_create_loan_policy_with_recall(self, client: AsyncClient, auth_headers):
        """Test creating a loan policy with recall configuration."""
        policy_data = {
            "name": "Recallable Loan",
            "code": "RECALLABLE",
            "loan_period_duration": 30,
            "loan_period_interval": "Days",
            "renewable": True,
            "number_of_renewals_allowed": 3,
            "renewal_period_duration": 30,
            "renewal_period_interval": "Days",
            "grace_period_duration": 0,
            "grace_period_interval": "Days",
            "recall_return_interval_duration": 7,
            "recall_return_interval_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["recall_return_interval_duration"] == 7

    async def test_create_duplicate_policy_code(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test creating policy with duplicate code."""
        policy = LoanPolicy(
            name="Existing Policy",
            code="EXISTING",
            loan_period_duration=14,
            loan_period_interval="Days",
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()

        policy_data = {
            "name": "New Policy",
            "code": "EXISTING",  # Duplicate
            "loan_period_duration": 7,
            "loan_period_interval": "Days",
            "renewable": True,
            "number_of_renewals_allowed": 3,
            "renewal_period_duration": 7,
            "renewal_period_interval": "Days",
            "grace_period_duration": 0,
            "grace_period_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    async def test_get_loan_policy(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test getting a specific loan policy."""
        policy = LoanPolicy(
            name="Test Policy",
            code="TEST_GET",
            description="Policy for testing get",
            loan_period_duration=14,
            loan_period_interval="Days",
            renewable=True,
            number_of_renewals_allowed=3,
            renewal_period_duration=14,
            renewal_period_interval="Days",
            grace_period_duration=1,
            grace_period_interval="Days",
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()
        await db_session.refresh(policy)

        response = await client.get(f"/api/v1/circulation/loan-policies/{policy.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(policy.id)
        assert data["name"] == "Test Policy"
        assert data["code"] == "TEST_GET"

    async def test_get_nonexistent_loan_policy(self, client: AsyncClient, auth_headers):
        """Test getting non-existent loan policy."""
        response = await client.get(
            "/api/v1/circulation/loan-policies/00000000-0000-0000-0000-000000000000",
            headers=auth_headers
        )
        assert response.status_code == 404

    async def test_update_loan_policy(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test updating a loan policy."""
        policy = LoanPolicy(
            name="Original Name",
            code="UPDATE_TEST",
            loan_period_duration=14,
            loan_period_interval="Days",
            renewable=True,
            number_of_renewals_allowed=3,
            renewal_period_duration=14,
            renewal_period_interval="Days",
            grace_period_duration=0,
            grace_period_interval="Days",
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()
        await db_session.refresh(policy)

        update_data = {
            "name": "Updated Name",
            "description": "Updated description",
            "loan_period_duration": 21,
            "number_of_renewals_allowed": 5,
        }
        response = await client.put(
            f"/api/v1/circulation/loan-policies/{policy.id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "Updated description"
        assert data["loan_period_duration"] == 21
        assert data["number_of_renewals_allowed"] == 5

    async def test_update_loan_policy_disable(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test disabling a loan policy."""
        policy = LoanPolicy(
            name="Active Policy",
            code="DISABLE_TEST",
            loan_period_duration=14,
            loan_period_interval="Days",
            is_active=True,
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()
        await db_session.refresh(policy)

        update_data = {"is_active": False}
        response = await client.put(
            f"/api/v1/circulation/loan-policies/{policy.id}",
            json=update_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    async def test_delete_loan_policy(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test deleting a loan policy."""
        policy = LoanPolicy(
            name="To Delete",
            code="DELETE_ME",
            loan_period_duration=7,
            loan_period_interval="Days",
            tenant_id=test_tenant.id,
        )
        db_session.add(policy)
        await db_session.commit()
        await db_session.refresh(policy)

        response = await client.delete(f"/api/v1/circulation/loan-policies/{policy.id}", headers=auth_headers)
        assert response.status_code == 204

    async def test_filter_loan_policies_by_active(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test filtering loan policies by active status."""
        active_policy = LoanPolicy(
            name="Active Policy",
            code="ACTIVE",
            loan_period_duration=14,
            loan_period_interval="Days",
            is_active=True,
            tenant_id=test_tenant.id,
        )
        inactive_policy = LoanPolicy(
            name="Inactive Policy",
            code="INACTIVE",
            loan_period_duration=14,
            loan_period_interval="Days",
            is_active=False,
            tenant_id=test_tenant.id,
        )
        db_session.add_all([active_policy, inactive_policy])
        await db_session.commit()

        response = await client.get("/api/v1/circulation/loan-policies?is_active=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert all(policy["is_active"] is True for policy in data["items"])

    async def test_loan_policy_with_weeks_interval(self, client: AsyncClient, auth_headers):
        """Test creating policy with weeks interval."""
        policy_data = {
            "name": "Weekly Loan",
            "code": "WEEKLY",
            "loan_period_duration": 2,
            "loan_period_interval": "Weeks",
            "renewable": True,
            "number_of_renewals_allowed": 2,
            "renewal_period_duration": 2,
            "renewal_period_interval": "Weeks",
            "grace_period_duration": 0,
            "grace_period_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["loan_period_interval"] == "Weeks"

    async def test_loan_policy_with_months_interval(self, client: AsyncClient, auth_headers):
        """Test creating policy with months interval."""
        policy_data = {
            "name": "Monthly Loan",
            "code": "MONTHLY",
            "loan_period_duration": 3,
            "loan_period_interval": "Months",
            "renewable": True,
            "number_of_renewals_allowed": 1,
            "renewal_period_duration": 3,
            "renewal_period_interval": "Months",
            "grace_period_duration": 1,
            "grace_period_interval": "Weeks",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["loan_period_interval"] == "Months"
        assert data["grace_period_interval"] == "Weeks"

    async def test_loan_policy_non_renewable(self, client: AsyncClient, auth_headers):
        """Test creating non-renewable policy."""
        policy_data = {
            "name": "Non-Renewable",
            "code": "NO_RENEW",
            "loan_period_duration": 7,
            "loan_period_interval": "Days",
            "renewable": False,
            "number_of_renewals_allowed": 0,
            "renewal_period_duration": 1,
            "renewal_period_interval": "Days",
            "grace_period_duration": 0,
            "grace_period_interval": "Days",
            "is_active": True,
        }
        response = await client.post("/api/v1/circulation/loan-policies", json=policy_data, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["renewable"] is False
        assert data["number_of_renewals_allowed"] == 0

    async def test_pagination_loan_policies(self, client: AsyncClient, auth_headers, db_session, test_tenant):
        """Test pagination of loan policies."""
        # Create multiple policies
        for i in range(15):
            policy = LoanPolicy(
                name=f"Policy {i}",
                code=f"POLICY_{i}",
                loan_period_duration=14,
                loan_period_interval="Days",
                tenant_id=test_tenant.id,
            )
            db_session.add(policy)
        await db_session.commit()

        # Get first page
        response = await client.get("/api/v1/circulation/loan-policies?page=1&page_size=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] >= 15

        # Get second page
        response = await client.get("/api/v1/circulation/loan-policies?page=2&page_size=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 5
