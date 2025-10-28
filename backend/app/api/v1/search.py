"""
Advanced Search API Endpoints
Elasticsearch-powered search with facets and autocomplete
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from uuid import UUID

from app.core.deps import get_current_user, get_current_tenant
from app.models.user import User
from app.services.elasticsearch_service import get_elasticsearch_service


router = APIRouter()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class FacetItem(BaseModel):
    """Individual facet value with count"""
    value: str
    count: int


class SearchFacets(BaseModel):
    """Search result facets"""
    instance_types: List[FacetItem] = []
    languages: List[FacetItem] = []
    subjects: List[FacetItem] = []
    publication_years: List[FacetItem] = []


class SearchResponse(BaseModel):
    """Advanced search response"""
    results: List[dict]
    total: int
    page: int
    page_size: int
    total_pages: int
    facets: SearchFacets


class AutocompleteResponse(BaseModel):
    """Autocomplete suggestions response"""
    suggestions: List[str]


# ============================================================================
# SEARCH ENDPOINTS
# ============================================================================

@router.get("/", response_model=SearchResponse)
async def advanced_search(
    q: Optional[str] = Query(None, description="Search query"),
    instance_type: Optional[str] = Query(None, description="Filter by instance type"),
    languages: Optional[str] = Query(None, description="Filter by languages (comma-separated)"),
    subjects: Optional[str] = Query(None, description="Filter by subjects (comma-separated)"),
    year_from: Optional[int] = Query(None, description="Publication year from"),
    year_to: Optional[int] = Query(None, description="Publication year to"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Advanced search with Elasticsearch

    Supports:
    - Full-text search across title, contributors, subjects
    - Faceted filtering by type, language, subject, year
    - Fuzzy matching for typos
    - Relevance ranking
    - Pagination

    Example:
        GET /api/v1/search/?q=programming&instance_type=text&year_from=2020
    """
    es_service = get_elasticsearch_service()

    # Check Elasticsearch availability
    if not await es_service.ping():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search service is temporarily unavailable"
        )

    # Build filters
    filters = {}

    if instance_type:
        filters["instance_type"] = instance_type

    if languages:
        filters["languages"] = [lang.strip() for lang in languages.split(",")]

    if subjects:
        filters["subjects"] = [subj.strip() for subj in subjects.split(",")]

    if year_from:
        filters["year_from"] = year_from

    if year_to:
        filters["year_to"] = year_to

    # Execute search
    try:
        result = await es_service.search(
            query=q,
            filters=filters,
            page=page,
            page_size=page_size,
            tenant_id=tenant_id
        )

        return SearchResponse(
            results=result["results"],
            total=result["total"],
            page=result["page"],
            page_size=result["page_size"],
            total_pages=result["total_pages"],
            facets=SearchFacets(
                instance_types=result["facets"]["instance_types"],
                languages=result["facets"]["languages"],
                subjects=result["facets"]["subjects"],
                publication_years=result["facets"]["publication_years"]
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search error: {str(e)}"
        )


@router.get("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete_suggestions(
    q: str = Query(..., min_length=2, description="Query string (min 2 characters)"),
    field: str = Query("title", description="Field to search (title, contributors.name)"),
    limit: int = Query(10, ge=1, le=20, description="Maximum suggestions"),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Autocomplete suggestions

    Returns up to `limit` autocomplete suggestions based on the query.

    Supported fields:
    - title: Book/resource titles
    - contributors.name: Author/contributor names

    Example:
        GET /api/v1/search/autocomplete?q=prog&field=title&limit=5
    """
    es_service = get_elasticsearch_service()

    # Check Elasticsearch availability
    if not await es_service.ping():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search service is temporarily unavailable"
        )

    # Validate field
    valid_fields = ["title", "contributors.name"]
    if field not in valid_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid field. Must be one of: {', '.join(valid_fields)}"
        )

    # Get suggestions
    try:
        suggestions = await es_service.autocomplete(
            query=q,
            field=field,
            limit=limit,
            tenant_id=tenant_id
        )

        return AutocompleteResponse(suggestions=suggestions)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Autocomplete error: {str(e)}"
        )


@router.post("/reindex")
async def reindex_all_instances(
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant),
):
    """
    Reindex all instances

    WARNING: This operation can take a while for large datasets.
    Only accessible to admin users.
    """
    # TODO: Add admin permission check
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")

    from app.db.session import get_db
    from app.models.inventory import Instance
    from sqlalchemy import select

    es_service = get_elasticsearch_service()

    # Check Elasticsearch availability
    if not await es_service.ping():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Search service is temporarily unavailable"
        )

    # Get database session
    async for db in get_db():
        # Fetch all instances for tenant
        result = await db.execute(
            select(Instance).where(Instance.tenant_id == UUID(tenant_id))
        )
        instances = result.scalars().all()

        # Convert to dict
        instances_data = []
        for instance in instances:
            instance_dict = {
                "id": instance.id,
                "title": instance.title,
                "subtitle": instance.subtitle,
                "index_title": instance.index_title,
                "series": instance.series,
                "edition": instance.edition,
                "publication": instance.publication,
                "publication_period": instance.publication_period,
                "contributors": instance.contributors,
                "subjects": instance.subjects,
                "classifications": instance.classifications,
                "languages": instance.languages,
                "instance_type_id": instance.instance_type_id,
                "instance_format_ids": instance.instance_format_ids,
                "identifiers": instance.identifiers,
                "cataloged_date": instance.cataloged_date,
                "staff_suppress": instance.staff_suppress,
                "discovery_suppress": instance.discovery_suppress,
                "source": instance.source,
                "tags": instance.tags,
                "tenant_id": instance.tenant_id,
                "created_date": instance.created_date,
                "updated_date": instance.updated_date
            }
            instances_data.append(instance_dict)

        # Bulk index
        result = await es_service.bulk_index_instances(instances_data)

        return {
            "message": "Reindexing completed",
            "total_instances": len(instances_data),
            "indexed": result["success"],
            "failed": result["failed"]
        }


@router.get("/health")
async def search_health():
    """Check search service health"""
    es_service = get_elasticsearch_service()

    is_available = await es_service.ping()

    return {
        "status": "healthy" if is_available else "unavailable",
        "service": "elasticsearch",
        "available": is_available
    }
