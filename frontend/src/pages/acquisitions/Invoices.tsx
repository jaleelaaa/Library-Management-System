/**
 * Invoices Page - Redesigned with shadcn/ui
 * Full CRUD for invoices with modern UI components
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  fetchVendors,
} from '../../store/slices/acquisitionsSlice'
import { FileText, Plus, Edit, Trash2, Eye, RefreshCw, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

// shadcn components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'

type ModalMode = 'create' | 'edit' | 'view' | null

const Invoices = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { invoices, selectedInvoice, vendors, loading } = useAppSelector(
    (state) => state.acquisitions
  )

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string, number: string } | null>(null)
  const [formData, setFormData] = useState({
    invoice_number: '',
    vendor_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    payment_due_date: '',
    status: 'open',
    total_amount: 0,
    description: '',
  })

  useEffect(() => {
    dispatch(fetchInvoices({}))
    dispatch(fetchVendors({ page: 1, page_size: 100 }))
  }, [dispatch])

  const handleOpenModal = (mode: ModalMode, invoiceId?: string) => {
    setModalMode(mode)
    if (mode === 'create') {
      setFormData({
        invoice_number: '',
        vendor_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_due_date: '',
        status: 'open',
        total_amount: 0,
        description: '',
      })
    } else if (invoiceId && (mode === 'edit' || mode === 'view')) {
      dispatch(fetchInvoiceById(invoiceId)).then((result: any) => {
        if (result.payload) {
          setFormData({
            invoice_number: result.payload.invoice_number || '',
            vendor_id: result.payload.vendor_id || '',
            invoice_date: result.payload.invoice_date?.split('T')[0] || '',
            payment_due_date: result.payload.payment_due_date?.split('T')[0] || '',
            status: result.payload.status || 'open',
            total_amount: result.payload.total_amount || 0,
            description: result.payload.description || '',
          })
        }
      })
    }
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setFormData({
      invoice_number: '',
      vendor_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      payment_due_date: '',
      status: 'open',
      total_amount: 0,
      description: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'create') {
      await dispatch(createInvoice(formData))
      handleCloseModal()
    } else if (modalMode === 'edit' && selectedInvoice) {
      await dispatch(
        updateInvoice({
          invoiceId: selectedInvoice.id,
          invoiceData: formData,
        })
      )
      handleCloseModal()
    }
  }

  const handleDeleteClick = (invoiceId: string, invoiceNumber: string) => {
    setInvoiceToDelete({ id: invoiceId, number: invoiceNumber })
  }

  const handleDeleteConfirm = async () => {
    if (invoiceToDelete) {
      await dispatch(deleteInvoice(invoiceToDelete.id))
      setInvoiceToDelete(null)
    }
  }

  const isViewMode = modalMode === 'view'
  const modalTitle =
    modalMode === 'create'
      ? t('acquisitions.invoices.modal.create')
      : modalMode === 'edit'
      ? t('acquisitions.invoices.modal.edit')
      : t('acquisitions.invoices.modal.view')

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      paid: { color: 'from-green-100 to-emerald-100 text-green-700 border-green-200', icon: CheckCircle2 },
      approved: { color: 'from-blue-100 to-cyan-100 text-blue-700 border-blue-200', icon: AlertCircle },
      open: { color: 'from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200', icon: Clock },
      cancelled: { color: 'from-gray-100 to-slate-100 text-gray-700 border-gray-200', icon: XCircle },
    }
    const badge = badges[status] || badges.open
    const Icon = badge.icon

    return (
      <Badge className={`bg-gradient-to-r ${badge.color}`}>
        <Icon className="w-3 h-3 me-1" />
        {t(`acquisitions.invoices.status.${status}`)}
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-900 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  {t('acquisitions.invoices.title')}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => dispatch(fetchInvoices({}))}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('common.refresh')}
                </Button>
                <Button
                  onClick={() => handleOpenModal('create')}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('acquisitions.invoices.new')}
                </Button>
              </div>
            </div>
            <p className="text-gray-600 mt-2">{t('acquisitions.invoices.subtitle')}</p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full">
                    <FileText className="w-16 h-16 text-teal-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('acquisitions.invoices.noInvoices')}</p>
                <p className="text-gray-500">{t('acquisitions.invoices.noInvoices.desc')}</p>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <TableHead className="font-semibold">{t('acquisitions.invoices.table.invoiceNumber')}</TableHead>
                      <TableHead className="font-semibold">{t('acquisitions.invoices.table.vendor')}</TableHead>
                      <TableHead className="font-semibold">{t('acquisitions.invoices.table.date')}</TableHead>
                      <TableHead className="font-semibold">{t('acquisitions.invoices.table.status')}</TableHead>
                      <TableHead className="font-semibold">{t('acquisitions.invoices.table.total')}</TableHead>
                      <TableHead className="font-semibold text-end">{t('acquisitions.invoices.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {invoices.map((invoice, index) => (
                        <motion.tr
                          key={invoice.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="border-b hover:bg-teal-50/50 transition-colors"
                        >
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.vendor_name}</TableCell>
                          <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="font-medium">${invoice.total_amount.toFixed(2)}</TableCell>
                          <TableCell className="text-end">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal('view', invoice.id)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal('edit', invoice.id)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-900 hover:bg-green-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(invoice.id, invoice.invoice_number)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-50"
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
      <Dialog open={!!modalMode} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {modalTitle}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' && t('acquisitions.invoices.modal.createDesc')}
              {modalMode === 'edit' && t('acquisitions.invoices.modal.editDesc')}
              {modalMode === 'view' && t('acquisitions.invoices.modal.viewDesc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Invoice Number */}
              <div className="grid gap-2">
                <Label htmlFor="invoice_number">{t('acquisitions.invoices.form.invoiceNumber')} *</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  required
                  disabled={isViewMode}
                  placeholder={t('acquisitions.invoices.form.invoiceNumberPlaceholder')}
                  className="h-11"
                />
              </div>

              {/* Vendor */}
              <div className="grid gap-2">
                <Label htmlFor="vendor">{t('acquisitions.invoices.form.vendor')} *</Label>
                <Select
                  value={formData.vendor_id}
                  onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                  disabled={isViewMode}
                >
                  <SelectTrigger id="vendor" className="h-11">
                    <SelectValue placeholder={t('acquisitions.invoices.form.selectVendor')} />
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

              <div className="grid grid-cols-2 gap-4">
                {/* Invoice Date */}
                <div className="grid gap-2">
                  <Label htmlFor="invoice_date">{t('acquisitions.invoices.form.invoiceDate')} *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                    disabled={isViewMode}
                    className="h-11"
                  />
                </div>

                {/* Payment Due Date */}
                <div className="grid gap-2">
                  <Label htmlFor="payment_due_date">{t('acquisitions.invoices.form.paymentDueDate')}</Label>
                  <Input
                    id="payment_due_date"
                    type="date"
                    value={formData.payment_due_date}
                    onChange={(e) => setFormData({ ...formData, payment_due_date: e.target.value })}
                    disabled={isViewMode}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">{t('acquisitions.invoices.form.status')} *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger id="status" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">{t('acquisitions.invoices.status.open')}</SelectItem>
                      <SelectItem value="approved">{t('acquisitions.invoices.status.approved')}</SelectItem>
                      <SelectItem value="paid">{t('acquisitions.invoices.status.paid')}</SelectItem>
                      <SelectItem value="cancelled">{t('acquisitions.invoices.status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Amount */}
                <div className="grid gap-2">
                  <Label htmlFor="total_amount">{t('acquisitions.invoices.form.totalAmount')} *</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={isViewMode}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">{t('acquisitions.invoices.form.description')}</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  disabled={isViewMode}
                  placeholder={t('acquisitions.invoices.form.descriptionPlaceholder')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {isViewMode ? t('common.close') : t('common.cancel')}
              </Button>
              {!isViewMode && (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  {modalMode === 'create' ? t('common.create') : t('common.update')}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('acquisitions.invoices.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('acquisitions.invoices.deleteConfirm')} <strong>{invoiceToDelete?.number}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
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

export default Invoices
