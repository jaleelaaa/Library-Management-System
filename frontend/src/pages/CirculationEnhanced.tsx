import { useState } from 'react'
import { FiBook, FiList, FiInbox } from 'react-icons/fi'
import CheckOutCheckInEnhanced from './circulation/CheckOutCheckInEnhanced'
import Loans from './circulation/Loans'
import Requests from './circulation/Requests'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'

type Tab = 'checkout' | 'loans' | 'requests'

const CirculationEnhanced = () => {
  const [activeTab, setActiveTab] = useState<Tab>('checkout')
  const { t } = useLanguage()

  const tabs = [
    { id: 'checkout' as Tab, label: t('circulation.tabs.checkout'), icon: FiBook },
    { id: 'loans' as Tab, label: t('circulation.tabs.loans'), icon: FiList },
    { id: 'requests' as Tab, label: t('circulation.tabs.requests'), icon: FiInbox },
  ]

  return (
    <div className="p-6">
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
              <FiBook className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('circulation.title')}</h1>
              <p className="text-gray-600 mt-1">{t('circulation.subtitle')}</p>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Enhanced Tabs with Animation */}
      <div className="border-b border-gray-200 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <nav className="-mb-px flex space-x-8">
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
                      ? 'border-orange-600 text-orange-600 transform scale-105'
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
      <div className="tab-content animate-fadeIn">
        {activeTab === 'checkout' && <CheckOutCheckInEnhanced />}
        {activeTab === 'loans' && <Loans />}
        {activeTab === 'requests' && <Requests />}
      </div>
    </div>
  )
}

export default CirculationEnhanced
