import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchRequests, createRequest, cancelRequest, setRequestsFilters } from '../../store/slices/circulationSlice'
import { FiInbox, FiFilter, FiX, FiPlus, FiRefreshCw, FiAlertCircle, FiClock } from 'react-icons/fi'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageSwitcher from '../../components/common/LanguageSwitcher'
import type { RequestStatus, RequestType } from '../../types/circulation'

const DEFAULT_SERVICE_POINT = '00000000-0000-0000-0000-000000000000'

const RequestsEnhanced = () => {
  const dispatch = useAppDispatch()
  const { requests, loading, requestsMeta, requestsFilters } = useAppSelector(state => state.circulation)
  const { t, isRTL } = useLanguage()

  const [isVisible, setIsVisible] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [createForm, setCreateForm] = useState({
    item_barcode: '',
    user_barcode: '',
    request_type: 'hold' as RequestType,
    pickup_service_point_id: DEFAULT_SERVICE_POINT,
    expiration_date: ''
  })

  useEffect(() => {
    dispatch(fetchRequests(requestsFilters))
    setTimeout(() => setIsVisible(true), 100)
  }, [dispatch])

  // Calculate statistics
  const totalRequests = requests.length
  const openRequests = requests.filter(r => r.status === 'open').length
  const requestsToday = requests.filter(r => {
    const today = new Date().toDateString()
    return new Date(r.request_date).toDateString() === today
  }).length
  const avgQueuePosition = requests.length > 0
    ? (requests.reduce((sum, r) => sum + (r.position || 0), 0) / requests.length).toFixed(1)
    : '0'

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...requestsFilters, [key]: value, page: 1 }
    dispatch(setRequestsFilters(newFilters))
    dispatch(fetchRequests(newFilters))
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...requestsFilters, page }
    dispatch(setRequestsFilters(newFilters))
    dispatch(fetchRequests(newFilters))
  }

  const handleRefresh = () => {
    dispatch(fetchRequests(requestsFilters))
  }

  const handleClearFilters = () => {
    dispatch(setRequestsFilters({ page: 1, page_size: 20 }))
    dispatch(fetchRequests({ page: 1, page_size: 20 }))
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    const requestData: any = {
      item_barcode: createForm.item_barcode,
      user_barcode: createForm.user_barcode,
      request_type: createForm.request_type,
      pickup_service_point_id: createForm.pickup_service_point_id
    }

    if (createForm.expiration_date) {
      requestData.expiration_date = createForm.expiration_date
    }

    const result = await dispatch(createRequest(requestData))

    if (createRequest.fulfilled.match(result)) {
      setShowCreateModal(false)
      setCreateForm({
        item_barcode: '',
        user_barcode: '',
        request_type: 'hold',
        pickup_service_point_id: DEFAULT_SERVICE_POINT,
        expiration_date: ''
      })
      dispatch(fetchRequests(requestsFilters))
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm(t('holds.cancelConfirm'))) {
      await dispatch(cancelRequest(requestId))
      dispatch(fetchRequests(requestsFilters))
    }
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'awaiting_pickup':
        return 'bg-blue-100 text-blue-800'
      case 'in_transit':
        return 'bg-purple-100 text-purple-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getQueuePositionBadge = (position: number) => {
    if (position === 1) return t('holds.queue.first')
    if (position === 2) return t('holds.queue.second')
    if (position === 3) return t('holds.queue.third')
    return `${position}${t('holds.queue.nth')}`
  }

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg shadow-lg">
              <FiInbox className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('holds.title')}</h1>
              <p className="text-gray-600 mt-1">{t('holds.subtitle')}</p>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="folio-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">{t('holds.totalRequests')}</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1 number-display">{totalRequests}</p>
            </div>
            <div className="p-3 bg-indigo-200 rounded-lg">
              <FiInbox className="text-indigo-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">{t('holds.openRequests')}</p>
              <p className="text-3xl font-bold text-green-900 mt-1 number-display">{openRequests}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <FiAlertCircle className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">{t('holds.requestsToday')}</p>
              <p className="text-3xl font-bold text-blue-900 mt-1 number-display">{requestsToday}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <FiClock className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">{t('holds.avgQueuePosition')}</p>
              <p className="text-3xl font-bold text-purple-900 mt-1 number-display">{avgQueuePosition}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <FiRefreshCw className="text-purple-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="folio-card mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1"></div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <FiFilter size={18} />
            {showFilters ? t('holds.filter.hideFilters') : t('holds.filter.showFilters')}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <FiRefreshCw size={18} />
            {t('holds.refresh')}
          </button>

          {/* Create Request Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FiPlus size={18} />
            {t('holds.newRequest')}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('holds.filter.status')}
                </label>
                <select
                  value={requestsFilters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{t('holds.status.all')}</option>
                  <option value="open">{t('holds.status.open')}</option>
                  <option value="awaiting_pickup">{t('holds.status.awaiting_pickup')}</option>
                  <option value="in_transit">{t('holds.status.in_transit')}</option>
                  <option value="closed">{t('holds.status.closed')}</option>
                  <option value="cancelled">{t('holds.status.cancelled')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('holds.filter.type')}
                </label>
                <select
                  value={requestsFilters.request_type || 'all'}
                  onChange={(e) => handleFilterChange('request_type', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{t('holds.type.all')}</option>
                  <option value="hold">{t('holds.type.hold')}</option>
                  <option value="recall">{t('holds.type.recall')}</option>
                  <option value="page">{t('holds.type.page')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <FiX /> {t('holds.filter.clear')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="folio-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 mt-4">{t('holds.loading')}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
              <FiInbox className="text-gray-400" size={48} />
            </div>
            <p className="text-gray-600 font-medium text-xl mb-2">{t('holds.noRequests')}</p>
            <p className="text-gray-500">{t('holds.noRequests.desc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.position')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.item')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.user')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.requestType')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.requestDate')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.expirationDate')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.status')}
                    </th>
                    <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-semibold text-gray-700`}>
                      {t('holds.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold number-display">
                            {request.position || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {request.item_title || 'Unknown Item'}
                          </div>
                          <div className="text-sm text-gray-500 number-display">
                            {request.item_barcode}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-gray-900">
                            {request.user_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500 number-display">
                            {request.user_barcode}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {t(`holds.type.${request.request_type}`)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm number-display">
                        {new Date(request.request_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm number-display">
                        {request.expiration_date
                          ? new Date(request.expiration_date).toLocaleDateString()
                          : t('holds.noExpiration')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {t(`holds.status.${request.status}`)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {request.status === 'open' && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                          >
                            <FiX size={16} />
                            {t('holds.action.cancel')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {requestsMeta && requestsMeta.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
                <div className="text-sm text-gray-700">
                  {t('holds.pagination.showing')} {requestsMeta.page} {t('holds.pagination.of')} {requestsMeta.total_pages} ({requestsMeta.total_items} {t('holds.pagination.totalRequests')})
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(requestsMeta.page - 1)}
                    disabled={requestsMeta.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(requestsMeta.page + 1)}
                    disabled={requestsMeta.page === requestsMeta.total_pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('holds.create.title')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('holds.create.userBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.user_barcode}
                  onChange={(e) => setCreateForm({ ...createForm, user_barcode: e.target.value })}
                  placeholder={t('holds.create.userBarcodePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('holds.create.itemBarcode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.item_barcode}
                  onChange={(e) => setCreateForm({ ...createForm, item_barcode: e.target.value })}
                  placeholder={t('holds.create.itemBarcodePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('holds.create.requestType')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.request_type}
                  onChange={(e) => setCreateForm({ ...createForm, request_type: e.target.value as RequestType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="hold">{t('holds.type.hold')}</option>
                  <option value="recall">{t('holds.type.recall')}</option>
                  <option value="page">{t('holds.type.page')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('holds.create.expirationDate')}
                </label>
                <input
                  type="date"
                  value={createForm.expiration_date}
                  onChange={(e) => setCreateForm({ ...createForm, expiration_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {t('holds.create.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? t('holds.create.processing') : t('holds.create.button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsEnhanced
