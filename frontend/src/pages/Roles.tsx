import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
  setSelectedRole
} from '../store/slices/rolesSlice'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye } from 'react-icons/fi'
import type { RoleCreate, Permission } from '../types/role'
import { useLanguage } from '../contexts/LanguageContext'
import PermissionGate from '../components/auth/PermissionGate'

const Roles = () => {
  const dispatch = useAppDispatch()
  const { roles, selectedRole, permissions, loading } = useAppSelector(state => state.roles)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = []
    }
    acc[perm.resource].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  // Form state
  const [formData, setFormData] = useState<Partial<RoleCreate>>({
    name: '',
    display_name: '',
    description: '',
    permission_ids: []
  })

  useEffect(() => {
    dispatch(fetchRoles())
    dispatch(fetchPermissions())
  }, [dispatch])

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permission_ids: []
    })
    setShowModal(true)
  }

  const openEditModal = (role: any) => {
    setModalMode('edit')
    dispatch(setSelectedRole(role))
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      permission_ids: role.permissions?.map((p: Permission) => p.id) || []
    })
    setShowModal(true)
  }

  const openViewModal = (role: any) => {
    setModalMode('view')
    dispatch(setSelectedRole(role))
    setShowModal(true)
  }

  const handleDelete = async (roleId: string) => {
    if (window.confirm(t('roles.deleteConfirm'))) {
      await dispatch(deleteRole(roleId))
      await dispatch(fetchRoles())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (modalMode === 'create') {
      await dispatch(createRole(formData as RoleCreate))
      await dispatch(fetchRoles())
    } else if (modalMode === 'edit' && selectedRole) {
      await dispatch(updateRole({
        roleId: selectedRole.id,
        roleData: formData
      }))
      await dispatch(fetchRoles())
    }
    setShowModal(false)
  }

  const togglePermission = (permId: string) => {
    const currentPerms = formData.permission_ids || []
    if (currentPerms.includes(permId)) {
      setFormData({
        ...formData,
        permission_ids: currentPerms.filter(id => id !== permId)
      })
    } else {
      setFormData({
        ...formData,
        permission_ids: [...currentPerms, permId]
      })
    }
  }

  const toggleAllInResource = (_resource: string, perms: Permission[]) => {
    const currentPerms = formData.permission_ids || []
    const resourcePermIds = perms.map(p => p.id)
    const allSelected = resourcePermIds.every(id => currentPerms.includes(id))

    if (allSelected) {
      // Deselect all
      setFormData({
        ...formData,
        permission_ids: currentPerms.filter(id => !resourcePermIds.includes(id))
      })
    } else {
      // Select all
      const newPerms = [...new Set([...currentPerms, ...resourcePermIds])]
      setFormData({
        ...formData,
        permission_ids: newPerms
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('roles.title')}</h1>
          <p className="text-gray-600 mt-1">{t('roles.subtitle')}</p>
        </div>
        <PermissionGate permission="roles.create">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            <FiPlus size={20} />
            {t('roles.addNew')}
          </button>
        </PermissionGate>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">{t('roles.noRoles')}</p>
            <p>{t('roles.noRoles.desc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('roles.roleName')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('roles.description')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('roles.permissions')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('roles.systemRole')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('roles.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{role.display_name}</div>
                      <div className="text-sm text-gray-500">{role.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {role.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {t('roles.permissionCount').replace('{count}', role.permission_count.toString())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {role.is_system ? (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          {t('roles.system')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {t('roles.customRole')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openViewModal(role)}
                          className="text-blue-600 hover:text-blue-800"
                          title={t('common.view')}
                        >
                          <FiEye size={18} />
                        </button>
                        {!role.is_system && (
                          <>
                            <PermissionGate permission="roles.update">
                              <button
                                onClick={() => openEditModal(role)}
                                className="text-yellow-600 hover:text-yellow-800"
                                title={t('common.edit')}
                              >
                                <FiEdit2 size={18} />
                              </button>
                            </PermissionGate>
                            <PermissionGate permission="roles.delete">
                              <button
                                onClick={() => handleDelete(role.id)}
                                className="text-red-600 hover:text-red-800"
                                title={t('common.delete')}
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </PermissionGate>
                          </>
                        )}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('roles.createRole') : modalMode === 'edit' ? t('roles.editRole') : t('roles.viewRole')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedRole ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.roleName')}</label>
                  <p className="text-gray-900">{selectedRole.display_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.description')}</label>
                  <p className="text-gray-900">{selectedRole.description || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.systemRole')}</label>
                  <p className="text-gray-900">{selectedRole.is_system ? t('common.yes') : t('common.no')}</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('common.close')}
                  </button>
                  {!selectedRole.is_system && (
                    <PermissionGate permission="roles.update">
                      <button
                        onClick={() => openEditModal(selectedRole)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                      >
                        {t('roles.editRole')}
                      </button>
                    </PermissionGate>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.form.roleNameInternal')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('roles.form.roleNamePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.form.displayName')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder={t('roles.form.displayNamePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('roles.description')}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('roles.permissions')}</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto border p-4 rounded-md">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <div key={resource} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{resource}</h4>
                          <button
                            type="button"
                            onClick={() => toggleAllInResource(resource, perms)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {perms.every(p => formData.permission_ids?.includes(p.id)) ? t('roles.deselectAll') : t('roles.selectAll')}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {perms.map(perm => (
                            <label key={perm.id} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.permission_ids?.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="ms-2 text-sm text-gray-700">{perm.display_name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                  >
                    {modalMode === 'create' ? t('roles.createRole') : t('roles.updateRole')}
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

export default Roles
