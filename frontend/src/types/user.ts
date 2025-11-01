/**
 * User-related TypeScript types matching backend Pydantic schemas
 */

import { RoleSimple } from './role'

export interface Address {
  id?: string
  user_id?: string
  address_line1?: string
  address_line2?: string
  city?: string
  region?: string
  postal_code?: string
  country_id?: string
  address_type?: string
  primary_address: boolean
}

export interface PersonalInfo {
  lastName: string
  firstName: string
  middleName?: string
  preferredFirstName?: string
  pronouns?: string
  email?: string
  phone?: string
  mobilePhone?: string
  dateOfBirth?: string
  preferredContactTypeId?: string
}

export interface User {
  id: string
  username: string
  email: string
  barcode?: string
  active: boolean
  user_type: 'staff' | 'patron' | 'shadow' | 'system' | 'dcb'
  patron_group_id?: string
  patron_group_name?: string
  personal: PersonalInfo
  addresses: Address[]
  roles: RoleSimple[]
  role_ids: string[]
  enrollment_date?: string
  expiration_date?: string
  custom_fields: Record<string, any>
  tags: string[]
  preferred_email_communication: string[]
  created_date: string
  updated_date?: string
  tenant_id: string
}

export interface UserCreate {
  username: string
  email: string
  password: string
  barcode?: string
  active: boolean
  user_type: string
  patron_group_id?: string
  personal: PersonalInfo
  addresses: Address[]
  role_ids?: string[]
  enrollment_date?: string
  expiration_date?: string
  custom_fields?: Record<string, any>
  tags?: string[]
  preferred_email_communication?: string[]
}

export interface UserUpdate {
  username?: string
  email?: string
  barcode?: string
  active?: boolean
  user_type?: string
  patron_group_id?: string
  personal?: PersonalInfo
  role_ids?: string[]
  enrollment_date?: string
  expiration_date?: string
  custom_fields?: Record<string, any>
  tags?: string[]
  preferred_email_communication?: string[]
  password?: string
}

export interface PatronGroup {
  id: string
  group_name: string
  description?: string
  loan_period_days: string
  renewals_allowed: boolean
  created_date: string
  updated_date?: string
  tenant_id: string
  user_count?: number
}

export interface PatronGroupCreate {
  group_name: string
  description?: string
  loan_period_days?: string
  renewals_allowed?: boolean
}

export interface Department {
  id: string
  name: string
  code: string
  created_date: string
  updated_date?: string
  tenant_id: string
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface PaginatedUsersResponse {
  data: User[]
  meta: PaginationMeta
}

export interface UsersFilter {
  search?: string
  active?: boolean
  user_type?: string
  patron_group_id?: string
  page?: number
  page_size?: number
}
