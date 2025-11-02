import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardStats, fetchRecentLoans } from '../store/slices/dashboardSlice'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Users,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Database,
  Zap,
  BookMarked,
  UserPlus,
  Repeat
} from 'lucide-react'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, recentLoans, loading, error } = useAppSelector(state => state.dashboard)
  const { t } = useLanguage()

  useEffect(() => {
    dispatch(fetchDashboardStats())
    dispatch(fetchRecentLoans())

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
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: t('stats.totalItems.desc'),
      trend: '+12%'
    },
    {
      title: t('stats.activeLoans'),
      value: stats.activeLoans,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: t('stats.activeLoans.desc'),
      trend: '+8%'
    },
    {
      title: t('stats.totalUsers'),
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: t('stats.totalUsers.desc'),
      trend: '+15%'
    },
    {
      title: t('stats.overdueItems'),
      value: stats.overdueItems,
      icon: AlertCircle,
      color: 'from-red-500 to-orange-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      description: t('stats.overdueItems.desc'),
      trend: stats.overdueItems > 0 ? 'Alert' : 'Good'
    }
  ]

  const quickActions = [
    {
      title: t('quickActions.checkout'),
      description: t('quickActions.checkout.desc'),
      href: '/circulation',
      icon: Repeat,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: t('quickActions.addItem'),
      description: t('quickActions.addItem.desc'),
      href: '/inventory',
      icon: BookMarked,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: t('quickActions.manageUsers'),
      description: t('quickActions.manageUsers.desc'),
      href: '/users',
      icon: UserPlus,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">{t('dashboard.subtitle')}</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="ms-2">{t('dashboard.refresh')}</span>
        </Button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">{t('dashboard.error')}</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistics Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div key={index} variants={item}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                      <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                        className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                        style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                      >
                        <span className={card.textColor}>
                          {loading ? (
                            <span className="inline-block animate-pulse">...</span>
                          ) : (
                            card.value.toLocaleString()
                          )}
                        </span>
                      </motion.p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${action.bgGradient}`}>
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{action.title}</CardTitle>
                    <CardDescription className="text-base">{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      asChild
                      variant="ghost"
                      className="group hover:bg-white/50 w-full justify-between"
                    >
                      <a href={action.href}>
                        <span>{t('quickActions.goTo')} →</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Activity & System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Loans */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {t('activity.recentLoans')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && recentLoans.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-500">{t('common.loading')}</p>
              </div>
            ) : recentLoans.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('activity.noLoans')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLoans.map((loan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {loan.item_title || t('circulation.recent.unknownItem')}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        {t('activity.active')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{t('activity.user')}: {loan.user_name || loan.user_barcode || t('circulation.recent.unknownItem')}</p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t('activity.due')}: {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              {t('system.status')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <div>
                  <p className="font-semibold text-green-900">{t('system.apiStatus')}</p>
                  <p className="text-sm text-green-700">{t('system.apiStatus.desc')}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                <div>
                  <p className="font-semibold text-blue-900">{t('system.database')}</p>
                  <p className="text-sm text-blue-700">{t('system.database.desc')}</p>
                </div>
              </div>
              <Database className="w-5 h-5 text-blue-600" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
                <div>
                  <p className="font-semibold text-purple-900">{t('system.cache')}</p>
                  <p className="text-sm text-purple-700">{t('system.cache.desc')}</p>
                </div>
              </div>
              <Zap className="w-5 h-5 text-purple-600" />
            </motion.div>

            {stats.overdueItems > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-yellow-900">{t('system.overdue')}</p>
                  <p className="text-sm text-yellow-700">{stats.overdueItems} {t('system.overdue.desc')}</p>
                </div>
                <AlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Dashboard
