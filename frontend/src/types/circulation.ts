/**
 * Circulation-related TypeScript types matching backend schemas
 */

export type LoanStatus = 'open' | 'closed' | 'overdue'

export type RequestStatus =
  | 'open_not_yet_filled'
  | 'open_awaiting_pickup'
  | 'open_in_transit'
  | 'closed_filled'
  | 'closed_cancelled'
  | 'closed_unfilled'
  | 'closed_pickup_expired'

export type RequestType = 'hold' | 'recall' | 'page'

// Check-out/Check-in
export interface CheckOutRequest {
  item_barcode: string
  user_barcode: string
  service_point_id: string
  due_date?: string
}

export interface CheckOutResponse {
  loan_id: string
  item_id: string
  user_id: string
  item_barcode: string
  user_barcode: string
  loan_date: string
  due_date: string
  status: LoanStatus
  item_title?: string
  user_name?: string
}

export interface CheckInRequest {
  item_barcode: string
  service_point_id: string
  check_in_date?: string
}

export interface CheckInResponse {
  loan_id: string
  item_id: string
  user_id: string
  item_barcode: string
  user_barcode?: string
  loan_date: string
  due_date: string
  return_date: string
  status: LoanStatus
  item_title?: string
  was_overdue: boolean
  fine_amount?: number
}

export interface RenewRequest {
  item_barcode: string
  user_barcode?: string
}

export interface RenewResponse {
  loan_id: string
  item_id: string
  user_id: string
  previous_due_date: string
  new_due_date: string
  renewal_count: number
  max_renewals: number
}

// Loans
export interface Loan {
  id: string
  user_id: string
  item_id: string
  loan_date: string
  due_date: string
  return_date?: string
  status: LoanStatus
  renewal_count: number
  max_renewals: number
  checkout_service_point_id: string
  checkin_service_point_id?: string
  created_date: string
  updated_date?: string
  tenant_id: string

  // Joined data
  item_barcode?: string
  item_title?: string
  user_barcode?: string
  user_name?: string
}

// Requests
export interface Request {
  id: string
  user_id: string
  item_id: string
  request_type: RequestType
  request_date: string
  request_expiration_date?: string
  status: RequestStatus
  position: number
  fulfillment_preference: string
  pickup_service_point_id?: string
  created_date: string
  updated_date?: string
  tenant_id: string

  // Joined data
  item_barcode?: string
  item_title?: string
  user_barcode?: string
  user_name?: string
}

export interface RequestCreate {
  user_id: string
  item_id: string
  request_type: RequestType
  fulfillment_preference?: string
  pickup_service_point_id?: string
  request_expiration_date?: string
}

// Filters
export interface LoansFilter {
  page?: number
  page_size?: number
  user_id?: string
  item_id?: string
  status?: LoanStatus
  overdue_only?: boolean
}

export interface RequestsFilter {
  page?: number
  page_size?: number
  user_id?: string
  item_id?: string
  status?: RequestStatus
}

// Pagination
export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface PaginatedLoansResponse {
  data: Loan[]
  meta: PaginationMeta
}

export interface PaginatedRequestsResponse {
  data: Request[]
  meta: PaginationMeta
}

// Service Point (for future use)
export interface ServicePoint {
  id: string
  name: string
  code: string
  discovery_display_name: string
  description?: string
  is_active: boolean
}
