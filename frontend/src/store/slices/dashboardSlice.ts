import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface DashboardStats {
  totalItems: number
  activeLoans: number
  totalUsers: number
  overdueItems: number
}

interface Loan {
  id: string
  item_title?: string
  user_name?: string
  user_barcode?: string
  due_date?: string
  status: 'open' | 'closed'
  [key: string]: any // Allow additional fields from backend
}

interface DashboardState {
  stats: DashboardStats
  recentLoans: Loan[]
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: {
    totalItems: 0,
    activeLoans: 0,
    totalUsers: 0,
    overdueItems: 0
  },
  recentLoans: [],
  loading: false,
  error: null
}

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async () => {
    // Fetch multiple endpoints in parallel
    const [instancesRes, usersRes, loansRes, overdueRes] = await Promise.all([
      api.get('/inventory/instances', { params: { page: 1, page_size: 1 } }),
      api.get('/users/', { params: { page: 1, page_size: 1 } }),
      api.get('/circulation/loans', { params: { page: 1, page_size: 1, status: 'open' } }),
      api.get('/circulation/loans', { params: { page: 1, page_size: 1, overdue_only: true } })
    ])

    return {
      totalItems: instancesRes.data.meta?.total_items || 0,
      totalUsers: usersRes.data.meta?.total_items || 0,
      activeLoans: loansRes.data.meta?.total_items || 0,
      overdueItems: overdueRes.data.meta?.total_items || 0
    }
  }
)

export const fetchRecentLoans = createAsyncThunk(
  'dashboard/fetchRecentLoans',
  async () => {
    const response = await api.get('/circulation/loans', {
      params: { page: 1, page_size: 5, status: 'open' }
    })
    return response.data.data || []
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch stats
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.loading = false
      state.stats = action.payload
    })
    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch dashboard stats'
    })

    // Fetch recent loans
    builder.addCase(fetchRecentLoans.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchRecentLoans.fulfilled, (state, action) => {
      state.loading = false
      state.recentLoans = action.payload
    })
    builder.addCase(fetchRecentLoans.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch recent loans'
    })
  }
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
