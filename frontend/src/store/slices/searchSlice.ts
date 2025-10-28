/**
 * Search Redux Slice
 * State management for advanced search functionality
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import searchService, {
  SearchResponse,
  SearchResult,
  SearchFacets,
  SearchFilters,
  AutocompleteResponse,
} from '../../services/searchService'

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface SearchState {
  results: SearchResult[]
  facets: SearchFacets | null
  total: number
  page: number
  pageSize: number
  totalPages: number
  query: string
  filters: SearchFilters
  loading: boolean
  error: string | null
  autocomplete: {
    suggestions: string[]
    loading: boolean
  }
  searchServiceAvailable: boolean
}

const initialState: SearchState = {
  results: [],
  facets: null,
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  query: '',
  filters: {},
  loading: false,
  error: null,
  autocomplete: {
    suggestions: [],
    loading: false,
  },
  searchServiceAvailable: true,
}

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Perform advanced search
 */
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (
    params: {
      query?: string
      filters?: SearchFilters
      page?: number
      pageSize?: number
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await searchService.search(
        params.query,
        params.filters,
        params.page,
        params.pageSize
      )
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Search failed')
    }
  }
)

/**
 * Get autocomplete suggestions
 */
export const getAutocompleteSuggestions = createAsyncThunk(
  'search/autocomplete',
  async (
    params: {
      query: string
      field?: string
      limit?: number
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await searchService.autocomplete(
        params.query,
        params.field,
        params.limit
      )
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Autocomplete failed')
    }
  }
)

/**
 * Check search service health
 */
export const checkSearchHealth = createAsyncThunk(
  'search/checkHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.health()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Health check failed')
    }
  }
)

/**
 * Reindex all instances
 */
export const reindexInstances = createAsyncThunk(
  'search/reindex',
  async (_, { rejectWithValue }) => {
    try {
      const response = await searchService.reindex()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Reindex failed')
    }
  }
)

// ============================================================================
// SLICE
// ============================================================================

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Set search query
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },

    // Set filters
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload
    },

    // Update a single filter
    updateFilter: (state, action: PayloadAction<{ key: keyof SearchFilters; value: any }>) => {
      state.filters[action.payload.key] = action.payload.value
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {}
    },

    // Reset search state
    resetSearch: (state) => {
      state.results = []
      state.facets = null
      state.total = 0
      state.page = 1
      state.totalPages = 0
      state.query = ''
      state.filters = {}
      state.error = null
    },

    // Clear autocomplete
    clearAutocomplete: (state) => {
      state.autocomplete.suggestions = []
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Perform Search
    builder
      .addCase(performSearch.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload.results
        state.facets = action.payload.facets
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.page_size
        state.totalPages = action.payload.total_pages
        state.searchServiceAvailable = true
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        // Check if error is due to service unavailability
        if (action.payload?.toString().includes('unavailable')) {
          state.searchServiceAvailable = false
        }
      })

    // Autocomplete
    builder
      .addCase(getAutocompleteSuggestions.pending, (state) => {
        state.autocomplete.loading = true
      })
      .addCase(getAutocompleteSuggestions.fulfilled, (state, action) => {
        state.autocomplete.loading = false
        state.autocomplete.suggestions = action.payload.suggestions
      })
      .addCase(getAutocompleteSuggestions.rejected, (state) => {
        state.autocomplete.loading = false
        state.autocomplete.suggestions = []
      })

    // Health Check
    builder
      .addCase(checkSearchHealth.fulfilled, (state, action) => {
        state.searchServiceAvailable = action.payload.available
      })
      .addCase(checkSearchHealth.rejected, (state) => {
        state.searchServiceAvailable = false
      })

    // Reindex
    builder.addCase(reindexInstances.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(reindexInstances.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(reindexInstances.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const {
  setQuery,
  setFilters,
  updateFilter,
  clearFilters,
  resetSearch,
  clearAutocomplete,
  clearError,
} = searchSlice.actions

export default searchSlice.reducer
