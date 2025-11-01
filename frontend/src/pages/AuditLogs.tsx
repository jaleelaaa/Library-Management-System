/**
 * Audit Logs Page - View and export system activity logs
 */

import { useEffect, useState } from 'react'
import { FiFileText, FiFilter, FiDownload, FiX, FiUser, FiClock, FiEye } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import PermissionGate from '../components/auth/PermissionGate'
import auditService from '../services/auditService'
import type { AuditLog, AuditLogFilters } from '../types/audit'
import { toast } from 'react-toastify'

const AuditLogs = () => {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Pagination
  const [meta, setMeta] = useState({
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
  })

  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    page_size: 20,
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await auditService.fetchAuditLogs(filters)
      setLogs(response.data)
      setMeta(response.meta)
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error)
      toast.error(error?.response?.data?.detail || t('auditLogs.error.fetch'))
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    })
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
    })
  }

  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage,
    })
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(true)
    try {
      const blob = await auditService.exportAuditLogs({
        format,
        action: filters.action,
        resource_type: filters.resource_type,
        user_id: filters.user_id,
        start_date: filters.start_date,
        end_date: filters.end_date,
        search: filters.search,
      })
      auditService.downloadAuditLogs(blob, format)
      toast.success(t('auditLogs.success.exported'))
    } catch (error: any) {
      console.error('Failed to export audit logs:', error)
      toast.error(error?.response?.data?.detail || t('auditLogs.error.export'))
    } finally {
      setExporting(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      READ: 'bg-yellow-100 text-yellow-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'SUCCESS'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  return (
    <PermissionGate
      permission="audit.read"
      fallback={
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <FiFileText className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              {t('auditLogs.error.noPermission')}
            </h2>
            <p className="text-red-700">
              {t('auditLogs.error.noPermissionDesc')}
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg shadow-lg">
              <FiFileText className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('auditLogs.title')}</h1>
              <p className="text-gray-600 mt-1">{t('auditLogs.subtitle')}</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <FiDownload /> {t('auditLogs.exportCSV')}
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition disabled:opacity-50"
            >
              <FiDownload /> {t('auditLogs.exportExcel')}
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="folio-card mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex justify-between items-center text-left"
          >
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FiFilter /> {t('auditLogs.filters')}
            </div>
            <span className="text-gray-500">
              {showFilters ? t('common.hide') : t('common.show')}
            </span>
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auditLogs.fromDate')}
                </label>
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auditLogs.toDate')}
                </label>
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auditLogs.actionType')}
                </label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                  <option value="READ">READ</option>
                </select>
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auditLogs.resourceTypeFilter')}
                </label>
                <select
                  value={filters.resource_type || ''}
                  onChange={(e) => handleFilterChange('resource_type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('common.all')}</option>
                  <option value="user">Users</option>
                  <option value="instance">Instances</option>
                  <option value="item">Items</option>
                  <option value="loan">Loans</option>
                  <option value="holding">Holdings</option>
                  <option value="order">Orders</option>
                  <option value="invoice">Invoices</option>
                </select>
              </div>

              {/* Search by ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auditLogs.searchById')}
                </label>
                <input
                  type="text"
                  placeholder={t('auditLogs.searchPlaceholder')}
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={fetchLogs}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition"
                >
                  {t('auditLogs.applyFilters')}
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition"
                >
                  {t('auditLogs.clearFilters')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="folio-card">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">{t('auditLogs.loading')}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiFileText className="mx-auto mb-4" size={48} />
              <p className="text-xl mb-2">{t('auditLogs.noLogs')}</p>
              <p>{t('auditLogs.noLogsDesc')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.timestamp')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.user')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.action')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.resourceType')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.resourceId')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.status')}
                      </th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('auditLogs.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <FiClock className="text-gray-400" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400" />
                            {log.username || 'System'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {log.resource_type || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {log.target || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <FiEye /> {t('auditLogs.viewDetails')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.total_pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-700">
                    {t('auditLogs.showing')} {meta.page} {t('common.of')} {meta.total_pages} ({meta.total_items} {t('auditLogs.totalLogs')})
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={meta.page === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {t('common.previous')}
                    </button>
                    <button
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={meta.page === meta.total_pages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
                <h2 className="text-2xl font-bold">{t('auditLogs.details')}</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auditLogs.timestamp')}
                    </label>
                    <p className="text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auditLogs.user')}
                    </label>
                    <p className="text-gray-900">{selectedLog.username || 'System'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auditLogs.action')}
                    </label>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadgeColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auditLogs.status')}
                    </label>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auditLogs.resourceType')}
                    </label>
                    <p className="text-gray-900">{selectedLog.resource_type || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auditLogs.ipAddress')}
                    </label>
                    <p className="text-gray-900">{selectedLog.ip_address || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auditLogs.resourceId')}
                  </label>
                  <p className="text-gray-900 break-all">{selectedLog.target || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auditLogs.userAgent')}
                  </label>
                  <p className="text-gray-900 text-sm break-all">{selectedLog.user_agent || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auditLogs.details')}
                  </label>
                  <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  )
}

export default AuditLogs
