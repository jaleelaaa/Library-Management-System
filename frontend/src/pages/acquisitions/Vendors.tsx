import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchVendors, createVendor, updateVendor, deleteVendor, setVendorsFilters } from '../../store/slices/acquisitionsSlice'
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch } from 'react-icons/fi'
import type { VendorCreate, VendorUpdate } from '../../types/acquisitions'
import { useLanguage } from '../../contexts/LanguageContext'

const Vendors = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { vendors, loading, vendorsMeta, vendorsFilters } = useAppSelector(state => state.acquisitions)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState<VendorCreate>({
    code: '',
    name: '',
    description: '',
    vendor_status: 'active',
    payment_method: '',
    currency: 'USD',
    language: 'en',
    is_vendor: true,
    is_customer: false
  })

  useEffect(() => {
    dispatch(fetchVendors(vendorsFilters))
  }, [dispatch])

  const handleSearch = () => {
    const newFilters = { ...vendorsFilters, search: searchTerm, page: 1 }
    dispatch(setVendorsFilters(newFilters))
    dispatch(fetchVendors(newFilters))
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...vendorsFilters, page }
    dispatch(setVendorsFilters(newFilters))
    dispatch(fetchVendors(newFilters))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(createVendor(formData))
    if (createVendor.fulfilled.match(result)) {
      setShowCreateModal(false)
      setFormData({
        code: '',
        name: '',
        description: '',
        vendor_status: 'active',
        payment_method: '',
        currency: 'USD',
        language: 'en',
        is_vendor: true,
        is_customer: false
      })
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendor) return

    const updateData: VendorUpdate = {
      name: formData.name,
      description: formData.description,
      vendor_status: formData.vendor_status,
      payment_method: formData.payment_method
    }

    const result = await dispatch(updateVendor({ vendorId: selectedVendor.id, vendorData: updateData }))
    if (updateVendor.fulfilled.match(result)) {
      setShowEditModal(false)
      setSelectedVendor(null)
    }
  }

  const handleDelete = async (vendorId: string) => {
    if (window.confirm(t('acquisitions.vendors.deleteConfirm'))) {
      await dispatch(deleteVendor(vendorId))
    }
  }

  const openEditModal = (vendor: any) => {
    setSelectedVendor(vendor)
    setFormData({
      code: vendor.code,
      name: vendor.name,
      description: vendor.description || '',
      vendor_status: vendor.vendor_status,
      payment_method: vendor.payment_method || '',
      currency: vendor.currency || 'USD',
      language: vendor.language || 'en',
      is_vendor: vendor.is_vendor,
      is_customer: vendor.is_customer
    })
    setShowEditModal(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{t('acquisitions.vendors.title')}</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FiPlus /> {t('acquisitions.vendors.createVendor')}
        </button>
      </div>

      {/* Search */}
      <div className="folio-card mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('acquisitions.vendors.searchPlaceholder')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSearch}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FiSearch /> {t('common.search')}
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('acquisitions.vendors.loading')}</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">{t('acquisitions.vendors.noVendors')}</p>
            <p>{t('acquisitions.vendors.noVendors.desc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('acquisitions.vendors.code')}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('acquisitions.vendors.name')}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('acquisitions.vendors.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('acquisitions.vendors.paymentMethod')}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('acquisitions.vendors.type')}</th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('acquisitions.vendors.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{vendor.code}</td>
                      <td className="px-6 py-4">{vendor.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          vendor.vendor_status === 'active' ? 'bg-green-100 text-green-800' :
                          vendor.vendor_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`acquisitions.vendors.status.${vendor.vendor_status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{vendor.payment_method || '-'}</td>
                      <td className="px-6 py-4">
                        {vendor.is_vendor && vendor.is_customer ? t('acquisitions.vendors.type.both') :
                         vendor.is_vendor ? t('acquisitions.vendors.type.vendor') :
                         vendor.is_customer ? t('acquisitions.vendors.type.customer') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(vendor)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(vendor.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {vendorsMeta && vendorsMeta.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  {t('common.showing')} {t('common.page')} {vendorsMeta.page} {t('common.of')} {vendorsMeta.total_pages} ({vendorsMeta.total_items} {t('acquisitions.vendors.totalVendors')})
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(vendorsMeta.page - 1)}
                    disabled={vendorsMeta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(vendorsMeta.page + 1)}
                    disabled={vendorsMeta.page === vendorsMeta.total_pages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t('acquisitions.vendors.modal.create')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.code')} *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.status')}</label>
                <select
                  value={formData.vendor_status}
                  onChange={(e) => setFormData({ ...formData, vendor_status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">{t('acquisitions.vendors.status.active')}</option>
                  <option value="inactive">{t('acquisitions.vendors.status.inactive')}</option>
                  <option value="pending">{t('acquisitions.vendors.status.pending')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.paymentMethod')}</label>
                <input
                  type="text"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? t('acquisitions.vendors.creating') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t('acquisitions.vendors.modal.edit')}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.code')}</label>
                <input
                  type="text"
                  disabled
                  value={formData.code}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.status')}</label>
                <select
                  value={formData.vendor_status}
                  onChange={(e) => setFormData({ ...formData, vendor_status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">{t('acquisitions.vendors.status.active')}</option>
                  <option value="inactive">{t('acquisitions.vendors.status.inactive')}</option>
                  <option value="pending">{t('acquisitions.vendors.status.pending')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('acquisitions.vendors.paymentMethod')}</label>
                <input
                  type="text"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? t('acquisitions.vendors.updating') : t('common.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vendors
