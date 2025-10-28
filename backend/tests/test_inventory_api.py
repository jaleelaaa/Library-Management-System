"""
Comprehensive tests for Inventory API endpoints.
Tests for Instances, Holdings, Items, Locations, and Libraries.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Instance, Holding, Item, Location, Library
from app.models.user import User
from app.models.tenant import Tenant
from .conftest import assert_pagination_response, assert_uuid_format


# ===========================
# Instance Tests
# ===========================

@pytest.mark.asyncio
async def test_list_instances(client: AsyncClient, auth_headers: dict, test_instance: Instance):
    """Test listing instances with pagination."""
    response = await client.get("/api/v1/inventory/instances", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Test Book Title"


@pytest.mark.asyncio
async def test_create_instance(client: AsyncClient, auth_headers: dict):
    """Test creating a new instance."""
    instance_data = {
        "title": "New Test Book",
        "subtitle": "Volume 1",
        "instance_type": "text",
        "contributors": [{"name": "Author Name", "type": "author"}],
        "publication": [{"publisher": "Publisher", "dateOfPublication": "2024"}],
        "subjects": ["Testing", "Python"],
        "tags": ["test"],
    }

    response = await client.post("/api/v1/inventory/instances", json=instance_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Test Book"
    assert data["subtitle"] == "Volume 1"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_get_instance(client: AsyncClient, auth_headers: dict, test_instance: Instance):
    """Test getting a single instance."""
    response = await client.get(f"/api/v1/inventory/instances/{test_instance.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_instance.id)
    assert data["title"] == test_instance.title


@pytest.mark.asyncio
async def test_update_instance(client: AsyncClient, auth_headers: dict, test_instance: Instance):
    """Test updating an instance."""
    update_data = {"title": "Updated Title", "subtitle": "Updated Subtitle"}

    response = await client.put(
        f"/api/v1/inventory/instances/{test_instance.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["subtitle"] == "Updated Subtitle"


@pytest.mark.asyncio
async def test_delete_instance(client: AsyncClient, auth_headers: dict, test_instance: Instance):
    """Test deleting an instance."""
    response = await client.delete(f"/api/v1/inventory/instances/{test_instance.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/inventory/instances/{test_instance.id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_search_instances(client: AsyncClient, auth_headers: dict, test_instance: Instance):
    """Test searching instances."""
    response = await client.get("/api/v1/inventory/instances?q=Test Book", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


# ===========================
# Holdings Tests
# ===========================

@pytest.mark.asyncio
async def test_list_holdings(client: AsyncClient, auth_headers: dict, test_holding: Holding):
    """Test listing holdings."""
    response = await client.get("/api/v1/inventory/holdings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert len(data["items"]) == 1
    assert data["items"][0]["call_number"] == "123.45 TES"


@pytest.mark.asyncio
async def test_create_holding(client: AsyncClient, auth_headers: dict, test_instance: Instance, test_location: Location):
    """Test creating a new holding."""
    holding_data = {
        "instance_id": str(test_instance.id),
        "permanent_location_id": str(test_location.id),
        "call_number": "456.78 NEW",
        "call_number_prefix": "REF",
        "shelving_title": "New Holding",
    }

    response = await client.post("/api/v1/inventory/holdings", json=holding_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["call_number"] == "456.78 NEW"
    assert data["call_number_prefix"] == "REF"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_create_holding_invalid_instance(client: AsyncClient, auth_headers: dict, test_location: Location):
    """Test creating holding with invalid instance ID."""
    import uuid
    holding_data = {
        "instance_id": str(uuid.uuid4()),
        "permanent_location_id": str(test_location.id),
        "call_number": "999.99 BAD",
    }

    response = await client.post("/api/v1/inventory/holdings", json=holding_data, headers=auth_headers)
    assert response.status_code == 404
    assert "Instance not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_holding(client: AsyncClient, auth_headers: dict, test_holding: Holding):
    """Test getting a single holding."""
    response = await client.get(f"/api/v1/inventory/holdings/{test_holding.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_holding.id)
    assert data["call_number"] == test_holding.call_number


@pytest.mark.asyncio
async def test_update_holding(client: AsyncClient, auth_headers: dict, test_holding: Holding):
    """Test updating a holding."""
    update_data = {"call_number": "789.01 UPD", "shelving_title": "Updated Holding"}

    response = await client.put(
        f"/api/v1/inventory/holdings/{test_holding.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["call_number"] == "789.01 UPD"
    assert data["shelving_title"] == "Updated Holding"


@pytest.mark.asyncio
async def test_delete_holding(client: AsyncClient, auth_headers: dict, test_holding: Holding):
    """Test deleting a holding."""
    response = await client.delete(f"/api/v1/inventory/holdings/{test_holding.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/inventory/holdings/{test_holding.id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_filter_holdings_by_instance(client: AsyncClient, auth_headers: dict, test_holding: Holding, test_instance: Instance):
    """Test filtering holdings by instance ID."""
    response = await client.get(
        f"/api/v1/inventory/holdings?instance_id={test_instance.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["instance_id"] == str(test_instance.id)


# ===========================
# Item Tests
# ===========================

@pytest.mark.asyncio
async def test_list_items(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test listing items."""
    response = await client.get("/api/v1/inventory/items", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert len(data["items"]) == 1
    assert data["items"][0]["barcode"] == "TEST123456"


@pytest.mark.asyncio
async def test_create_item(client: AsyncClient, auth_headers: dict, test_holding: Holding, test_location: Location):
    """Test creating a new item."""
    item_data = {
        "holding_id": str(test_holding.id),
        "barcode": "NEW123456",
        "status": "available",
        "permanent_location_id": str(test_location.id),
        "copy_number": "c.1",
        "volume": "v.1",
    }

    response = await client.post("/api/v1/inventory/items", json=item_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["barcode"] == "NEW123456"
    assert data["status"] == "available"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_create_item_duplicate_barcode(client: AsyncClient, auth_headers: dict, test_item: Item, test_holding: Holding):
    """Test creating item with duplicate barcode."""
    item_data = {
        "holding_id": str(test_holding.id),
        "barcode": test_item.barcode,  # Duplicate
        "status": "available",
    }

    response = await client.post("/api/v1/inventory/items", json=item_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Barcode already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_item(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test getting a single item."""
    response = await client.get(f"/api/v1/inventory/items/{test_item.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_item.id)
    assert data["barcode"] == test_item.barcode


@pytest.mark.asyncio
async def test_get_item_by_barcode(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test getting item by barcode."""
    response = await client.get(f"/api/v1/inventory/items/barcode/{test_item.barcode}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["barcode"] == test_item.barcode
    assert data["id"] == str(test_item.id)


@pytest.mark.asyncio
async def test_update_item(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test updating an item."""
    update_data = {"status": "checked_out", "copy_number": "c.2"}

    response = await client.put(
        f"/api/v1/inventory/items/{test_item.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "checked_out"
    assert data["copy_number"] == "c.2"


@pytest.mark.asyncio
async def test_delete_item(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test deleting an item."""
    response = await client.delete(f"/api/v1/inventory/items/{test_item.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/inventory/items/{test_item.id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_filter_items_by_status(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test filtering items by status."""
    response = await client.get("/api/v1/inventory/items?status=available", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert all(item["status"] == "available" for item in data["items"])


@pytest.mark.asyncio
async def test_filter_items_by_barcode(client: AsyncClient, auth_headers: dict, test_item: Item):
    """Test filtering items by barcode."""
    response = await client.get(f"/api/v1/inventory/items?barcode={test_item.barcode}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


# ===========================
# Location Tests
# ===========================

@pytest.mark.asyncio
async def test_list_locations(client: AsyncClient, auth_headers: dict, test_location: Location):
    """Test listing locations."""
    response = await client.get("/api/v1/inventory/locations", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert len(data["items"]) == 1
    assert data["items"][0]["code"] == "MAIN-ST"


@pytest.mark.asyncio
async def test_create_location(client: AsyncClient, auth_headers: dict, test_library: Library):
    """Test creating a new location."""
    location_data = {
        "name": "Reference Section",
        "code": "REF-SEC",
        "description": "Reference materials section",
        "library_id": str(test_library.id),
        "is_active": True,
    }

    response = await client.post("/api/v1/inventory/locations", json=location_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Reference Section"
    assert data["code"] == "REF-SEC"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_create_location_duplicate_code(client: AsyncClient, auth_headers: dict, test_location: Location):
    """Test creating location with duplicate code."""
    location_data = {
        "name": "Duplicate Location",
        "code": test_location.code,  # Duplicate
    }

    response = await client.post("/api/v1/inventory/locations", json=location_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Location code already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_location(client: AsyncClient, auth_headers: dict, test_location: Location):
    """Test getting a single location."""
    response = await client.get(f"/api/v1/inventory/locations/{test_location.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_location.id)
    assert data["name"] == test_location.name


@pytest.mark.asyncio
async def test_update_location(client: AsyncClient, auth_headers: dict, test_location: Location):
    """Test updating a location."""
    update_data = {"name": "Updated Location Name", "description": "Updated description"}

    response = await client.put(
        f"/api/v1/inventory/locations/{test_location.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Location Name"
    assert data["description"] == "Updated description"


@pytest.mark.asyncio
async def test_delete_location(client: AsyncClient, auth_headers: dict, test_location: Location):
    """Test deleting a location."""
    response = await client.delete(f"/api/v1/inventory/locations/{test_location.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/inventory/locations/{test_location.id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_filter_locations_by_library(client: AsyncClient, auth_headers: dict, test_location: Location, test_library: Library):
    """Test filtering locations by library."""
    response = await client.get(
        f"/api/v1/inventory/locations?library_id={test_library.id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert all(item["library_id"] == str(test_library.id) for item in data["items"])


# ===========================
# Library Tests
# ===========================

@pytest.mark.asyncio
async def test_list_libraries(client: AsyncClient, auth_headers: dict, test_library: Library):
    """Test listing libraries."""
    response = await client.get("/api/v1/inventory/libraries", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert len(data["items"]) == 1
    assert data["items"][0]["code"] == "MAIN"


@pytest.mark.asyncio
async def test_create_library(client: AsyncClient, auth_headers: dict):
    """Test creating a new library."""
    library_data = {
        "name": "Branch Library",
        "code": "BRANCH",
    }

    response = await client.post("/api/v1/inventory/libraries", json=library_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Branch Library"
    assert data["code"] == "BRANCH"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_create_library_duplicate_code(client: AsyncClient, auth_headers: dict, test_library: Library):
    """Test creating library with duplicate code."""
    library_data = {
        "name": "Duplicate Library",
        "code": test_library.code,  # Duplicate
    }

    response = await client.post("/api/v1/inventory/libraries", json=library_data, headers=auth_headers)
    assert response.status_code == 400
    assert "Library code already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_library(client: AsyncClient, auth_headers: dict, test_library: Library):
    """Test getting a single library."""
    response = await client.get(f"/api/v1/inventory/libraries/{test_library.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_library.id)
    assert data["name"] == test_library.name


@pytest.mark.asyncio
async def test_update_library(client: AsyncClient, auth_headers: dict, test_library: Library):
    """Test updating a library."""
    update_data = {"name": "Updated Library Name"}

    response = await client.put(
        f"/api/v1/inventory/libraries/{test_library.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Library Name"


@pytest.mark.asyncio
async def test_delete_library(client: AsyncClient, auth_headers: dict, test_library: Library):
    """Test deleting a library."""
    response = await client.delete(f"/api/v1/inventory/libraries/{test_library.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/inventory/libraries/{test_library.id}", headers=auth_headers)
    assert response.status_code == 404


# ===========================
# Pagination Tests
# ===========================

@pytest.mark.asyncio
async def test_pagination_instances(client: AsyncClient, auth_headers: dict, db_session: AsyncSession, test_tenant: Tenant, test_user: User):
    """Test pagination for instances."""
    # Create 15 instances
    for i in range(15):
        instance = Instance(
            title=f"Book Title {i}",
            instance_type="text",
            tenant_id=test_tenant.id,
            created_by_user_id=test_user.id,
        )
        db_session.add(instance)
    await db_session.commit()

    # Test page 1
    response = await client.get("/api/v1/inventory/instances?page=1&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["items"]) == 10
    assert data["total_pages"] == 2

    # Test page 2
    response = await client.get("/api/v1/inventory/instances?page=2&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5


# ===========================
# Error Handling Tests
# ===========================

@pytest.mark.asyncio
async def test_get_instance_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent instance."""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.get(f"/api/v1/inventory/instances/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_instance_not_found(client: AsyncClient, auth_headers: dict):
    """Test updating a non-existent instance."""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.put(
        f"/api/v1/inventory/instances/{fake_id}",
        json={"title": "Updated"},
        headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    """Test accessing endpoints without authentication."""
    response = await client.get("/api/v1/inventory/instances")
    assert response.status_code == 401
