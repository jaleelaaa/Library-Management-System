// TODO: FeesEnhanced component temporarily disabled
// The feesSlice module needs to be created before this component can be used
// This component has been commented out to prevent build errors

import { useLanguage } from '../contexts/LanguageContext'

const FeesEnhanced = () => {
  const { t } = useLanguage()

  return (
    <div className="p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-yellow-900 mb-2">
          {t('fees.underDevelopment') || 'Fees Module Under Development'}
        </h2>
        <p className="text-yellow-700">
          {t('fees.comingSoon') || 'This enhanced fees module is coming soon. Please use the basic Fees page for now.'}
        </p>
      </div>
    </div>
  )
}

export default FeesEnhanced
