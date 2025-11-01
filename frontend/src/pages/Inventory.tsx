import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchInstances,
  fetchInstanceById,
  createInstance,
  updateInstance,
  deleteInstance,
  setSelectedInstance,
  setFilters
} from '../store/slices/inventorySlice'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiEye, FiBook } from 'react-icons/fi'
import type { Instance, InstanceCreate } from '../types/inventory'
import { useLanguage } from '../contexts/LanguageContext'
import { sanitizeSearchQuery } from '../utils/sanitize'

const Inventory = () => {
  const dispatch = useAppDispatch()
  const { instances, selectedInstance, loading, meta, filters, error } = useAppSelector(state => state.inventory)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state - simplified for basic inventory
  const [formData, setFormData] = useState<Partial<InstanceCreate>>({
    title: '',
    subtitle: '',
    edition: '',
    publication: [],
    instance_type_id: 'text', // default
    languages: ['eng'],
    subjects: [],
    contributors: [],
    identifiers: [],
    tags: []
  })

  useEffect(() => {
    dispatch(fetchInstances(filters))
  }, [dispatch])

  const handleSearch = () => {
    const sanitizedQuery = sanitizeSearchQuery(searchTerm)
    const newFilters = { ...filters, q: sanitizedQuery, page: 1 }
    dispatch(setFilters(newFilters))
    dispatch(fetchInstances(newFilters))
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    dispatch(setFilters(newFilters))
    dispatch(fetchInstances(newFilters))
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      title: '',
      subtitle: '',
      edition: '',
      publication: [],
      instance_type_id: 'text',
      languages: ['eng'],
      subjects: [],
      contributors: [],
      identifiers: [],
      tags: []
    })
    setShowModal(true)
  }

  const openEditModal = (instance: Instance) => {
    setModalMode('edit')
    dispatch(setSelectedInstance(instance))
    setFormData({
      title: instance.title,
      subtitle: instance.subtitle || '',
      edition: instance.edition || '',
      publication: instance.publication || [],
      instance_type_id: instance.instance_type_id,
      languages: instance.languages || ['eng'],
      subjects: instance.subjects || [],
      contributors: instance.contributors || [],
      identifiers: instance.identifiers || [],
      tags: instance.tags || []
    })
    setShowModal(true)
  }

  const openViewModal = (instance: Instance) => {
    setModalMode('view')
    dispatch(setSelectedInstance(instance))
    dispatch(fetchInstanceById(instance.id))
    setShowModal(true)
  }

  const handleDelete = async (instanceId: string) => {
    if (window.confirm(t('inventory.deleteConfirm'))) {
      await dispatch(deleteInstance(instanceId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (modalMode === 'create') {
      await dispatch(createInstance(formData as InstanceCreate))
      setShowModal(false)
      dispatch(fetchInstances(filters)) // Refresh list
    } else if (modalMode === 'edit' && selectedInstance) {
      await dispatch(updateInstance({ instanceId: selectedInstance.id, instanceData: formData }))
      setShowModal(false)
      dispatch(fetchInstances(filters)) // Refresh list
    }
  }

  const addPublicationField = () => {
    setFormData({
      ...formData,
      publication: [...(formData.publication || []), '']
    })
  }

  const updatePublicationField = (index: number, value: string) => {
    const newPublication = [...(formData.publication || [])]
    newPublication[index] = value
    setFormData({ ...formData, publication: newPublication })
  }

  const removePublicationField = (index: number) => {
    const newPublication = [...(formData.publication || [])]
    newPublication.splice(index, 1)
    setFormData({ ...formData, publication: newPublication })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
          <p className="text-gray-600 mt-1">{t('inventory.subtitle')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
        >
          <FiPlus /> {t('inventory.newInstance')}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          <p className="font-medium">{t('common.error')}:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="folio-card mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('inventory.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition"
          >
            {t('common.search')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiFilter /> {t('users.filters')}
          </button>
        </div>

        {/* Advanced Filters - Placeholder for future */}
        {showFilters && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">{t('inventory.filtersComingSoon')}</p>
          </div>
        )}
      </div>

      {/* Instances Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('inventory.loading')}</p>
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiBook className="mx-auto text-5xl mb-4 text-gray-400" />
            <p className="text-xl mb-2">{t('inventory.noInstances')}</p>
            <p>{t('inventory.noInstances.desc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inventory.title.field')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inventory.contributors')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inventory.edition')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('inventory.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((instance) => (
                    <tr key={instance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{instance.title}</div>
                        {instance.subtitle && (
                          <div className="text-sm text-gray-500">{instance.subtitle}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {instance.contributors && instance.contributors.length > 0
                          ? instance.contributors
                              .filter(c => c.primary)
                              .map(c => c.name)
                              .join(', ') || instance.contributors[0]?.name || '-'
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {instance.edition || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {instance.instance_type_id || 'text'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openViewModal(instance)}
                            className="text-blue-600 hover:text-blue-800"
                            title={t('common.view')}
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(instance)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title={t('common.edit')}
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(instance.id)}
                            className="text-red-600 hover:text-red-800"
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

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  {t('inventory.pagination.page')} {meta.page} {t('inventory.pagination.of')} {meta.total_pages} ({meta.total_items} {t('inventory.pagination.totalInstances')})
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.total_pages}
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

      {/* Create/Edit/View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('inventory.modal.createInstance') : modalMode === 'edit' ? t('inventory.modal.editInstance') : t('inventory.modal.viewInstance')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedInstance ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.title')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedInstance.title}</p>
                  </div>
                  {selectedInstance.subtitle && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.subtitle')}</label>
                      <p className="text-gray-900">{selectedInstance.subtitle}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.edition')}</label>
                    <p className="text-gray-900">{selectedInstance.edition || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.type')}</label>
                    <p className="text-gray-900">{selectedInstance.instance_type_id || 'text'}</p>
                  </div>
                  {selectedInstance.contributors && selectedInstance.contributors.length > 0 && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.contributors')}</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {selectedInstance.contributors.map((contrib, idx) => (
                          <li key={idx}>
                            {contrib.name} {contrib.primary && `(${t('inventory.primary')})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedInstance.publication && selectedInstance.publication.length > 0 && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.publication')}</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {selectedInstance.publication.map((pub, idx) => (
                          <li key={idx}>{pub}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('common.close')}
                  </button>
                  <button
                    onClick={() => openEditModal(selectedInstance)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                  >
                    {t('inventory.editInstance')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('inventory.form.basicInfo')}</h3>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.title')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('inventory.form.titlePlaceholder')}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.subtitle')}</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('inventory.form.subtitlePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.edition')}</label>
                    <input
                      type="text"
                      value={formData.edition}
                      onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('inventory.form.editionPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.type')} *</label>
                    <select
                      required
                      value={formData.instance_type_id}
                      onChange={(e) => setFormData({ ...formData, instance_type_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="text">{t('inventory.types.text')}</option>
                      <option value="audio">{t('inventory.types.audio')}</option>
                      <option value="video">{t('inventory.types.video')}</option>
                      <option value="software">{t('inventory.types.software')}</option>
                      <option value="map">{t('inventory.types.map')}</option>
                      <option value="mixed">{t('inventory.types.mixed')}</option>
                    </select>
                  </div>

                  {/* Publication Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('inventory.form.publicationInfo')}</h3>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.form.publication')}</label>
                    {formData.publication && formData.publication.map((pub, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pub}
                          onChange={(e) => updatePublicationField(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                          placeholder={t('inventory.form.publicationPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => removePublicationField(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPublicationField}
                      className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                    >
                      <FiPlus size={16} /> {t('inventory.addPublication')}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
                  >
                    {loading ? t('common.saving') : modalMode === 'create' ? t('inventory.createInstance') : t('inventory.updateInstance')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
