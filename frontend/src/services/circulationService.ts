/**
 * Circulation API service
 */

import api from './api'
import type {
  CheckOutRequest,
  CheckOutResponse,
  CheckInRequest,
  CheckInResponse,
  RenewRequest,
  RenewResponse,
  PaginatedLoansResponse,
  PaginatedRequestsResponse,
  LoansFilter,
  RequestsFilter,
  RequestCreate,
  Request
} from '../types/circulation'

const CIRCULATION_BASE_URL = '/circulation'

// ============================================================================
// CHECK-OUT / CHECK-IN / RENEW
// ============================================================================

/**
 * Check out an item to a user
 */
export const checkOutItem = async (data: CheckOutRequest): Promise<CheckOutResponse> => {
  const response = await api.post(`${CIRCULATION_BASE_URL}/check-out`, data)
  return response.data
}

/**
 * Check in an item
 */
export const checkInItem = async (data: CheckInRequest): Promise<CheckInResponse> => {
  const response = await api.post(`${CIRCULATION_BASE_URL}/check-in`, data)
  return response.data
}

/**
 * Renew a loan
 */
export const renewLoan = async (data: RenewRequest): Promise<RenewResponse> => {
  const response = await api.post(`${CIRCULATION_BASE_URL}/renew`, data)
  return response.data
}

// ============================================================================
// LOANS
// ============================================================================

/**
 * Fetch loans with pagination and filters
 */
export const fetchLoans = async (filters: LoansFilter = {}): Promise<PaginatedLoansResponse> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.user_id) params.append('user_id', filters.user_id)
  if (filters.item_id) params.append('item_id', filters.item_id)
  if (filters.status) params.append('status', filters.status)
  if (filters.overdue_only) params.append('overdue_only', filters.overdue_only.toString())

  const response = await api.get(`${CIRCULATION_BASE_URL}/loans?${params.toString()}`)
  return response.data
}

// ============================================================================
// REQUESTS (HOLDS)
// ============================================================================

/**
 * Fetch requests with pagination and filters
 */
export const fetchRequests = async (
  filters: RequestsFilter = {}
): Promise<PaginatedRequestsResponse> => {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.user_id) params.append('user_id', filters.user_id)
  if (filters.item_id) params.append('item_id', filters.item_id)
  if (filters.status) params.append('status', filters.status)

  const response = await api.get(`${CIRCULATION_BASE_URL}/requests?${params.toString()}`)
  return response.data
}

/**
 * Create a new request (hold)
 */
export const createRequest = async (data: RequestCreate): Promise<Request> => {
  const response = await api.post(`${CIRCULATION_BASE_URL}/requests`, data)
  return response.data
}

/**
 * Cancel a request
 */
export const cancelRequest = async (requestId: string): Promise<void> => {
  await api.delete(`${CIRCULATION_BASE_URL}/requests/${requestId}`)
}
