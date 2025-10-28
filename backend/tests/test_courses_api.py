"""
Comprehensive tests for Courses API endpoints.
Tests for Courses and Course Reserves.
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

from app.models.course import Course, CourseReserve
from app.models.inventory import Item
from app.models.user import User
from .conftest import assert_pagination_response, assert_uuid_format


@pytest.mark.asyncio
async def test_list_courses(client: AsyncClient, auth_headers: dict, test_course: Course):
    """Test listing courses."""
    response = await client.get("/api/v1/courses/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Introduction to Testing"


@pytest.mark.asyncio
async def test_create_course(client: AsyncClient, auth_headers: dict):
    """Test creating a new course."""
    course_data = {
        "name": "Advanced Testing Techniques",
        "code": "TEST201",
        "term": "Spring 2025",
        "instructor": "Dr. Test",
        "description": "Learn advanced testing methods",
        "is_active": True,
        "start_date": (datetime.now()).isoformat(),
        "end_date": (datetime.now() + timedelta(days=90)).isoformat(),
    }

    response = await client.post("/api/v1/courses/", json=course_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Advanced Testing Techniques"
    assert data["code"] == "TEST201"
    assert data["term"] == "Spring 2025"
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_get_course(client: AsyncClient, auth_headers: dict, test_course: Course):
    """Test getting a single course."""
    response = await client.get(f"/api/v1/courses/{test_course.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_course.id)
    assert data["name"] == test_course.name
    assert data["code"] == test_course.code


@pytest.mark.asyncio
async def test_update_course(client: AsyncClient, auth_headers: dict, test_course: Course):
    """Test updating a course."""
    update_data = {
        "name": "Updated Course Name",
        "instructor": "Prof. Updated",
        "is_active": False,
    }

    response = await client.put(
        f"/api/v1/courses/{test_course.id}",
        json=update_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Course Name"
    assert data["instructor"] == "Prof. Updated"
    assert data["is_active"] is False


@pytest.mark.asyncio
async def test_delete_course(client: AsyncClient, auth_headers: dict, test_course: Course):
    """Test deleting a course."""
    response = await client.delete(f"/api/v1/courses/{test_course.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/courses/{test_course.id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_search_courses_by_name(client: AsyncClient, auth_headers: dict, test_course: Course):
    """Test searching courses by name."""
    response = await client.get("/api/v1/courses/?q=Introduction", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_filter_courses_by_term(client: AsyncClient, auth_headers: dict, test_course: Course, db_session):
    """Test filtering courses by term."""
    # Create another course with different term
    course2 = Course(
        name="Another Course",
        code="TEST102",
        term="Spring 2025",
        instructor="Dr. Another",
        is_active=True,
        tenant_id=test_course.tenant_id,
        created_by_user_id=test_course.created_by_user_id,
    )
    db_session.add(course2)
    await db_session.commit()

    response = await client.get("/api/v1/courses/?term=Spring 2025", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(course["term"] == "Spring 2025" for course in data["items"])


@pytest.mark.asyncio
async def test_filter_courses_by_active_status(client: AsyncClient, auth_headers: dict, test_course: Course, db_session):
    """Test filtering courses by active status."""
    # Create an inactive course
    course2 = Course(
        name="Inactive Course",
        code="INACT01",
        term="Fall 2024",
        instructor="Dr. Inactive",
        is_active=False,
        tenant_id=test_course.tenant_id,
        created_by_user_id=test_course.created_by_user_id,
    )
    db_session.add(course2)
    await db_session.commit()

    response = await client.get("/api/v1/courses/?is_active=true", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert all(course["is_active"] is True for course in data["items"])


@pytest.mark.asyncio
async def test_list_course_reserves(client: AsyncClient, auth_headers: dict, test_course: Course, test_item: Item, db_session):
    """Test listing reserves for a course."""
    # Create a course reserve
    reserve = CourseReserve(
        course_id=test_course.id,
        item_id=test_item.id,
        loan_period_hours=4,
        notes="Required reading",
        tenant_id=test_course.tenant_id,
    )
    db_session.add(reserve)
    await db_session.commit()

    response = await client.get(f"/api/v1/courses/{test_course.id}/reserves", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert_pagination_response(data, expected_total=1)
    assert data["items"][0]["course_id"] == str(test_course.id)


@pytest.mark.asyncio
async def test_add_item_to_reserves(client: AsyncClient, auth_headers: dict, test_course: Course, test_item: Item):
    """Test adding an item to course reserves."""
    reserve_data = {
        "item_id": str(test_item.id),
        "loan_period_hours": 2,
        "notes": "Recommended reading",
    }

    response = await client.post(
        f"/api/v1/courses/{test_course.id}/reserves",
        json=reserve_data,
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["course_id"] == str(test_course.id)
    assert data["item_id"] == str(test_item.id)
    assert data["loan_period_hours"] == 2
    assert_uuid_format(data["id"])


@pytest.mark.asyncio
async def test_remove_item_from_reserves(client: AsyncClient, auth_headers: dict, test_course: Course, test_item: Item, db_session):
    """Test removing an item from course reserves."""
    # Create a reserve first
    reserve = CourseReserve(
        course_id=test_course.id,
        item_id=test_item.id,
        loan_period_hours=4,
        tenant_id=test_course.tenant_id,
    )
    db_session.add(reserve)
    await db_session.commit()
    await db_session.refresh(reserve)

    response = await client.delete(
        f"/api/v1/courses/reserves/{reserve.id}",
        headers=auth_headers
    )
    assert response.status_code == 204

    # Verify deletion
    response = await client.get(f"/api/v1/courses/{test_course.id}/reserves", headers=auth_headers)
    data = response.json()
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_duplicate_reserve_prevention(client: AsyncClient, auth_headers: dict, test_course: Course, test_item: Item, db_session):
    """Test that duplicate reserves are prevented."""
    # Add item to reserves
    reserve = CourseReserve(
        course_id=test_course.id,
        item_id=test_item.id,
        loan_period_hours=4,
        tenant_id=test_course.tenant_id,
    )
    db_session.add(reserve)
    await db_session.commit()

    # Try to add the same item again
    reserve_data = {
        "item_id": str(test_item.id),
        "loan_period_hours": 2,
    }

    response = await client.post(
        f"/api/v1/courses/{test_course.id}/reserves",
        json=reserve_data,
        headers=auth_headers
    )
    # Should fail with 400 or succeed silently depending on implementation
    assert response.status_code in [400, 409]


@pytest.mark.asyncio
async def test_create_course_with_dates(client: AsyncClient, auth_headers: dict):
    """Test creating a course with start and end dates."""
    start_date = datetime.now()
    end_date = start_date + timedelta(days=120)

    course_data = {
        "name": "Semester Course",
        "code": "SEM101",
        "term": "Fall 2024",
        "instructor": "Prof. Semester",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
    }

    response = await client.post("/api/v1/courses/", json=course_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "start_date" in data
    assert "end_date" in data


@pytest.mark.asyncio
async def test_pagination_courses(client: AsyncClient, auth_headers: dict, db_session, test_tenant, test_user):
    """Test pagination for courses."""
    # Create 15 courses
    for i in range(15):
        course = Course(
            name=f"Course {i}",
            code=f"COURSE{i:03d}",
            term="Fall 2024",
            instructor=f"Instructor {i}",
            is_active=True,
            tenant_id=test_tenant.id,
            created_by_user_id=test_user.id,
        )
        db_session.add(course)
    await db_session.commit()

    # Test page 1
    response = await client.get("/api/v1/courses/?page=1&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 15
    assert len(data["items"]) == 10
    assert data["total_pages"] == 2

    # Test page 2
    response = await client.get("/api/v1/courses/?page=2&page_size=10", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5


@pytest.mark.asyncio
async def test_get_course_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent course."""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.get(f"/api/v1/courses/{fake_id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_course_not_found(client: AsyncClient, auth_headers: dict):
    """Test updating a non-existent course."""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.put(
        f"/api/v1/courses/{fake_id}",
        json={"name": "Updated"},
        headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_add_invalid_item_to_reserves(client: AsyncClient, auth_headers: dict, test_course: Course):
    """Test adding a non-existent item to reserves."""
    import uuid
    reserve_data = {
        "item_id": str(uuid.uuid4()),
        "loan_period_hours": 2,
    }

    response = await client.post(
        f"/api/v1/courses/{test_course.id}/reserves",
        json=reserve_data,
        headers=auth_headers
    )
    assert response.status_code == 404
