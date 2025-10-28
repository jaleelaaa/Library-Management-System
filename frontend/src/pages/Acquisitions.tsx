import { useState } from 'react'
import { FiShoppingCart, FiDollarSign, FiFileText, FiUsers } from 'react-icons/fi'
import Vendors from './acquisitions/Vendors'
import Funds from './acquisitions/Funds'
import PurchaseOrders from './acquisitions/PurchaseOrders'
import Invoices from './acquisitions/Invoices'
import { useLanguage } from '../contexts/LanguageContext'

type Tab = 'vendors' | 'funds' | 'purchase-orders' | 'invoices'

const Acquisitions = () => {
  const [activeTab, setActiveTab] = useState<Tab>('vendors')
  const { t } = useLanguage()

  const tabs = [
    { id: 'vendors' as Tab, label: t('acquisitions.tabs.vendors'), icon: FiUsers },
    { id: 'funds' as Tab, label: t('acquisitions.tabs.funds'), icon: FiDollarSign },
    { id: 'purchase-orders' as Tab, label: t('acquisitions.tabs.purchaseOrders'), icon: FiShoppingCart },
    { id: 'invoices' as Tab, label: t('acquisitions.tabs.invoices'), icon: FiFileText },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('acquisitions.title')}</h1>
        <p className="text-gray-600 mt-1">{t('acquisitions.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition
                  ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'vendors' && <Vendors />}
        {activeTab === 'funds' && <Funds />}
        {activeTab === 'purchase-orders' && <PurchaseOrders />}
        {activeTab === 'invoices' && <Invoices />}
      </div>
    </div>
  )
}

export default Acquisitions
