/**
 * Audit log TypeScript types matching backend schemas
 */

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
export type AuditStatus = 'SUCCESS' | 'FAILURE'

export interface AuditLog {
  id: string
  timestamp: string
  actor: string | null
  username: string | null
  action: AuditAction
  target: string | null
  resource_type: string | null
  details: Record<string, any>
  status: AuditStatus
  ip_address: string | null
  user_agent: string | null
}

export interface AuditLogFilters {
  page?: number
  page_size?: number
  action?: AuditAction | string
  resource_type?: string
  user_id?: string
  start_date?: string
  end_date?: string
  search?: string
}

export interface PaginatedAuditLogsResponse {
  data: AuditLog[]
  meta: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}

export interface ExportAuditLogsRequest {
  format: 'csv' | 'excel'
  action?: AuditAction | string
  resource_type?: string
  user_id?: string
  start_date?: string
  end_date?: string
  search?: string
}
