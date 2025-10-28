import { useState, useEffect } from 'react'
import { FiShoppingCart, FiDollarSign, FiFileText, FiUsers, FiTrendingUp } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import Vendors from './acquisitions/Vendors'
import Funds from './acquisitions/Funds'
import PurchaseOrders from './acquisitions/PurchaseOrders'
import Invoices from './acquisitions/Invoices'

type Tab = 'vendors' | 'funds' | 'purchase-orders' | 'invoices'

const AcquisitionsEnhanced = () => {
  const [activeTab, setActiveTab] = useState<Tab>('vendors')
  const [isVisible, setIsVisible] = useState(false)
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // Mock statistics - in a real app, these would come from Redux state
  const stats = {
    totalSpent: 125000,
    activeOrders: 24,
    pendingInvoices: 12,
    activeVendors: 18
  }

  const tabs = [
    { id: 'vendors' as Tab, label: t('acquisitions.tabs.vendors'), icon: FiUsers },
    { id: 'funds' as Tab, label: t('acquisitions.tabs.funds'), icon: FiDollarSign },
    { id: 'purchase-orders' as Tab, label: t('acquisitions.tabs.purchaseOrders'), icon: FiShoppingCart },
    { id: 'invoices' as Tab, label: t('acquisitions.tabs.invoices'), icon: FiFileText },
  ]

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg">
              <FiShoppingCart className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('acquisitions.title')}</h1>
              <p className="text-gray-600 mt-1">{t('acquisitions.subtitle')}</p>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="folio-card bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">{t('acquisitions.totalSpent')}</p>
              <p className="text-3xl font-bold text-teal-900 mt-1 number-display">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-teal-200 rounded-lg">
              <FiTrendingUp className="text-teal-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">{t('acquisitions.activeOrders')}</p>
              <p className="text-3xl font-bold text-cyan-900 mt-1 number-display">{stats.activeOrders}</p>
            </div>
            <div className="p-3 bg-cyan-200 rounded-lg">
              <FiShoppingCart className="text-cyan-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">{t('acquisitions.pendingInvoices')}</p>
              <p className="text-3xl font-bold text-blue-900 mt-1 number-display">{stats.pendingInvoices}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <FiFileText className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">{t('acquisitions.activeVendors')}</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1 number-display">{stats.activeVendors}</p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-lg">
              <FiUsers className="text-emerald-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs with Animation */}
      <div className="border-b border-gray-200 mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <nav className={`-mb-px flex ${isRTL ? 'space-x-reverse' : ''} space-x-8`}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600 transform scale-105'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content with Fade Animation */}
      <div className="tab-content animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        {activeTab === 'vendors' && <Vendors />}
        {activeTab === 'funds' && <Funds />}
        {activeTab === 'purchase-orders' && <PurchaseOrders />}
        {activeTab === 'invoices' && <Invoices />}
      </div>
    </div>
  )
}

export default AcquisitionsEnhanced
