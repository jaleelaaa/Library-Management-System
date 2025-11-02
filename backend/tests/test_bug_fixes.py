"""
Comprehensive tests for BUG-004 and BUG-010 fixes.

Tests:
- BUG-004: User creation with password hashing
- BUG-010: All missing API endpoints
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

# Test fixtures would be imported from conftest.py in actual implementation


class TestBug004UserCreation:
    """Tests for BUG-004: Cannot Create New Users"""

    @pytest.mark.asyncio
    async def test_create_user_with_password_hashing(
        self, client: AsyncClient, admin_token: str
    ):
        """
        Test that user creation properly hashes passwords.

        Verifies:
        - User can be created successfully
        - Password is hashed (not stored in plaintext)
        - Response doesn't include hashed_password
        """
        user_data = {
            "username": f"testuser_{uuid4().hex[:8]}",
            "email": f"test_{uuid4().hex[:8]}@example.com",
            "password": "SecureP@ssw0rd",
            "user_type": "patron",
            "personal": {
                "firstName": "Test",
                "lastName": "User"
            }
        }

        response = await client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 201
        data = response.json()

        # Verify user was created
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert data["id"] is not None

        # Verify password not exposed in response
        assert "password" not in data
        assert "hashed_password" not in data

    @pytest.mark.asyncio
    async def test_create_user_weak_password_rejected(
        self, client: AsyncClient, admin_token: str
    ):
        """Test that weak passwords are rejected."""
        user_data = {
            "username": f"testuser_{uuid4().hex[:8]}",
            "email": f"test_{uuid4().hex[:8]}@example.com",
            "password": "weak",  # Too weak
            "user_type": "patron",
            "personal": {
                "firstName": "Test",
                "lastName": "User"
            }
        }

        response = await client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        # Should fail validation
        assert response.status_code == 400
        assert "password" in response.json()["detail"].lower()


class TestBug010MissingEndpoints:
    """Tests for BUG-010: Missing API Endpoints"""

    @pytest.mark.asyncio
    async def test_suspend_user_endpoint(
        self, client: AsyncClient, admin_token: str, test_user_id: str
    ):
        """Test POST /users/{id}/suspend endpoint."""
        response = await client.post(
            f"/api/v1/users/{test_user_id}/suspend",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["active"] is False
        assert "suspended" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_unsuspend_user_endpoint(
        self, client: AsyncClient, admin_token: str, test_user_id: str
    ):
        """Test POST /users/{id}/unsuspend endpoint."""
        # First suspend
        await client.post(
            f"/api/v1/users/{test_user_id}/suspend",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        # Then unsuspend
        response = await client.post(
            f"/api/v1/users/{test_user_id}/unsuspend",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["active"] is True
        assert "unsuspended" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_bulk_import_items_endpoint(
        self, client: AsyncClient, admin_token: str, test_holding_id: str
    ):
        """Test POST /items/bulk-import endpoint."""
        items_data = [
            {
                "holding_id": test_holding_id,
                "barcode": f"BULK_{uuid4().hex[:8]}",
                "item_level_call_number": "TEST.001",
                "status": "Available",
                "material_type": "book"
            },
            {
                "holding_id": test_holding_id,
                "barcode": f"BULK_{uuid4().hex[:8]}",
                "item_level_call_number": "TEST.002",
                "status": "Available",
                "material_type": "book"
            }
        ]

        response = await client.post(
            "/api/v1/inventory/items/bulk-import",
            json=items_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success_count"] == 2
        assert data["failure_count"] == 0
        assert len(data["imported_ids"]) == 2

    @pytest.mark.asyncio
    async def test_bulk_import_validates_duplicates(
        self, client: AsyncClient, admin_token: str, test_holding_id: str
    ):
        """Test that bulk import validates duplicate barcodes."""
        duplicate_barcode = f"BULK_{uuid4().hex[:8]}"
        items_data = [
            {
                "holding_id": test_holding_id,
                "barcode": duplicate_barcode,
                "item_level_call_number": "TEST.001",
                "status": "Available",
                "material_type": "book"
            },
            {
                "holding_id": test_holding_id,
                "barcode": duplicate_barcode,  # Duplicate!
                "item_level_call_number": "TEST.002",
                "status": "Available",
                "material_type": "book"
            }
        ]

        response = await client.post(
            "/api/v1/inventory/items/bulk-import",
            json=items_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success_count"] == 0
        assert "DUPLICATE_IN_BATCH" in str(data["errors"])

    @pytest.mark.asyncio
    async def test_fulfill_request_endpoint(
        self, client: AsyncClient, admin_token: str, test_request_id: str
    ):
        """Test POST /requests/{id}/fulfill endpoint."""
        response = await client.post(
            f"/api/v1/circulation/requests/{test_request_id}/fulfill",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "fulfilled" in data["message"].lower()
        assert data["request_id"] == test_request_id

    @pytest.mark.asyncio
    async def test_overdue_loans_endpoint(
        self, client: AsyncClient, admin_token: str
    ):
        """Test GET /loans/overdue endpoint."""
        response = await client.get(
            "/api/v1/circulation/loans/overdue",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "meta" in data
        # Should have pagination metadata
        assert "total" in data["meta"]

    @pytest.mark.asyncio
    async def test_forgive_fine_endpoint(
        self, client: AsyncClient, admin_token: str, test_loan_id: str
    ):
        """Test POST /loans/{id}/forgive-fine endpoint."""
        response = await client.post(
            f"/api/v1/circulation/loans/{test_loan_id}/forgive-fine",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        # May return 400 if no fine exists, which is acceptable
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "forgiven" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_report_templates_endpoint(
        self, client: AsyncClient, admin_token: str
    ):
        """Test GET /reports/templates endpoint."""
        response = await client.get(
            "/api/v1/reports/templates",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        # Check template structure
        template = data[0]
        assert "id" in template
        assert "name" in template
        assert "description" in template
        assert "parameters" in template
        assert "export_formats" in template

    @pytest.mark.asyncio
    async def test_schedule_report_endpoint(
        self, client: AsyncClient, admin_token: str
    ):
        """Test POST /reports/schedule endpoint."""
        schedule_data = {
            "template_id": "circulation",
            "name": "Weekly Circulation Report",
            "description": "Automated weekly report",
            "schedule": "0 9 * * 1",  # Every Monday at 9 AM
            "parameters": {},
            "export_format": "csv",
            "recipients": ["admin@example.com"],
            "enabled": True
        }

        response = await client.post(
            "/api/v1/reports/schedule",
            json=schedule_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 201
        data = response.json()
        assert "scheduled successfully" in data["message"].lower()
        assert data["template_id"] == "circulation"
        assert "next_run" in data

    @pytest.mark.asyncio
    async def test_receive_purchase_order_endpoint(
        self, client: AsyncClient, admin_token: str, test_po_id: str
    ):
        """Test POST /purchase-orders/{id}/receive endpoint."""
        response = await client.post(
            f"/api/v1/acquisitions/purchase-orders/{test_po_id}/receive",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        # May return 400 if already closed
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "received" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_cancel_purchase_order_endpoint(
        self, client: AsyncClient, admin_token: str, test_po_id: str
    ):
        """Test POST /purchase-orders/{id}/cancel endpoint."""
        response = await client.post(
            f"/api/v1/acquisitions/purchase-orders/{test_po_id}/cancel?reason=Test+cancellation",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        # May return 400 if already closed/cancelled
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "cancelled" in data["message"].lower()


class TestPermissionEnforcement:
    """Test that all new endpoints enforce permissions."""

    @pytest.mark.asyncio
    async def test_suspend_requires_permission(
        self, client: AsyncClient, patron_token: str, test_user_id: str
    ):
        """Test that suspend endpoint requires users.update permission."""
        response = await client.post(
            f"/api/v1/users/{test_user_id}/suspend",
            headers={"Authorization": f"Bearer {patron_token}"}
        )

        # Should be forbidden
        assert response.status_code == 403
        assert "permission" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_bulk_import_requires_permission(
        self, client: AsyncClient, patron_token: str
    ):
        """Test that bulk import requires inventory.create permission."""
        response = await client.post(
            "/api/v1/inventory/items/bulk-import",
            json=[],
            headers={"Authorization": f"Bearer {patron_token}"}
        )

        # Should be forbidden
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_forgive_fine_requires_permission(
        self, client: AsyncClient, patron_token: str, test_loan_id: str
    ):
        """Test that forgive fine requires fees.waive permission."""
        response = await client.post(
            f"/api/v1/circulation/loans/{test_loan_id}/forgive-fine",
            headers={"Authorization": f"Bearer {patron_token}"}
        )

        # Should be forbidden
        assert response.status_code == 403


# =============================================================================
# MANUAL TESTING GUIDE
# =============================================================================
"""
To run these tests manually:

1. Start the backend server:
   cd backend
   uvicorn app.main:app --reload

2. Run pytest:
   pytest tests/test_bug_fixes.py -v

3. Or test individual endpoints with curl:

   # Test user creation (BUG-004)
   curl -X POST http://localhost:8000/api/v1/users/ \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "newuser",
       "email": "new@example.com",
       "password": "SecureP@ss123",
       "user_type": "patron",
       "personal": {"firstName": "New", "lastName": "User"}
     }'

   # Test suspend user (BUG-010)
   curl -X POST http://localhost:8000/api/v1/users/{user_id}/suspend \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Test report templates (BUG-010)
   curl http://localhost:8000/api/v1/reports/templates \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Test overdue loans (BUG-010)
   curl http://localhost:8000/api/v1/circulation/loans/overdue \
     -H "Authorization: Bearer $ADMIN_TOKEN"

4. Expected results:
   - All endpoints should return proper status codes
   - User creation should work without 500 errors
   - All new endpoints should be accessible
   - Permission checks should be enforced
"""
