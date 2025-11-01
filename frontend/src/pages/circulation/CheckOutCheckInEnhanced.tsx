import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { checkOutItem, checkInItem, renewLoan, fetchLoans } from '../../store/slices/circulationSlice'
import { FiArrowDown, FiArrowUp, FiRefreshCw, FiX } from 'react-icons/fi'
import { useLanguage } from '../../contexts/LanguageContext'

const DEFAULT_SERVICE_POINT = '00000000-0000-0000-0000-000000000000'

const CheckOutCheckInEnhanced = () => {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.circulation)
  const { t } = useLanguage()

  const [operation, setOperation] = useState<'checkout' | 'checkin' | 'renew'>('checkout')

  const [checkoutForm, setCheckoutForm] = useState({
    item_barcode: '',
    user_barcode: '',
    service_point_id: DEFAULT_SERVICE_POINT
  })

  const [checkinForm, setCheckinForm] = useState({
    item_barcode: '',
    service_point_id: DEFAULT_SERVICE_POINT
  })

  const [renewForm, setRenewForm] = useState({
    item_barcode: ''
  })

  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(checkOutItem(checkoutForm))

    if (checkOutItem.fulfilled.match(result)) {
      setRecentTransactions(prev => [
        { ...result.payload, type: 'checkout', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])
      setCheckoutForm({ ...checkoutForm, item_barcode: '', user_barcode: '' })
      dispatch(fetchLoans({}))
    }
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(checkInItem(checkinForm))

    if (checkInItem.fulfilled.match(result)) {
      setRecentTransactions(prev => [
        { ...result.payload, type: 'checkin', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])
      setCheckinForm({ ...checkinForm, item_barcode: '' })
      dispatch(fetchLoans({}))
    }
  }

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(renewLoan(renewForm))

    if (renewLoan.fulfilled.match(result)) {
      setRecentTransactions(prev => [
        { ...result.payload, type: 'renew', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])
      setRenewForm({ item_barcode: '' })
      dispatch(fetchLoans({}))
    }
  }

  const clearRecentTransactions = () => {
    setRecentTransactions([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp">
      {/* Left Column: Operations */}
      <div className="lg:col-span-2 space-y-6">
        {/* Operation Selector with Enhanced Design */}
        <div className="folio-card">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setOperation('checkout')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                operation === 'checkout'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5'
              }`}
            >
              <FiArrowDown /> {t('circulation.operation.checkout')}
            </button>
            <button
              onClick={() => setOperation('checkin')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                operation === 'checkin'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5'
              }`}
            >
              <FiArrowUp /> {t('circulation.operation.checkin')}
            </button>
            <button
              onClick={() => setOperation('renew')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                operation === 'renew'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5'
              }`}
            >
              <FiRefreshCw /> {t('circulation.operation.renew')}
            </button>
          </div>

          {/* Check Out Form */}
          {operation === 'checkout' && (
            <form onSubmit={handleCheckOut} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('circulation.checkout.userBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.user_barcode}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, user_barcode: e.target.value })}
                  placeholder={t('circulation.checkout.userPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('circulation.checkout.itemBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.item_barcode}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, item_barcode: e.target.value })}
                  placeholder={t('circulation.checkout.itemPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? t('circulation.checkout.processing') : t('circulation.checkout.button')}
              </button>
            </form>
          )}

          {/* Check In Form */}
          {operation === 'checkin' && (
            <form onSubmit={handleCheckIn} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('circulation.checkin.itemBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={checkinForm.item_barcode}
                  onChange={(e) => setCheckinForm({ ...checkinForm, item_barcode: e.target.value })}
                  placeholder={t('circulation.checkin.itemPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? t('circulation.checkin.processing') : t('circulation.checkin.button')}
              </button>
            </form>
          )}

          {/* Renew Form */}
          {operation === 'renew' && (
            <form onSubmit={handleRenew} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('circulation.renew.itemBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={renewForm.item_barcode}
                  onChange={(e) => setRenewForm({ item_barcode: e.target.value })}
                  placeholder={t('circulation.renew.itemPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? t('circulation.renew.processing') : t('circulation.renew.button')}
              </button>
            </form>
          )}
        </div>

        {/* Instructions Card with Enhanced Design */}
        <div className="folio-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">📋</span> {t('circulation.instructions.title')}
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('circulation.instructions.scanner')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('circulation.instructions.checkout')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('circulation.instructions.checkin')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('circulation.instructions.renew')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('circulation.instructions.recent')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Recent Transactions with Enhanced Design */}
      <div className="lg:col-span-1">
        <div className="folio-card sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-900">{t('circulation.recent.title')}</h3>
            {recentTransactions.length > 0 && (
              <button
                onClick={clearRecentTransactions}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all"
              >
                <FiX size={14} /> {t('circulation.recent.clear')}
              </button>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                <FiRefreshCw className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500">{t('circulation.recent.empty')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md animate-slideInRight ${
                    transaction.type === 'checkout'
                      ? 'bg-green-50 border-green-500'
                      : transaction.type === 'checkin'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        transaction.type === 'checkout'
                          ? 'bg-green-100 text-green-800'
                          : transaction.type === 'checkin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {transaction.type === 'checkout'
                        ? t('circulation.recent.checkedOut')
                        : transaction.type === 'checkin'
                        ? t('circulation.recent.checkedIn')
                        : t('circulation.recent.renewed')}
                    </span>
                    <span className="text-xs text-gray-500 number-display">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="font-semibold text-gray-900">
                      {transaction.item_title || t('circulation.recent.unknownItem')}
                    </div>
                    <div className="text-gray-600">
                      {t('circulation.recent.item')}: <span className="number-display">{transaction.item_barcode}</span>
                    </div>
                    {transaction.user_barcode && (
                      <div className="text-gray-600">
                        {t('circulation.recent.user')}: <span className="number-display">{transaction.user_name || transaction.user_barcode}</span>
                      </div>
                    )}
                    {transaction.due_date && (
                      <div className="text-gray-600">
                        {t('circulation.recent.due')}: <span className="number-display">{new Date(transaction.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {transaction.was_overdue && (
                      <div className="text-red-600 font-semibold">
                        {t('circulation.recent.overdueFine')}: <span className="number-display">${transaction.fine_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckOutCheckInEnhanced
