import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardStats, fetchRecentLoans } from '../store/slices/dashboardSlice'
import {
  FiBook,
  FiUsers,
  FiRefreshCw,
  FiAlertCircle,
  FiTrendingUp,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiActivity,
  FiCalendar,
  FiPackage
} from 'react-icons/fi'
import AnimatedCounter from '../components/common/AnimatedCounter'
import { SkeletonCard, SkeletonList } from '../components/common/SkeletonLoader'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import { useLanguage } from '../contexts/LanguageContext'

const DashboardI18n = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { stats, recentLoans, loading, error } = useAppSelector(state => state.dashboard)
  const { t, isRTL } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Initial fetch
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentLoans())

    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats())
      dispatch(fetchRecentLoans())
    }, 30000)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchRecentLoans())
    ])
    setTimeout(() => setRefreshing(false), 500)
  }

  const statCards = [
    {
      title: t('stats.totalItems'),
      value: stats.totalItems || 0,
      icon: FiBook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      description: t('stats.totalItems.desc'),
      trend: { value: 12, isUp: true },
      link: '/inventory'
    },
    {
      title: t('stats.activeLoans'),
      value: stats.activeLoans || 0,
      icon: FiTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
      description: t('stats.activeLoans.desc'),
      trend: { value: 8, isUp: true },
      link: '/circulation'
    },
    {
      title: t('stats.totalUsers'),
      value: stats.totalUsers || 0,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
      description: t('stats.totalUsers.desc'),
      trend: { value: 5, isUp: true },
      link: '/users'
    },
    {
      title: t('stats.overdueItems'),
      value: stats.overdueItems || 0,
      icon: FiAlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      gradient: 'from-red-500 to-red-600',
      description: t('stats.overdueItems.desc'),
      trend: { value: 3, isUp: false },
      link: '/circulation'
    }
  ]

  const quickActions = [
    {
      title: t('quickActions.checkout'),
      description: t('quickActions.checkout.desc'),
      icon: FiCheckCircle,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      link: '/circulation',
      color: 'blue'
    },
    {
      title: t('quickActions.addItem'),
      description: t('quickActions.addItem.desc'),
      icon: FiPackage,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      link: '/inventory',
      color: 'green'
    },
    {
      title: t('quickActions.manageUsers'),
      description: t('quickActions.manageUsers.desc'),
      icon: FiUsers,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      link: '/users',
      color: 'purple'
    }
  ]

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Language Switcher */}
      <div className="flex justify-between items-center mb-8 animate-fadeInDown">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <FiActivity className="text-blue-500" />
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <FiRefreshCw className={`${refreshing || loading ? 'animate-spin' : ''} relative z-10`} />
            <span className="relative z-10">{t('dashboard.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-800 animate-slideInLeft">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold">{t('dashboard.error')}</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading && stats.totalItems === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          statCards.map((card, index) => {
            const Icon = card.icon
            const TrendIcon = card.trend.isUp ? FiArrowUp : FiArrowDown

            return (
              <div
                key={index}
                onClick={() => navigate(card.link)}
                className={`folio-card hover-lift cursor-pointer border-l-4 border-transparent hover:border-${card.color.split('-')[1]}-500 animate-fadeInUp stagger-${index + 1} relative overflow-hidden group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
                      <div className={`text-4xl font-bold ${card.color} mb-2 flex items-baseline gap-2`}>
                        <span className="number-display">
                          <AnimatedCounter end={card.value} duration={1500} />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{card.description}</p>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          card.trend.isUp ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendIcon size={12} />
                          <span className="number-display">{card.trend.value}%</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={card.color} size={28} />
                    </div>
                  </div>

                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${card.gradient} transition-all duration-1000`}
                      style={{ width: `${Math.min((card.value / (stats.totalItems || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon

          return (
            <div
              key={index}
              onClick={() => navigate(action.link)}
              className={`folio-card bg-gradient-to-br ${action.bgGradient} border-${action.color}-200 hover-lift cursor-pointer animate-scaleIn stagger-${index + 1} relative overflow-hidden group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 bg-gradient-to-br ${action.gradient} rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-${action.color}-900 text-lg mb-1`}>{action.title}</h3>
                    <p className={`text-sm text-${action.color}-700`}>{action.description}</p>
                  </div>
                </div>
                <button
                  className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${action.gradient} hover:shadow-lg text-white rounded-lg text-sm font-semibold transition-all duration-200 transform group-hover:translate-x-1`}
                >
                  <span>{t('quickActions.goTo')} {action.title.split(' ')[0]}</span>
                  <FiArrowUp className={isRTL ? '-rotate-135' : 'rotate-45'} size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <div className="animate-fadeInLeft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiClock className="text-blue-600" />
              {t('activity.recentLoans')}
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {t('activity.lastUpdated')}
            </span>
          </div>

          <div className="folio-card min-h-[400px]">
            {loading && recentLoans.length === 0 ? (
              <SkeletonList items={4} />
            ) : recentLoans.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FiClock className="mx-auto text-6xl mb-4 text-gray-300 animate-floating" />
                <p className="text-lg font-medium">{t('activity.noLoans')}</p>
                <p className="text-sm mt-2">{t('activity.noLoans.desc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLoans.slice(0, 5).map((loan, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {loan.item_title || 'Unknown Item'}
                        </div>
                      </div>
                      <span className={`${isRTL ? 'me-2' : 'ms-2'} text-xs px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold shadow-sm`}>
                        {t('activity.active')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiUsers size={14} className="text-gray-400" />
                        <span className="truncate">{t('activity.user')}: {loan.user_name || loan.user_barcode || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar size={14} className="text-gray-400" />
                        <span className="number-display">{t('activity.due')}: {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="animate-fadeInRight">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiActivity className="text-purple-600" />
              {t('system.status')}
            </h2>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-semibold">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {t('system.operational')}
            </div>
          </div>

          <div className="folio-card space-y-4">
            {[
              { name: t('system.apiStatus'), detail: t('system.apiStatus.desc'), color: 'green', icon: FiCheckCircle },
              { name: t('system.database'), detail: t('system.database.desc'), color: 'blue', icon: FiActivity },
              { name: t('system.cache'), detail: t('system.cache.desc'), color: 'purple', icon: FiTrendingUp },
              ...(stats.overdueItems > 0 ? [{
                name: t('system.overdue'),
                detail: `${stats.overdueItems} ${t('system.overdue.desc')}`,
                color: 'yellow',
                icon: FiAlertCircle
              }] : [])
            ].map((service, index) => {
              const ServiceIcon = service.icon

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 bg-${service.color}-50 border-2 border-${service.color}-100 rounded-xl hover:shadow-md transition-all duration-200 animate-scaleIn`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${service.color}-100 rounded-lg`}>
                      <ServiceIcon className={`text-${service.color}-600`} size={20} />
                    </div>
                    <div>
                      <p className={`font-semibold text-${service.color}-900`}>{service.name}</p>
                      <p className={`text-sm text-${service.color}-700`}>{service.detail}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 bg-${service.color}-500 rounded-full ${service.color === 'green' ? 'animate-pulse' : ''}`}></div>
                </div>
              )
            })}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 number-display">
                  <AnimatedCounter end={24} />
                  <span className="text-sm text-gray-500 font-normal">h</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{t('system.uptime')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 number-display">
                  <AnimatedCounter end={98} />
                  <span className="text-sm text-gray-500 font-normal">%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{t('system.performance')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 number-display">
                  <AnimatedCounter end={42} />
                  <span className="text-sm text-gray-500 font-normal">ms</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{t('system.response')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardI18n
