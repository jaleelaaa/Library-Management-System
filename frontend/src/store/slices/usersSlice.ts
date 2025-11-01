import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { User, UsersFilter, PaginationMeta, PatronGroup, Department } from '../../types/user'
import * as usersService from '../../services/usersService'
import { toast } from 'react-toastify'

interface UsersState {
  users: User[]
  selectedUser: User | null
  patronGroups: PatronGroup[]
  departments: Department[]
  loading: boolean
  error: string | null
  meta: PaginationMeta | null
  filters: UsersFilter
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  patronGroups: [],
  departments: [],
  loading: false,
  error: null,
  meta: null,
  filters: {
    page: 1,
    page_size: 20
  }
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters: UsersFilter = {}, { rejectWithValue }) => {
    try {
      const response = await usersService.fetchUsers(filters)
      return response
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch users')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch users')
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const user = await usersService.fetchUserById(userId)
      return user
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch user')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: any, { rejectWithValue, dispatch, getState }) => {
    try {
      const user = await usersService.createUser(userData)
      toast.success('User created successfully')
      // Reset to page 1 and clear filters to show the newly created user
      // (new users appear at top due to created_date DESC ordering)
      const state = getState() as { users: UsersState }
      const resetFilters = {
        page: 1,
        page_size: state.users.filters.page_size || 20
      }
      dispatch(setFilters(resetFilters))
      dispatch(fetchUsers(resetFilters))
      return user
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create user')
      return rejectWithValue(error.response?.data?.detail || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }: { userId: string, userData: any }, { rejectWithValue, dispatch, getState }) => {
    try {
      const user = await usersService.updateUser(userId, userData)
      toast.success('User updated successfully')
      // Preserve current filter state when refetching
      const state = getState() as { users: UsersState }
      dispatch(fetchUsers(state.users.filters))
      return user
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update user')
      return rejectWithValue(error.response?.data?.detail || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue, dispatch, getState }) => {
    try {
      await usersService.deleteUser(userId)
      toast.success('User deleted successfully')
      // Preserve current filter state when refetching
      const state = getState() as { users: UsersState }
      dispatch(fetchUsers(state.users.filters))
      return userId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete user')
    }
  }
)

export const fetchPatronGroups = createAsyncThunk(
  'users/fetchPatronGroups',
  async (_, { rejectWithValue }) => {
    try {
      const groups = await usersService.fetchPatronGroups()
      return groups
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch patron groups')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch patron groups')
    }
  }
)

export const fetchDepartments = createAsyncThunk(
  'users/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const departments = await usersService.fetchDepartments()
      return departments
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch departments')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch departments')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload
    },
    setFilters: (state, action: PayloadAction<UsersFilter>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch patron groups
    builder
      .addCase(fetchPatronGroups.fulfilled, (state, action) => {
        state.patronGroups = action.payload
      })

    // Fetch departments
    builder
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload
      })
  },
})

export const { setSelectedUser, setFilters, clearError } = usersSlice.actions
export default usersSlice.reducer
