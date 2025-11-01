import { useLanguage } from '@/contexts/LanguageContext'
import { FiGlobe } from 'react-icons/fi'
import { useState } from 'react'

const LanguageSwitcher = () => {
  const { language, setLanguage, t, isRTL } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200 hover:border-blue-300 hover:shadow-md group"
        title={t('language.switch')}
      >
        <FiGlobe className="text-gray-600 group-hover:text-blue-600 transition-colors" size={20} />
        <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
          {language === 'en' ? 'EN' : 'عر'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className={`absolute ${
              isRTL ? 'left-0' : 'right-0'
            } mt-2 w-48 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden animate-scaleIn`}
          >
            {/* English Option */}
            <button
              onClick={() => handleLanguageChange('en')}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                language === 'en' ? 'bg-blue-50 border-s-4 border-blue-500' : ''
              }`}
            >
              <span className="text-2xl">🇬🇧</span>
              <div className="flex-1 text-start">
                <div className="font-semibold text-gray-900">English</div>
                <div className="text-xs text-gray-500">English</div>
              </div>
              {language === 'en' && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Arabic Option */}
            <button
              onClick={() => handleLanguageChange('ar')}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-t-2 border-gray-100 ${
                language === 'ar' ? 'bg-blue-50 border-s-4 border-blue-500' : ''
              }`}
            >
              <span className="text-2xl">🇸🇦</span>
              <div className="flex-1 text-start">
                <div className="font-semibold text-gray-900">العربية</div>
                <div className="text-xs text-gray-500">Arabic</div>
              </div>
              {language === 'ar' && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Info Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t-2 border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {t('language.switch')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
