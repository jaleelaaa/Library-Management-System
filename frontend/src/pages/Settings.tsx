import React, { useState } from 'react';
import Locations from './settings/Locations';
import Libraries from './settings/Libraries';
import FeePolicies from './settings/FeePolicies';
import LoanPolicies from './settings/LoanPolicies';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'locations' | 'libraries' | 'fee-policies' | 'loan-policies';

const Settings: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('locations');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('settings.title')}</h1>
        <p className="text-gray-600 mt-2">{t('settings.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('settings.tabs.locations')}
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'libraries'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('settings.tabs.libraries')}
          </button>
          <button
            onClick={() => setActiveTab('fee-policies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fee-policies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('settings.tabs.feePolicies')}
          </button>
          <button
            onClick={() => setActiveTab('loan-policies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'loan-policies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('settings.tabs.loanPolicies')}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'locations' && <Locations />}
        {activeTab === 'libraries' && <Libraries />}
        {activeTab === 'fee-policies' && <FeePolicies />}
        {activeTab === 'loan-policies' && <LoanPolicies />}
      </div>
    </div>
  );
};

export default Settings;
