import { useState, useEffect } from 'react'
import { FiBarChart2, FiDownload } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import reportsService from '../services/reportsService'
import { toast } from 'react-toastify'

type ReportType = 'circulation' | 'collection' | 'financial' | 'overdue'
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

const ReportsEnhanced = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [reportType, setReportType] = useState<ReportType>('circulation')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // Note: Report history tracking can be added in future
  // For now, showing report generation interface only

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      // Prepare request based on report type
      const filters: any = {}

      // Add date range if provided
      if (startDate || endDate) {
        filters.date_range = {
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      }

      let response: Blob | any

      // Call appropriate API endpoint based on report type
      switch (reportType) {
        case 'circulation':
          response = await reportsService.generateCirculationReport({
            report_type: 'circulation',
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            export_format: exportFormat,
            include_charts: exportFormat === 'pdf'
          })
          break

        case 'collection':
          response = await reportsService.generateCollectionReport({
            report_type: 'collection',
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            export_format: exportFormat,
            include_statistics: true
          })
          break

        case 'financial':
          response = await reportsService.generateFinancialReport({
            report_type: 'financial',
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            export_format: exportFormat,
            include_charts: exportFormat === 'pdf'
          })
          break

        case 'overdue':
          response = await reportsService.generateOverdueReport({
            report_type: 'overdue',
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            export_format: exportFormat,
            min_days_overdue: 1,
            include_fines: true
          })
          break

        default:
          throw new Error(`Unknown report type: ${reportType}`)
      }

      // If response is a Blob (file download), download it
      if (response instanceof Blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const extension = exportFormat === 'excel' ? 'xlsx' : exportFormat
        const filename = `${reportType}_report_${timestamp}.${extension}`
        reportsService.downloadReport(response, filename)
        toast.success(t('reports.success.generated') || 'Report generated successfully!')
      } else {
        // JSON response
        console.log('Report data:', response)
        toast.success(t('reports.success.generated') || 'Report generated successfully!')
      }
    } catch (error: any) {
      console.error('Failed to generate report:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate report'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg shadow-lg">
              <FiBarChart2 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
              <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Report Generation Form */}
      <div className="grid grid-cols-1 gap-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        {/* Configuration Panel */}
        <div>
          <div className="folio-card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('reports.generate')}</h2>

            <div className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reports.reportType')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReportType('circulation')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      reportType === 'circulation'
                        ? 'border-gray-600 bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{t('reports.type.circulation')}</div>
                      <div className="text-xs text-gray-600 mt-1">Loans & returns data</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('collection')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      reportType === 'collection'
                        ? 'border-gray-600 bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{t('reports.type.collection')}</div>
                      <div className="text-xs text-gray-600 mt-1">Catalog statistics</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('financial')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      reportType === 'financial'
                        ? 'border-gray-600 bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{t('reports.type.financial')}</div>
                      <div className="text-xs text-gray-600 mt-1">Revenue & fines</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('overdue')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      reportType === 'overdue'
                        ? 'border-gray-600 bg-gray-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{t('reports.type.overdue')}</div>
                      <div className="text-xs text-gray-600 mt-1">Overdue items</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('reports.startDate')}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('reports.endDate')}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reports.exportFormat')}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['csv', 'excel', 'pdf', 'json'] as ExportFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        exportFormat === format
                          ? 'border-gray-600 bg-gray-50 text-gray-900'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t(`reports.format.${format}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <FiDownload size={20} />
                {loading ? t('reports.generating') : t('reports.generate')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsEnhanced
