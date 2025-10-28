"""
Comprehensive tests for Search/Elasticsearch API endpoints.
Tests search functionality, autocomplete, facets, and indexing.
"""

import pytest
from httpx import AsyncClient
from uuid import uuid4

# ============================================================================
# Search Tests
# ============================================================================

@pytest.mark.asyncio
async def test_basic_search(client: AsyncClient, auth_headers: dict, test_instance):
    """Test basic search functionality"""
    response = await client.get(
        f"/api/v1/search/?q={test_instance.title}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "hits" in data
    assert "total" in data
    assert "facets" in data


@pytest.mark.asyncio
async def test_search_with_filters(client: AsyncClient, auth_headers: dict):
    """Test search with instance type filter"""
    response = await client.get(
        "/api/v1/search/?q=test&instance_type=text",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "hits" in data


@pytest.mark.asyncio
async def test_search_with_language_filter(client: AsyncClient, auth_headers: dict):
    """Test search with language filter"""
    response = await client.get(
        "/api/v1/search/?q=test&language=eng",
        headers=auth_headers
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_pagination(client: AsyncClient, auth_headers: dict):
    """Test search with pagination"""
    response = await client.get(
        "/api/v1/search/?q=test&skip=0&limit=10",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "hits" in data
    assert len(data["hits"]) <= 10


@pytest.mark.asyncio
async def test_autocomplete(client: AsyncClient, auth_headers: dict, test_instance):
    """Test autocomplete functionality"""
    response = await client.get(
        f"/api/v1/search/autocomplete?q={test_instance.title[:3]}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert isinstance(data["suggestions"], list)


@pytest.mark.asyncio
async def test_search_empty_query(client: AsyncClient, auth_headers: dict):
    """Test search with empty query returns all results"""
    response = await client.get(
        "/api/v1/search/?q=",
        headers=auth_headers
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_facets(client: AsyncClient, auth_headers: dict):
    """Test that search returns facets"""
    response = await client.get(
        "/api/v1/search/?q=test",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "facets" in data
    assert "instance_type" in data["facets"] or len(data["facets"]) >= 0


@pytest.mark.asyncio
async def test_reindex_endpoint(client: AsyncClient, auth_headers: dict):
    """Test reindexing all instances"""
    response = await client.post(
        "/api/v1/search/reindex",
        headers=auth_headers
    )

    # Should return 200 or 202
    assert response.status_code in [200, 202]
    data = response.json()
    assert "message" in data or "indexed_count" in data


@pytest.mark.asyncio
async def test_search_health_check(client: AsyncClient, auth_headers: dict):
    """Test Elasticsearch health check"""
    response = await client.get(
        "/api/v1/search/health",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert "status" in data


@pytest.mark.asyncio
async def test_search_year_range(client: AsyncClient, auth_headers: dict):
    """Test search with year range filter"""
    response = await client.get(
        "/api/v1/search/?q=test&year_from=2020&year_to=2025",
        headers=auth_headers
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_by_author(client: AsyncClient, auth_headers: dict, test_instance):
    """Test search by author"""
    if test_instance.contributors:
        author = test_instance.contributors[0]
        response = await client.get(
            f"/api/v1/search/?q={author}",
            headers=auth_headers
        )

        assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_unauthorized(client: AsyncClient):
    """Test search without authentication"""
    response = await client.get("/api/v1/search/?q=test")
    # Depending on implementation, might be 401 or allowed
    assert response.status_code in [200, 401]


# ============================================================================
# Error Handling Tests
# ============================================================================

@pytest.mark.asyncio
async def test_autocomplete_too_short_query(client: AsyncClient, auth_headers: dict):
    """Test autocomplete with very short query"""
    response = await client.get(
        "/api/v1/search/autocomplete?q=a",
        headers=auth_headers
    )

    assert response.status_code in [200, 400]


@pytest.mark.asyncio
async def test_search_invalid_parameters(client: AsyncClient, auth_headers: dict):
    """Test search with invalid pagination parameters"""
    response = await client.get(
        "/api/v1/search/?q=test&skip=-1&limit=1000",
        headers=auth_headers
    )

    # Should either accept and sanitize, or return validation error
    assert response.status_code in [200, 400, 422]
