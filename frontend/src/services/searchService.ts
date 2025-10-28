/**
 * Search Service
 * API calls for Elasticsearch-powered advanced search
 */

import api from './api'

export interface SearchFilters {
  instance_type?: string
  languages?: string
  subjects?: string
  year_from?: number
  year_to?: number
}

export interface FacetItem {
  value: string
  count: number
}

export interface SearchFacets {
  instance_types: FacetItem[]
  languages: FacetItem[]
  subjects: FacetItem[]
  publication_years: FacetItem[]
}

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  contributors?: Array<{
    name: string
    contributor_type_id?: string
    primary?: boolean
  }>
  publication?: string
  publication_year?: number
  subjects?: string[]
  languages?: string[]
  instance_type_id?: string
  edition?: string
  series?: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  page_size: number
  total_pages: number
  facets: SearchFacets
}

export interface AutocompleteResponse {
  suggestions: string[]
}

const searchService = {
  /**
   * Advanced search with filters and pagination
   */
  search: async (
    query?: string,
    filters?: SearchFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<SearchResponse> => {
    const params: any = {
      page,
      page_size: pageSize,
    }

    if (query) {
      params.q = query
    }

    if (filters?.instance_type) {
      params.instance_type = filters.instance_type
    }

    if (filters?.languages) {
      params.languages = filters.languages
    }

    if (filters?.subjects) {
      params.subjects = filters.subjects
    }

    if (filters?.year_from) {
      params.year_from = filters.year_from
    }

    if (filters?.year_to) {
      params.year_to = filters.year_to
    }

    const response = await api.get<SearchResponse>('/search/', { params })
    return response.data
  },

  /**
   * Autocomplete suggestions
   */
  autocomplete: async (
    query: string,
    field: string = 'title',
    limit: number = 10
  ): Promise<AutocompleteResponse> => {
    const response = await api.get<AutocompleteResponse>('/search/autocomplete', {
      params: {
        q: query,
        field,
        limit,
      },
    })
    return response.data
  },

  /**
   * Reindex all instances (admin only)
   */
  reindex: async (): Promise<{ message: string; total_instances: number; indexed: number; failed: number }> => {
    const response = await api.post('/search/reindex')
    return response.data
  },

  /**
   * Check search service health
   */
  health: async (): Promise<{ status: string; service: string; available: boolean }> => {
    const response = await api.get('/search/health')
    return response.data
  },
}

export default searchService
