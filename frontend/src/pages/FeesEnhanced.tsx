import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchFees, createFee, updateFee, deleteFee, fetchUsers } from '../store/slices/feesSlice'
import { FiDollarSign, FiSearch, FiFilter, FiPlus, FiEye, FiCreditCard, FiAlertCircle, FiX, FiCheck } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'

interface Fee {
  id: string
  user_id: string
  fee_type: string
  status: string
  amount: number
  remaining: number
  created_at: string
  due_date?: string
  reason?: string
  description?: string
  item_id?: string
}

interface Payment {
  id: string
  fee_id: string
  amount: number
  payment_method: string
  note?: string
  created_at: string
  created_by: string
}

type ModalMode = 'create' | 'pay' | 'waive' | 'view' | null

const FeesEnhanced = () => {
  const dispatch = useAppDispatch()
  const { fees, users, loading } = useAppSelector(state => state.fees)
  const { t, isRTL } = useLanguage()

  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: '',
    note: ''
  })

  const [waiveForm, setWaiveForm] = useState({
    reason: ''
  })

  const [createForm, setCreateForm] = useState({
    user_barcode: '',
    fee_type: 'manual',
    amount: '',
    reason: '',
    description: ''
  })

  useEffect(() => {
    dispatch(fetchFees())
    dispatch(fetchUsers())
    setTimeout(() => setIsVisible(true), 100)
  }, [dispatch])

  // Calculate statistics
  const totalOwed = fees.reduce((sum, fee) => sum + (fee.status === 'open' ? fee.remaining : 0), 0)
  const openFeesCount = fees.filter(fee => fee.status === 'open').length
  const collectedToday = fees
    .filter(fee => {
      const today = new Date().toDateString()
      return fee.status === 'closed' && new Date(fee.created_at).toDateString() === today
    })
    .reduce((sum, fee) => sum + fee.amount, 0)

  // Filter fees
  const filteredFees = fees.filter(fee => {
    const matchesSearch = searchTerm === '' ||
      getUserName(fee.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter
    const matchesType = typeFilter === 'all' || fee.fee_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Unknown User'
  }

  const getUserBarcode = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.barcode || 'N/A'
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFee) return

    // Validate payment amount
    const paymentAmount = parseFloat(paymentForm.amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert(t('fees.error.invalidAmount'))
      return
    }
    if (paymentAmount > selectedFee.remaining) {
      alert(t('fees.error.insufficientAmount'))
      return
    }

    // In a real app, this would call an API endpoint
    // For now, we'll update the fee to reduce remaining balance
    const updatedFee = {
      ...selectedFee,
      remaining: selectedFee.remaining - paymentAmount,
      status: (selectedFee.remaining - paymentAmount) === 0 ? 'closed' : 'open'
    }

    await dispatch(updateFee({ id: selectedFee.id, ...updatedFee }))

    setModalMode(null)
    setPaymentForm({ amount: '', payment_method: '', note: '' })
    dispatch(fetchFees())
  }

  const handleWaive = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFee) return

    const updatedFee = {
      ...selectedFee,
      remaining: 0,
      status: 'closed'
    }

    await dispatch(updateFee({ id: selectedFee.id, ...updatedFee }))

    setModalMode(null)
    setWaiveForm({ reason: '' })
    dispatch(fetchFees())
  }

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault()

    // Find user by barcode
    const user = users.find(u => u.barcode === createForm.user_barcode)
    if (!user) {
      alert('User not found with that barcode')
      return
    }

    const amount = parseFloat(createForm.amount)
    if (isNaN(amount) || amount <= 0) {
      alert(t('fees.error.invalidAmount'))
      return
    }

    const newFee = {
      user_id: user.id,
      fee_type: createForm.fee_type,
      status: 'open',
      amount: amount,
      remaining: amount,
      reason: createForm.reason,
      description: createForm.description
    }

    await dispatch(createFee(newFee))

    setModalMode(null)
    setCreateForm({ user_barcode: '', fee_type: 'manual', amount: '', reason: '', description: '' })
    dispatch(fetchFees())
  }

  const openPaymentModal = (fee: Fee) => {
    setSelectedFee(fee)
    setPaymentForm({ amount: fee.remaining.toString(), payment_method: '', note: '' })
    setModalMode('pay')
  }

  const openWaiveModal = (fee: Fee) => {
    setSelectedFee(fee)
    setWaiveForm({ reason: '' })
    setModalMode('waive')
  }

  const openViewModal = (fee: Fee) => {
    setSelectedFee(fee)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedFee(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'closed': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg shadow-lg">
              <FiDollarSign className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('fees.title')}</h1>
              <p className="text-gray-600 mt-1">{t('fees.subtitle')}</p>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="folio-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">{t('fees.totalOwed')}</p>
              <p className="text-3xl font-bold text-red-900 mt-1 number-display">${totalOwed.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <FiAlertCircle className="text-red-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">{t('fees.openFees')}</p>
              <p className="text-3xl font-bold text-amber-900 mt-1 number-display">{openFeesCount}</p>
            </div>
            <div className="p-3 bg-amber-200 rounded-lg">
              <FiDollarSign className="text-amber-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Collected Today</p>
              <p className="text-3xl font-bold text-green-900 mt-1 number-display">${collectedToday.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <FiCheck className="text-green-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="folio-card mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
            <input
              type="text"
              placeholder={t('fees.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all`}
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <FiFilter size={18} />
            {showFilters ? t('users.hideFilters') : t('users.showFilters')}
          </button>

          {/* Create Fee Button */}
          <button
            onClick={() => setModalMode('create')}
            className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FiPlus size={18} />
            {t('fees.newFee')}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.filter.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">{t('fees.status.all')}</option>
                  <option value="open">{t('fees.status.openOnly')}</option>
                  <option value="closed">{t('fees.status.closedOnly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.filter.type')}
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">{t('fees.type.all')}</option>
                  <option value="overdue">{t('fees.type.overdue')}</option>
                  <option value="lost_item">{t('fees.type.lost_item')}</option>
                  <option value="damaged_item">{t('fees.type.damaged_item')}</option>
                  <option value="processing">{t('fees.type.processing')}</option>
                  <option value="replacement">{t('fees.type.replacement')}</option>
                  <option value="manual">{t('fees.type.manual')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fees Table */}
      <div className="folio-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            <p className="text-gray-600 mt-4">{t('fees.loading')}</p>
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
              <FiDollarSign className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-600 font-medium">{t('fees.noFees')}</p>
            <p className="text-gray-500 text-sm mt-1">{t('fees.noFees.desc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.user')}
                  </th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.feeType')}
                  </th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.status')}
                  </th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.amount')}
                  </th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.remaining')}
                  </th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.dateCreated')}
                  </th>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                    {t('fees.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((fee, index) => (
                  <tr
                    key={fee.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{getUserName(fee.user_id)}</div>
                        <div className="text-sm text-gray-500 number-display">{getUserBarcode(fee.user_id)}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{t(`fees.type.${fee.fee_type}`)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                        {t(`fees.status.${fee.status}`)}
                      </span>
                    </td>
                    <td className="py-3 px-4 number-display font-semibold text-gray-900">
                      ${fee.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 number-display font-semibold text-red-600">
                      ${fee.remaining.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm number-display">
                      {new Date(fee.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {fee.status === 'open' && (
                          <>
                            <button
                              onClick={() => openPaymentModal(fee)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title={t('fees.action.pay')}
                            >
                              <FiCreditCard size={18} />
                            </button>
                            <button
                              onClick={() => openWaiveModal(fee)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                              title={t('fees.action.waive')}
                            >
                              <FiAlertCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openViewModal(fee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title={t('fees.action.viewDetails')}
                        >
                          <FiEye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {modalMode === 'pay' && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('fees.payment.title')}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.user')}
                </label>
                <p className="text-gray-900 font-medium">{getUserName(selectedFee.user_id)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.remaining')}
                </label>
                <p className="text-red-600 font-bold text-lg number-display">${selectedFee.remaining.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.payment.amount')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder={t('fees.payment.amountPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.payment.method')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">{t('fees.method.selectMethod')}</option>
                  <option value="cash">{t('fees.method.cash')}</option>
                  <option value="check">{t('fees.method.check')}</option>
                  <option value="credit_card">{t('fees.method.credit_card')}</option>
                  <option value="transfer">{t('fees.method.transfer')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.payment.note')}
                </label>
                <textarea
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  placeholder={t('fees.payment.notePlaceholder')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50"
                >
                  {loading ? t('fees.payment.processing') : t('fees.payment.button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {modalMode === 'waive' && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('fees.waive.title')}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleWaive} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.user')}
                </label>
                <p className="text-gray-900 font-medium">{getUserName(selectedFee.user_id)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.remaining')}
                </label>
                <p className="text-red-600 font-bold text-lg number-display">${selectedFee.remaining.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.waive.reason')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={waiveForm.reason}
                  onChange={(e) => setWaiveForm({ reason: e.target.value })}
                  placeholder={t('fees.waive.reasonPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all disabled:opacity-50"
                >
                  {loading ? t('fees.waive.processing') : t('fees.waive.button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Fee Modal */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('fees.createFee')}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.form.userBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.user_barcode}
                  onChange={(e) => setCreateForm({ ...createForm, user_barcode: e.target.value })}
                  placeholder={t('fees.form.userBarcodePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.form.feeTypeLabel')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.fee_type}
                  onChange={(e) => setCreateForm({ ...createForm, fee_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="manual">{t('fees.type.manual')}</option>
                  <option value="processing">{t('fees.type.processing')}</option>
                  <option value="replacement">{t('fees.type.replacement')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.form.amountLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                  placeholder={t('fees.form.amountPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.form.reasonLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.reason}
                  onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                  placeholder={t('fees.form.reasonPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fees.description')}
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={t('fees.form.descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all disabled:opacity-50"
                >
                  {loading ? t('common.loading') : t('fees.button.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {modalMode === 'view' && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">{t('fees.viewFee')}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Fee Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('fees.details.feeInfo')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('fees.user')}</p>
                    <p className="font-medium text-gray-900">{getUserName(selectedFee.user_id)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('fees.feeType')}</p>
                    <p className="font-medium text-gray-900">{t(`fees.type.${selectedFee.fee_type}`)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('fees.amount')}</p>
                    <p className="font-medium text-gray-900 number-display">${selectedFee.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('fees.remaining')}</p>
                    <p className="font-semibold text-red-600 number-display">${selectedFee.remaining.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('fees.status')}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedFee.status)}`}>
                      {t(`fees.status.${selectedFee.status}`)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('fees.dateCreated')}</p>
                    <p className="font-medium text-gray-900 number-display">{new Date(selectedFee.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedFee.reason && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{t('fees.reason')}</p>
                    <p className="text-gray-900">{selectedFee.reason}</p>
                  </div>
                )}

                {selectedFee.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{t('fees.description')}</p>
                    <p className="text-gray-900">{selectedFee.description}</p>
                  </div>
                )}
              </div>

              {/* Payment History - Placeholder */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('fees.history.title')}</h3>
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">{t('fees.history.noPayments')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedFee.status === 'open' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      closeModal()
                      openPaymentModal(selectedFee)
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
                  >
                    <FiCreditCard size={18} />
                    {t('fees.action.pay')}
                  </button>
                  <button
                    onClick={() => {
                      closeModal()
                      openWaiveModal(selectedFee)
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FiAlertCircle size={18} />
                    {t('fees.action.waive')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeesEnhanced
