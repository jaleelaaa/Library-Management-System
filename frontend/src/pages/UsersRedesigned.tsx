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
import type { User, UserCreate, PersonalInfo } from '../types/user'
import { useLanguage } from '../contexts/LanguageContext'
import PermissionGate from '../components/auth/PermissionGate'
import { sanitizeSearchQuery } from '../utils/sanitize'
import { motion, AnimatePresence } from 'framer-motion'

// shadcn components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

// Icons
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Loader2
} from 'lucide-react'

const Users = () => {
  const dispatch = useAppDispatch()
  const { users, selectedUser, patronGroups, loading, meta, filters } = useAppSelector(state => state.users)
  const { roles } = useAppSelector(state => state.roles)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

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

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete))
      await dispatch(fetchUsers(filters))
      setDeleteDialogOpen(false)
      setUserToDelete(null)
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
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            {t('users.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('users.subtitle') || 'Manage system users and permissions'}</p>
        </div>
        <PermissionGate permission="users.create">
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span className="ms-2">{t('users.newUser')}</span>
          </Button>
        </PermissionGate>
      </motion.div>

      {/* Search and Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('users.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="ps-10 h-11"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('common.search')}
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
              >
                <Filter className="w-4 h-4" />
                <span className="ms-2">{t('users.filters')}</span>
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>{t('users.status')}</Label>
                      <Select
                        value={filters.active === undefined ? 'all' : filters.active.toString()}
                        onValueChange={(value) => handleFilterChange('active', value === 'all' ? undefined : value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('users.status.all')}</SelectItem>
                          <SelectItem value="true">{t('users.status.activeOnly')}</SelectItem>
                          <SelectItem value="false">{t('users.status.inactiveOnly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t('users.userType')}</Label>
                      <Select
                        value={filters.user_type || 'all'}
                        onValueChange={(value) => handleFilterChange('user_type', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('users.type.all')}</SelectItem>
                          <SelectItem value="patron">{t('users.type.patron')}</SelectItem>
                          <SelectItem value="staff">{t('users.type.staff')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t('users.patronGroup')}</Label>
                      <Select
                        value={filters.patron_group_id || 'all'}
                        onValueChange={(value) => handleFilterChange('patron_group_id', value === 'all' ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('patronGroups.title')}</SelectItem>
                          {patronGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.group_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-md border-0">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">{t('users.noUsers')}</p>
                <p className="text-gray-500">{t('users.noUsers.desc')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>{t('users.username')}</TableHead>
                        <TableHead>{t('users.name')}</TableHead>
                        <TableHead>{t('users.email')}</TableHead>
                        <TableHead>{t('users.barcode')}</TableHead>
                        <TableHead>{t('users.patronGroup')}</TableHead>
                        <TableHead>{t('users.roles')}</TableHead>
                        <TableHead>{t('users.status')}</TableHead>
                        <TableHead className="text-end">{t('users.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>
                            {user.personal?.firstName || '-'} {user.personal?.lastName || ''}
                          </TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell className="text-gray-600">{user.barcode || '-'}</TableCell>
                          <TableCell className="text-gray-600">{user.patron_group_name || '-'}</TableCell>
                          <TableCell>
                            {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map(role => (
                                  <Badge key={role?.id || Math.random()} variant="secondary">
                                    {role?.display_name || 'Unknown'}
                                  </Badge>
                                ))}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.active ? "default" : "destructive"}
                              className={user.active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                            >
                              {user.active ? t('users.status.active') : t('users.status.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => openViewModal(user)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <PermissionGate permission="users.update">
                                <Button
                                  onClick={() => openEditModal(user)}
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-yellow-50 hover:text-yellow-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </PermissionGate>
                              <PermissionGate permission="users.delete">
                                <Button
                                  onClick={() => openDeleteDialog(user.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {meta && meta.total_pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-700">
                      {t('users.pagination.showing')} {meta.page} {t('common.of')} {meta.total_pages} ({meta.total_items} {t('users.pagination.totalUsers')})
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePageChange(meta.page - 1)}
                        disabled={meta.page === 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handlePageChange(meta.page + 1)}
                        disabled={meta.page === meta.total_pages}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Dialog (Create/Edit/View) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? t('users.createUser') : modalMode === 'edit' ? t('users.editUser') : t('users.viewUser')}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'view' ? t('users.viewUser.desc') : t('users.form.fillRequired')}
            </DialogDescription>
          </DialogHeader>

          {modalMode === 'view' && selectedUser ? (
            <div className="grid grid-cols-2 gap-6 py-4">
              <div>
                <Label className="text-gray-600">{t('users.username')}</Label>
                <p className="font-medium">{selectedUser.username}</p>
              </div>
              <div>
                <Label className="text-gray-600">{t('users.email')}</Label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">{t('users.barcode')}</Label>
                <p className="font-medium">{selectedUser.barcode || '-'}</p>
              </div>
              <div>
                <Label className="text-gray-600">{t('users.status')}</Label>
                <Badge variant={selectedUser.active ? "default" : "destructive"} className="mt-1">
                  {selectedUser.active ? t('users.status.active') : t('users.status.inactive')}
                </Badge>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('users.username')} *</Label>
                  <Input
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('users.email')} *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span className="ms-2">{modalMode === 'create' ? t('users.button.create') : t('users.button.update')}</span>
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
            <AlertDialogTitle>{t('users.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Users
