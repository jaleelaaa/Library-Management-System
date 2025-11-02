import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Eye, CreditCard, XCircle as X,
  RefreshCw, ChevronLeft, ChevronRight, CheckCircle,
  AlertCircle, Ban, Receipt, Calendar, User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface Fee {
  id: string;
  user_id: string;
  loan_id?: string;
  item_id?: string;
  fee_type: string;
  status: string;
  amount: number;
  remaining: number;
  paid_amount: number;
  description?: string;
  reason?: string;
  fee_date: string;
  due_date?: string;
  closed_date?: string;
  automated: boolean;
  created_date: string;
  tenant_id: string;
}

interface Payment {
  id: string;
  fee_id: string;
  user_id: string;
  payment_method: string;
  amount: number;
  transaction_info?: string;
  comments?: string;
  payment_date: string;
  balance: number;
}

const Fees: React.FC = () => {
  const { t } = useLanguage();
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'pay' | 'waive' | 'view'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const token = useSelector((state: RootState) => state.auth.token);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchFees();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchFees = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter && typeFilter !== 'all') params.fee_type = typeFilter;

      const response = await axios.get('/api/v1/fees/fees', {
        ...axiosConfig,
        params,
      });
      setFees(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('fees.error.fetch'));
    } finally {
      setLoading(false);
    }
  };

  const fetchFeePayments = async (feeId: string) => {
    try {
      const response = await axios.get(`/api/v1/fees/fees/${feeId}/payments`, axiosConfig);
      setPayments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('fees.error.fetchPayments'));
    }
  };

  const handleViewFee = async (fee: Fee) => {
    setSelectedFee(fee);
    setModalMode('view');
    setShowModal(true);
    await fetchFeePayments(fee.id);
  };

  const handleCreateFee = () => {
    setSelectedFee(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handlePayFee = (fee: Fee) => {
    setSelectedFee(fee);
    setModalMode('pay');
    setShowModal(true);
  };

  const handleWaiveFee = (fee: Fee) => {
    setSelectedFee(fee);
    setModalMode('waive');
    setShowModal(true);
  };

  const handleSubmitFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      if (modalMode === 'create') {
        const feeData = {
          user_id: formData.get('user_id'),
          fee_type: formData.get('fee_type'),
          amount: parseFloat(formData.get('amount') as string),
          description: formData.get('description'),
          reason: formData.get('reason'),
          automated: false,
        };
        await axios.post('/api/v1/fees/fees', feeData, axiosConfig);
      } else if (modalMode === 'pay' && selectedFee) {
        const paymentData = {
          fee_id: selectedFee.id,
          payment_method: formData.get('payment_method'),
          amount: parseFloat(formData.get('amount') as string),
          transaction_info: formData.get('transaction_info'),
          comments: formData.get('comments'),
        };
        await axios.post(`/api/v1/fees/fees/${selectedFee.id}/payments`, paymentData, axiosConfig);
      } else if (modalMode === 'waive' && selectedFee) {
        const waiveData = {
          amount: formData.get('amount') ? parseFloat(formData.get('amount') as string) : undefined,
          reason: formData.get('reason'),
          payment_method: formData.get('payment_method') || 'waive',
        };
        await axios.post(`/api/v1/fees/fees/${selectedFee.id}/waive`, waiveData, axiosConfig);
      }
      setShowModal(false);
      fetchFees();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process request');
    }
  };

  const FEE_TYPES = ['overdue', 'lost_item', 'damaged_item', 'processing', 'replacement', 'lost_item_processing', 'manual'];
  const STATUSES = ['open', 'closed', 'suspended'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 me-1" />
            {status}
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 me-1" />
            {status}
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200">
            <Ban className="w-3 h-3 me-1" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFeeTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            {t('fees.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('fees.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={fetchFees}
              variant="outline"
              className="hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 me-2" />
              {t('common.refresh')}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleCreateFee}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 me-2" />
              {t('fees.newFee')}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-red-800">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-sm border-amber-100">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label>{t('fees.filters.allStatuses')}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('fees.filters.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('fees.filters.allStatuses')}</SelectItem>
                    {STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>{t('fees.filters.allTypes')}</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('fees.filters.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('fees.filters.allTypes')}</SelectItem>
                    {FEE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {getFeeTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fees Table */}
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
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !fees || fees.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full">
                    <Receipt className="w-12 h-12 text-amber-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('fees.noFees')}</p>
                <p className="text-gray-500">No fees found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">{t('fees.table.type')}</TableHead>
                      <TableHead className="font-semibold">{t('fees.table.status')}</TableHead>
                      <TableHead className="font-semibold">{t('fees.table.amount')}</TableHead>
                      <TableHead className="font-semibold">{t('fees.table.remaining')}</TableHead>
                      <TableHead className="font-semibold">{t('fees.table.description')}</TableHead>
                      <TableHead className="font-semibold">{t('fees.table.date')}</TableHead>
                      <TableHead className="font-semibold text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {fees.map((fee, index) => (
                        <motion.tr
                          key={fee.id}
                          variants={item}
                          initial="hidden"
                          animate="show"
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors border-b"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                                {getFeeTypeLabel(fee.fee_type)}
                              </div>
                              {fee.automated && (
                                <div className="text-xs text-gray-500 mt-0.5">{t('fees.autoGenerated')}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(fee.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {fee.amount.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {fee.remaining.toFixed(2)}
                            </div>
                            {fee.paid_amount > 0 && (
                              <div className="text-xs text-green-600 mt-0.5">
                                {t('fees.paid')}: ${fee.paid_amount.toFixed(2)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {fee.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {new Date(fee.fee_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-end">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewFee(fee)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {fee.status === 'open' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePayFee(fee)}
                                    className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleWaiveFee(fee)}
                                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center gap-2"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 text-sm text-gray-700">
            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {modalMode === 'create' && t('fees.modal.createFee')}
              {modalMode === 'pay' && t('fees.modal.recordPayment')}
              {modalMode === 'waive' && t('fees.modal.waiveFee')}
              {modalMode === 'view' && t('fees.modal.feeDetails')}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' && 'Create a new fee for a patron'}
              {modalMode === 'pay' && 'Record a payment for this fee'}
              {modalMode === 'waive' && 'Waive or forgive this fee'}
              {modalMode === 'view' && 'View fee details and payment history'}
            </DialogDescription>
          </DialogHeader>

          {modalMode === 'view' && selectedFee ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{t('fees.modal.type')}</Label>
                  <div className="text-sm font-medium">{getFeeTypeLabel(selectedFee.fee_type)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{t('fees.modal.status')}</Label>
                  <div>{getStatusBadge(selectedFee.status)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{t('fees.modal.originalAmount')}</Label>
                  <div className="text-sm font-semibold">${selectedFee.amount.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{t('fees.modal.remaining')}</Label>
                  <div className="text-sm font-bold text-amber-600">${selectedFee.remaining.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{t('fees.modal.paid')}</Label>
                  <div className="text-sm font-medium text-green-600">${selectedFee.paid_amount.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">{t('fees.modal.feeDate')}</Label>
                  <div className="text-sm">{new Date(selectedFee.fee_date).toLocaleString()}</div>
                </div>
              </div>

              {selectedFee.description && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">{t('fees.modal.description')}</Label>
                    <div className="text-sm">{selectedFee.description}</div>
                  </div>
                </>
              )}

              {selectedFee.reason && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">{t('fees.modal.reason')}</Label>
                    <div className="text-sm">{selectedFee.reason}</div>
                  </div>
                </>
              )}

              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('fees.modal.paymentHistory')}</Label>
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('fees.modal.noPayments')}</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <Card key={payment.id} className="border-amber-100">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-amber-600" />
                                {payment.payment_method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </div>
                              {payment.comments && (
                                <div className="text-xs text-gray-600">{payment.comments}</div>
                              )}
                              {payment.transaction_info && (
                                <div className="text-xs text-gray-500">{t('fees.modal.ref')}: {payment.transaction_info}</div>
                              )}
                            </div>
                            <div className="text-end space-y-1">
                              <div className="text-sm font-bold text-green-600">${payment.amount.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">{t('fees.modal.balance')}: ${payment.balance.toFixed(2)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  {t('common.close')}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmitFee} className="space-y-4">
              {modalMode === 'create' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="user_id">{t('fees.form.userId')} *</Label>
                    <Input
                      id="user_id"
                      name="user_id"
                      required
                      placeholder={t('fees.form.userIdPlaceholder')}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">{t('fees.form.userIdHint')}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fee_type">{t('fees.form.feeType')} *</Label>
                    <select
                      id="fee_type"
                      name="fee_type"
                      required
                      className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    >
                      {FEE_TYPES.map(type => (
                        <option key={type} value={type}>{getFeeTypeLabel(type)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">{t('fees.form.amount')} *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('fees.form.description')}</Label>
                    <Input
                      id="description"
                      name="description"
                      maxLength={500}
                      placeholder={t('fees.form.descriptionPlaceholder')}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">{t('fees.form.reason')}</Label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows={3}
                      placeholder={t('fees.form.reasonPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              {modalMode === 'pay' && selectedFee && (
                <>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4 space-y-1">
                      <div className="text-sm">
                        <strong>{t('fees.form.fee')}:</strong> {getFeeTypeLabel(selectedFee.fee_type)}
                      </div>
                      <div className="text-sm">
                        <strong>{t('fees.form.remainingBalance')}:</strong> ${selectedFee.remaining.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method">{t('fees.form.paymentMethod')} *</Label>
                    <select
                      id="payment_method"
                      name="payment_method"
                      required
                      className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="cash">{t('fees.paymentMethods.cash')}</option>
                      <option value="check">{t('fees.paymentMethods.check')}</option>
                      <option value="credit_card">{t('fees.paymentMethods.creditCard')}</option>
                      <option value="transfer">{t('fees.paymentMethods.transfer')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pay_amount">{t('fees.form.amount')} *</Label>
                    <Input
                      id="pay_amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedFee.remaining}
                      defaultValue={selectedFee.remaining}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      {t('fees.form.maximum')}: ${selectedFee.remaining.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction_info">{t('fees.form.transactionInfo')}</Label>
                    <Input
                      id="transaction_info"
                      name="transaction_info"
                      maxLength={500}
                      placeholder={t('fees.form.transactionInfoPlaceholder')}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">{t('fees.form.comments')}</Label>
                    <textarea
                      id="comments"
                      name="comments"
                      rows={2}
                      placeholder={t('fees.form.commentsPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              {modalMode === 'waive' && selectedFee && (
                <>
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4 space-y-1">
                      <div className="text-sm">
                        <strong>{t('fees.form.fee')}:</strong> {getFeeTypeLabel(selectedFee.fee_type)}
                      </div>
                      <div className="text-sm">
                        <strong>{t('fees.form.remainingBalance')}:</strong> ${selectedFee.remaining.toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="waive_method">{t('fees.form.action')} *</Label>
                    <select
                      id="waive_method"
                      name="payment_method"
                      required
                      className="w-full h-11 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="waive">{t('fees.actions.waive')}</option>
                      <option value="forgive">{t('fees.actions.forgive')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waive_amount">{t('fees.form.amountOptional')}</Label>
                    <Input
                      id="waive_amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={selectedFee.remaining}
                      placeholder={`${selectedFee.remaining.toFixed(2)} (${t('fees.form.fullAmount')})`}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waive_reason">{t('fees.form.reason')} *</Label>
                    <textarea
                      id="waive_reason"
                      name="reason"
                      rows={3}
                      required
                      placeholder={t('fees.form.waiveReasonPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {modalMode === 'create' && t('fees.button.createFee')}
                  {modalMode === 'pay' && t('fees.button.recordPayment')}
                  {modalMode === 'waive' && t('fees.button.waiveForgive')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fees;
