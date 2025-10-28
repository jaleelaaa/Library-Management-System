/**
 * Purchase Orders Page
 * Full CRUD for purchase orders with create/edit/view modals
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  fetchVendors,
} from '../../store/slices/acquisitionsSlice'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiRefreshCw } from 'react-icons/fi'

type ModalMode = 'create' | 'edit' | 'view' | null

const PurchaseOrders = () => {
  const dispatch = useAppDispatch()
  const { purchaseOrders, selectedPurchaseOrder, vendors, loading } = useAppSelector(
    (state) => state.acquisitions
  )

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [formData, setFormData] = useState({
    po_number: '',
    vendor_id: '',
    order_type: 'one-time',
    workflow_status: 'pending',
    total_estimated_price: 0,
    notes: '',
  })

  useEffect(() => {
    dispatch(fetchPurchaseOrders())
    dispatch(fetchVendors({ page: 1, page_size: 100 }))
  }, [dispatch])

  const handleOpenModal = (mode: ModalMode, poId?: string) => {
    setModalMode(mode)
    if (mode === 'create') {
      setFormData({
        po_number: '',
        vendor_id: '',
        order_type: 'one-time',
        workflow_status: 'pending',
        total_estimated_price: 0,
        notes: '',
      })
    } else if (poId && (mode === 'edit' || mode === 'view')) {
      dispatch(fetchPurchaseOrderById(poId)).then((result: any) => {
        if (result.payload) {
          setFormData({
            po_number: result.payload.po_number || '',
            vendor_id: result.payload.vendor_id || '',
            order_type: result.payload.order_type || 'one-time',
            workflow_status: result.payload.workflow_status || 'pending',
            total_estimated_price: result.payload.total_estimated_price || 0,
            notes: result.payload.notes || '',
          })
        }
      })
    }
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setFormData({
      po_number: '',
      vendor_id: '',
      order_type: 'one-time',
      workflow_status: 'pending',
      total_estimated_price: 0,
      notes: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      await dispatch(createPurchaseOrder(formData))
      handleCloseModal()
    } else if (modalMode === 'edit' && selectedPurchaseOrder) {
      await dispatch(
        updatePurchaseOrder({
          poId: selectedPurchaseOrder.id,
          poData: formData,
        })
      )
      handleCloseModal()
    }
  }

  const handleDelete = async (poId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      await dispatch(deletePurchaseOrder(poId))
    }
  }

  const renderModal = () => {
    if (!modalMode) return null

    const isViewMode = modalMode === 'view'
    const title =
      modalMode === 'create'
        ? 'Create Purchase Order'
        : modalMode === 'edit'
        ? 'Edit Purchase Order'
        : 'Purchase Order Details'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* PO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Number *
                </label>
                <input
                  type="text"
                  value={formData.po_number}
                  onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor *
                </label>
                <select
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select vendor...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Type *
                </label>
                <select
                  value={formData.order_type}
                  onChange={(e) => setFormData({ ...formData, order_type: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="one-time">One-Time</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>

              {/* Workflow Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.workflow_status}
                  onChange={(e) =>
                    setFormData({ ...formData, workflow_status: e.target.value })
                  }
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="pending">Pending</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Total Estimated Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Estimated Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_estimated_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_estimated_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Purchase Orders</h2>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchPurchaseOrders())}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiPlus /> Create Purchase Order
          </button>
        </div>
      </div>

      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No purchase orders found. Create your first purchase order to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{po.po_number}</td>
                    <td className="px-6 py-4">{po.vendor_name}</td>
                    <td className="px-6 py-4 capitalize">{po.order_type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          po.workflow_status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : po.workflow_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {po.workflow_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">${po.total_estimated_price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal('view', po.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal('edit', po.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(po.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
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

      {renderModal()}
    </div>
  )
}

export default PurchaseOrders
