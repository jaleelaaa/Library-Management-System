import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type {
  Loan,
  Request,
  LoansFilter,
  RequestsFilter,
  PaginationMeta,
  CheckOutRequest,
  CheckInRequest,
  RenewRequest
} from '../../types/circulation'
import * as circulationService from '../../services/circulationService'
import { toast } from 'react-toastify'

interface CirculationState {
  loans: Loan[]
  requests: Request[]
  selectedLoan: Loan | null
  selectedRequest: Request | null
  loading: boolean
  error: string | null
  loansMeta: PaginationMeta | null
  requestsMeta: PaginationMeta | null
  loansFilters: LoansFilter
  requestsFilters: RequestsFilter
}

const initialState: CirculationState = {
  loans: [],
  requests: [],
  selectedLoan: null,
  selectedRequest: null,
  loading: false,
  error: null,
  loansMeta: null,
  requestsMeta: null,
  loansFilters: {
    page: 1,
    page_size: 20
  },
  requestsFilters: {
    page: 1,
    page_size: 20
  }
}

// ============================================================================
// Async thunks
// ============================================================================

export const checkOutItem = createAsyncThunk(
  'circulation/checkOutItem',
  async (data: CheckOutRequest, { rejectWithValue }) => {
    try {
      const result = await circulationService.checkOutItem(data)
      toast.success(`Item checked out successfully. Due: ${new Date(result.due_date).toLocaleDateString()}`)
      return result
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to check out item'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const checkInItem = createAsyncThunk(
  'circulation/checkInItem',
  async (data: CheckInRequest, { rejectWithValue }) => {
    try {
      const result = await circulationService.checkInItem(data)
      if (result.was_overdue && result.fine_amount) {
        toast.warning(
          `Item checked in. Overdue fine: $${result.fine_amount.toFixed(2)}`
        )
      } else {
        toast.success('Item checked in successfully')
      }
      return result
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to check in item'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const renewLoan = createAsyncThunk(
  'circulation/renewLoan',
  async (data: RenewRequest, { rejectWithValue }) => {
    try {
      const result = await circulationService.renewLoan(data)
      toast.success(`Loan renewed. New due date: ${new Date(result.new_due_date).toLocaleDateString()}`)
      return result
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to renew loan'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchLoans = createAsyncThunk(
  'circulation/fetchLoans',
  async (filters: LoansFilter = {}, { rejectWithValue }) => {
    try {
      const response = await circulationService.fetchLoans(filters)
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch loans')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch loans')
    }
  }
)

export const fetchRequests = createAsyncThunk(
  'circulation/fetchRequests',
  async (filters: RequestsFilter = {}, { rejectWithValue }) => {
    try {
      const response = await circulationService.fetchRequests(filters)
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch requests')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch requests')
    }
  }
)

export const createRequest = createAsyncThunk(
  'circulation/createRequest',
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const request = await circulationService.createRequest(data)
      toast.success('Request created successfully')
      dispatch(fetchRequests())
      return request
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create request')
      return rejectWithValue(error.response?.data?.detail || 'Failed to create request')
    }
  }
)

export const cancelRequest = createAsyncThunk(
  'circulation/cancelRequest',
  async (requestId: string, { rejectWithValue, dispatch }) => {
    try {
      await circulationService.cancelRequest(requestId)
      toast.success('Request cancelled successfully')
      dispatch(fetchRequests())
      return requestId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to cancel request')
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel request')
    }
  }
)

// ============================================================================
// Slice
// ============================================================================

const circulationSlice = createSlice({
  name: 'circulation',
  initialState,
  reducers: {
    setSelectedLoan: (state, action: PayloadAction<Loan | null>) => {
      state.selectedLoan = action.payload
    },
    setSelectedRequest: (state, action: PayloadAction<Request | null>) => {
      state.selectedRequest = action.payload
    },
    setLoansFilters: (state, action: PayloadAction<LoansFilter>) => {
      state.loansFilters = { ...state.loansFilters, ...action.payload }
    },
    setRequestsFilters: (state, action: PayloadAction<RequestsFilter>) => {
      state.requestsFilters = { ...state.requestsFilters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Check out
    builder
      .addCase(checkOutItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkOutItem.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(checkOutItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Check in
    builder
      .addCase(checkInItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkInItem.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(checkInItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Renew
    builder
      .addCase(renewLoan.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(renewLoan.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(renewLoan.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch loans
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false
        state.loans = action.payload.data
        state.loansMeta = action.payload.meta
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch requests
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload.data
        state.requestsMeta = action.payload.meta
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create request
    builder
      .addCase(createRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRequest.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Cancel request
    builder
      .addCase(cancelRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelRequest.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(cancelRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedLoan,
  setSelectedRequest,
  setLoansFilters,
  setRequestsFilters,
  clearError
} = circulationSlice.actions

export default circulationSlice.reducer
