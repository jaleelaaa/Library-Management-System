"""
Elasticsearch Service for FOLIO LMS
Provides advanced search, indexing, and autocomplete functionality
"""

from typing import List, Dict, Any, Optional
from elasticsearch import AsyncElasticsearch, exceptions
from datetime import datetime
import logging
from uuid import UUID

logger = logging.getLogger(__name__)


class ElasticsearchService:
    """Elasticsearch service for advanced search capabilities"""

    def __init__(self, hosts: List[str] = None):
        """Initialize Elasticsearch client"""
        if hosts is None:
            hosts = ["http://elasticsearch:9200"]

        self.client = AsyncElasticsearch(
            hosts=hosts,
            max_retries=3,
            retry_on_timeout=True,
            request_timeout=30
        )
        self.index_name = "folio_instances"

    async def close(self):
        """Close Elasticsearch connection"""
        await self.client.close()

    async def ping(self) -> bool:
        """Check if Elasticsearch is available"""
        try:
            return await self.client.ping()
        except Exception as e:
            logger.error(f"Elasticsearch ping failed: {e}")
            return False

    # ========================================================================
    # INDEX MANAGEMENT
    # ========================================================================

    async def create_index(self, delete_existing: bool = False):
        """Create Elasticsearch index with mapping"""

        if delete_existing:
            try:
                await self.client.indices.delete(index=self.index_name)
                logger.info(f"Deleted existing index: {self.index_name}")
            except exceptions.NotFoundError:
                pass

        # Define index mapping
        mapping = {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 1,
                "analysis": {
                    "analyzer": {
                        "autocomplete": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "autocomplete_filter"]
                        },
                        "autocomplete_search": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase"]
                        }
                    },
                    "filter": {
                        "autocomplete_filter": {
                            "type": "edge_ngram",
                            "min_gram": 2,
                            "max_gram": 20
                        }
                    }
                }
            },
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "title": {
                        "type": "text",
                        "analyzer": "autocomplete",
                        "search_analyzer": "autocomplete_search",
                        "fields": {
                            "keyword": {"type": "keyword"},
                            "raw": {"type": "text", "analyzer": "standard"}
                        }
                    },
                    "subtitle": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "index_title": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "series": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "edition": {
                        "type": "keyword"
                    },
                    "publication": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "publication_year": {
                        "type": "integer"
                    },
                    "contributors": {
                        "type": "nested",
                        "properties": {
                            "name": {
                                "type": "text",
                                "analyzer": "autocomplete",
                                "search_analyzer": "autocomplete_search"
                            },
                            "contributor_type_id": {"type": "keyword"},
                            "primary": {"type": "boolean"}
                        }
                    },
                    "subjects": {
                        "type": "keyword"
                    },
                    "classifications": {
                        "type": "nested",
                        "properties": {
                            "classification_number": {"type": "keyword"},
                            "classification_type_id": {"type": "keyword"}
                        }
                    },
                    "languages": {
                        "type": "keyword"
                    },
                    "instance_type_id": {
                        "type": "keyword"
                    },
                    "instance_format_ids": {
                        "type": "keyword"
                    },
                    "identifiers": {
                        "type": "nested",
                        "properties": {
                            "value": {"type": "keyword"},
                            "identifier_type_id": {"type": "keyword"}
                        }
                    },
                    "notes": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "cataloged_date": {
                        "type": "date"
                    },
                    "staff_suppress": {
                        "type": "boolean"
                    },
                    "discovery_suppress": {
                        "type": "boolean"
                    },
                    "source": {
                        "type": "keyword"
                    },
                    "tags": {
                        "type": "keyword"
                    },
                    "tenant_id": {
                        "type": "keyword"
                    },
                    "created_date": {
                        "type": "date"
                    },
                    "updated_date": {
                        "type": "date"
                    }
                }
            }
        }

        try:
            await self.client.indices.create(
                index=self.index_name,
                body=mapping
            )
            logger.info(f"Created index: {self.index_name}")
            return True
        except exceptions.RequestError as e:
            if "resource_already_exists_exception" in str(e):
                logger.info(f"Index already exists: {self.index_name}")
                return True
            else:
                logger.error(f"Error creating index: {e}")
                raise

    # ========================================================================
    # DOCUMENT INDEXING
    # ========================================================================

    async def index_instance(self, instance_data: Dict[str, Any]) -> bool:
        """Index a single instance document"""
        try:
            # Extract publication year from publication_period
            pub_year = None
            if instance_data.get("publication_period"):
                pub_year = instance_data["publication_period"].get("start")

            # Prepare document
            doc = {
                "id": str(instance_data["id"]),
                "title": instance_data.get("title"),
                "subtitle": instance_data.get("subtitle"),
                "index_title": instance_data.get("index_title"),
                "series": instance_data.get("series"),
                "edition": instance_data.get("edition"),
                "publication": instance_data.get("publication"),
                "publication_year": pub_year,
                "contributors": instance_data.get("contributors", []),
                "subjects": instance_data.get("subjects", []),
                "classifications": instance_data.get("classifications", []),
                "languages": instance_data.get("languages", []),
                "instance_type_id": instance_data.get("instance_type_id"),
                "instance_format_ids": instance_data.get("instance_format_ids", []),
                "identifiers": instance_data.get("identifiers", []),
                "notes": instance_data.get("notes", []),
                "cataloged_date": instance_data.get("cataloged_date"),
                "staff_suppress": instance_data.get("staff_suppress", False),
                "discovery_suppress": instance_data.get("discovery_suppress", False),
                "source": instance_data.get("source"),
                "tags": instance_data.get("tags", []),
                "tenant_id": str(instance_data.get("tenant_id")),
                "created_date": instance_data.get("created_date"),
                "updated_date": instance_data.get("updated_date")
            }

            # Index document
            await self.client.index(
                index=self.index_name,
                id=str(instance_data["id"]),
                document=doc
            )

            logger.debug(f"Indexed instance: {instance_data['id']}")
            return True

        except Exception as e:
            logger.error(f"Error indexing instance {instance_data.get('id')}: {e}")
            return False

    async def bulk_index_instances(self, instances: List[Dict[str, Any]]) -> Dict[str, int]:
        """Bulk index multiple instances"""
        from elasticsearch.helpers import async_bulk

        actions = []
        for instance in instances:
            pub_year = None
            if instance.get("publication_period"):
                pub_year = instance["publication_period"].get("start")

            doc = {
                "_index": self.index_name,
                "_id": str(instance["id"]),
                "_source": {
                    "id": str(instance["id"]),
                    "title": instance.get("title"),
                    "subtitle": instance.get("subtitle"),
                    "index_title": instance.get("index_title"),
                    "series": instance.get("series"),
                    "edition": instance.get("edition"),
                    "publication": instance.get("publication"),
                    "publication_year": pub_year,
                    "contributors": instance.get("contributors", []),
                    "subjects": instance.get("subjects", []),
                    "classifications": instance.get("classifications", []),
                    "languages": instance.get("languages", []),
                    "instance_type_id": instance.get("instance_type_id"),
                    "instance_format_ids": instance.get("instance_format_ids", []),
                    "identifiers": instance.get("identifiers", []),
                    "cataloged_date": instance.get("cataloged_date"),
                    "staff_suppress": instance.get("staff_suppress", False),
                    "discovery_suppress": instance.get("discovery_suppress", False),
                    "source": instance.get("source"),
                    "tags": instance.get("tags", []),
                    "tenant_id": str(instance.get("tenant_id")),
                    "created_date": instance.get("created_date"),
                    "updated_date": instance.get("updated_date")
                }
            }
            actions.append(doc)

        try:
            success, failed = await async_bulk(self.client, actions, raise_on_error=False)
            logger.info(f"Bulk indexed: {success} succeeded, {failed} failed")
            return {"success": success, "failed": failed}
        except Exception as e:
            logger.error(f"Error in bulk indexing: {e}")
            return {"success": 0, "failed": len(instances)}

    async def delete_instance(self, instance_id: UUID) -> bool:
        """Delete instance from index"""
        try:
            await self.client.delete(
                index=self.index_name,
                id=str(instance_id)
            )
            logger.debug(f"Deleted instance from index: {instance_id}")
            return True
        except exceptions.NotFoundError:
            logger.warning(f"Instance not found in index: {instance_id}")
            return False
        except Exception as e:
            logger.error(f"Error deleting instance: {e}")
            return False

    # ========================================================================
    # SEARCH OPERATIONS
    # ========================================================================

    async def search(
        self,
        query: str = None,
        filters: Dict[str, Any] = None,
        page: int = 1,
        page_size: int = 20,
        tenant_id: str = None
    ) -> Dict[str, Any]:
        """
        Advanced search with filtering and pagination

        Args:
            query: Search query string
            filters: Dictionary of filters (instance_type, languages, year_range, etc.)
            page: Page number
            page_size: Results per page
            tenant_id: Tenant ID for multi-tenancy

        Returns:
            Dictionary with results, facets, and pagination metadata
        """
        # Calculate offset
        offset = (page - 1) * page_size

        # Build query
        must_clauses = []
        filter_clauses = []

        # Tenant filter (always apply)
        if tenant_id:
            filter_clauses.append({"term": {"tenant_id": tenant_id}})

        # Suppress hidden records
        filter_clauses.append({"term": {"discovery_suppress": False}})

        # Text search
        if query:
            must_clauses.append({
                "multi_match": {
                    "query": query,
                    "fields": [
                        "title^3",
                        "subtitle^2",
                        "contributors.name^2",
                        "subjects",
                        "series",
                        "publication"
                    ],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            })
        else:
            must_clauses.append({"match_all": {}})

        # Apply filters
        if filters:
            # Instance type filter
            if filters.get("instance_type"):
                filter_clauses.append({"term": {"instance_type_id": filters["instance_type"]}})

            # Languages filter
            if filters.get("languages"):
                filter_clauses.append({"terms": {"languages": filters["languages"]}})

            # Publication year range
            if filters.get("year_from") or filters.get("year_to"):
                year_range = {}
                if filters.get("year_from"):
                    year_range["gte"] = filters["year_from"]
                if filters.get("year_to"):
                    year_range["lte"] = filters["year_to"]
                filter_clauses.append({"range": {"publication_year": year_range}})

            # Subjects filter
            if filters.get("subjects"):
                filter_clauses.append({"terms": {"subjects": filters["subjects"]}})

        # Build complete query
        search_query = {
            "query": {
                "bool": {
                    "must": must_clauses,
                    "filter": filter_clauses
                }
            },
            "from": offset,
            "size": page_size,
            "sort": [
                {"_score": {"order": "desc"}},
                {"title.keyword": {"order": "asc"}}
            ],
            "aggs": {
                "instance_types": {
                    "terms": {"field": "instance_type_id", "size": 20}
                },
                "languages": {
                    "terms": {"field": "languages", "size": 50}
                },
                "subjects": {
                    "terms": {"field": "subjects", "size": 100}
                },
                "publication_years": {
                    "terms": {"field": "publication_year", "size": 50, "order": {"_key": "desc"}}
                }
            }
        }

        try:
            response = await self.client.search(
                index=self.index_name,
                body=search_query
            )

            # Extract results
            hits = response["hits"]["hits"]
            total = response["hits"]["total"]["value"]

            results = [hit["_source"] for hit in hits]

            # Extract facets
            facets = {
                "instance_types": [
                    {"value": bucket["key"], "count": bucket["doc_count"]}
                    for bucket in response["aggregations"]["instance_types"]["buckets"]
                ],
                "languages": [
                    {"value": bucket["key"], "count": bucket["doc_count"]}
                    for bucket in response["aggregations"]["languages"]["buckets"]
                ],
                "subjects": [
                    {"value": bucket["key"], "count": bucket["doc_count"]}
                    for bucket in response["aggregations"]["subjects"]["buckets"]
                ],
                "publication_years": [
                    {"value": bucket["key"], "count": bucket["doc_count"]}
                    for bucket in response["aggregations"]["publication_years"]["buckets"]
                ]
            }

            return {
                "results": results,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size,
                "facets": facets
            }

        except Exception as e:
            logger.error(f"Search error: {e}")
            raise

    async def autocomplete(
        self,
        query: str,
        field: str = "title",
        limit: int = 10,
        tenant_id: str = None
    ) -> List[str]:
        """
        Autocomplete suggestions for a field

        Args:
            query: Partial query string
            field: Field to search (title, contributors.name, etc.)
            limit: Maximum number of suggestions
            tenant_id: Tenant ID

        Returns:
            List of autocomplete suggestions
        """
        filter_clauses = []

        if tenant_id:
            filter_clauses.append({"term": {"tenant_id": tenant_id}})

        filter_clauses.append({"term": {"discovery_suppress": False}})

        search_query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {field: {"query": query, "operator": "and"}}}
                    ],
                    "filter": filter_clauses
                }
            },
            "size": limit,
            "_source": [field]
        }

        try:
            response = await self.client.search(
                index=self.index_name,
                body=search_query
            )

            # Extract unique suggestions
            suggestions = []
            seen = set()

            for hit in response["hits"]["hits"]:
                value = hit["_source"].get(field)
                if value and value not in seen:
                    suggestions.append(value)
                    seen.add(value)

                if len(suggestions) >= limit:
                    break

            return suggestions

        except Exception as e:
            logger.error(f"Autocomplete error: {e}")
            return []


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_elasticsearch_service: Optional[ElasticsearchService] = None


def get_elasticsearch_service() -> ElasticsearchService:
    """Get or create Elasticsearch service singleton"""
    global _elasticsearch_service

    if _elasticsearch_service is None:
        _elasticsearch_service = ElasticsearchService()

    return _elasticsearch_service


async def init_elasticsearch():
    """Initialize Elasticsearch service and create index"""
    service = get_elasticsearch_service()

    # Check connection
    if not await service.ping():
        logger.warning("Elasticsearch is not available")
        return False

    # Create index if it doesn't exist
    await service.create_index(delete_existing=False)

    logger.info("Elasticsearch service initialized")
    return True


async def close_elasticsearch():
    """Close Elasticsearch service"""
    global _elasticsearch_service

    if _elasticsearch_service:
        await _elasticsearch_service.close()
        _elasticsearch_service = None

    logger.info("Elasticsearch service closed")
