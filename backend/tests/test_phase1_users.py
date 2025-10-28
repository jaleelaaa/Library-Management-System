"""
PHASE 1: Users Management Module - Comprehensive Tests
Tests: Backend API, Functionality, Unit Tests
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User, PatronGroup, Department
from app.core.security import get_password_hash


# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


# ============================================================================
# PHASE 1 TESTS
# ============================================================================

class TestPhase1UsersManagement:
    """Phase 1: Users Management - All Tests"""

    @classmethod
    def setup_class(cls):
        """Setup test data"""
        cls.tenant_id = str(uuid.uuid4())
        cls.test_data = {}

    # ========================================================================
    # FEATURE TESTS - Patron Groups
    # ========================================================================

    def test_feature_create_patron_group(self):
        """Feature Test: Create patron group"""
        response = client.post(
            "/api/v1/users/patron-groups/",
            json={"group": "Students", "desc": "Student patrons"},
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["group"] == "Students"
        assert "id" in data
        self.test_data["patron_group_id"] = data["id"]

    def test_feature_list_patron_groups(self):
        """Feature Test: List patron groups"""
        response = client.get(
            "/api/v1/users/patron-groups/",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_feature_update_patron_group(self):
        """Feature Test: Update patron group"""
        if "patron_group_id" not in self.test_data:
            pytest.skip("Patron group not created")

        response = client.put(
            f"/api/v1/users/patron-groups/{self.test_data['patron_group_id']}",
            json={"desc": "Updated description"},
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200
        assert response.json()["desc"] == "Updated description"

    # ========================================================================
    # FEATURE TESTS - Users
    # ========================================================================

    def test_feature_create_user(self):
        """Feature Test: Create user"""
        user_data = {
            "username": "john.doe",
            "email": "john.doe@example.com",
            "barcode": "USER001",
            "password": "Test123!@#",
            "active": True,
            "user_type": "patron",
            "patron_group_id": self.test_data.get("patron_group_id"),
            "personal_info": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com"
            }
        }

        response = client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "john.doe"
        assert data["email"] == "john.doe@example.com"
        assert "id" in data
        self.test_data["user_id"] = data["id"]

    def test_feature_list_users_with_pagination(self):
        """Feature Test: List users with pagination"""
        response = client.get(
            "/api/v1/users/?page=1&page_size=10",
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "meta" in data
        assert "page" in data["meta"]
        assert "total_items" in data["meta"]

    def test_feature_search_users(self):
        """Feature Test: Search users"""
        response = client.get(
            "/api/v1/users/?q=john",
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200
        data = response.json()
        assert "data" in data

    def test_feature_get_user_by_id(self):
        """Feature Test: Get user by ID"""
        if "user_id" not in self.test_data:
            pytest.skip("User not created")

        response = client.get(
            f"/api/v1/users/{self.test_data['user_id']}",
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == self.test_data["user_id"]
        assert data["username"] == "john.doe"

    def test_feature_update_user(self):
        """Feature Test: Update user"""
        if "user_id" not in self.test_data:
            pytest.skip("User not created")

        response = client.put(
            f"/api/v1/users/{self.test_data['user_id']}",
            json={"active": False},
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["active"] == False

    def test_feature_filter_users_by_status(self):
        """Feature Test: Filter users by status"""
        response = client.get(
            "/api/v1/users/?status=active",
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200

    def test_feature_filter_users_by_type(self):
        """Feature Test: Filter users by type"""
        response = client.get(
            "/api/v1/users/?user_type=patron",
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200

    # ========================================================================
    # FUNCTIONALITY TESTS
    # ========================================================================

    def test_functionality_duplicate_username_prevention(self):
        """Functionality: Prevent duplicate usernames"""
        user_data = {
            "username": "john.doe",  # Duplicate
            "email": "another@example.com",
            "barcode": "USER002",
            "password": "Test123!@#",
            "active": True,
            "user_type": "patron"
        }

        response = client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 400

    def test_functionality_duplicate_email_prevention(self):
        """Functionality: Prevent duplicate emails"""
        user_data = {
            "username": "jane.doe",
            "email": "john.doe@example.com",  # Duplicate
            "barcode": "USER003",
            "password": "Test123!@#",
            "active": True,
            "user_type": "patron"
        }

        response = client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 400

    def test_functionality_password_hashing(self):
        """Functionality: Passwords are hashed"""
        # Create user with password
        user_data = {
            "username": "password.test",
            "email": "password.test@example.com",
            "barcode": "PWDTEST001",
            "password": "PlainTextPassword123!",
            "active": True,
            "user_type": "patron"
        }

        response = client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 201
        data = response.json()

        # Password should not be in response
        assert "password" not in data or data.get("password") != "PlainTextPassword123!"

    def test_functionality_pagination_metadata(self):
        """Functionality: Pagination metadata is correct"""
        response = client.get(
            "/api/v1/users/?page=1&page_size=5",
            headers={"X-Tenant-ID": self.tenant_id}
        )

        assert response.status_code == 200
        data = response.json()
        meta = data["meta"]

        assert meta["page"] == 1
        assert meta["page_size"] == 5
        assert "total_items" in meta
        assert "total_pages" in meta

    # ========================================================================
    # UNIT TESTS - Business Logic
    # ========================================================================

    def test_unit_password_hash_verification(self):
        """Unit: Password hashing works correctly"""
        from app.core.security import verify_password

        password = "Test123!@#"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) == True
        assert verify_password("WrongPassword", hashed) == False

    def test_unit_user_model_creation(self):
        """Unit: User model creates correctly"""
        db = next(override_get_db())

        user = User(
            id=uuid.uuid4(),
            username="unit.test",
            email="unit.test@example.com",
            barcode="UNIT001",
            hashed_password=get_password_hash("Test123"),
            active=True,
            user_type="patron",
            tenant_id=uuid.uuid4()
        )

        db.add(user)
        db.commit()

        assert user.id is not None
        assert user.username == "unit.test"

        db.delete(user)
        db.commit()

    # ========================================================================
    # USER ACCEPTANCE TESTS
    # ========================================================================

    def test_acceptance_complete_user_lifecycle(self):
        """UAT: Complete user lifecycle (create, read, update, delete)"""

        # Step 1: Create user
        user_data = {
            "username": "lifecycle.test",
            "email": "lifecycle@example.com",
            "barcode": "LIFECYCLE001",
            "password": "Test123!@#",
            "active": True,
            "user_type": "patron",
            "personal_info": {
                "first_name": "Lifecycle",
                "last_name": "Test",
                "email": "lifecycle@example.com"
            }
        }

        response = client.post(
            "/api/v1/users/",
            json=user_data,
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 201
        user_id = response.json()["id"]

        # Step 2: Read user
        response = client.get(
            f"/api/v1/users/{user_id}",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200
        assert response.json()["username"] == "lifecycle.test"

        # Step 3: Update user
        response = client.put(
            f"/api/v1/users/{user_id}",
            json={"active": False},
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200
        assert response.json()["active"] == False

        # Step 4: Delete user
        response = client.delete(
            f"/api/v1/users/{user_id}",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 204

        # Step 5: Verify deletion
        response = client.get(
            f"/api/v1/users/{user_id}",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 404

    def test_acceptance_search_and_filter_workflow(self):
        """UAT: Search and filter users workflow"""

        # Create multiple users
        for i in range(5):
            user_data = {
                "username": f"search.user{i}",
                "email": f"search{i}@example.com",
                "barcode": f"SEARCH{str(i).zfill(3)}",
                "password": "Test123!@#",
                "active": i % 2 == 0,  # Alternate active/inactive
                "user_type": "patron" if i < 3 else "staff"
            }

            client.post(
                "/api/v1/users/",
                json=user_data,
                headers={"X-Tenant-ID": self.tenant_id}
            )

        # Search by username
        response = client.get(
            "/api/v1/users/?q=search.user",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200
        assert len(response.json()["data"]) >= 5

        # Filter by active status
        response = client.get(
            "/api/v1/users/?status=active",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200

        # Filter by user type
        response = client.get(
            "/api/v1/users/?user_type=staff",
            headers={"X-Tenant-ID": self.tenant_id}
        )
        assert response.status_code == 200


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
