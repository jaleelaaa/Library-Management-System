import { useState, useEffect } from 'react'
import reportsService, {
  ReportData,
  DashboardStats,
  CirculationReportRequest,
  CollectionReportRequest,
  FinancialReportRequest,
  OverdueReportRequest,
} from '../services/reportsService'
import { useLanguage } from '../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
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

type ReportType = 'circulation' | 'collection' | 'financial' | 'overdue'
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

const Reports = () => {
  const { t } = useLanguage()
  const [reportType, setReportType] = useState<ReportType>('circulation')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [minDaysOverdue, setMinDaysOverdue] = useState<number>(1)
  const [includeFines, setIncludeFines] = useState<boolean>(true)
  const [includeStatistics, setIncludeStatistics] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setStatsLoading(true)
    try {
      const stats = await reportsService.getDashboardStats()
      setDashboardStats(stats)
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    setError('')
    setReportData(null)

    try {
      const filters: any = {}

      if (startDate || endDate) {
        filters.date_range = {}
        if (startDate) filters.date_range.start_date = startDate
        if (endDate) filters.date_range.end_date = endDate
      }

      let result: ReportData | Blob

      switch (reportType) {
        case 'circulation': {
          const request: CirculationReportRequest = {
            report_type: 'circulation',
            filters,
            export_format: exportFormat,
            include_charts: false,
          }
          result = await reportsService.generateCirculationReport(request)
          break
        }
        case 'collection': {
          const request: CollectionReportRequest = {
            report_type: 'collection',
            filters,
            export_format: exportFormat,
            include_statistics: includeStatistics,
          }
          result = await reportsService.generateCollectionReport(request)
          break
        }
        case 'overdue': {
          const request: OverdueReportRequest = {
            report_type: 'overdue',
            filters,
            export_format: exportFormat,
            min_days_overdue: minDaysOverdue,
            include_fines: includeFines,
          }
          result = await reportsService.generateOverdueReport(request)
          break
        }
        case 'financial': {
          const request: FinancialReportRequest = {
            report_type: 'financial',
            filters,
            export_format: exportFormat,
            include_charts: false,
            summary_only: false,
          }
          result = await reportsService.generateFinancialReport(request)
          break
        }
        default:
          throw new Error('Invalid report type')
      }

      if (exportFormat === 'json') {
        setReportData(result as ReportData)
      } else {
        // Download file
        const blob = result as Blob
        const extension = exportFormat === 'excel' ? 'xlsx' : exportFormat
        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${extension}`
        reportsService.downloadReport(blob, filename)
        setReportData(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate report')
      console.error('Report generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getReportTitle = () => {
    const titles: Record<ReportType, string> = {
      circulation: t('reports.titles.circulation'),
      collection: t('reports.titles.collection'),
      financial: t('reports.titles.financial'),
      overdue: t('reports.titles.overdue'),
    }
    return titles[reportType]
  }

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string
    value: number | string
    icon: any
    color: string
  }) => {
    return (
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${color} rounded-xl`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            {t('reports.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('reports.subtitle')}</p>
        </div>
      </motion.div>

      {/* Dashboard Stats */}
      {statsLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('reports.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : dashboardStats ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {t('reports.quickStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.totalCheckouts')}
                    value={dashboardStats.circulation.total_checkouts}
                    icon={BookOpen}
                    color="from-blue-500 to-cyan-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.activeLoans')}
                    value={dashboardStats.circulation.active_loans}
                    icon={CheckCircle2}
                    color="from-green-500 to-emerald-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.overdueItems')}
                    value={dashboardStats.circulation.overdue_loans}
                    icon={AlertCircle}
                    color="from-red-500 to-orange-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.totalItems')}
                    value={dashboardStats.collection.total_items}
                    icon={FileText}
                    color="from-purple-500 to-violet-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.totalUsers')}
                    value={dashboardStats.users.total_users}
                    icon={Users}
                    color="from-indigo-500 to-blue-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.allocatedFunds')}
                    value={`$${dashboardStats.financial.total_allocated.toFixed(2)}`}
                    icon={DollarSign}
                    color="from-yellow-500 to-amber-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.expended')}
                    value={`$${dashboardStats.financial.total_expended.toFixed(2)}`}
                    icon={TrendingUp}
                    color="from-orange-500 to-red-500"
                  />
                </motion.div>
                <motion.div variants={item}>
                  <StatCard
                    title={t('reports.stats.available')}
                    value={`$${dashboardStats.financial.total_available.toFixed(2)}`}
                    icon={DollarSign}
                    color="from-green-500 to-teal-500"
                  />
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* Report Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {t('reports.generateReport')}
            </CardTitle>
            <CardDescription>
              Select report type, date range, and export format to generate custom reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="reportType" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  {t('reports.form.reportType')}
                </Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                  <SelectTrigger id="reportType" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circulation">{t('reports.types.circulation')}</SelectItem>
                    <SelectItem value="collection">{t('reports.types.collection')}</SelectItem>
                    <SelectItem value="overdue">{t('reports.types.overdue')}</SelectItem>
                    <SelectItem value="financial">{t('reports.types.financial')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <Label htmlFor="exportFormat" className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-500" />
                  {t('reports.form.exportFormat')}
                </Label>
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                  <SelectTrigger id="exportFormat" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">{t('reports.formats.json')}</SelectItem>
                    <SelectItem value="csv">{t('reports.formats.csv')}</SelectItem>
                    <SelectItem value="excel">{t('reports.formats.excel')}</SelectItem>
                    <SelectItem value="pdf">{t('reports.formats.pdf')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {t('reports.form.startDate')}
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  {t('reports.form.endDate')}
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Report-specific options */}
              {reportType === 'overdue' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="minDaysOverdue">
                      {t('reports.form.minDaysOverdue')}
                    </Label>
                    <Input
                      id="minDaysOverdue"
                      type="number"
                      min="1"
                      value={minDaysOverdue}
                      onChange={(e) => setMinDaysOverdue(parseInt(e.target.value))}
                      className="h-11"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="includeFines"
                      checked={includeFines}
                      onCheckedChange={(checked) => setIncludeFines(checked as boolean)}
                    />
                    <Label
                      htmlFor="includeFines"
                      className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('reports.form.includeFines')}
                    </Label>
                  </div>
                </>
              )}

              {reportType === 'collection' && (
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="includeStatistics"
                    checked={includeStatistics}
                    onCheckedChange={(checked) => setIncludeStatistics(checked as boolean)}
                  />
                  <Label
                    htmlFor="includeStatistics"
                    className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('reports.form.includeStats')}
                  </Label>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white h-12 text-base shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 me-2 animate-spin" />
                    {t('reports.generating')}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 me-2" />
                    {t('reports.generate')} {getReportTitle()}
                  </>
                )}
              </Button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-red-800 text-sm flex-1">{error}</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Data Display (JSON mode) */}
      <AnimatePresence>
        {reportData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {reportData.title}
                    </CardTitle>
                    {reportData.description && (
                      <CardDescription className="mt-2">{reportData.description}</CardDescription>
                    )}
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-200">
                    {t('reports.display.generated')}: {new Date(reportData.generated_at).toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600">
                    {t('reports.display.totalRecords')}: <span className="font-semibold text-gray-900">{reportData.total_records}</span>
                  </p>
                </div>

                {/* Summary */}
                {reportData.summary && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      {t('reports.display.summary')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded-md shadow-sm">
                          <p className="text-xs text-gray-600 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Table */}
                {reportData.data.length > 0 ? (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            {Object.keys(reportData.data[0]).map((key) => (
                              <TableHead key={key} className="font-semibold">
                                {key.replace(/_/g, ' ').toUpperCase()}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.data.slice(0, 100).map((row, idx) => (
                            <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                              {Object.values(row).map((value, colIdx) => (
                                <TableCell key={colIdx} className="text-gray-900">
                                  {value !== null && value !== undefined ? String(value) : '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {reportData.data.length > 100 && (
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                          {t('reports.display.showing100', { total: reportData.total_records })}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full">
                        <FileText className="w-12 h-12 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">{t('reports.display.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reports
