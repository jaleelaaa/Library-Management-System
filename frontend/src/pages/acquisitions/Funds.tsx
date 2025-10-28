/**
 * Funds Page
 * Full CRUD for funds with create/edit/view modals
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchFunds,
  createFund,
  updateFund,
  deleteFund,
} from '../../store/slices/acquisitionsSlice'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiRefreshCw } from 'react-icons/fi'

type ModalMode = 'create' | 'edit' | 'view' | null

const Funds = () => {
  const dispatch = useAppDispatch()
  const { funds, loading } = useAppSelector((state) => state.acquisitions)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedFund, setSelectedFund] = useState<any>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    fund_status: 'active',
    description: '',
    allocated_amount: 0,
    available_amount: 0,
  })

  useEffect(() => {
    dispatch(fetchFunds())
  }, [dispatch])

  const handleOpenModal = (mode: ModalMode, fund?: any) => {
    setModalMode(mode)
    if (mode === 'create') {
      setFormData({
        code: '',
        name: '',
        fund_status: 'active',
        description: '',
        allocated_amount: 0,
        available_amount: 0,
      })
      setSelectedFund(null)
    } else if (fund && (mode === 'edit' || mode === 'view')) {
      setSelectedFund(fund)
      setFormData({
        code: fund.code || '',
        name: fund.name || '',
        fund_status: fund.fund_status || 'active',
        description: fund.description || '',
        allocated_amount: fund.allocated_amount || 0,
        available_amount: fund.available_amount || 0,
      })
    }
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setSelectedFund(null)
    setFormData({
      code: '',
      name: '',
      fund_status: 'active',
      description: '',
      allocated_amount: 0,
      available_amount: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      await dispatch(createFund(formData))
      handleCloseModal()
    } else if (modalMode === 'edit' && selectedFund) {
      await dispatch(
        updateFund({
          fundId: selectedFund.id,
          fundData: formData,
        })
      )
      handleCloseModal()
    }
  }

  const handleDelete = async (fundId: string) => {
    if (window.confirm('Are you sure you want to delete this fund?')) {
      await dispatch(deleteFund(fundId))
    }
  }

  const renderModal = () => {
    if (!modalMode) return null

    const isViewMode = modalMode === 'view'
    const title =
      modalMode === 'create' ? 'Create Fund' : modalMode === 'edit' ? 'Edit Fund' : 'Fund Details'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fund Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fund Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.fund_status}
                  onChange={(e) => setFormData({ ...formData, fund_status: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="active">Active</option>
                  <option value="frozen">Frozen</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Allocated Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allocated Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.allocated_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allocated_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Available Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.available_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      available_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
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
        <h2 className="text-2xl font-semibold">Funds</h2>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchFunds())}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiPlus /> Create Fund
          </button>
        </div>
      </div>

      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : funds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No funds found. Create your first fund to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Allocated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funds.map((fund) => (
                  <tr key={fund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{fund.code}</td>
                    <td className="px-6 py-4">{fund.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          fund.fund_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : fund.fund_status === 'frozen'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {fund.fund_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">${fund.allocated_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">${fund.available_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal('view', fund)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal('edit', fund)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
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

export default Funds
