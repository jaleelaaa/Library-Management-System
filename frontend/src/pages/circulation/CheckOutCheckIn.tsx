import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { checkOutItem, checkInItem, renewLoan, fetchLoans } from '../../store/slices/circulationSlice'
import { FiArrowDown, FiArrowUp, FiRefreshCw, FiX } from 'react-icons/fi'

// Default service point ID (should be configurable)
const DEFAULT_SERVICE_POINT = '00000000-0000-0000-0000-000000000000'

const CheckOutCheckIn = () => {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.circulation)

  const [operation, setOperation] = useState<'checkout' | 'checkin' | 'renew'>('checkout')

  // Check-out form
  const [checkoutForm, setCheckoutForm] = useState({
    item_barcode: '',
    user_barcode: '',
    service_point_id: DEFAULT_SERVICE_POINT
  })

  // Check-in form
  const [checkinForm, setCheckinForm] = useState({
    item_barcode: '',
    service_point_id: DEFAULT_SERVICE_POINT
  })

  // Renew form
  const [renewForm, setRenewForm] = useState({
    item_barcode: ''
  })

  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(checkOutItem(checkoutForm))

    if (checkOutItem.fulfilled.match(result)) {
      // Add to recent transactions
      setRecentTransactions(prev => [
        { ...result.payload, type: 'checkout', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])

      // Clear form
      setCheckoutForm({
        ...checkoutForm,
        item_barcode: '',
        user_barcode: ''
      })

      // Refresh loans list
      dispatch(fetchLoans())
    }
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(checkInItem(checkinForm))

    if (checkInItem.fulfilled.match(result)) {
      // Add to recent transactions
      setRecentTransactions(prev => [
        { ...result.payload, type: 'checkin', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])

      // Clear form
      setCheckinForm({
        ...checkinForm,
        item_barcode: ''
      })

      // Refresh loans list
      dispatch(fetchLoans())
    }
  }

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(renewLoan(renewForm))

    if (renewLoan.fulfilled.match(result)) {
      // Add to recent transactions
      setRecentTransactions(prev => [
        { ...result.payload, type: 'renew', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])

      // Clear form
      setRenewForm({ item_barcode: '' })

      // Refresh loans list
      dispatch(fetchLoans())
    }
  }

  const clearRecentTransactions = () => {
    setRecentTransactions([])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Operations */}
      <div className="lg:col-span-2">
        {/* Operation Selector */}
        <div className="folio-card mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setOperation('checkout')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition flex items-center justify-center gap-2 ${
                operation === 'checkout'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiArrowDown /> Check Out
            </button>
            <button
              onClick={() => setOperation('checkin')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition flex items-center justify-center gap-2 ${
                operation === 'checkin'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiArrowUp /> Check In
            </button>
            <button
              onClick={() => setOperation('renew')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition flex items-center justify-center gap-2 ${
                operation === 'renew'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiRefreshCw /> Renew
            </button>
          </div>

          {/* Check Out Form */}
          {operation === 'checkout' && (
            <form onSubmit={handleCheckOut} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.user_barcode}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, user_barcode: e.target.value })}
                  placeholder="Scan or enter user barcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.item_barcode}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, item_barcode: e.target.value })}
                  placeholder="Scan or enter item barcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Check Out Item'}
              </button>
            </form>
          )}

          {/* Check In Form */}
          {operation === 'checkin' && (
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={checkinForm.item_barcode}
                  onChange={(e) => setCheckinForm({ ...checkinForm, item_barcode: e.target.value })}
                  placeholder="Scan or enter item barcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Check In Item'}
              </button>
            </form>
          )}

          {/* Renew Form */}
          {operation === 'renew' && (
            <form onSubmit={handleRenew} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={renewForm.item_barcode}
                  onChange={(e) => setRenewForm({ item_barcode: e.target.value })}
                  placeholder="Scan or enter item barcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 transition"
              >
                {loading ? 'Processing...' : 'Renew Loan'}
              </button>
            </form>
          )}
        </div>

        {/* Instructions */}
        <div className="folio-card bg-blue-50 border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">📋 Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a barcode scanner or type barcodes manually</li>
            <li>• Check out: Scan user barcode first, then item barcode</li>
            <li>• Check in: Scan item barcode only</li>
            <li>• Renew: Scan item barcode to extend due date</li>
            <li>• Recent transactions appear in the panel on the right</li>
          </ul>
        </div>
      </div>

      {/* Right Column: Recent Transactions */}
      <div className="lg:col-span-1">
        <div className="folio-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            {recentTransactions.length > 0 && (
              <button
                onClick={clearRecentTransactions}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <FiX size={14} /> Clear
              </button>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent transactions</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border-l-4 ${
                    transaction.type === 'checkout'
                      ? 'bg-green-50 border-green-500'
                      : transaction.type === 'checkin'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        transaction.type === 'checkout'
                          ? 'bg-green-100 text-green-800'
                          : transaction.type === 'checkin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {transaction.type === 'checkout'
                        ? 'Checked Out'
                        : transaction.type === 'checkin'
                        ? 'Checked In'
                        : 'Renewed'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="font-medium text-gray-900">
                      {transaction.item_title || 'Unknown Item'}
                    </div>
                    <div className="text-gray-600">
                      Item: {transaction.item_barcode}
                    </div>
                    {transaction.user_barcode && (
                      <div className="text-gray-600">
                        User: {transaction.user_name || transaction.user_barcode}
                      </div>
                    )}
                    {transaction.due_date && (
                      <div className="text-gray-600">
                        Due: {new Date(transaction.due_date).toLocaleDateString()}
                      </div>
                    )}
                    {transaction.was_overdue && (
                      <div className="text-red-600 font-medium">
                        Overdue fine: ${transaction.fine_amount?.toFixed(2) || '0.00'}
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

export default CheckOutCheckIn
