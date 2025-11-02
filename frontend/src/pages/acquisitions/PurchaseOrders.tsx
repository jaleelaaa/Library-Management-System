/**
 * Purchase Orders Page
 * Full CRUD for purchase orders with create/edit/view modals
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  fetchVendors,
} from '../../store/slices/acquisitionsSlice'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

type ModalMode = 'create' | 'edit' | 'view' | null

const PurchaseOrders = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { purchaseOrders, selectedPurchaseOrder, vendors, loading } = useAppSelector(
    (state) => state.acquisitions
  )

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [poToDelete, setPoToDelete] = useState<{ id: string; po_number: string } | null>(null)
  const [formData, setFormData] = useState({
    po_number: '',
    vendor_id: '',
    order_type: 'one-time',
    workflow_status: 'pending',
    total_estimated_price: 0,
    notes: '',
  })

  useEffect(() => {
    dispatch(fetchPurchaseOrders({}))
    dispatch(fetchVendors({ page: 1, page_size: 100 }))
  }, [dispatch])

  const handleOpenModal = (mode: ModalMode, poId?: string) => {
    setModalMode(mode)
    if (mode === 'create') {
      setFormData({
        po_number: '',
        vendor_id: '',
        order_type: 'one-time',
        workflow_status: 'pending',
        total_estimated_price: 0,
        notes: '',
      })
    } else if (poId && (mode === 'edit' || mode === 'view')) {
      dispatch(fetchPurchaseOrderById(poId)).then((result: any) => {
        if (result.payload) {
          setFormData({
            po_number: result.payload.po_number || '',
            vendor_id: result.payload.vendor_id || '',
            order_type: result.payload.order_type || 'one-time',
            workflow_status: result.payload.workflow_status || 'pending',
            total_estimated_price: result.payload.total_estimated_price || 0,
            notes: result.payload.notes || '',
          })
        }
      })
    }
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setFormData({
      po_number: '',
      vendor_id: '',
      order_type: 'one-time',
      workflow_status: 'pending',
      total_estimated_price: 0,
      notes: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      await dispatch(createPurchaseOrder(formData))
      handleCloseModal()
    } else if (modalMode === 'edit' && selectedPurchaseOrder) {
      await dispatch(
        updatePurchaseOrder({
          poId: selectedPurchaseOrder.id,
          poData: formData,
        })
      )
      handleCloseModal()
    }
  }

  const confirmDelete = (po: { id: string; po_number: string }) => {
    setPoToDelete(po)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!poToDelete) return
    await dispatch(deletePurchaseOrder(poToDelete.id))
    setDeleteDialogOpen(false)
    setPoToDelete(null)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      open: { color: 'from-green-100 to-emerald-100 text-green-700 border-green-200', icon: CheckCircle2 },
      pending: { color: 'from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200', icon: Clock },
      closed: { color: 'from-gray-100 to-slate-100 text-gray-700 border-gray-200', icon: Package },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <Badge className={`bg-gradient-to-r ${badge.color}`}>
        <Icon className="w-3 h-3 me-1" />
        {t(`acquisitions.po.status.${status}`)}
      </Badge>
    )
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const isViewMode = modalMode === 'view'
  const modalTitle =
    modalMode === 'create'
      ? t('acquisitions.po.modal.create')
      : modalMode === 'edit'
      ? t('acquisitions.po.modal.edit')
      : t('acquisitions.po.modal.view')

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            {t('acquisitions.po.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('acquisitions.po.subtitle')}</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => dispatch(fetchPurchaseOrders({}))}
            variant="outline"
            className="shadow-sm"
          >
            <RefreshCw className="w-4 h-4 me-2" />
            {t('common.refresh')}
          </Button>
          <Button
            onClick={() => handleOpenModal('create')}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
          >
            <Plus className="w-4 h-4 me-2" />
            {t('acquisitions.po.new')}
          </Button>
        </div>
      </motion.div>

      {/* Purchase Orders Table */}
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
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                    <ShoppingCart className="w-12 h-12 text-amber-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('acquisitions.po.noPOs')}</p>
                <p className="text-gray-500">{t('acquisitions.po.noPOs.desc')}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">{t('acquisitions.po.table.poNumber')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.po.table.vendor')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.po.table.type')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.po.table.status')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.po.table.total')}</TableHead>
                        <TableHead className="font-semibold text-end">{t('acquisitions.po.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {purchaseOrders.map((po, index) => (
                          <motion.tr
                            key={po.id}
                            variants={item}
                            initial="hidden"
                            animate="show"
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors border-b"
                          >
                            <TableCell>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                                {po.po_number}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">{po.vendor_name}</TableCell>
                            <TableCell className="text-gray-600">
                              {t(`acquisitions.po.orderType.${po.order_type === 'one-time' ? 'oneTime' : 'ongoing'}`)}
                            </TableCell>
                            <TableCell>{getStatusBadge(po.workflow_status)}</TableCell>
                            <TableCell className="font-medium text-gray-900">
                              ${po.total_estimated_price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenModal('view', po.id)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenModal('edit', po.id)}
                                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete({ id: po.id, po_number: po.po_number })}
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
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit/View Dialog */}
      <Dialog open={!!modalMode} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {modalTitle}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create'
                ? 'Create a new purchase order'
                : modalMode === 'edit'
                ? 'Update purchase order details'
                : 'View purchase order information'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="po_number">{t('acquisitions.po.form.poNumber')} *</Label>
              <Input
                id="po_number"
                type="text"
                value={formData.po_number}
                onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                required
                disabled={isViewMode}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">{t('acquisitions.po.form.vendor')} *</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                disabled={isViewMode}
              >
                <SelectTrigger id="vendor" className="h-11">
                  <SelectValue placeholder={t('acquisitions.po.form.selectVendor')} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_type">{t('acquisitions.po.form.orderType')} *</Label>
              <Select
                value={formData.order_type}
                onValueChange={(value) => setFormData({ ...formData, order_type: value })}
                disabled={isViewMode}
              >
                <SelectTrigger id="order_type" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">{t('acquisitions.po.orderType.oneTime')}</SelectItem>
                  <SelectItem value="ongoing">{t('acquisitions.po.orderType.ongoing')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow_status">{t('acquisitions.po.form.status')} *</Label>
              <Select
                value={formData.workflow_status}
                onValueChange={(value) => setFormData({ ...formData, workflow_status: value })}
                disabled={isViewMode}
              >
                <SelectTrigger id="workflow_status" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('acquisitions.po.status.pending')}</SelectItem>
                  <SelectItem value="open">{t('acquisitions.po.status.open')}</SelectItem>
                  <SelectItem value="closed">{t('acquisitions.po.status.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_price">{t('acquisitions.po.form.totalPrice')} *</Label>
              <Input
                id="total_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_estimated_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_estimated_price: parseFloat(e.target.value) || 0,
                  })
                }
                required
                disabled={isViewMode}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('acquisitions.po.form.notes')}</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {isViewMode ? t('common.close') : t('common.cancel')}
              </Button>
              {!isViewMode && (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
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
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {t('acquisitions.po.deleteConfirm')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase order{' '}
              <span className="font-semibold">{poToDelete?.po_number}</span>.
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

export default PurchaseOrders
