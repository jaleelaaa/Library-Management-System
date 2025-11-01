import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPatronGroups } from '../store/slices/usersSlice'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import type { PatronGroup, PatronGroupCreate } from '../types/user'
import * as usersService from '../services/usersService'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'

const PatronGroups = () => {
  const dispatch = useAppDispatch()
  const { patronGroups, loading } = useAppSelector(state => state.users)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedGroup, setSelectedGroup] = useState<PatronGroup | null>(null)
  const [formData, setFormData] = useState<PatronGroupCreate>({
    group_name: '',
    description: '',
    loan_period_days: '14',
    renewals_allowed: true
  })

  useEffect(() => {
    dispatch(fetchPatronGroups())
  }, [dispatch])

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      group_name: '',
      description: '',
      loan_period_days: '14',
      renewals_allowed: true
    })
    setShowModal(true)
  }

  const openEditModal = (group: PatronGroup) => {
    setModalMode('edit')
    setSelectedGroup(group)
    setFormData({
      group_name: group.group_name,
      description: group.description || '',
      loan_period_days: group.loan_period_days,
      renewals_allowed: group.renewals_allowed
    })
    setShowModal(true)
  }

  const handleDelete = async (groupId: string, groupName: string, userCount: number = 0) => {
    if (userCount > 0) {
      toast.error(t('patronGroups.delete.hasUsers', { groupName, userCount }))
      return
    }

    if (window.confirm(t('patronGroups.delete.confirm', { groupName }))) {
      try {
        await usersService.deletePatronGroup(groupId)
        toast.success(t('patronGroups.delete.success'))
        dispatch(fetchPatronGroups())
      } catch (error: any) {
        toast.error(error.response?.data?.detail || t('patronGroups.delete.error'))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (modalMode === 'create') {
        await usersService.createPatronGroup(formData)
        toast.success(t('patronGroups.create.success'))
      } else if (modalMode === 'edit' && selectedGroup) {
        await usersService.updatePatronGroup(selectedGroup.id, formData)
        toast.success(t('patronGroups.update.success'))
      }

      setShowModal(false)
      dispatch(fetchPatronGroups())
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t(`patronGroups.${modalMode}.error`))
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('patronGroups.title')}</h1>
          <p className="text-gray-600 mt-1">{t('patronGroups.subtitle')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
        >
          <FiPlus /> {t('patronGroups.newGroup')}
        </button>
      </div>

      {/* Patron Groups Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('patronGroups.loading')}</p>
          </div>
        ) : patronGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">{t('patronGroups.noGroups')}</p>
            <p>{t('patronGroups.noGroups.desc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('patronGroups.groupName')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('patronGroups.description')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('patronGroups.loanPeriod')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('patronGroups.renewalsAllowed')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('patronGroups.userCount')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patronGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{group.group_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-md truncate">
                        {group.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {group.loan_period_days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        group.renewals_allowed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {group.renewals_allowed ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                        {group.user_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(group)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title={t('common.edit')}
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id, group.group_name, group.user_count)}
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
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('patronGroups.createGroup') : t('patronGroups.editGroup')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('patronGroups.form.groupName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder={t('patronGroups.form.groupNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('patronGroups.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder={t('patronGroups.form.descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('patronGroups.form.loanPeriod')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.loan_period_days}
                  onChange={(e) => setFormData({ ...formData, loan_period_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder={t('patronGroups.form.loanPeriodPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">{t('patronGroups.form.loanPeriodHint')}</p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.renewals_allowed}
                    onChange={(e) => setFormData({ ...formData, renewals_allowed: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t('patronGroups.form.allowRenewals')}</span>
                </label>
              </div>

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
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md"
                >
                  {modalMode === 'create' ? t('patronGroups.button.create') : t('patronGroups.button.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatronGroups
