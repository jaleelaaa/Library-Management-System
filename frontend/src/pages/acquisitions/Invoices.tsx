/**
 * Invoices Page
 * Full CRUD for invoices with create/edit/view modals
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  fetchVendors,
} from '../../store/slices/acquisitionsSlice'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiRefreshCw } from 'react-icons/fi'
import { useLanguage } from '../../contexts/LanguageContext'

type ModalMode = 'create' | 'edit' | 'view' | null

const Invoices = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { invoices, selectedInvoice, vendors, loading } = useAppSelector(
    (state) => state.acquisitions
  )

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [formData, setFormData] = useState({
    invoice_number: '',
    vendor_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_due_date: '',
    status: 'open',
    total_amount: 0,
    description: '',
  })

  useEffect(() => {
    dispatch(fetchInvoices({}))
    dispatch(fetchVendors({ page: 1, page_size: 100 }))
  }, [dispatch])

  const handleOpenModal = (mode: ModalMode, invoiceId?: string) => {
    setModalMode(mode)
    if (mode === 'create') {
      setFormData({
        invoice_number: '',
        vendor_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_due_date: '',
        status: 'open',
        total_amount: 0,
        description: '',
      })
    } else if (invoiceId && (mode === 'edit' || mode === 'view')) {
      dispatch(fetchInvoiceById(invoiceId)).then((result: any) => {
        if (result.payload) {
          setFormData({
            invoice_number: result.payload.invoice_number || '',
            vendor_id: result.payload.vendor_id || '',
            invoice_date: result.payload.invoice_date?.split('T')[0] || '',
            payment_due_date: result.payload.payment_due_date?.split('T')[0] || '',
            status: result.payload.status || 'open',
            total_amount: result.payload.total_amount || 0,
            description: result.payload.description || '',
          })
        }
      })
    }
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setFormData({
      invoice_number: '',
      vendor_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      payment_due_date: '',
      status: 'open',
      total_amount: 0,
      description: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      await dispatch(createInvoice(formData))
      handleCloseModal()
    } else if (modalMode === 'edit' && selectedInvoice) {
      await dispatch(
        updateInvoice({
          invoiceId: selectedInvoice.id,
          invoiceData: formData,
        })
      )
      handleCloseModal()
    }
  }

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm(t('acquisitions.invoices.deleteConfirm'))) {
      await dispatch(deleteInvoice(invoiceId))
    }
  }

  const renderModal = () => {
    if (!modalMode) return null

    const isViewMode = modalMode === 'view'
    const title =
      modalMode === 'create'
        ? t('acquisitions.invoices.modal.create')
        : modalMode === 'edit'
        ? t('acquisitions.invoices.modal.edit')
        : t('acquisitions.invoices.modal.view')

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
              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.invoiceNumber')} *
                </label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.vendor')} *
                </label>
                <select
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">{t('acquisitions.invoices.form.selectVendor')}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.invoiceDate')} *
                </label>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Payment Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.paymentDueDate')}
                </label>
                <input
                  type="date"
                  value={formData.payment_due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_due_date: e.target.value })
                  }
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.status')} *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="open">{t('acquisitions.invoices.status.open')}</option>
                  <option value="approved">{t('acquisitions.invoices.status.approved')}</option>
                  <option value="paid">{t('acquisitions.invoices.status.paid')}</option>
                  <option value="cancelled">{t('acquisitions.invoices.status.cancelled')}</option>
                </select>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.totalAmount')} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('acquisitions.invoices.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {isViewMode ? t('common.close') : t('common.cancel')}
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {modalMode === 'create' ? t('common.create') : t('common.update')}
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
        <h2 className="text-2xl font-semibold">{t('acquisitions.invoices.title')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchInvoices({}))}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiRefreshCw /> {t('common.refresh')}
          </button>
          <button
            onClick={() => handleOpenModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiPlus /> {t('acquisitions.invoices.new')}
          </button>
        </div>
      </div>

      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {t('acquisitions.invoices.noInvoices')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t('acquisitions.invoices.table.invoiceNumber')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t('acquisitions.invoices.table.vendor')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t('acquisitions.invoices.table.date')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t('acquisitions.invoices.table.status')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t('acquisitions.invoices.table.total')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                    {t('acquisitions.invoices.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4">{invoice.vendor_name}</td>
                    <td className="px-6 py-4">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.status === 'open'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t(`acquisitions.invoices.status.${invoice.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">${invoice.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal('view', invoice.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('common.view')}
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal('edit', invoice.id)}
                          className="text-green-600 hover:text-green-900"
                          title={t('common.edit')}
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('common.delete')}
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

export default Invoices
