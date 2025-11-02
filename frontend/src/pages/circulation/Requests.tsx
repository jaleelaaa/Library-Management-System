import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchRequests, cancelRequest } from '../../store/slices/circulationSlice'
import { BookMarked, Plus, RefreshCw, Filter, X, User, Package, Calendar, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import type { Request as CirculationRequest, RequestType } from '../../types/circulation'
import * as circulationService from '../../services/circulationService'
import { toast } from 'react-toastify'
import { useLanguage } from '../../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const Requests = () => {
  const dispatch = useAppDispatch()
  const { requests, requestsMeta, loading } = useAppSelector(state => state.circulation)
  const { t } = useLanguage()

  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<{ id: string, itemTitle: string } | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Create form
  const [createForm, setCreateForm] = useState({
    item_barcode: '',
    user_barcode: '',
    request_type: 'hold' as RequestType,
    pickup_service_point_id: '00000000-0000-0000-0000-000000000000',
    expiration_date: ''
  })

  useEffect(() => {
    loadRequests()
  }, [statusFilter, typeFilter])

  const loadRequests = (page = 1) => {
    const params: any = { page, limit: 10 }
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter
    if (typeFilter && typeFilter !== 'all') params.request_type = typeFilter
    dispatch(fetchRequests(params))
  }

  const handlePageChange = (page: number) => {
    loadRequests(page)
  }

  const handleRefresh = () => {
    loadRequests(requestsMeta.page)
  }

  const handleClearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
  }

  const confirmCancel = (request: CirculationRequest) => {
    setRequestToCancel({ id: request.id, itemTitle: request.item?.title || 'Unknown' })
    setCancelDialogOpen(true)
  }

  const handleCancelRequest = async () => {
    if (!requestToCancel) return

    try {
      await dispatch(cancelRequest(requestToCancel.id))
      toast.success(t('circulation.requests.cancelSuccess'))
      loadRequests(requestsMeta.page)
      setCancelDialogOpen(false)
      setRequestToCancel(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('circulation.requests.cancelError'))
    }
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await circulationService.createRequest({
        ...createForm,
        expiration_date: createForm.expiration_date || undefined
      })
      toast.success(t('circulation.requests.createSuccess'))
      setShowCreateModal(false)
      setCreateForm({
        item_barcode: '',
        user_barcode: '',
        request_type: 'hold',
        pickup_service_point_id: '00000000-0000-0000-0000-000000000000',
        expiration_date: ''
      })
      loadRequests()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('circulation.requests.createError'))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return (
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 me-1" />
            {t('circulation.requests.status.open')}
          </Badge>
        )
      case 'closed':
        return (
          <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 me-1" />
            {t('circulation.requests.status.closed')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 me-1" />
            {t('circulation.requests.status.cancelled')}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200">
            {status}
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hold':
        return (
          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
            {t('circulation.requests.type.hold')}
          </Badge>
        )
      case 'recall':
        return (
          <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200">
            {t('circulation.requests.type.recall')}
          </Badge>
        )
      case 'page':
        return (
          <Badge className="bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200">
            {t('circulation.requests.type.page')}
          </Badge>
        )
      default:
        return <Badge>{type}</Badge>
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
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
              <BookMarked className="w-8 h-8 text-white" />
            </div>
            {t('circulation.requests.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('circulation.requests.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 me-2" />
              {t('circulation.requests.createRequest')}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-teal-200 text-teal-600 hover:bg-teal-50"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex justify-between items-center hover:bg-teal-50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-teal-600" />
                    <CardTitle className="text-lg">{t('common.filters')}</CardTitle>
                  </div>
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-45' : ''}`} />
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('circulation.requests.filters.status')}</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all')}</SelectItem>
                        <SelectItem value="open">{t('circulation.requests.status.open')}</SelectItem>
                        <SelectItem value="closed">{t('circulation.requests.status.closed')}</SelectItem>
                        <SelectItem value="cancelled">{t('circulation.requests.status.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('circulation.requests.filters.type')}</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all')}</SelectItem>
                        <SelectItem value="hold">{t('circulation.requests.type.hold')}</SelectItem>
                        <SelectItem value="recall">{t('circulation.requests.type.recall')}</SelectItem>
                        <SelectItem value="page">{t('circulation.requests.type.page')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 me-2" />
                      {t('common.clearFilters')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full">
                    <BookMarked className="w-12 h-12 text-teal-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('circulation.requests.noRequests')}</p>
                <p className="text-gray-500">{t('circulation.requests.noRequests.desc')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">{t('circulation.requests.position')}</TableHead>
                        <TableHead className="font-semibold">{t('circulation.requests.item')}</TableHead>
                        <TableHead className="font-semibold">{t('circulation.requests.user')}</TableHead>
                        <TableHead className="font-semibold">{t('circulation.requests.type')}</TableHead>
                        <TableHead className="font-semibold">{t('circulation.requests.requestDate')}</TableHead>
                        <TableHead className="font-semibold">{t('circulation.requests.expirationDate')}</TableHead>
                        <TableHead className="font-semibold">{t('circulation.requests.status')}</TableHead>
                        <TableHead className="font-semibold text-end">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {requests.map((request, index) => (
                          <motion.tr
                            key={request.id}
                            variants={item}
                            initial="hidden"
                            animate="show"
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors border-b"
                          >
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200">
                                #{request.position}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-teal-500" />
                                <div>
                                  <div className="font-medium text-gray-900">{request.item?.title || '-'}</div>
                                  <div className="text-sm text-gray-500">{request.item?.barcode || '-'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-teal-500" />
                                <div>
                                  <div className="font-medium text-gray-900">{request.user?.full_name || '-'}</div>
                                  <div className="text-sm text-gray-500">{request.user?.barcode || '-'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-teal-500" />
                                <span>{new Date(request.request_date).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.expiration_date ? (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Clock className="w-4 h-4 text-amber-500" />
                                  <span>{new Date(request.expiration_date).toLocaleDateString()}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-end">
                              {request.status.toLowerCase() === 'open' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmCancel(request)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {requestsMeta.total_pages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {t('common.page')} {requestsMeta.page} {t('common.of')} {requestsMeta.total_pages}
                      <span className="ms-2">
                        ({requestsMeta.total} {t('common.total')})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePageChange(requestsMeta.page - 1)}
                        disabled={requestsMeta.page === 1}
                        variant="outline"
                      >
                        {t('common.previous')}
                      </Button>
                      <Button
                        onClick={() => handlePageChange(requestsMeta.page + 1)}
                        disabled={requestsMeta.page === requestsMeta.total_pages}
                        variant="outline"
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

      {/* Create Request Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {t('circulation.requests.createRequest')}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new hold, recall, or page request
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_barcode" className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-500" />
                {t('circulation.requests.form.userBarcode')} *
              </Label>
              <Input
                id="user_barcode"
                type="text"
                required
                value={createForm.user_barcode}
                onChange={(e) => setCreateForm({ ...createForm, user_barcode: e.target.value })}
                placeholder={t('circulation.requests.form.userBarcodePlaceholder')}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_barcode" className="flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-500" />
                {t('circulation.requests.form.itemBarcode')} *
              </Label>
              <Input
                id="item_barcode"
                type="text"
                required
                value={createForm.item_barcode}
                onChange={(e) => setCreateForm({ ...createForm, item_barcode: e.target.value })}
                placeholder={t('circulation.requests.form.itemBarcodePlaceholder')}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_type">{t('circulation.requests.form.requestType')} *</Label>
              <Select
                value={createForm.request_type}
                onValueChange={(value) => setCreateForm({ ...createForm, request_type: value as RequestType })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hold">{t('circulation.requests.type.hold')}</SelectItem>
                  <SelectItem value="recall">{t('circulation.requests.type.recall')}</SelectItem>
                  <SelectItem value="page">{t('circulation.requests.type.page')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500" />
                {t('circulation.requests.form.expirationDate')}
              </Label>
              <Input
                id="expiration_date"
                type="date"
                value={createForm.expiration_date}
                onChange={(e) => setCreateForm({ ...createForm, expiration_date: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-gray-500">{t('circulation.requests.form.optional')}</p>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              >
                {loading ? t('common.creating') : t('circulation.requests.button.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {t('circulation.requests.cancel.confirm')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('circulation.requests.cancel.message', { itemTitle: requestToCancel?.itemTitle })}
              <br />
              <span className="font-semibold text-red-600">{t('circulation.requests.cancel.warning')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('circulation.requests.button.cancelRequest')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Requests
