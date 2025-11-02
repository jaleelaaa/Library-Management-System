/**
 * Funds Page - Redesigned with shadcn/ui
 * Full CRUD for funds with create/edit/view modals
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchFunds,
  createFund,
  updateFund,
  deleteFund,
} from '../../store/slices/acquisitionsSlice'
import { DollarSign, Plus, Edit, Trash2, Eye, RefreshCw, Search, CheckCircle2, Snowflake, XCircle } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

// shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

type ModalMode = 'create' | 'edit' | 'view' | null

const Funds = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { funds, loading } = useAppSelector((state) => state.acquisitions)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedFund, setSelectedFund] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fundToDelete, setFundToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    fund_status: 'active',
    description: '',
    allocated_amount: 0,
    available_amount: 0,
  })

  useEffect(() => {
    dispatch(fetchFunds({}))
  }, [dispatch])

  const handleOpenModal = (mode: ModalMode, fund?: any) => {
    setModalMode(mode)
    if (mode === 'create') {
      setFormData({
        code: '',
        name: '',
        fund_status: 'active',
        description: '',
        allocated_amount: 0,
        available_amount: 0,
      })
      setSelectedFund(null)
    } else if (fund && (mode === 'edit' || mode === 'view')) {
      setSelectedFund(fund)
      setFormData({
        code: fund.code || '',
        name: fund.name || '',
        fund_status: fund.fund_status || 'active',
        description: fund.description || '',
        allocated_amount: fund.allocated_amount || 0,
        available_amount: fund.available_amount || 0,
      })
    }
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setSelectedFund(null)
    setFormData({
      code: '',
      name: '',
      fund_status: 'active',
      description: '',
      allocated_amount: 0,
      available_amount: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      await dispatch(createFund(formData))
      handleCloseModal()
    } else if (modalMode === 'edit' && selectedFund) {
      await dispatch(
        updateFund({
          fundId: selectedFund.id,
          fundData: formData,
        })
      )
      handleCloseModal()
    }
  }

  const handleDeleteClick = (fundId: string) => {
    setFundToDelete(fundId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (fundToDelete) {
      await dispatch(deleteFund(fundToDelete))
      setDeleteDialogOpen(false)
      setFundToDelete(null)
    }
  }

  const filteredFunds = funds.filter((fund) => {
    const query = searchQuery.toLowerCase()
    return (
      fund.code?.toLowerCase().includes(query) ||
      fund.name?.toLowerCase().includes(query) ||
      fund.description?.toLowerCase().includes(query)
    )
  })

  const isViewMode = modalMode === 'view'
  const dialogTitle =
    modalMode === 'create'
      ? t('acquisitions.funds.modal.create')
      : modalMode === 'edit'
      ? t('acquisitions.funds.modal.edit')
      : t('acquisitions.funds.modal.view')

  const dialogDescription =
    modalMode === 'create'
      ? t('acquisitions.funds.modal.createDesc')
      : modalMode === 'edit'
      ? t('acquisitions.funds.modal.editDesc')
      : t('acquisitions.funds.modal.viewDesc')

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      active: { color: 'from-green-100 to-emerald-100 text-green-700 border-green-200', icon: CheckCircle2 },
      frozen: { color: 'from-blue-100 to-cyan-100 text-blue-700 border-blue-200', icon: Snowflake },
      inactive: { color: 'from-gray-100 to-slate-100 text-gray-700 border-gray-200', icon: XCircle },
    }
    const badge = badges[status] || badges.active
    const Icon = badge.icon
    return (
      <Badge className={`bg-gradient-to-r ${badge.color}`}>
        <Icon className="w-3 h-3 me-1" />
        {t(`acquisitions.funds.status.${status}`)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-900 to-green-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  {t('acquisitions.funds.title')}
                </h1>
              </div>
              <Button onClick={() => handleOpenModal('create')} size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md">
                <Plus className="w-4 h-4 me-2" />
                {t('acquisitions.funds.new')}
              </Button>
            </div>
            <CardDescription className="text-base mt-2">
              {t('acquisitions.funds.subtitle')}
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder={t('acquisitions.funds.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                onClick={() => dispatch(fetchFunds({}))}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common.refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Funds Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredFunds.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 mb-4"
                >
                  <DollarSign className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {t('acquisitions.funds.noFunds')}
                </p>
                <p className="text-gray-500">{t('acquisitions.funds.noFunds.desc')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <TableHead>{t('acquisitions.funds.table.code')}</TableHead>
                      <TableHead>{t('acquisitions.funds.table.name')}</TableHead>
                      <TableHead>{t('acquisitions.funds.table.status')}</TableHead>
                      <TableHead>{t('acquisitions.funds.table.allocated')}</TableHead>
                      <TableHead>{t('acquisitions.funds.table.available')}</TableHead>
                      <TableHead className="text-end">{t('acquisitions.funds.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredFunds.map((fund, index) => (
                        <motion.tr
                          key={fund.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-emerald-50/50 transition-colors"
                        >
                          <TableCell className="font-semibold">{fund.code}</TableCell>
                          <TableCell>{fund.name}</TableCell>
                          <TableCell>{getStatusBadge(fund.fund_status)}</TableCell>
                          <TableCell className="font-mono">${fund.allocated_amount.toFixed(2)}</TableCell>
                          <TableCell className="font-mono">${fund.available_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleOpenModal('view', fund)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleOpenModal('edit', fund)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(fund.id)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50 hover:text-red-600"
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

      {/* Create/Edit/View Dialog */}
      <Dialog open={modalMode !== null} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">{t('acquisitions.funds.form.code')} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  disabled={isViewMode}
                  placeholder={t('acquisitions.funds.codePlaceholder')}
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('acquisitions.funds.form.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isViewMode}
                  placeholder={t('acquisitions.funds.namePlaceholder')}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">{t('acquisitions.funds.form.status')} *</Label>
              <Select
                value={formData.fund_status}
                onValueChange={(value) => setFormData({ ...formData, fund_status: value })}
                disabled={isViewMode}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('acquisitions.funds.status.active')}</SelectItem>
                  <SelectItem value="frozen">{t('acquisitions.funds.status.frozen')}</SelectItem>
                  <SelectItem value="inactive">{t('acquisitions.funds.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('acquisitions.funds.form.description')}</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={isViewMode}
                placeholder={t('acquisitions.funds.descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Allocated Amount */}
              <div className="space-y-2">
                <Label htmlFor="allocated">{t('acquisitions.funds.form.allocated')} *</Label>
                <Input
                  id="allocated"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.allocated_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allocated_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  disabled={isViewMode}
                  placeholder="0.00"
                />
              </div>

              {/* Available Amount */}
              <div className="space-y-2">
                <Label htmlFor="available">{t('acquisitions.funds.form.available')} *</Label>
                <Input
                  id="available"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.available_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      available_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  disabled={isViewMode}
                  placeholder="0.00"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {isViewMode ? t('common.close') : t('common.cancel')}
              </Button>
              {!isViewMode && (
                <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                  {modalMode === 'create' ? t('common.create') : t('common.update')}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              {t('acquisitions.funds.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('acquisitions.funds.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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

export default Funds
