/**
 * Vendors Page - Redesigned with shadcn/ui
 * Full CRUD for vendors with modern UI components
 */

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchVendors, createVendor, updateVendor, deleteVendor, setVendorsFilters } from '../../store/slices/acquisitionsSlice'
import { Users, Plus, Edit, Trash2, Search, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { VendorCreate, VendorUpdate } from '../../types/acquisitions'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

// shadcn components
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'

const Vendors = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { vendors, loading, vendorsMeta, vendorsFilters } = useAppSelector(state => state.acquisitions)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [vendorToDelete, setVendorToDelete] = useState<{ id: string, name: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState<VendorCreate>({
    code: '',
    name: '',
    description: '',
    vendor_status: 'active',
    payment_method: '',
    currency: 'USD',
    language: 'en',
    is_vendor: true,
    is_customer: false
  })

  useEffect(() => {
    dispatch(fetchVendors(vendorsFilters))
  }, [dispatch])

  const handleSearch = () => {
    const newFilters = { ...vendorsFilters, search: searchTerm, page: 1 }
    dispatch(setVendorsFilters(newFilters))
    dispatch(fetchVendors(newFilters))
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...vendorsFilters, page }
    dispatch(setVendorsFilters(newFilters))
    dispatch(fetchVendors(newFilters))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(createVendor(formData))
    if (createVendor.fulfilled.match(result)) {
      setShowCreateModal(false)
      setFormData({
        code: '',
        name: '',
        description: '',
        vendor_status: 'active',
        payment_method: '',
        currency: 'USD',
        language: 'en',
        is_vendor: true,
        is_customer: false
      })
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendor) return

    const updateData: VendorUpdate = {
      name: formData.name,
      description: formData.description,
      vendor_status: formData.vendor_status,
      payment_method: formData.payment_method
    }

    const result = await dispatch(updateVendor({ vendorId: selectedVendor.id, vendorData: updateData }))
    if (updateVendor.fulfilled.match(result)) {
      setShowEditModal(false)
      setSelectedVendor(null)
    }
  }

  const handleDeleteClick = (vendorId: string, vendorName: string) => {
    setVendorToDelete({ id: vendorId, name: vendorName })
  }

  const handleDeleteConfirm = async () => {
    if (vendorToDelete) {
      await dispatch(deleteVendor(vendorToDelete.id))
      setVendorToDelete(null)
    }
  }

  const openEditModal = (vendor: any) => {
    setSelectedVendor(vendor)
    setFormData({
      code: vendor.code,
      name: vendor.name,
      description: vendor.description || '',
      vendor_status: vendor.vendor_status,
      payment_method: vendor.payment_method || '',
      currency: vendor.currency || 'USD',
      language: vendor.language || 'en',
      is_vendor: vendor.is_vendor,
      is_customer: vendor.is_customer
    })
    setShowEditModal(true)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      active: { color: 'from-green-100 to-emerald-100 text-green-700 border-green-200', icon: CheckCircle2 },
      pending: { color: 'from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200', icon: Clock },
      inactive: { color: 'from-gray-100 to-slate-100 text-gray-700 border-gray-200', icon: XCircle },
    }
    const badge = badges[status] || badges.active
    const Icon = badge.icon

    return (
      <Badge className={`bg-gradient-to-r ${badge.color}`}>
        <Icon className="w-3 h-3 me-1" />
        {t(`acquisitions.vendors.status.${status}`)}
      </Badge>
    )
  }

  const modalMode = showCreateModal ? 'create' : showEditModal ? 'edit' : null
  const modalTitle = modalMode === 'create'
    ? t('acquisitions.vendors.modal.create')
    : t('acquisitions.vendors.modal.edit')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  {t('acquisitions.vendors.title')}
                </h1>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('acquisitions.vendors.createVendor')}
              </Button>
            </div>
            <p className="text-gray-600 mt-2">{t('acquisitions.vendors.subtitle')}</p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('acquisitions.vendors.searchPlaceholder')}
                className="h-11"
              />
              <Button
                onClick={handleSearch}
                variant="outline"
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                {t('common.search')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vendors Table */}
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
            ) : vendors.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full">
                    <Users className="w-16 h-16 text-indigo-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('acquisitions.vendors.noVendors')}</p>
                <p className="text-gray-500">{t('acquisitions.vendors.noVendors.desc')}</p>
              </motion.div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50">
                        <TableHead className="font-semibold">{t('acquisitions.vendors.code')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.vendors.name')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.vendors.status')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.vendors.paymentMethod')}</TableHead>
                        <TableHead className="font-semibold">{t('acquisitions.vendors.type')}</TableHead>
                        <TableHead className="font-semibold text-end">{t('acquisitions.vendors.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {vendors.map((vendor, index) => (
                          <motion.tr
                            key={vendor.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="border-b hover:bg-indigo-50/50 transition-colors"
                          >
                            <TableCell className="font-medium">{vendor.code}</TableCell>
                            <TableCell>{vendor.name}</TableCell>
                            <TableCell>{getStatusBadge(vendor.vendor_status)}</TableCell>
                            <TableCell>{vendor.payment_method || '-'}</TableCell>
                            <TableCell>
                              {vendor.is_vendor && vendor.is_customer ? t('acquisitions.vendors.type.both') :
                               vendor.is_vendor ? t('acquisitions.vendors.type.vendor') :
                               vendor.is_customer ? t('acquisitions.vendors.type.customer') : '-'}
                            </TableCell>
                            <TableCell className="text-end">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(vendor)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-900 hover:bg-green-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(vendor.id, vendor.name)}
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

                {/* Pagination */}
                {vendorsMeta && vendorsMeta.total_pages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t mt-4">
                    <div className="text-sm text-gray-700">
                      {t('common.showing')} {t('common.page')} {vendorsMeta.page} {t('common.of')} {vendorsMeta.total_pages} ({vendorsMeta.total_items} {t('acquisitions.vendors.totalVendors')})
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(vendorsMeta.page - 1)}
                        disabled={vendorsMeta.page === 1}
                      >
                        {t('common.previous')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(vendorsMeta.page + 1)}
                        disabled={vendorsMeta.page === vendorsMeta.total_pages}
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={!!modalMode} onOpenChange={() => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedVendor(null)
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {modalTitle}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' && t('acquisitions.vendors.modal.createDesc')}
              {modalMode === 'edit' && t('acquisitions.vendors.modal.editDesc')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={modalMode === 'create' ? handleCreate : handleEdit}>
            <div className="grid gap-4 py-4">
              {/* Code */}
              <div className="grid gap-2">
                <Label htmlFor="code">{t('acquisitions.vendors.code')} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  disabled={modalMode === 'edit'}
                  placeholder={t('acquisitions.form.codePlaceholder')}
                  className="h-11"
                />
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">{t('acquisitions.vendors.name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={t('acquisitions.form.namePlaceholder')}
                  className="h-11"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">{t('acquisitions.vendors.description')}</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder={t('acquisitions.form.descriptionPlaceholder')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">{t('acquisitions.vendors.status')}</Label>
                <Select
                  value={formData.vendor_status}
                  onValueChange={(value) => setFormData({ ...formData, vendor_status: value as any })}
                >
                  <SelectTrigger id="status" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('acquisitions.vendors.status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('acquisitions.vendors.status.inactive')}</SelectItem>
                    <SelectItem value="pending">{t('acquisitions.vendors.status.pending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="grid gap-2">
                <Label htmlFor="payment_method">{t('acquisitions.vendors.paymentMethod')}</Label>
                <Input
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  placeholder={t('acquisitions.vendors.paymentMethodPlaceholder')}
                  className="h-11"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  setSelectedVendor(null)
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              >
                {loading
                  ? (modalMode === 'create' ? t('acquisitions.vendors.creating') : t('acquisitions.vendors.updating'))
                  : (modalMode === 'create' ? t('common.create') : t('common.update'))
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!vendorToDelete} onOpenChange={() => setVendorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('acquisitions.vendors.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('acquisitions.vendors.deleteConfirm')} <strong>{vendorToDelete?.name}</strong>?
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

export default Vendors
