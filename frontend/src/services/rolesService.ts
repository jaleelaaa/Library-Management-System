import api from './api'
import type { Role, RoleListItem, RoleCreate, RoleUpdate, Permission } from '../types/role'

const BASE_URL = '/permissions'

export const fetchRoles = async (): Promise<RoleListItem[]> => {
  const response = await api.get(`${BASE_URL}/roles`)
  return response.data
}

export const fetchRoleById = async (roleId: string): Promise<Role> => {
  const response = await api.get(`${BASE_URL}/roles/${roleId}`)
  return response.data
}

export const createRole = async (roleData: RoleCreate): Promise<Role> => {
  const response = await api.post(`${BASE_URL}/roles`, roleData)
  return response.data
}

export const updateRole = async (roleId: string, roleData: RoleUpdate): Promise<Role> => {
  const response = await api.put(`${BASE_URL}/roles/${roleId}`, roleData)
  return response.data
}

export const deleteRole = async (roleId: string): Promise<void> => {
  await api.delete(`${BASE_URL}/roles/${roleId}`)
}

export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await api.get(`${BASE_URL}/permissions`)
  return response.data
}
