import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPatronGroups } from '../store/slices/usersSlice'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers } from 'react-icons/fi'
import type { PatronGroup, PatronGroupCreate } from '../types/user'
import * as usersService from '../services/usersService'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import SkeletonLoader from '../components/common/SkeletonLoader'

const PatronGroupsEnhanced = () => {
  const dispatch = useAppDispatch()
  const { patronGroups, loading } = useAppSelector(state => state.users)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedGroup, setSelectedGroup] = useState<PatronGroup | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState<PatronGroupCreate>({
    group_name: '',
    description: '',
    loan_period_days: '14',
    renewals_allowed: true
  })

  useEffect(() => {
    dispatch(fetchPatronGroups())
    setIsVisible(true)
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
      toast.error(`${t('patronGroups.cannotDelete')} "${groupName}" ${t('patronGroups.hasUsers')} ${userCount} ${t('patronGroups.activeUsers')}`)
      return
    }

    if (window.confirm(`${t('patronGroups.deleteConfirm')} "${groupName}"?`)) {
      try {
        await usersService.deletePatronGroup(groupId)
        toast.success(t('patronGroups.success.deleted'))
        dispatch(fetchPatronGroups())
      } catch (error: any) {
        toast.error(error.response?.data?.detail || t('patronGroups.error.delete'))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (modalMode === 'create') {
        await usersService.createPatronGroup(formData)
        toast.success(t('patronGroups.success.created'))
      } else if (modalMode === 'edit' && selectedGroup) {
        await usersService.updatePatronGroup(selectedGroup.id, formData)
        toast.success(t('patronGroups.success.updated'))
      }

      setShowModal(false)
      dispatch(fetchPatronGroups())
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t(`patronGroups.error.${modalMode}`))
    }
  }

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <FiUsers className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('patronGroups.title')}</h1>
              <p className="text-gray-600 mt-1">{t('patronGroups.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <FiPlus size={20} /> {t('patronGroups.newGroup')}
          </button>
        </div>
      </div>

      {/* Patron Groups Table Card */}
      <div className="folio-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} variant="rectangle" height="3rem" />
            ))}
          </div>
        ) : patronGroups.length === 0 ? (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-block p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full mb-4">
              <FiUsers className="text-gray-400" size={64} />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">{t('patronGroups.noGroups')}</p>
            <p className="text-gray-500">{t('patronGroups.noGroups.desc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('patronGroups.groupName')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('patronGroups.description')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('patronGroups.loanPeriod')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('patronGroups.renewalsAllowed')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('patronGroups.userCount')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {t('users.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patronGroups.map((group, index) => (
                  <tr
                    key={group.id}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{group.group_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-md truncate">
                        {group.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="number-display text-gray-600 font-semibold">
                        {group.loan_period_days}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                        group.renewals_allowed
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}>
                        {group.renewals_allowed ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="number-display px-3 py-1 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-semibold">
                        {group.user_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(group)}
                          className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                          title={t('common.edit')}
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id, group.group_name, group.user_count)}
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
        )}
      </div>

      {/* Create/Edit Modal with Enhanced Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-scaleIn">
            <div className="flex justify-between items-center px-8 py-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('patronGroups.createGroup') : t('patronGroups.editGroup')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('patronGroups.groupName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={t('patronGroups.form.groupNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('patronGroups.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder={t('patronGroups.form.descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('patronGroups.loanPeriod')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.loan_period_days}
                  onChange={(e) => setFormData({ ...formData, loan_period_days: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={t('patronGroups.form.loanPeriodPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-2">{t('patronGroups.form.loanPeriodHint')}</p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.renewals_allowed}
                    onChange={(e) => setFormData({ ...formData, renewals_allowed: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="ms-3 text-sm font-medium text-gray-700">{t('patronGroups.allowRenewals')}</span>
                </label>
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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

export default PatronGroupsEnhanced
