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
import { Shield, Plus, Edit, Trash2, X, Eye, CheckCircle2, AlertCircle } from 'lucide-react'
import type { RoleCreate, Permission } from '../types/role'
import { useLanguage } from '../contexts/LanguageContext'
import PermissionGate from '../components/auth/PermissionGate'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

const Roles = () => {
  const dispatch = useAppDispatch()
  const { roles, selectedRole, permissions, loading } = useAppSelector(state => state.roles)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)

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

  const confirmDelete = (roleId: string) => {
    setRoleToDelete(roleId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (roleToDelete) {
      await dispatch(deleteRole(roleToDelete))
      await dispatch(fetchRoles())
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            {t('roles.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('roles.subtitle')}</p>
        </div>
        <PermissionGate permission="roles.create">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 me-2" />
              {t('roles.addNew')}
            </Button>
          </motion.div>
        </PermissionGate>
      </motion.div>

      {/* Roles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : roles.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                    <Shield className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('roles.noRoles')}</p>
                <p className="text-gray-500">{t('roles.noRoles.desc')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">{t('roles.roleName')}</TableHead>
                      <TableHead className="font-semibold">{t('roles.description')}</TableHead>
                      <TableHead className="font-semibold">{t('roles.permissions')}</TableHead>
                      <TableHead className="font-semibold">{t('roles.systemRole')}</TableHead>
                      <TableHead className="font-semibold text-end">{t('roles.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {roles.map((role, index) => (
                        <motion.tr
                          key={role.id}
                          variants={item}
                          initial="hidden"
                          animate="show"
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors border-b"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{role.display_name}</div>
                              <div className="text-sm text-gray-500">{role.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">
                            {role.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                              <CheckCircle2 className="w-3 h-3 me-1" />
                              {t('roles.permissionCount').replace('{count}', role.permission_count.toString())}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {role.is_system ? (
                              <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200">
                                <AlertCircle className="w-3 h-3 me-1" />
                                {t('roles.system')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600">
                                {t('roles.customRole')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-end">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openViewModal(role)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!role.is_system && (
                                <>
                                  <PermissionGate permission="roles.update">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEditModal(role)}
                                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </PermissionGate>
                                  <PermissionGate permission="roles.delete">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => confirmDelete(role.id)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </PermissionGate>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit/View Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {modalMode === 'create' ? t('roles.createRole') : modalMode === 'edit' ? t('roles.editRole') : t('roles.viewRole')}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' && 'Create a new role with custom permissions'}
              {modalMode === 'edit' && 'Update role details and permissions'}
              {modalMode === 'view' && 'View role details and assigned permissions'}
            </DialogDescription>
          </DialogHeader>

          {modalMode === 'view' && selectedRole ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t('roles.roleName')}</Label>
                <p className="text-gray-900 font-semibold">{selectedRole.display_name}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t('roles.description')}</Label>
                <p className="text-gray-900">{selectedRole.description || '-'}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t('roles.systemRole')}</Label>
                <p className="text-gray-900">{selectedRole.is_system ? t('common.yes') : t('common.no')}</p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.close')}
                </Button>
                {!selectedRole.is_system && (
                  <PermissionGate permission="roles.update">
                    <Button
                      onClick={() => openEditModal(selectedRole)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {t('roles.editRole')}
                    </Button>
                  </PermissionGate>
                )}
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('roles.form.roleNameInternal')} *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('roles.form.roleNamePlaceholder')}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">{t('roles.form.displayName')} *</Label>
                  <Input
                    id="display_name"
                    type="text"
                    required
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder={t('roles.form.displayNamePlaceholder')}
                    className="h-11"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">{t('roles.description')}</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">{t('roles.permissions')}</Label>
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                    {formData.permission_ids?.length || 0} selected
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pe-2">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => {
                    const allSelected = perms.every(p => formData.permission_ids?.includes(p.id))
                    return (
                      <motion.div
                        key={resource}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="border-purple-200 hover:border-purple-300 transition-colors">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                                {resource}
                              </h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAllInResource(resource, perms)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                {allSelected ? t('roles.deselectAll') : t('roles.selectAll')}
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {perms.map(perm => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={perm.id}
                                    checked={formData.permission_ids?.includes(perm.id)}
                                    onCheckedChange={() => togglePermission(perm.id)}
                                  />
                                  <Label
                                    htmlFor={perm.id}
                                    className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {perm.display_name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {modalMode === 'create' ? t('roles.createRole') : t('roles.updateRole')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {t('roles.deleteConfirm')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role and remove all associated permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Roles
