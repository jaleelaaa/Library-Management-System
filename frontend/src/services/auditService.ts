/**
 * Audit logs service for fetching and exporting audit trail data
 */

import api from './api'
import type {
  AuditLogFilters,
  PaginatedAuditLogsResponse,
  ExportAuditLogsRequest
} from '../types/audit'

const auditService = {
  /**
   * Fetch audit logs with filters and pagination
   */
  fetchAuditLogs: async (filters: AuditLogFilters = {}): Promise<PaginatedAuditLogsResponse> => {
    const params = new URLSearchParams()

    // Add pagination
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.page_size) params.append('page_size', filters.page_size.toString())

    // Add filters
    if (filters.action) params.append('action', filters.action)
    if (filters.resource_type) params.append('resource_type', filters.resource_type)
    if (filters.user_id) params.append('user_id', filters.user_id)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    if (filters.search) params.append('search', filters.search)

    const response = await api.get<PaginatedAuditLogsResponse>(
      `/audit-logs?${params.toString()}`
    )
    return response.data
  },

  /**
   * Export audit logs to CSV or Excel
   */
  exportAuditLogs: async (request: ExportAuditLogsRequest): Promise<Blob> => {
    const params = new URLSearchParams()

    // Add format
    params.append('format', request.format)

    // Add filters
    if (request.action) params.append('action', request.action)
    if (request.resource_type) params.append('resource_type', request.resource_type)
    if (request.user_id) params.append('user_id', request.user_id)
    if (request.start_date) params.append('start_date', request.start_date)
    if (request.end_date) params.append('end_date', request.end_date)
    if (request.search) params.append('search', request.search)

    const response = await api.post(
      `/audit-logs/export?${params.toString()}`,
      {},
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  /**
   * Download exported audit logs file
   */
  downloadAuditLogs: (blob: Blob, format: 'csv' | 'excel') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const extension = format === 'excel' ? 'xlsx' : 'csv'
    const filename = `audit_logs_${timestamp}.${extension}`

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

export default auditService
