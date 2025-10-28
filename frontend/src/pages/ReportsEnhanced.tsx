import { useState, useEffect } from 'react'
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiFileText, FiClock, FiDownload } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'

type ReportType = 'circulation' | 'collection' | 'financial' | 'overdue'
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

const ReportsEnhanced = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [reportType, setReportType] = useState<ReportType>('circulation')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // Mock statistics - in a real app, these would come from the backend
  const stats = {
    totalReports: 156,
    generatedToday: 8,
    scheduled: 12,
    totalCirculation: 3420
  }

  const handleGenerateReport = () => {
    setLoading(true)
    // Simulate report generation
    setTimeout(() => {
      setLoading(false)
      alert(t('reports.success.generated'))
    }, 1500)
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="folio-card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('reports.totalReports')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1 number-display">{stats.totalReports}</p>
            </div>
            <div className="p-3 bg-gray-200 rounded-lg">
              <FiFileText className="text-gray-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">{t('reports.generatedToday')}</p>
              <p className="text-3xl font-bold text-blue-900 mt-1 number-display">{stats.generatedToday}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <FiTrendingUp className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">{t('reports.scheduled')}</p>
              <p className="text-3xl font-bold text-purple-900 mt-1 number-display">{stats.scheduled}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <FiClock className="text-purple-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">{t('reports.stats.totalCirculation')}</p>
              <p className="text-3xl font-bold text-green-900 mt-1 number-display">{stats.totalCirculation}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <FiDollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
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

        {/* Recent Reports Panel */}
        <div className="lg:col-span-1">
          <div className="folio-card sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.recentReports')}</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{t(`reports.type.${['circulation', 'financial', 'collection', 'overdue'][i % 4] as ReportType}`)}</div>
                      <div className="text-xs text-gray-500 mt-1 number-display">
                        {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {['CSV', 'PDF', 'Excel', 'PDF'][i % 4]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsEnhanced
