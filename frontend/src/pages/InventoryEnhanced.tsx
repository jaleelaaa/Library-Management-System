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
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import SkeletonLoader from '../components/common/SkeletonLoader'

const InventoryEnhanced = () => {
  const dispatch = useAppDispatch()
  const { instances, selectedInstance, loading, meta, filters, error } = useAppSelector(state => state.inventory)
  const { t, isRTL } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const [formData, setFormData] = useState<Partial<InstanceCreate>>({
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

  useEffect(() => {
    dispatch(fetchInstances(filters))
    setIsVisible(true)
  }, [dispatch])

  const handleSearch = () => {
    const newFilters = { ...filters, q: searchTerm, page: 1 }
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
      dispatch(fetchInstances(filters))
    } else if (modalMode === 'edit' && selectedInstance) {
      await dispatch(updateInstance({ instanceId: selectedInstance.id, instanceData: formData }))
      setShowModal(false)
      dispatch(fetchInstances(filters))
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
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg">
              <FiBook className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
              <p className="text-gray-600 mt-1">{t('inventory.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <FiPlus size={20} /> {t('inventory.newInstance')}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 animate-fadeIn">
          <p className="font-medium">{t('common.error')}:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filters Card */}
      <div className="folio-card mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('inventory.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full ${isRTL ? 'pe-10 ps-4' : 'ps-10 pe-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300`}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-all duration-300 shadow hover:shadow-lg hover:-translate-y-0.5"
          >
            {t('common.search')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${
              showFilters ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <FiFilter /> {t('users.filters')}
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t animate-slideDown">
            <p className="text-sm text-gray-600">{t('inventory.filtersComingSoon')}</p>
          </div>
        )}
      </div>

      {/* Instances Table Card */}
      <div className="folio-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} variant="rectangle" height="3rem" />
            ))}
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-block p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-full mb-4">
              <FiBook className="text-gray-400" size={64} />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">{t('inventory.noInstances')}</p>
            <p className="text-gray-500">{t('inventory.noInstances.desc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('inventory.title.field')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('inventory.contributors')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('inventory.edition')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('inventory.type')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((instance, index) => (
                    <tr
                      key={instance.id}
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-200 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{instance.title}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {t(`inventory.type.${instance.instance_type_id || 'text'}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openViewModal(instance)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title={t('common.view')}
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(instance)}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                            title={t('common.edit')}
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(instance.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
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
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-700">
                  <span className="number-display">
                    {t('inventory.pagination.page')} {meta.page} {t('inventory.pagination.of')} {meta.total_pages} ({meta.total_items} {t('inventory.pagination.totalInstances')})
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow transition-all duration-200"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.total_pages}
                    className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow transition-all duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-center px-8 py-6 border-b sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('inventory.createInstance') : modalMode === 'edit' ? t('inventory.editInstance') : t('inventory.viewInstance')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                <FiX size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedInstance ? (
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('inventory.title.field')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedInstance.title}</p>
                  </div>
                  {selectedInstance.subtitle && (
                    <div className="col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-500">{t('inventory.subtitle.field')}</label>
                      <p className="text-gray-900">{selectedInstance.subtitle}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('inventory.edition')}</label>
                    <p className="text-gray-900">{selectedInstance.edition || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('inventory.type')}</label>
                    <p className="text-gray-900">{t(`inventory.type.${selectedInstance.instance_type_id || 'text'}`)}</p>
                  </div>
                  {selectedInstance.contributors && selectedInstance.contributors.length > 0 && (
                    <div className="col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-500">{t('inventory.contributors')}</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {selectedInstance.contributors.map((contrib, idx) => (
                          <li key={idx}>
                            {contrib.name} {contrib.primary && `(${t('inventory.form.primary')})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedInstance.publication && selectedInstance.publication.length > 0 && (
                    <div className="col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-500">{t('inventory.publication')}</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {selectedInstance.publication.map((pub, idx) => (
                          <li key={idx}>{pub}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {t('common.close')}
                  </button>
                  <button
                    onClick={() => openEditModal(selectedInstance)}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t('inventory.button.editInstance')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-teal-600 rounded-full"></div>
                      {t('inventory.form.basicInfo')}
                    </h3>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('inventory.title.field')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder={t('inventory.form.titlePlaceholder')}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.subtitle.field')}</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder={t('inventory.form.subtitlePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.edition')}</label>
                    <input
                      type="text"
                      value={formData.edition}
                      onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder={t('inventory.form.editionPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('inventory.type')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.instance_type_id}
                      onChange={(e) => setFormData({ ...formData, instance_type_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      <option value="text">{t('inventory.type.text')}</option>
                      <option value="audio">{t('inventory.type.audio')}</option>
                      <option value="video">{t('inventory.type.video')}</option>
                      <option value="software">{t('inventory.type.software')}</option>
                      <option value="map">{t('inventory.type.map')}</option>
                      <option value="mixed">{t('inventory.type.mixed')}</option>
                    </select>
                  </div>

                  <div className="col-span-2 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-teal-600 rounded-full"></div>
                      {t('inventory.form.publicationInfo')}
                    </h3>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.publication')}</label>
                    {formData.publication && formData.publication.map((pub, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pub}
                          onChange={(e) => updatePublicationField(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder={t('inventory.form.publicationPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => removePublicationField(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <FiX size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPublicationField}
                      className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 hover:bg-green-50 px-3 py-2 rounded-lg transition-all"
                    >
                      <FiPlus size={16} /> {t('inventory.form.addPublication')}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? t('common.loading') : modalMode === 'create' ? t('inventory.button.create') : t('inventory.button.update')}
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

export default InventoryEnhanced
