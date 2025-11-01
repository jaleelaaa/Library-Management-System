import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Role, RoleListItem, RoleCreate, RoleUpdate, Permission } from '../../types/role'
import * as rolesService from '../../services/rolesService'
import { toast } from 'react-toastify'

interface RolesState {
  roles: RoleListItem[]
  selectedRole: Role | null
  permissions: Permission[]
  loading: boolean
  error: string | null
}

const initialState: RolesState = {
  roles: [],
  selectedRole: null,
  permissions: [],
  loading: false,
  error: null
}

// Async thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const roles = await rolesService.fetchRoles()
      return roles
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch roles')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch roles')
    }
  }
)

export const fetchRoleById = createAsyncThunk(
  'roles/fetchRoleById',
  async (roleId: string, { rejectWithValue }) => {
    try {
      const role = await rolesService.fetchRoleById(roleId)
      return role
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch role')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch role')
    }
  }
)

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: RoleCreate, { rejectWithValue, dispatch }) => {
    try {
      const role = await rolesService.createRole(roleData)
      toast.success('Role created successfully')
      dispatch(fetchRoles())
      return role
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create role')
      return rejectWithValue(error.response?.data?.detail || 'Failed to create role')
    }
  }
)

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ roleId, roleData }: { roleId: string, roleData: RoleUpdate }, { rejectWithValue, dispatch }) => {
    try {
      const role = await rolesService.updateRole(roleId, roleData)
      toast.success('Role updated successfully')
      dispatch(fetchRoles())
      return role
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update role')
      return rejectWithValue(error.response?.data?.detail || 'Failed to update role')
    }
  }
)

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: string, { rejectWithValue, dispatch }) => {
    try {
      await rolesService.deleteRole(roleId)
      toast.success('Role deleted successfully')
      dispatch(fetchRoles())
      return roleId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete role')
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete role')
    }
  }
)

export const fetchPermissions = createAsyncThunk(
  'roles/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const permissions = await rolesService.fetchPermissions()
      return permissions
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch permissions')
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch permissions')
    }
  }
)

// Slice
const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Fetch roles
    builder.addCase(fetchRoles.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchRoles.fulfilled, (state, action) => {
      state.loading = false
      state.roles = action.payload
    })
    builder.addCase(fetchRoles.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch role by ID
    builder.addCase(fetchRoleById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchRoleById.fulfilled, (state, action) => {
      state.loading = false
      state.selectedRole = action.payload
    })
    builder.addCase(fetchRoleById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create role
    builder.addCase(createRole.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createRole.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(createRole.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update role
    builder.addCase(updateRole.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateRole.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(updateRole.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete role
    builder.addCase(deleteRole.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteRole.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(deleteRole.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch permissions
    builder.addCase(fetchPermissions.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchPermissions.fulfilled, (state, action) => {
      state.loading = false
      state.permissions = action.payload
    })
    builder.addCase(fetchPermissions.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  }
})

export const { setSelectedRole, clearError } = rolesSlice.actions
export default rolesSlice.reducer
