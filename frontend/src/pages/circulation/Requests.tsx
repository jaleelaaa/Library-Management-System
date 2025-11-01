import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchRequests, createRequest, cancelRequest, setRequestsFilters } from '../../store/slices/circulationSlice'
import { FiRefreshCw, FiFilter, FiX, FiPlus, FiInbox } from 'react-icons/fi'
import type { RequestStatus, RequestType } from '../../types/circulation'

const Requests = () => {
  const dispatch = useAppDispatch()
  const { requests, loading, requestsMeta, requestsFilters } = useAppSelector(state => state.circulation)

  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Create request form
  const [createForm, setCreateForm] = useState({
    item_barcode: '',
    user_barcode: '',
    request_type: 'hold' as RequestType,
    pickup_service_point_id: '00000000-0000-0000-0000-000000000000',
    expiration_date: ''
  })

  useEffect(() => {
    dispatch(fetchRequests(requestsFilters))
  }, [dispatch])

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
      await dispatch(fetchRequests(requestsFilters))
      setShowCreateModal(false)
      setCreateForm({
        item_barcode: '',
        user_barcode: '',
        request_type: 'hold',
        pickup_service_point_id: '00000000-0000-0000-0000-000000000000',
        expiration_date: ''
      })
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      await dispatch(cancelRequest(requestId))
      await dispatch(fetchRequests(requestsFilters))
    }
  }

  const getStatusColor = (status: RequestStatus) => {
    if (status.startsWith('open_')) {
      return 'bg-green-100 text-green-800'
    } else if (status === 'closed_cancelled') {
      return 'bg-red-100 text-red-800'
    } else if (status.startsWith('closed_')) {
      return 'bg-gray-100 text-gray-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getRequestTypeLabel = (type: RequestType) => {
    switch (type) {
      case 'hold':
        return 'Hold'
      case 'recall':
        return 'Recall'
      case 'page':
        return 'Page'
      default:
        return type
    }
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Requests & Holds</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiPlus /> Create Request
          </button>
          <button
            onClick={handleRefresh}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="folio-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={requestsFilters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Requests</option>
                <option value="open_not_yet_filled">Open - Not Yet Filled</option>
                <option value="open_awaiting_pickup">Open - Awaiting Pickup</option>
                <option value="open_in_transit">Open - In Transit</option>
                <option value="closed_filled">Closed - Filled</option>
                <option value="closed_cancelled">Closed - Cancelled</option>
                <option value="closed_unfilled">Closed - Unfilled</option>
                <option value="closed_pickup_expired">Closed - Pickup Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
              <select
                value={requestsFilters.request_type || 'all'}
                onChange={(e) => handleFilterChange('request_type', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="hold">Hold</option>
                <option value="recall">Recall</option>
                <option value="page">Page</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  dispatch(setRequestsFilters({ page: 1, page_size: 20 }))
                  dispatch(fetchRequests({ page: 1, page_size: 20 }))
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition"
              >
                <FiX /> Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiInbox size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl mb-2">No requests found</p>
            <p>Try adjusting your filters or create a new request</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration Date
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-800 font-semibold">
                            {request.position}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {request.item_title || 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Barcode: {request.item_barcode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          {request.user_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.user_barcode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {getRequestTypeLabel(request.request_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(request.request_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {request.request_expiration_date
                          ? new Date(request.request_expiration_date).toLocaleDateString()
                          : 'No expiration'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status.startsWith('open_') && (
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <FiX size={16} />
                            Cancel
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
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing page {requestsMeta.page} of {requestsMeta.total_pages} ({requestsMeta.total_items} total requests)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(requestsMeta.page - 1)}
                    disabled={requestsMeta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(requestsMeta.page + 1)}
                    disabled={requestsMeta.page === requestsMeta.total_pages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Request</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.user_barcode}
                  onChange={(e) => setCreateForm({ ...createForm, user_barcode: e.target.value })}
                  placeholder="Scan or enter user barcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Barcode *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.item_barcode}
                  onChange={(e) => setCreateForm({ ...createForm, item_barcode: e.target.value })}
                  placeholder="Scan or enter item barcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type *
                </label>
                <select
                  required
                  value={createForm.request_type}
                  onChange={(e) => setCreateForm({ ...createForm, request_type: e.target.value as RequestType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="hold">Hold</option>
                  <option value="recall">Recall</option>
                  <option value="page">Page</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={createForm.expiration_date}
                  onChange={(e) => setCreateForm({ ...createForm, expiration_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50 transition"
                >
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Requests
