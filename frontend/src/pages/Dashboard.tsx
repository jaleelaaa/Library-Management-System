import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardStats, fetchRecentLoans } from '../store/slices/dashboardSlice'
import { FiBook, FiUsers, FiRefreshCw, FiAlertCircle, FiTrendingUp, FiClock } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, recentLoans, loading, error } = useAppSelector(state => state.dashboard)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    // Fetch dashboard data on mount
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentLoans())

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats())
      dispatch(fetchRecentLoans())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentLoans())
  }

  const statCards = [
    {
      title: t('stats.totalItems'),
      value: stats.totalItems,
      icon: FiBook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: t('stats.totalItems.desc')
    },
    {
      title: t('stats.activeLoans'),
      value: stats.activeLoans,
      icon: FiTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: t('stats.activeLoans.desc')
    },
    {
      title: t('stats.totalUsers'),
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: t('stats.totalUsers.desc')
    },
    {
      title: t('stats.overdueItems'),
      value: stats.overdueItems,
      icon: FiAlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: t('stats.overdueItems.desc')
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          {t('dashboard.refresh')}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          <p className="font-medium">{t('dashboard.error')}</p>
          <p>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="folio-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                  <p className={`text-3xl font-bold ${card.color} mb-1`}>
                    {loading ? (
                      <span className="inline-block animate-pulse">...</span>
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`${card.color}`} size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="folio-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">{t('quickActions.checkout')}</h3>
          <p className="text-sm text-blue-700 mb-3">{t('quickActions.checkout.desc')}</p>
          <a
            href="/circulation"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition"
          >
            {t('quickActions.goTo')} {t('circulation.title')} →
          </a>
        </div>

        <div className="folio-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">{t('quickActions.addItem')}</h3>
          <p className="text-sm text-green-700 mb-3">{t('quickActions.addItem.desc')}</p>
          <a
            href="/inventory"
            className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition"
          >
            {t('quickActions.goTo')} {t('inventory.title')} →
          </a>
        </div>

        <div className="folio-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">{t('quickActions.manageUsers')}</h3>
          <p className="text-sm text-purple-700 mb-3">{t('quickActions.manageUsers.desc')}</p>
          <a
            href="/users"
            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition"
          >
            {t('quickActions.goTo')} {t('users.title')} →
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FiClock /> {t('activity.recentLoans')}
          </h2>
          <div className="folio-card">
            {loading && recentLoans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : recentLoans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiClock className="mx-auto text-4xl mb-2 text-gray-400" />
                <p>{t('activity.noLoans')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLoans.map((loan, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-md hover:border-primary-300 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">
                        {loan.item_title || t('circulation.recent.unknownItem')}
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {t('activity.active')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{t('activity.user')}: {loan.user_name || loan.user_barcode || t('circulation.recent.unknownItem')}</p>
                      <p>{t('activity.due')}: {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FiAlertCircle /> {t('system.status')}
          </h2>
          <div className="folio-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <p className="font-medium text-green-900">{t('system.apiStatus')}</p>
                  <p className="text-sm text-green-700">{t('system.apiStatus.desc')}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div>
                  <p className="font-medium text-blue-900">{t('system.database')}</p>
                  <p className="text-sm text-blue-700">{t('system.database.desc')}</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-md">
                <div>
                  <p className="font-medium text-purple-900">{t('system.cache')}</p>
                  <p className="text-sm text-purple-700">{t('system.cache.desc')}</p>
                </div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>

              {stats.overdueItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div>
                    <p className="font-medium text-yellow-900">{t('system.overdue')}</p>
                    <p className="text-sm text-yellow-700">{stats.overdueItems} {t('system.overdue.desc')}</p>
                  </div>
                  <FiAlertCircle className="text-yellow-600" size={20} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
