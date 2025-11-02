import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchPatronGroups } from '../store/slices/usersSlice'
import { Users, Plus, Edit, Trash2, Calendar, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { PatronGroup, PatronGroupCreate } from '../types/user'
import * as usersService from '../services/usersService'
import { toast } from 'react-toastify'
import { useLanguage } from '../contexts/LanguageContext'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'

const PatronGroups = () => {
  const dispatch = useAppDispatch()
  const { patronGroups, loading } = useAppSelector(state => state.users)
  const { t } = useLanguage()

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedGroup, setSelectedGroup] = useState<PatronGroup | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<{ id: string, name: string, userCount: number } | null>(null)

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

  const confirmDelete = (group: PatronGroup) => {
    if (group.user_count && group.user_count > 0) {
      toast.error(t('patronGroups.delete.hasUsers', { groupName: group.group_name, userCount: group.user_count }))
      return
    }
    setGroupToDelete({ id: group.id, name: group.group_name, userCount: group.user_count || 0 })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!groupToDelete) return

    try {
      await usersService.deletePatronGroup(groupToDelete.id)
      toast.success(t('patronGroups.delete.success'))
      dispatch(fetchPatronGroups())
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('patronGroups.delete.error'))
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
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            {t('patronGroups.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('patronGroups.subtitle')}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 me-2" />
            {t('patronGroups.newGroup')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Patron Groups Table */}
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
            ) : patronGroups.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full">
                    <Users className="w-12 h-12 text-indigo-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('patronGroups.noGroups')}</p>
                <p className="text-gray-500">{t('patronGroups.noGroups.desc')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">{t('patronGroups.groupName')}</TableHead>
                      <TableHead className="font-semibold">{t('patronGroups.description')}</TableHead>
                      <TableHead className="font-semibold">{t('patronGroups.loanPeriod')}</TableHead>
                      <TableHead className="font-semibold">{t('patronGroups.renewalsAllowed')}</TableHead>
                      <TableHead className="font-semibold">{t('patronGroups.userCount')}</TableHead>
                      <TableHead className="font-semibold text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {patronGroups.map((group, index) => (
                        <motion.tr
                          key={group.id}
                          variants={item}
                          initial="hidden"
                          animate="show"
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors border-b"
                        >
                          <TableCell>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                              {group.group_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-md truncate">
                            {group.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-indigo-500" />
                              <span>{group.loan_period_days} days</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {group.renewals_allowed ? (
                              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
                                <CheckCircle2 className="w-3 h-3 me-1" />
                                {t('common.yes')}
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200">
                                <XCircle className="w-3 h-3 me-1" />
                                {t('common.no')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200">
                              <Users className="w-3 h-3 me-1" />
                              {group.user_count || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-end">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(group)}
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(group)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

      {/* Create/Edit Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {modalMode === 'create' ? t('patronGroups.createGroup') : t('patronGroups.editGroup')}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Create a new patron group with custom loan policies'
                : 'Update patron group details and loan policies'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group_name">{t('patronGroups.form.groupName')} *</Label>
              <Input
                id="group_name"
                type="text"
                required
                value={formData.group_name}
                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                placeholder={t('patronGroups.form.groupNamePlaceholder')}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('patronGroups.form.description')}</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={t('patronGroups.form.descriptionPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan_period_days" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {t('patronGroups.form.loanPeriod')} *
              </Label>
              <Input
                id="loan_period_days"
                type="text"
                required
                value={formData.loan_period_days}
                onChange={(e) => setFormData({ ...formData, loan_period_days: e.target.value })}
                placeholder={t('patronGroups.form.loanPeriodPlaceholder')}
                className="h-11"
              />
              <p className="text-xs text-gray-500">{t('patronGroups.form.loanPeriodHint')}</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="renewals_allowed"
                checked={formData.renewals_allowed}
                onCheckedChange={(checked) => setFormData({ ...formData, renewals_allowed: checked as boolean })}
              />
              <Label
                htmlFor="renewals_allowed"
                className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                {t('patronGroups.form.allowRenewals')}
              </Label>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              >
                {modalMode === 'create' ? t('patronGroups.button.create') : t('patronGroups.button.update')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {t('patronGroups.delete.confirm', { groupName: groupToDelete?.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patron group
              {groupToDelete && groupToDelete.userCount > 0 && (
                <span className="font-semibold text-red-600"> and affect {groupToDelete.userCount} user(s)</span>
              )}.
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

export default PatronGroups
