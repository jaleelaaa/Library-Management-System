import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Instance, InstanceCreate, InstanceUpdate, InstanceFilters, PaginationMeta } from '../../types/inventory'

interface InventoryState {
  instances: Instance[]
  selectedInstance: Instance | null
  loading: boolean
  error: string | null
  meta: PaginationMeta | null
  filters: InstanceFilters
}

const initialState: InventoryState = {
  instances: [],
  selectedInstance: null,
  loading: false,
  error: null,
  meta: null,
  filters: {
    page: 1,
    page_size: 20,
    q: undefined
  }
}

// Async thunks
export const fetchInstances = createAsyncThunk(
  'inventory/fetchInstances',
  async (filters: InstanceFilters = {}) => {
    const response = await api.get('/inventory/instances', { params: filters })
    return response.data
  }
)

export const fetchInstanceById = createAsyncThunk(
  'inventory/fetchInstanceById',
  async (instanceId: string) => {
    const response = await api.get(`/inventory/instances/${instanceId}`)
    return response.data
  }
)

export const createInstance = createAsyncThunk(
  'inventory/createInstance',
  async (instanceData: InstanceCreate) => {
    const response = await api.post('/inventory/instances', instanceData)
    return response.data
  }
)

export const updateInstance = createAsyncThunk(
  'inventory/updateInstance',
  async ({ instanceId, instanceData }: { instanceId: string; instanceData: InstanceUpdate }) => {
    const response = await api.put(`/inventory/instances/${instanceId}`, instanceData)
    return response.data
  }
)

export const deleteInstance = createAsyncThunk(
  'inventory/deleteInstance',
  async (instanceId: string) => {
    await api.delete(`/inventory/instances/${instanceId}`)
    return instanceId
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSelectedInstance: (state, action: PayloadAction<Instance | null>) => {
      state.selectedInstance = action.payload
    },
    setFilters: (state, action: PayloadAction<InstanceFilters>) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch instances
    builder.addCase(fetchInstances.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchInstances.fulfilled, (state, action) => {
      state.loading = false
      state.instances = action.payload.data
      state.meta = action.payload.meta
    })
    builder.addCase(fetchInstances.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch instances'
    })

    // Fetch instance by ID
    builder.addCase(fetchInstanceById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchInstanceById.fulfilled, (state, action) => {
      state.loading = false
      state.selectedInstance = action.payload
    })
    builder.addCase(fetchInstanceById.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch instance'
    })

    // Create instance
    builder.addCase(createInstance.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createInstance.fulfilled, (state, action) => {
      state.loading = false
      state.instances.unshift(action.payload)
    })
    builder.addCase(createInstance.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to create instance'
    })

    // Update instance
    builder.addCase(updateInstance.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateInstance.fulfilled, (state, action) => {
      state.loading = false
      const index = state.instances.findIndex(inst => inst.id === action.payload.id)
      if (index !== -1) {
        state.instances[index] = action.payload
      }
      if (state.selectedInstance?.id === action.payload.id) {
        state.selectedInstance = action.payload
      }
    })
    builder.addCase(updateInstance.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to update instance'
    })

    // Delete instance
    builder.addCase(deleteInstance.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteInstance.fulfilled, (state, action) => {
      state.loading = false
      state.instances = state.instances.filter(inst => inst.id !== action.payload)
      if (state.selectedInstance?.id === action.payload) {
        state.selectedInstance = null
      }
    })
    builder.addCase(deleteInstance.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to delete instance'
    })
  },
})

export const { setSelectedInstance, setFilters, clearError } = inventorySlice.actions
export default inventorySlice.reducer
