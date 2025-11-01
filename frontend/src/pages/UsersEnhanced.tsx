import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  fetchPatronGroups,
  setSelectedUser,
  setFilters
} from '../store/slices/usersSlice'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiEye, FiUsers } from 'react-icons/fi'
import type { User, UserCreate, PersonalInfo } from '../types/user'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import SkeletonLoader from '../components/common/SkeletonLoader'

const UsersEnhanced = () => {
  const dispatch = useAppDispatch()
  const { users, selectedUser, patronGroups, loading, meta, filters } = useAppSelector(state => state.users)
  const { t, isRTL } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<UserCreate>>({
    username: '',
    email: '',
    password: '',
    barcode: '',
    active: true,
    user_type: 'patron',
    patron_group_id: '',
    personal: {
      firstName: '',
      lastName: '',
      middleName: '',
      preferredFirstName: '',
      email: '',
      phone: '',
      mobilePhone: ''
    },
    addresses: [],
    tags: [],
    custom_fields: {}
  })

  useEffect(() => {
    dispatch(fetchUsers(filters))
    dispatch(fetchPatronGroups())
    setIsVisible(true)
  }, [dispatch])

  const handleSearch = () => {
    dispatch(setFilters({ ...filters, search: searchTerm, page: 1 }))
    dispatch(fetchUsers({ ...filters, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    dispatch(setFilters(newFilters))
    dispatch(fetchUsers(newFilters))
  }

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ ...filters, page }))
    dispatch(fetchUsers({ ...filters, page }))
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      username: '',
      email: '',
      password: '',
      barcode: '',
      active: true,
      user_type: 'patron',
      patron_group_id: patronGroups[0]?.id || '',
      personal: {
        firstName: '',
        lastName: '',
        middleName: '',
        preferredFirstName: '',
        email: '',
        phone: '',
        mobilePhone: ''
      },
      addresses: [],
      tags: [],
      custom_fields: {}
    })
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setModalMode('edit')
    dispatch(setSelectedUser(user))
    setFormData({
      username: user.username,
      email: user.email,
      barcode: user.barcode || '',
      active: user.active,
      user_type: user.user_type,
      patron_group_id: user.patron_group_id || '',
      personal: user.personal,
      addresses: user.addresses,
      tags: user.tags,
      custom_fields: user.custom_fields
    })
    setShowModal(true)
  }

  const openViewModal = (user: User) => {
    setModalMode('view')
    dispatch(setSelectedUser(user))
    dispatch(fetchUserById(user.id))
    setShowModal(true)
  }

  const handleDelete = async (userId: string) => {
    if (window.confirm(t('users.deleteConfirm'))) {
      await dispatch(deleteUser(userId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (modalMode === 'create') {
      await dispatch(createUser(formData as UserCreate))
      setShowModal(false)
    } else if (modalMode === 'edit' && selectedUser) {
      const { password, ...updateData } = formData
      await dispatch(updateUser({ userId: selectedUser.id, userData: updateData }))
      setShowModal(false)
    }
  }

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal!,
        [field]: value
      }
    })
  }

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with Gradient */}
      <div className="flex justify-between items-center mb-8 animate-fadeInUp">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <FiUsers className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
              <p className="text-gray-600 mt-1">{t('users.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <FiPlus size={20} /> {t('users.newUser')}
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="folio-card mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-300 shadow hover:shadow-lg hover:-translate-y-0.5"
          >
            {t('common.search')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${
              showFilters ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <FiFilter /> {t('users.filters')}
          </button>
        </div>

        {/* Advanced Filters with Slide Animation */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t animate-slideDown">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.status')}</label>
              <select
                value={filters.active === undefined ? 'all' : filters.active.toString()}
                onChange={(e) => handleFilterChange('active', e.target.value === 'all' ? undefined : e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">{t('users.status.all')}</option>
                <option value="true">{t('users.status.activeOnly')}</option>
                <option value="false">{t('users.status.inactiveOnly')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.userType')}</label>
              <select
                value={filters.user_type || 'all'}
                onChange={(e) => handleFilterChange('user_type', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">{t('users.type.all')}</option>
                <option value="patron">{t('users.type.patron')}</option>
                <option value="staff">{t('users.type.staff')}</option>
                <option value="shadow">{t('users.type.shadow')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.patronGroup')}</label>
              <select
                value={filters.patron_group_id || 'all'}
                onChange={(e) => handleFilterChange('patron_group_id', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">{t('common.all')}</option>
                {patronGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table Card */}
      <div className="folio-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} variant="rectangle" height="3rem" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full mb-4">
              <FiUsers className="text-gray-400" size={64} />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">{t('users.noUsers')}</p>
            <p className="text-gray-500">{t('users.noUsers.desc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.username')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.name')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.email')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.barcode')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.patronGroup')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.status')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {t('users.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {user.personal.firstName} {user.personal.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="number-display text-gray-600">
                          {user.barcode || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.patron_group_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                          user.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}>
                          {user.active ? t('users.status.active') : t('users.status.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openViewModal(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title={t('common.view')}
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                            title={t('common.edit')}
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
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
                    {t('users.pagination.showing')} {meta.page} {t('common.of')} {meta.total_pages} ({meta.total_items} {t('users.pagination.totalUsers')})
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

      {/* Create/Edit Modal with Enhanced Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-center px-8 py-6 border-b sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('users.createUser') : modalMode === 'edit' ? t('users.editUser') : t('users.viewUser')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                <FiX size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedUser ? (
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.username')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.email')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.barcode')}</label>
                    <p className="text-lg font-semibold text-gray-900 number-display">{selectedUser.barcode || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.status')}</label>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.active ? t('users.status.active') : t('users.status.inactive')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.form.firstName')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUser.personal.firstName}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.form.lastName')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUser.personal.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.phone')}</label>
                    <p className="text-lg font-semibold text-gray-900 number-display">{selectedUser.personal.phone || '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">{t('users.patronGroup')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedUser.patron_group_name || '-'}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {t('common.close')}
                  </button>
                  <button
                    onClick={() => openEditModal(selectedUser)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t('users.button.editUser')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                      {t('users.form.accountInfo')}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.username')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('users.password')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2">{t('users.form.passwordHint')}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.barcode')}</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.userType')}</label>
                    <select
                      value={formData.user_type}
                      onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="patron">{t('users.type.patron')}</option>
                      <option value="staff">{t('users.type.staff')}</option>
                      <option value="shadow">{t('users.type.shadow')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.patronGroup')}</label>
                    <select
                      value={formData.patron_group_id}
                      onChange={(e) => setFormData({ ...formData, patron_group_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">{t('users.form.selectGroup')}</option>
                      {patronGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.group_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">{t('common.active')}</span>
                    </label>
                  </div>

                  {/* Personal Information */}
                  <div className="col-span-2 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                      {t('users.form.personalInfo')}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.form.firstName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personal?.firstName || ''}
                      onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.form.lastName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.personal?.lastName || ''}
                      onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.form.middleName')}</label>
                    <input
                      type="text"
                      value={formData.personal?.middleName || ''}
                      onChange={(e) => updatePersonalInfo('middleName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.form.preferredFirstName')}</label>
                    <input
                      type="text"
                      value={formData.personal?.preferredFirstName || ''}
                      onChange={(e) => updatePersonalInfo('preferredFirstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.phone')}</label>
                    <input
                      type="tel"
                      value={formData.personal?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.mobilePhone')}</label>
                    <input
                      type="tel"
                      value={formData.personal?.mobilePhone || ''}
                      onChange={(e) => updatePersonalInfo('mobilePhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Actions */}
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {loading ? t('users.button.save') : modalMode === 'create' ? t('users.button.create') : t('users.button.update')}
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

export default UsersEnhanced
