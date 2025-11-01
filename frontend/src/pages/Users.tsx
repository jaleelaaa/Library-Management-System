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
import { fetchRoles } from '../store/slices/rolesSlice'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiEye } from 'react-icons/fi'
import type { User, UserCreate, PersonalInfo } from '../types/user'
import { useLanguage } from '../contexts/LanguageContext'
import PermissionGate from '../components/auth/PermissionGate'
import { sanitizeSearchQuery } from '../utils/sanitize'

const Users = () => {
  const dispatch = useAppDispatch()
  const { users, selectedUser, patronGroups, loading, meta, filters } = useAppSelector(state => state.users)
  const { roles } = useAppSelector(state => state.roles)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
    role_ids: [],
    tags: [],
    custom_fields: {}
  })

  useEffect(() => {
    dispatch(fetchUsers(filters))
    dispatch(fetchPatronGroups())
    dispatch(fetchRoles())
  }, [dispatch])

  const handleSearch = () => {
    const sanitizedQuery = sanitizeSearchQuery(searchTerm)
    dispatch(setFilters({ ...filters, search: sanitizedQuery, page: 1 }))
    dispatch(fetchUsers({ ...filters, search: sanitizedQuery, page: 1 }))
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
      role_ids: [],
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
      personal: user.personal || {
        firstName: '',
        lastName: '',
        middleName: '',
        preferredFirstName: '',
        email: '',
        phone: '',
        mobilePhone: ''
      },
      addresses: user.addresses || [],
      role_ids: user.roles?.map(r => r.id) || [],
      tags: user.tags || [],
      custom_fields: user.custom_fields || {}
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
      await dispatch(fetchUsers(filters))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (modalMode === 'create') {
        await dispatch(createUser(formData as UserCreate)).unwrap()
        await dispatch(fetchUsers(filters))
        setShowModal(false)
      } else if (modalMode === 'edit' && selectedUser) {
        const { password, ...updateData } = formData
        await dispatch(updateUser({ userId: selectedUser.id, userData: updateData })).unwrap()
        await dispatch(fetchUsers(filters))
        setShowModal(false)
      }
    } catch (error) {
      // Error is already displayed via toast in the slice
      // Keep modal open so user can fix the issue
      console.error('Failed to save user:', error)
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
        <PermissionGate permission="users.create">
          <button
            onClick={openCreateModal}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiPlus /> {t('users.newUser')}
          </button>
        </PermissionGate>
      </div>

      {/* Search and Filters */}
      <div className="folio-card mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
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

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.status')}</label>
              <select
                value={filters.active === undefined ? 'all' : filters.active.toString()}
                onChange={(e) => handleFilterChange('active', e.target.value === 'all' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t('users.status.all')}</option>
                <option value="true">{t('users.status.activeOnly')}</option>
                <option value="false">{t('users.status.inactiveOnly')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.userType')}</label>
              <select
                value={filters.user_type || 'all'}
                onChange={(e) => handleFilterChange('user_type', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t('users.type.all')}</option>
                <option value="patron">{t('users.type.patron')}</option>
                <option value="staff">{t('users.type.staff')}</option>
                <option value="shadow">{t('users.type.shadow')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.patronGroup')}</label>
              <select
                value={filters.patron_group_id || 'all'}
                onChange={(e) => handleFilterChange('patron_group_id', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t('patronGroups.title')}</option>
                {patronGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('users.loading')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">{t('users.noUsers')}</p>
            <p>{t('users.noUsers.desc')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.username')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.name')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.email')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.barcode')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.patronGroup')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.roles')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.status')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {user.personal?.firstName || '-'} {user.personal?.lastName || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.barcode || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.patron_group_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map(role => (
                              <span key={role?.id || Math.random()} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {role?.display_name || 'Unknown'}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.active ? t('users.status.active') : t('users.status.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openViewModal(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          <PermissionGate permission="users.update">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Edit"
                            >
                              <FiEdit2 size={18} />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="users.delete">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </PermissionGate>
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
                  {t('users.pagination.showing')} {meta.page} {t('common.of')} {meta.total_pages} ({meta.total_items} {t('users.pagination.totalUsers')})
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('users.createUser') : modalMode === 'edit' ? t('users.editUser') : t('users.viewUser')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedUser ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.username')}</label>
                    <p className="text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.email')}</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.barcode')}</label>
                    <p className="text-gray-900">{selectedUser.barcode || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.status')}</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.active ? t('users.status.active') : t('users.status.inactive')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.form.firstName')}</label>
                    <p className="text-gray-900">{selectedUser.personal?.firstName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.form.lastName')}</label>
                    <p className="text-gray-900">{selectedUser.personal?.lastName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.phone')}</label>
                    <p className="text-gray-900">{selectedUser.personal?.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.patronGroup')}</label>
                    <p className="text-gray-900">{selectedUser.patron_group_name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.roles')}</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedUser.roles && Array.isArray(selectedUser.roles) && selectedUser.roles.length > 0 ? (
                        selectedUser.roles.map(role => (
                          <span key={role?.id || Math.random()} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {role?.display_name || 'Unknown'}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-900">{t('users.roles.none')}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('common.close')}
                  </button>
                  <PermissionGate permission="users.update">
                    <button
                      onClick={() => openEditModal(selectedUser)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                    >
                      {t('users.button.editUser')}
                    </button>
                  </PermissionGate>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('users.form.accountInfo')}</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.username')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.email')} *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {modalMode === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.password')} *</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{t('users.form.passwordHint')}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.barcode')}</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.userType')}</label>
                    <select
                      value={formData.user_type}
                      onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="patron">{t('users.type.patron')}</option>
                      <option value="staff">{t('users.type.staff')}</option>
                      <option value="shadow">{t('users.type.shadow')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.patronGroup')}</label>
                    <select
                      value={formData.patron_group_id}
                      onChange={(e) => setFormData({ ...formData, patron_group_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">{t('users.form.selectGroup')}</option>
                      {patronGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.group_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.roles')}</label>
                    <select
                      multiple
                      value={formData.role_ids}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                        setFormData({ ...formData, role_ids: selectedOptions })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      style={{ minHeight: '100px' }}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.display_name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{t('users.roles.multiSelectHint')}</p>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t('common.active')}</span>
                    </label>
                  </div>

                  {/* Personal Information */}
                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('users.form.personalInfo')}</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.form.firstName')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.personal?.firstName || ''}
                      onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.form.lastName')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.personal?.lastName || ''}
                      onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.form.middleName')}</label>
                    <input
                      type="text"
                      value={formData.personal?.middleName || ''}
                      onChange={(e) => updatePersonalInfo('middleName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.form.preferredFirstName')}</label>
                    <input
                      type="text"
                      value={formData.personal?.preferredFirstName || ''}
                      onChange={(e) => updatePersonalInfo('preferredFirstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.phone')}</label>
                    <input
                      type="tel"
                      value={formData.personal?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.mobilePhone')}</label>
                    <input
                      type="tel"
                      value={formData.personal?.mobilePhone || ''}
                      onChange={(e) => updatePersonalInfo('mobilePhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
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

export default Users
