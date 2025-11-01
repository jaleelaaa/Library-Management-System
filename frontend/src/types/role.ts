/**
 * Role and Permission TypeScript types matching backend Pydantic schemas
 */

export interface Permission {
  id: string
  name: string
  display_name: string
  description?: string
  resource: string
  action: string
  created_date: string
  updated_date?: string
}

export interface RoleSimple {
  id: string
  name: string
  display_name: string
  description?: string
  permissions?: Permission[]
}

export interface Role {
  id: string
  name: string
  display_name: string
  description?: string
  is_system: boolean
  permissions: Permission[]
  created_date: string
  updated_date?: string
}

export interface RoleListItem {
  id: string
  name: string
  display_name: string
  description?: string
  is_system: boolean
  permission_count: number
  created_date: string
}

export interface RoleCreate {
  name: string
  display_name: string
  description?: string
  permission_ids?: string[]
}

export interface RoleUpdate {
  name?: string
  display_name?: string
  description?: string
  permission_ids?: string[]
}

export interface PaginatedRolesResponse {
  data: RoleListItem[]
  meta: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}
