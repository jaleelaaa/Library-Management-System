import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, RefreshCw, Edit, Trash2, Eye,
  Receipt, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

interface FeePolicy {
  id: string;
  name: string;
  code: string;
  description?: string;
  fee_type: string;
  initial_amount?: number;
  max_amount?: number;
  per_day_amount?: number;
  grace_period_days: number;
  is_active: boolean;
  created_date: string;
  updated_date?: string;
  tenant_id: string;
}

const FeePolicies: React.FC = () => {
  const [policies, setPolicies] = useState<FeePolicy[]>([]);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPolicy, setSelectedPolicy] = useState<FeePolicy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const token = useSelector((state: RootState) => state.auth.token);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchPolicies();
  }, [currentPage, feeTypeFilter, activeFilter]);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (feeTypeFilter) params.fee_type = feeTypeFilter;
      if (activeFilter) params.is_active = activeFilter === 'true';

      const response = await axios.get('/api/v1/fees/fee-policies', {
        ...axiosConfig,
        params,
      });
      setPolicies(response.data.items || []);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('feePolicies.error.fetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPolicy(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (policy: FeePolicy) => {
    setSelectedPolicy(policy);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (policy: FeePolicy) => {
    setSelectedPolicy(policy);
    setModalMode('view');
    setShowModal(true);
  };

  const confirmDelete = (id: string) => {
    setPolicyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!policyToDelete) return;

    try {
      await axios.delete(`/api/v1/fees/fee-policies/${policyToDelete}`, axiosConfig);
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('feePolicies.error.delete'));
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const policyData: any = {
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      is_active: formData.get('is_active') === 'true',
    };

    // Add initial_amount if provided
    const initialAmount = formData.get('initial_amount');
    if (initialAmount && initialAmount !== '') {
      policyData.initial_amount = parseFloat(initialAmount as string);
    }

    // Add max_amount if provided
    const maxAmount = formData.get('max_amount');
    if (maxAmount && maxAmount !== '') {
      policyData.max_amount = parseFloat(maxAmount as string);
    }

    // Add per_day_amount if provided
    const perDayAmount = formData.get('per_day_amount');
    if (perDayAmount && perDayAmount !== '') {
      policyData.per_day_amount = parseFloat(perDayAmount as string);
    }

    // Add grace_period_days
    const gracePeriod = formData.get('grace_period_days');
    if (gracePeriod && gracePeriod !== '') {
      policyData.grace_period_days = parseInt(gracePeriod as string);
    }

    // For create mode, add code and fee_type
    if (modalMode === 'create') {
      policyData.code = formData.get('code');
      policyData.fee_type = formData.get('fee_type');
    }

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/fees/fee-policies', policyData, axiosConfig);
      } else if (modalMode === 'edit' && selectedPolicy) {
        await axios.put(`/api/v1/fees/fee-policies/${selectedPolicy.id}`, policyData, axiosConfig);
      }
      setShowModal(false);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('feePolicies.error.save'));
    }
  };

  const FEE_TYPES = ['overdue', 'lost_item', 'damaged_item', 'processing', 'replacement', 'lost_item_processing', 'manual'];

  const getFeeTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-900 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  {t('feePolicies.title')}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  size="lg"
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md"
                >
                  <Plus className="w-4 h-4 me-2" />
                  {t('feePolicies.new')}
                </Button>
                <Button onClick={fetchPolicies} variant="outline" size="lg">
                  <RefreshCw className="w-4 h-4 me-2" />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>
            <p className="text-gray-600 mt-2 text-lg">{t('feePolicies.subtitle')}</p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-red-800">{error}</p>
                  <Button onClick={() => setError(null)} variant="ghost" size="sm">
                    {t('common.dismiss')}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>{t('feePolicies.filterByType')}</Label>
                <Select
                  value={feeTypeFilter || 'all'}
                  onValueChange={(value) => setFeeTypeFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('feePolicies.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('feePolicies.allTypes')}</SelectItem>
                    {FEE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{getFeeTypeLabel(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>{t('feePolicies.filterByStatus')}</Label>
                <Select
                  value={activeFilter || 'all'}
                  onValueChange={(value) => setActiveFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('feePolicies.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('feePolicies.allStatuses')}</SelectItem>
                    <SelectItem value="true">{t('feePolicies.activeOnly')}</SelectItem>
                    <SelectItem value="false">{t('feePolicies.inactiveOnly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="mt-6">
        <Card>
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('feePolicies.table.code')}</TableHead>
                  <TableHead>{t('feePolicies.table.name')}</TableHead>
                  <TableHead>{t('feePolicies.table.type')}</TableHead>
                  <TableHead>{t('feePolicies.table.amounts')}</TableHead>
                  <TableHead>{t('feePolicies.table.status')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {(policies || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center py-16"
                        >
                          <div className="p-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full mb-4">
                            <Receipt className="w-16 h-16 text-rose-600" />
                          </div>
                          <p className="text-xl font-semibold text-gray-700 mb-2">{t('feePolicies.noPolicies')}</p>
                          <p className="text-gray-500">{t('feePolicies.noPolicies.desc')}</p>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (policies || []).map((policy, index) => (
                      <motion.tr
                        key={policy.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-rose-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">{policy.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{policy.name}</div>
                            {policy.description && (
                              <div className="text-xs text-gray-500 mt-1">{policy.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gradient-to-r from-rose-50 to-pink-50">
                            {getFeeTypeLabel(policy.fee_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600 space-y-1">
                            {policy.initial_amount !== null && policy.initial_amount !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{t('feePolicies.initialAmount')}:</span>
                                <span>${policy.initial_amount.toFixed(2)}</span>
                              </div>
                            )}
                            {policy.per_day_amount !== null && policy.per_day_amount !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{t('feePolicies.perDay')}:</span>
                                <span>${policy.per_day_amount.toFixed(2)}</span>
                              </div>
                            )}
                            {policy.max_amount !== null && policy.max_amount !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{t('feePolicies.max')}:</span>
                                <span>${policy.max_amount.toFixed(2)}</span>
                              </div>
                            )}
                            {policy.grace_period_days > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{t('feePolicies.grace')}:</span>
                                <span>{policy.grace_period_days} {t('feePolicies.days')}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {policy.is_active ? (
                            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 me-1" />
                              {t('common.active')}
                            </Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700">
                              <XCircle className="w-3 h-3 me-1" />
                              {t('common.inactive')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleView(policy)}
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleEdit(policy)}
                              variant="ghost"
                              size="sm"
                              className="hover:bg-rose-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => confirmDelete(policy.id)}
                              variant="ghost"
                              size="sm"
                              className="hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="mt-6 flex justify-center items-center gap-2">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            {t('common.previous')}
          </Button>
          <span className="px-4 py-2 text-gray-700">
            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            {t('common.next')}
          </Button>
        </motion.div>
      )}

      {/* Create/Edit/View Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-rose-900 to-pink-600 bg-clip-text text-transparent">
              {modalMode === 'create' ? t('feePolicies.modal.create') :
               modalMode === 'edit' ? t('feePolicies.modal.edit') :
               t('feePolicies.modal.view')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">{t('feePolicies.code')} *</Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={selectedPolicy?.code || ''}
                    required
                    disabled={modalMode !== 'create'}
                    placeholder="OVERDUE_STD"
                    maxLength={50}
                  />
                  {modalMode === 'create' && (
                    <p className="mt-1 text-xs text-gray-500">{t('feePolicies.codeHint')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="fee_type">{t('feePolicies.feeType')} *</Label>
                  <Select
                    name="fee_type"
                    defaultValue={selectedPolicy?.fee_type || 'overdue'}
                    required
                    disabled={modalMode !== 'create'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{getFeeTypeLabel(type)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name">{t('feePolicies.name')} *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedPolicy?.name || ''}
                  required
                  disabled={modalMode === 'view'}
                  placeholder={t('feePolicies.namePlaceholder')}
                  maxLength={255}
                />
              </div>

              <div>
                <Label htmlFor="description">{t('feePolicies.description')}</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={selectedPolicy?.description || ''}
                  disabled={modalMode === 'view'}
                  rows={2}
                  placeholder={t('feePolicies.descriptionPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Fee Amounts */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-rose-900">{t('feePolicies.feeAmounts')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="initial_amount">{t('feePolicies.initialAmount')}</Label>
                  <Input
                    id="initial_amount"
                    name="initial_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={selectedPolicy?.initial_amount || ''}
                    disabled={modalMode === 'view'}
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('feePolicies.initialAmountHint')}</p>
                </div>

                <div>
                  <Label htmlFor="per_day_amount">{t('feePolicies.perDayAmount')}</Label>
                  <Input
                    id="per_day_amount"
                    name="per_day_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={selectedPolicy?.per_day_amount || ''}
                    disabled={modalMode === 'view'}
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('feePolicies.perDayAmountHint')}</p>
                </div>

                <div>
                  <Label htmlFor="max_amount">{t('feePolicies.maxAmount')}</Label>
                  <Input
                    id="max_amount"
                    name="max_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={selectedPolicy?.max_amount || ''}
                    disabled={modalMode === 'view'}
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('feePolicies.maxAmountHint')}</p>
                </div>

                <div>
                  <Label htmlFor="grace_period_days">{t('feePolicies.gracePeriod')}</Label>
                  <Input
                    id="grace_period_days"
                    name="grace_period_days"
                    type="number"
                    min="0"
                    defaultValue={selectedPolicy?.grace_period_days || 0}
                    disabled={modalMode === 'view'}
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('feePolicies.gracePeriodHint')}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="is_active">{t('common.status')}</Label>
              <Select
                name="is_active"
                defaultValue={selectedPolicy?.is_active ? 'true' : 'false'}
                disabled={modalMode === 'view'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t('common.active')}</SelectItem>
                  <SelectItem value="false">{t('common.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metadata (View mode only) */}
            {selectedPolicy && modalMode === 'view' && (
              <div className="border-t pt-4 mt-4">
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>{t('feePolicies.created')}:</strong> {new Date(selectedPolicy.created_date).toLocaleString()}</p>
                  {selectedPolicy.updated_date && (
                    <p><strong>{t('feePolicies.updated')}:</strong> {new Date(selectedPolicy.updated_date).toLocaleString()}</p>
                  )}
                  <p><strong>{t('feePolicies.id')}:</strong> {selectedPolicy.id}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="outline"
              >
                {modalMode === 'view' ? t('common.close') : t('common.cancel')}
              </Button>
              {modalMode !== 'view' && (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                >
                  {modalMode === 'create' ? t('common.create') : t('common.save')}
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
            <AlertDialogTitle>{t('feePolicies.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('feePolicies.deleteWarning')}
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
    </motion.div>
  );
};

export default FeePolicies;
