/**
 * Users API service
 */

import api from './api'
import type {
  User,
  UserCreate,
  UserUpdate,
  PaginatedUsersResponse,
  UsersFilter,
  PatronGroup,
  PatronGroupCreate,
  Department
} from '../types/user'

const USERS_BASE_URL = '/users'

/**
 * Fetch users with pagination and filters
 */
export const fetchUsers = async (filters: UsersFilter = {}): Promise<PaginatedUsersResponse> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.active !== undefined) params.append('active', filters.active.toString())
  if (filters.user_type) params.append('user_type', filters.user_type)
  if (filters.patron_group_id) params.append('patron_group_id', filters.patron_group_id)

  const response = await api.get(`${USERS_BASE_URL}/?${params.toString()}`)
  return response.data
}

/**
 * Get a single user by ID
 */
export const fetchUserById = async (userId: string): Promise<User> => {
  const response = await api.get(`${USERS_BASE_URL}/${userId}`)
  return response.data
}

/**
 * Create a new user
 */
export const createUser = async (userData: UserCreate): Promise<User> => {
  const response = await api.post(USERS_BASE_URL, userData)
  return response.data
}

/**
 * Update an existing user
 */
export const updateUser = async (userId: string, userData: UserUpdate): Promise<User> => {
  const response = await api.put(`${USERS_BASE_URL}/${userId}`, userData)
  return response.data
}

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`${USERS_BASE_URL}/${userId}`)
}

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  await api.post(`${USERS_BASE_URL}/${userId}/change-password`, {
    old_password: oldPassword,
    new_password: newPassword
  })
}

/**
 * Bulk create users
 */
export const bulkCreateUsers = async (users: UserCreate[]): Promise<any> => {
  const response = await api.post(`${USERS_BASE_URL}/bulk`, { users })
  return response.data
}

// ============================================================================
// PATRON GROUPS
// ============================================================================

/**
 * Fetch all patron groups
 */
export const fetchPatronGroups = async (): Promise<PatronGroup[]> => {
  const response = await api.get(`${USERS_BASE_URL}/patron-groups/`)
  return response.data
}

/**
 * Create a new patron group
 */
export const createPatronGroup = async (groupData: PatronGroupCreate): Promise<PatronGroup> => {
  const response = await api.post(`${USERS_BASE_URL}/patron-groups/`, groupData)
  return response.data
}

/**
 * Update a patron group
 */
export const updatePatronGroup = async (
  groupId: string,
  groupData: Partial<PatronGroupCreate>
): Promise<PatronGroup> => {
  const response = await api.put(`${USERS_BASE_URL}/patron-groups/${groupId}`, groupData)
  return response.data
}

/**
 * Delete a patron group
 */
export const deletePatronGroup = async (groupId: string): Promise<void> => {
  await api.delete(`${USERS_BASE_URL}/patron-groups/${groupId}`)
}

// ============================================================================
// DEPARTMENTS
// ============================================================================

/**
 * Fetch all departments
 */
export const fetchDepartments = async (): Promise<Department[]> => {
  const response = await api.get(`${USERS_BASE_URL}/departments/`)
  return response.data
}

/**
 * Create a new department
 */
export const createDepartment = async (deptData: { name: string, code: string }): Promise<Department> => {
  const response = await api.post(`${USERS_BASE_URL}/departments/`, deptData)
  return response.data
}

/**
 * Update a department
 */
export const updateDepartment = async (
  deptId: string,
  deptData: Partial<{ name: string, code: string }>
): Promise<Department> => {
  const response = await api.put(`${USERS_BASE_URL}/departments/${deptId}`, deptData)
  return response.data
}

/**
 * Delete a department
 */
export const deleteDepartment = async (deptId: string): Promise<void> => {
  await api.delete(`${USERS_BASE_URL}/departments/${deptId}`)
}
