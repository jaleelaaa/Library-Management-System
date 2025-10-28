import { useState } from 'react'
import { FiBook, FiList, FiInbox } from 'react-icons/fi'
import CheckOutCheckIn from './circulation/CheckOutCheckIn'
import Loans from './circulation/Loans'
import Requests from './circulation/Requests'
import { useLanguage } from '../contexts/LanguageContext'

type Tab = 'checkout' | 'loans' | 'requests'

const Circulation = () => {
  const [activeTab, setActiveTab] = useState<Tab>('checkout')
  const { t } = useLanguage()

  const tabs = [
    { id: 'checkout' as Tab, label: t('circulation.tabs.checkout'), icon: FiBook },
    { id: 'loans' as Tab, label: t('circulation.tabs.loans'), icon: FiList },
    { id: 'requests' as Tab, label: t('circulation.tabs.requests'), icon: FiInbox },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('circulation.title')}</h1>
        <p className="text-gray-600 mt-1">{t('circulation.subtitle')}</p>
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
        {activeTab === 'checkout' && <CheckOutCheckIn />}
        {activeTab === 'loans' && <Loans />}
        {activeTab === 'requests' && <Requests />}
      </div>
    </div>
  )
}

export default Circulation
