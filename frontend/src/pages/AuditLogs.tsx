/**
 * Audit Logs Page - View and export system activity logs
 */

import { useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import PermissionGate from '../components/auth/PermissionGate'
import auditService from '../services/auditService'
import type { AuditLog, AuditLogFilters } from '../types/audit'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  FileText,
  Download,
  X,
  User,
  Clock,
  Eye,
  Filter,
  Search,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const AuditLogs = () => {
  const { t, language } = useLanguage()
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
    const locale = language === 'ar' ? 'ar-SA' : 'en-US'
    return date.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getActionBadge = (action: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      CREATE: { color: 'from-green-100 to-emerald-100 text-green-700 border-green-200', icon: CheckCircle2 },
      UPDATE: { color: 'from-blue-100 to-cyan-100 text-blue-700 border-blue-200', icon: AlertCircle },
      DELETE: { color: 'from-red-100 to-orange-100 text-red-700 border-red-200', icon: XCircle },
      LOGIN: { color: 'from-purple-100 to-violet-100 text-purple-700 border-purple-200', icon: User },
      LOGOUT: { color: 'from-gray-100 to-slate-100 text-gray-700 border-gray-200', icon: User },
      READ: { color: 'from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200', icon: Eye },
    }
    const badge = badges[action] || badges.READ
    const Icon = badge.icon
    return (
      <Badge className={`bg-gradient-to-r ${badge.color}`}>
        <Icon className="w-3 h-3 me-1" />
        {action}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    return status === 'SUCCESS' ? (
      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3 me-1" />
        {status}
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 me-1" />
        {status}
      </Badge>
    )
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <PermissionGate
      permission="audit.read"
      fallback={
        <div className="p-6">
          <Card className="border-red-200 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-red-100 to-orange-100 rounded-full">
                    <Shield className="w-12 h-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">
                  {t('auditLogs.error.noPermission')}
                </h2>
                <p className="text-red-700">
                  {t('auditLogs.error.noPermissionDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header with gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-500 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              {t('auditLogs.title')}
            </h1>
            <p className="text-gray-600 mt-2">{t('auditLogs.subtitle')}</p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
            >
              <Download className="w-4 h-4 me-2" />
              {t('auditLogs.exportCSV')}
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              disabled={exporting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
            >
              <Download className="w-4 h-4 me-2" />
              {t('auditLogs.exportExcel')}
            </Button>
          </div>
        </motion.div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-md border-0">
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Filter className="w-5 h-5 text-slate-600" />
                      {t('auditLogs.filters')}
                    </CardTitle>
                    <span className="text-sm text-gray-500">
                      {showFilters ? t('common.hide') : t('common.show')}
                    </span>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label htmlFor="fromDate" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {t('auditLogs.fromDate')}
                      </Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={filters.start_date || ''}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toDate" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {t('auditLogs.toDate')}
                      </Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={filters.end_date || ''}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        className="h-11"
                      />
                    </div>

                    {/* Action Type */}
                    <div className="space-y-2">
                      <Label htmlFor="actionType">{t('auditLogs.actionType')}</Label>
                      <Select
                        value={filters.action || 'all'}
                        onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger id="actionType" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('common.all')}</SelectItem>
                          <SelectItem value="CREATE">{t('audit.actions.create')}</SelectItem>
                          <SelectItem value="UPDATE">{t('audit.actions.update')}</SelectItem>
                          <SelectItem value="DELETE">{t('audit.actions.delete')}</SelectItem>
                          <SelectItem value="LOGIN">{t('audit.actions.login')}</SelectItem>
                          <SelectItem value="LOGOUT">{t('audit.actions.logout')}</SelectItem>
                          <SelectItem value="READ">{t('audit.actions.read')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Resource Type */}
                    <div className="space-y-2">
                      <Label htmlFor="resourceType">{t('auditLogs.resourceTypeFilter')}</Label>
                      <Select
                        value={filters.resource_type || 'all'}
                        onValueChange={(value) => handleFilterChange('resource_type', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger id="resourceType" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('common.all')}</SelectItem>
                          <SelectItem value="user">{t('audit.resources.users')}</SelectItem>
                          <SelectItem value="instance">{t('audit.resources.instances')}</SelectItem>
                          <SelectItem value="item">{t('audit.resources.items')}</SelectItem>
                          <SelectItem value="loan">{t('audit.resources.loans')}</SelectItem>
                          <SelectItem value="holding">{t('audit.resources.holdings')}</SelectItem>
                          <SelectItem value="order">{t('audit.resources.orders')}</SelectItem>
                          <SelectItem value="invoice">{t('audit.resources.invoices')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search by ID */}
                    <div className="space-y-2">
                      <Label htmlFor="search" className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-500" />
                        {t('auditLogs.searchById')}
                      </Label>
                      <Input
                        id="search"
                        type="text"
                        placeholder={t('auditLogs.searchPlaceholder')}
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={fetchLogs}
                      className="flex-1 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white"
                    >
                      {t('auditLogs.applyFilters')}
                    </Button>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="flex-1"
                    >
                      {t('auditLogs.clearFilters')}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </motion.div>

        {/* Audit Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-md border-0">
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gradient-to-br from-slate-100 to-gray-100 rounded-full">
                      <FileText className="w-12 h-12 text-slate-600" />
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">{t('auditLogs.noLogs')}</p>
                  <p className="text-gray-500">{t('auditLogs.noLogsDesc')}</p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">{t('auditLogs.timestamp')}</TableHead>
                            <TableHead className="font-semibold">{t('auditLogs.user')}</TableHead>
                            <TableHead className="font-semibold">{t('auditLogs.action')}</TableHead>
                            <TableHead className="font-semibold">{t('auditLogs.resourceType')}</TableHead>
                            <TableHead className="font-semibold">{t('auditLogs.resourceId')}</TableHead>
                            <TableHead className="font-semibold">{t('auditLogs.status')}</TableHead>
                            <TableHead className="font-semibold text-end">{t('auditLogs.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {logs.map((log, index) => (
                              <motion.tr
                                key={log.id}
                                variants={item}
                                initial="hidden"
                                animate="show"
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors border-b"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2 text-gray-900">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {formatTimestamp(log.timestamp)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-gray-900">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {log.username || t('common.system')}
                                  </div>
                                </TableCell>
                                <TableCell>{getActionBadge(log.action)}</TableCell>
                                <TableCell className="text-gray-600">
                                  {log.resource_type || '-'}
                                </TableCell>
                                <TableCell className="text-gray-600 max-w-xs truncate">
                                  {log.target || '-'}
                                </TableCell>
                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                                <TableCell className="text-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(log)}
                                    className="text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                                  >
                                    <Eye className="w-4 h-4 me-1" />
                                    {t('auditLogs.viewDetails')}
                                  </Button>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {meta.total_pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                      <div className="text-sm text-gray-700">
                        {t('auditLogs.showing')} {meta.page} {t('common.of')} {meta.total_pages} ({meta.total_items} {t('auditLogs.totalLogs')})
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePageChange(meta.page - 1)}
                          disabled={meta.page === 1}
                          variant="outline"
                          size="sm"
                        >
                          {t('common.previous')}
                        </Button>
                        <Button
                          onClick={() => handlePageChange(meta.page + 1)}
                          disabled={meta.page === meta.total_pages}
                          variant="outline"
                          size="sm"
                        >
                          {t('common.next')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Modal */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
                {t('auditLogs.details')}
              </DialogTitle>
              <DialogDescription>
                Audit log entry details and metadata
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">{t('auditLogs.timestamp')}</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatTimestamp(selectedLog.timestamp)}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">{t('auditLogs.user')}</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedLog.username || t('common.system')}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">{t('auditLogs.action')}</Label>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">{t('auditLogs.status')}</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">{t('auditLogs.resourceType')}</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedLog.resource_type || '-'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">{t('auditLogs.ipAddress')}</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedLog.ip_address || '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">{t('auditLogs.resourceId')}</Label>
                  <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                    {selectedLog.target || '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">{t('auditLogs.userAgent')}</Label>
                  <p className="text-sm text-gray-900 mt-1 break-all">
                    {selectedLog.user_agent || '-'}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">{t('auditLogs.details')}</Label>
                  <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto border border-gray-200">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  )
}

export default AuditLogs
