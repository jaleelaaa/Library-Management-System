import React, { useState, useEffect } from 'react';
import reportsService, {
  ReportData,
  DashboardStats,
  CirculationReportRequest,
  CollectionReportRequest,
  FinancialReportRequest,
  OverdueReportRequest,
} from '../services/reportsService';
import { useLanguage } from '../contexts/LanguageContext';

type ReportType = 'circulation' | 'collection' | 'financial' | 'overdue';
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState<ReportType>('circulation');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minDaysOverdue, setMinDaysOverdue] = useState<number>(1);
  const [includeFines, setIncludeFines] = useState<boolean>(true);
  const [includeStatistics, setIncludeStatistics] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const stats = await reportsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const filters: any = {};

      if (startDate || endDate) {
        filters.date_range = {};
        if (startDate) filters.date_range.start_date = startDate;
        if (endDate) filters.date_range.end_date = endDate;
      }

      let result: ReportData | Blob;

      switch (reportType) {
        case 'circulation': {
          const request: CirculationReportRequest = {
            report_type: 'circulation',
            filters,
            export_format: exportFormat,
            include_charts: false,
          };
          result = await reportsService.generateCirculationReport(request);
          break;
        }
        case 'collection': {
          const request: CollectionReportRequest = {
            report_type: 'collection',
            filters,
            export_format: exportFormat,
            include_statistics: includeStatistics,
          };
          result = await reportsService.generateCollectionReport(request);
          break;
        }
        case 'overdue': {
          const request: OverdueReportRequest = {
            report_type: 'overdue',
            filters,
            export_format: exportFormat,
            min_days_overdue: minDaysOverdue,
            include_fines: includeFines,
          };
          result = await reportsService.generateOverdueReport(request);
          break;
        }
        case 'financial': {
          const request: FinancialReportRequest = {
            report_type: 'financial',
            filters,
            export_format: exportFormat,
            include_charts: false,
            summary_only: false,
          };
          result = await reportsService.generateFinancialReport(request);
          break;
        }
        default:
          throw new Error('Invalid report type');
      }

      if (exportFormat === 'json') {
        setReportData(result as ReportData);
      } else {
        // Download file
        const blob = result as Blob;
        const extension = exportFormat === 'excel' ? 'xlsx' : exportFormat;
        const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${extension}`;
        reportsService.downloadReport(blob, filename);
        setReportData(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    const titles: Record<ReportType, string> = {
      circulation: t('reports.titles.circulation'),
      collection: t('reports.titles.collection'),
      financial: t('reports.titles.financial'),
      overdue: t('reports.titles.overdue'),
    };
    return titles[reportType];
  };

  const renderStatCard = (title: string, value: number | string, icon: string, color: string = 'blue') => {
    return (
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`text-3xl text-${color}-500`}>{icon}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('reports.title')}</h1>
        <p className="text-gray-600 mt-2">{t('reports.subtitle')}</p>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('reports.quickStats')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderStatCard(
              t('reports.stats.totalCheckouts'),
              dashboardStats.circulation.total_checkouts,
              '📚',
              'blue'
            )}
            {renderStatCard(
              t('reports.stats.activeLoans'),
              dashboardStats.circulation.active_loans,
              '📖',
              'green'
            )}
            {renderStatCard(
              t('reports.stats.overdueItems'),
              dashboardStats.circulation.overdue_loans,
              '⚠️',
              'red'
            )}
            {renderStatCard(
              t('reports.stats.totalItems'),
              dashboardStats.collection.total_items,
              '📦',
              'purple'
            )}
            {renderStatCard(
              t('reports.stats.totalUsers'),
              dashboardStats.users.total_users,
              '👥',
              'indigo'
            )}
            {renderStatCard(
              t('reports.stats.allocatedFunds'),
              `$${dashboardStats.financial.total_allocated.toFixed(2)}`,
              '💰',
              'yellow'
            )}
            {renderStatCard(
              t('reports.stats.expended'),
              `$${dashboardStats.financial.total_expended.toFixed(2)}`,
              '💸',
              'orange'
            )}
            {renderStatCard(
              t('reports.stats.available'),
              `$${dashboardStats.financial.total_available.toFixed(2)}`,
              '💵',
              'green'
            )}
          </div>
        </div>
      )}

      {/* Report Generator */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('reports.generateReport')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reports.form.reportType')}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="circulation">{t('reports.types.circulation')}</option>
              <option value="collection">{t('reports.types.collection')}</option>
              <option value="overdue">{t('reports.types.overdue')}</option>
              <option value="financial">{t('reports.types.financial')}</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reports.form.exportFormat')}
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="json">{t('reports.formats.json')}</option>
              <option value="csv">{t('reports.formats.csv')}</option>
              <option value="excel">{t('reports.formats.excel')}</option>
              <option value="pdf">{t('reports.formats.pdf')}</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reports.form.startDate')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reports.form.endDate')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Report-specific options */}
          {reportType === 'overdue' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reports.form.minDaysOverdue')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={minDaysOverdue}
                  onChange={(e) => setMinDaysOverdue(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeFines"
                  checked={includeFines}
                  onChange={(e) => setIncludeFines(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeFines" className="ml-2 block text-sm text-gray-700">
                  {t('reports.form.includeFines')}
                </label>
              </div>
            </>
          )}

          {reportType === 'collection' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeStatistics"
                checked={includeStatistics}
                onChange={(e) => setIncludeStatistics(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeStatistics" className="ml-2 block text-sm text-gray-700">
                {t('reports.form.includeStats')}
              </label>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('reports.generating')}
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t('reports.generate')} {getReportTitle()}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Report Data Display (JSON mode) */}
      {reportData && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{reportData.title}</h2>
            <span className="text-sm text-gray-600">
              {t('reports.display.generated')}: {new Date(reportData.generated_at).toLocaleString()}
            </span>
          </div>

          {reportData.description && (
            <p className="text-gray-600 mb-4">{reportData.description}</p>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {t('reports.display.totalRecords')}: <span className="font-semibold">{reportData.total_records}</span>
            </p>
          </div>

          {/* Summary */}
          {reportData.summary && (
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('reports.display.summary')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-600">{key.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          {reportData.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(reportData.data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((value, colIdx) => (
                        <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value !== null && value !== undefined ? String(value) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.data.length > 100 && (
                <p className="text-sm text-gray-600 text-center py-4">
                  {t('reports.display.showing100', { total: reportData.total_records })}
                </p>
              )}
            </div>
          )}

          {reportData.data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('reports.display.noData')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
