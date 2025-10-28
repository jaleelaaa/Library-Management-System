"""
Comprehensive tests for Users API endpoints.
Tests for Users, Patron Groups, and user-related operations.
"""

import pytest
from httpx import AsyncClient

from app.models.user import User, PatronGroup
from .conftest import assert_pagination_response, assert_uuid_format


@pytest.mark.asyncio
async def test_list_users(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test listing users."""
    response = await client.get("/api/v1/users/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data)
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, admin_headers: dict):
    """Test creating a new user."""
    user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "full_name": "New User",
        "password": "newpassword123",
        "is_active": True,
    }

    response = await client.post("/api/v1/users/", json=user_data, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "password" not in data  # Password should not be in response
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_create_user_duplicate_username(client: AsyncClient, admin_headers: dict, test_user: User):
    """Test creating a user with duplicate username."""
    user_data = {
        "username": test_user.username,  # Duplicate
        "email": "different@example.com",
        "full_name": "Duplicate User",
        "password": "password123",
    }

    response = await client.post("/api/v1/users/", json=user_data, headers=admin_headers)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_get_user(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test getting a single user."""
    response = await client.get(f"/api/v1/users/{test_user.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_user.id)
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email


@pytest.mark.asyncio
async def test_update_user(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test updating a user."""
    update_data = {
        "full_name": "Updated Name",
        "email": "updated@example.com",
    }

    response = await client.put(
        f"/api/v1/users/{test_user.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["email"] == "updated@example.com"


@pytest.mark.asyncio
async def test_delete_user(client: AsyncClient, admin_headers: dict, db_session, test_tenant, test_admin_user):
    """Test deleting a user (soft delete)."""
    # Create a user to delete
    from app.core.security import get_password_hash
    user_to_delete = User(
        username="deleteme",
        email="deleteme@example.com",
        full_name="Delete Me",
        hashed_password=get_password_hash("password"),
        is_active=True,
        tenant_id=test_tenant.id,
    )
    db_session.add(user_to_delete)
    await db_session.commit()
    await db_session.refresh(user_to_delete)

    response = await client.delete(f"/api/v1/users/{user_to_delete.id}", headers=admin_headers)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_search_users_by_username(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test searching users by username."""
    response = await client.get(f"/api/v1/users/?q={test_user.username}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_search_users_by_email(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test searching users by email."""
    response = await client.get(f"/api/v1/users/?q={test_user.email}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_filter_users_by_status(client: AsyncClient, auth_headers: dict, db_session, test_tenant):
    """Test filtering users by active status."""
    # Create active and inactive users
    from app.core.security import get_password_hash

    active_user = User(
        username="activeuser",
        email="active@example.com",
        full_name="Active User",
        hashed_password=get_password_hash("password"),
        is_active=True,
        tenant_id=test_tenant.id,
    )
    inactive_user = User(
        username="inactiveuser",
        email="inactive@example.com",
        full_name="Inactive User",
        hashed_password=get_password_hash("password"),
        is_active=False,
        tenant_id=test_tenant.id,
    )
    db_session.add_all([active_user, inactive_user])
    await db_session.commit()

    response = await client.get("/api/v1/users/?is_active=true", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert all(user["is_active"] is True for user in data["items"])


@pytest.mark.asyncio
async def test_get_user_loans(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test getting user's loans."""
    response = await client.get(f"/api/v1/users/{test_user.id}/loans", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data)


@pytest.mark.asyncio
async def test_get_user_fees(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test getting user's fees/fines."""
    response = await client.get(f"/api/v1/users/{test_user.id}/fees", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data)


# ===========================
# Patron Groups Tests
# ===========================

@pytest.mark.asyncio
async def test_list_patron_groups(client: AsyncClient, auth_headers: dict, db_session, test_tenant):
    """Test listing patron groups."""
    # Create a patron group
    from app.models.user import PatronGroup
    patron_group = PatronGroup(
        name="Staff",
        code="STAFF",
        description="Library staff members",
        tenant_id=test_tenant.id,
    )
    db_session.add(patron_group)
    await db_session.commit()

    response = await client.get("/api/v1/patron-groups/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)


@pytest.mark.asyncio
async def test_create_patron_group(client: AsyncClient, admin_headers: dict):
    """Test creating a new patron group."""
    group_data = {
        "name": "Students",
        "code": "STUDENT",
        "description": "Student patrons",
        "loan_limit": 10,
    }

    response = await client.post("/api/v1/patron-groups/", json=group_data, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Students"
    assert data["code"] == "STUDENT"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_update_patron_group(client: AsyncClient, admin_headers: dict, db_session, test_tenant):
    """Test updating a patron group."""
    # Create a patron group first
    from app.models.user import PatronGroup
    patron_group = PatronGroup(
        name="Faculty",
        code="FACULTY",
        loan_limit=20,
        tenant_id=test_tenant.id,
    )
    db_session.add(patron_group)
    await db_session.commit()
    await db_session.refresh(patron_group)

    update_data = {
        "name": "Faculty Members",
        "loan_limit": 25,
    }

    response = await client.put(
        f"/api/v1/patron-groups/{patron_group.id}",
        json=update_data,
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Faculty Members"
    assert data["loan_limit"] == 25


@pytest.mark.asyncio
async def test_delete_patron_group(client: AsyncClient, admin_headers: dict, db_session, test_tenant):
    """Test deleting a patron group."""
    # Create a patron group first
    from app.models.user import PatronGroup
    patron_group = PatronGroup(
        name="Temporary",
        code="TEMP",
        tenant_id=test_tenant.id,
    )
    db_session.add(patron_group)
    await db_session.commit()
    await db_session.refresh(patron_group)

    response = await client.delete(f"/api/v1/patron-groups/{patron_group.id}", headers=admin_headers)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_bulk_create_users(client: AsyncClient, admin_headers: dict):
    """Test bulk creating users."""
    users_data = [
        {
            "username": f"bulkuser{i}",
            "email": f"bulkuser{i}@example.com",
            "full_name": f"Bulk User {i}",
            "password": "password123",
        }
        for i in range(5)
    ]

    response = await client.post("/api/v1/users/bulk", json=users_data, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5


@pytest.mark.asyncio
async def test_pagination_users(client: AsyncClient, auth_headers: dict, db_session, test_tenant):
    """Test pagination for users."""
    from app.core.security import get_password_hash

    # Create 15 users
    for i in range(15):
        user = User(
            username=f"user{i}",
            email=f"user{i}@example.com",
            full_name=f"User {i}",
            hashed_password=get_password_hash("password"),
            is_active=True,
            tenant_id=test_tenant.id,
        )
        db_session.add(user)
    await db_session.commit()

    # Test page 1
    response = await client.get("/api/v1/users/?page=1&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 15
    assert len(data["items"]) == 10


@pytest.mark.asyncio
async def test_get_user_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent user."""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.get(f"/api/v1/users/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_user_not_found(client: AsyncClient, auth_headers: dict):
    """Test updating a non-existent user."""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.put(
        f"/api/v1/users/{fake_id}",
        json={"full_name": "Updated"},
        headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_password_not_in_response(client: AsyncClient, admin_headers: dict):
    """Test that password is never returned in API responses."""
    user_data = {
        "username": "secureuser",
        "email": "secure@example.com",
        "full_name": "Secure User",
        "password": "supersecret123",
    }

    response = await client.post("/api/v1/users/", json=user_data, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert "password" not in data
    assert "hashed_password" not in data
