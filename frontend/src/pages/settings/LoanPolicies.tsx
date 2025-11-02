import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Edit, Trash2, Eye, RefreshCw, CheckCircle2, XCircle, Calendar } from 'lucide-react';

// shadcn components
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

interface LoanPolicy {
  id: string;
  name: string;
  code: string;
  description?: string;
  loan_period_duration: number;
  loan_period_interval: string;
  renewable: boolean;
  number_of_renewals_allowed: number;
  renewal_period_duration: number;
  renewal_period_interval: string;
  grace_period_duration: number;
  grace_period_interval: string;
  recall_return_interval_duration?: number;
  recall_return_interval_interval?: string;
  is_active: boolean;
  created_date: string;
  updated_date?: string;
  tenant_id: string;
}

const LoanPolicies: React.FC = () => {
  const { t } = useLanguage();
  const [policies, setPolicies] = useState<LoanPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPolicy, setSelectedPolicy] = useState<LoanPolicy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
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
  }, [currentPage, activeFilter]);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (activeFilter) params.is_active = activeFilter === 'true';

      const response = await axios.get('/api/v1/circulation/loan-policies', {
        ...axiosConfig,
        params,
      });
      setPolicies(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('loanPolicies.error.fetch'));
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPolicy(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (policy: LoanPolicy) => {
    setSelectedPolicy(policy);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (policy: LoanPolicy) => {
    setSelectedPolicy(policy);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setPolicyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!policyToDelete) return;

    try {
      await axios.delete(`/api/v1/circulation/loan-policies/${policyToDelete}`, axiosConfig);
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('loanPolicies.error.delete'));
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const policyData: any = {
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      loan_period_duration: parseInt(formData.get('loan_period_duration') as string),
      loan_period_interval: formData.get('loan_period_interval'),
      renewable: formData.get('renewable') === 'true',
      number_of_renewals_allowed: parseInt(formData.get('number_of_renewals_allowed') as string),
      renewal_period_duration: parseInt(formData.get('renewal_period_duration') as string),
      renewal_period_interval: formData.get('renewal_period_interval'),
      grace_period_duration: parseInt(formData.get('grace_period_duration') as string),
      grace_period_interval: formData.get('grace_period_interval'),
      is_active: formData.get('is_active') === 'true',
    };

    // Add recall configuration if provided
    const recallDuration = formData.get('recall_return_interval_duration');
    if (recallDuration && recallDuration !== '') {
      policyData.recall_return_interval_duration = parseInt(recallDuration as string);
      policyData.recall_return_interval_interval = formData.get('recall_return_interval_interval');
    }

    // For create mode, add code
    if (modalMode === 'create') {
      policyData.code = formData.get('code');
    }

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/circulation/loan-policies', policyData, axiosConfig);
      } else if (modalMode === 'edit' && selectedPolicy) {
        await axios.put(`/api/v1/circulation/loan-policies/${selectedPolicy.id}`, policyData, axiosConfig);
      }
      setShowModal(false);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('loanPolicies.error.save'));
    }
  };

  const INTERVALS = ['Days', 'Weeks', 'Months'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 me-1" />
          {t('common.active')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200">
        <XCircle className="w-3 h-3 me-1" />
        {t('common.inactive')}
      </Badge>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-900 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  {t('loanPolicies.title')}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  size="lg"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md"
                >
                  <Plus className="w-4 h-4 me-2" />
                  {t('loanPolicies.new')}
                </Button>
                <Button
                  onClick={fetchPolicies}
                  variant="outline"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 me-2" />
                  {t('common.refresh')}
                </Button>
              </div>
            </div>
            <p className="text-gray-600 mt-2 text-base">{t('loanPolicies.subtitle')}</p>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl text-red-800 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                {t('common.dismiss')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-64">
                <Label className="text-gray-700 mb-2">{t('loanPolicies.filterByStatus')}</Label>
                <Select
                  value={activeFilter || 'all'}
                  onValueChange={(value) => setActiveFilter(value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('loanPolicies.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('loanPolicies.allStatuses')}</SelectItem>
                    <SelectItem value="true">{t('loanPolicies.activeOnly')}</SelectItem>
                    <SelectItem value="false">{t('loanPolicies.inactiveOnly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-40" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-40" />
                  </div>
                ))}
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 mb-4"
                >
                  <Calendar className="w-10 h-10 text-teal-600" />
                </motion.div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {t('loanPolicies.noPolicies')}
                </p>
                <p className="text-gray-500">{t('loanPolicies.noPolicies.desc')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50">
                    <TableHead className="font-semibold">{t('loanPolicies.code')}</TableHead>
                    <TableHead className="font-semibold">{t('loanPolicies.name')}</TableHead>
                    <TableHead className="font-semibold">{t('loanPolicies.loanPeriod')}</TableHead>
                    <TableHead className="font-semibold">{t('loanPolicies.renewability')}</TableHead>
                    <TableHead className="font-semibold">{t('common.status')}</TableHead>
                    <TableHead className="font-semibold text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {policies.map((policy) => (
                      <motion.tr
                        key={policy.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b hover:bg-teal-50/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium text-gray-900">{policy.code}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{policy.name}</div>
                          {policy.description && (
                            <div className="text-xs text-gray-500 mt-1">{policy.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {policy.loan_period_duration} {policy.loan_period_interval}
                          </div>
                          {policy.grace_period_duration > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {t('loanPolicies.grace')}: {policy.grace_period_duration} {policy.grace_period_interval}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {policy.renewable ? (
                            <div>
                              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 me-1" />
                                {t('loanPolicies.yes')}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {policy.number_of_renewals_allowed} {t('loanPolicies.renewals')}
                              </div>
                            </div>
                          ) : (
                            <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700">
                              <XCircle className="w-3 h-3 me-1" />
                              {t('loanPolicies.no')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(policy.is_active)}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(policy)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 me-1" />
                              {t('common.view')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(policy)}
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            >
                              <Edit className="w-4 h-4 me-1" />
                              {t('common.edit')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(policy.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 me-1" />
                              {t('common.delete')}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center items-center gap-2">
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
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-900 to-cyan-600 bg-clip-text text-transparent">
              {t(`loanPolicies.modal.${modalMode}`)}
            </DialogTitle>
            <DialogDescription>{t(`loanPolicies.modal.${modalMode}Desc`)}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code" className="text-gray-700">
                    {t('loanPolicies.code')} *
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    defaultValue={selectedPolicy?.code || ''}
                    required
                    disabled={modalMode !== 'create'}
                    placeholder="STANDARD_LOAN"
                    maxLength={50}
                    className="mt-1"
                  />
                  {modalMode === 'create' && (
                    <p className="mt-1 text-xs text-gray-500">{t('loanPolicies.codeHelp')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="is_active" className="text-gray-700">
                    {t('common.status')}
                  </Label>
                  <Select
                    name="is_active"
                    defaultValue={selectedPolicy?.is_active ? 'true' : 'false'}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t('common.active')}</SelectItem>
                      <SelectItem value="false">{t('common.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-gray-700">
                  {t('loanPolicies.name')} *
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedPolicy?.name || ''}
                  required
                  disabled={modalMode === 'view'}
                  placeholder={t('loanPolicies.namePlaceholder')}
                  maxLength={255}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">
                  {t('loanPolicies.description')}
                </Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={selectedPolicy?.description || ''}
                  disabled={modalMode === 'view'}
                  rows={2}
                  placeholder={t('loanPolicies.descriptionPlaceholder')}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Loan Period */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">{t('loanPolicies.loanPeriod')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan_period_duration" className="text-gray-700">
                    {t('loanPolicies.duration')} *
                  </Label>
                  <Input
                    id="loan_period_duration"
                    name="loan_period_duration"
                    type="number"
                    min="1"
                    defaultValue={selectedPolicy?.loan_period_duration || 14}
                    required
                    disabled={modalMode === 'view'}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="loan_period_interval" className="text-gray-700">
                    {t('loanPolicies.interval')} *
                  </Label>
                  <Select
                    name="loan_period_interval"
                    defaultValue={selectedPolicy?.loan_period_interval || 'Days'}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVALS.map(interval => (
                        <SelectItem key={interval} value={interval}>{interval}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Renewability */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">{t('loanPolicies.renewability')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="renewable" className="text-gray-700">
                    {t('loanPolicies.renewable')} *
                  </Label>
                  <Select
                    name="renewable"
                    defaultValue={selectedPolicy?.renewable ? 'true' : 'false'}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t('loanPolicies.yes')}</SelectItem>
                      <SelectItem value="false">{t('loanPolicies.no')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="number_of_renewals_allowed" className="text-gray-700">
                    {t('loanPolicies.numberOfRenewals')} *
                  </Label>
                  <Input
                    id="number_of_renewals_allowed"
                    name="number_of_renewals_allowed"
                    type="number"
                    min="0"
                    defaultValue={selectedPolicy?.number_of_renewals_allowed || 3}
                    required
                    disabled={modalMode === 'view'}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="renewal_period_duration" className="text-gray-700">
                    {t('loanPolicies.renewalDuration')} *
                  </Label>
                  <Input
                    id="renewal_period_duration"
                    name="renewal_period_duration"
                    type="number"
                    min="1"
                    defaultValue={selectedPolicy?.renewal_period_duration || 14}
                    required
                    disabled={modalMode === 'view'}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="renewal_period_interval" className="text-gray-700">
                    {t('loanPolicies.renewalInterval')} *
                  </Label>
                  <Select
                    name="renewal_period_interval"
                    defaultValue={selectedPolicy?.renewal_period_interval || 'Days'}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVALS.map(interval => (
                        <SelectItem key={interval} value={interval}>{interval}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Grace Period */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">{t('loanPolicies.gracePeriod')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grace_period_duration" className="text-gray-700">
                    {t('loanPolicies.duration')} *
                  </Label>
                  <Input
                    id="grace_period_duration"
                    name="grace_period_duration"
                    type="number"
                    min="0"
                    defaultValue={selectedPolicy?.grace_period_duration || 0}
                    required
                    disabled={modalMode === 'view'}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('loanPolicies.graceHelp')}</p>
                </div>

                <div>
                  <Label htmlFor="grace_period_interval" className="text-gray-700">
                    {t('loanPolicies.interval')} *
                  </Label>
                  <Select
                    name="grace_period_interval"
                    defaultValue={selectedPolicy?.grace_period_interval || 'Days'}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVALS.map(interval => (
                        <SelectItem key={interval} value={interval}>{interval}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Recall Configuration */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">{t('loanPolicies.recallConfig')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recall_return_interval_duration" className="text-gray-700">
                    {t('loanPolicies.returnIntervalDuration')}
                  </Label>
                  <Input
                    id="recall_return_interval_duration"
                    name="recall_return_interval_duration"
                    type="number"
                    min="1"
                    defaultValue={selectedPolicy?.recall_return_interval_duration || ''}
                    disabled={modalMode === 'view'}
                    placeholder={t('loanPolicies.recallPlaceholder')}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="recall_return_interval_interval" className="text-gray-700">
                    {t('loanPolicies.returnInterval')}
                  </Label>
                  <Select
                    name="recall_return_interval_interval"
                    defaultValue={selectedPolicy?.recall_return_interval_interval || 'Days'}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTERVALS.map(interval => (
                        <SelectItem key={interval} value={interval}>{interval}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {selectedPolicy && modalMode === 'view' && (
              <div className="border-t pt-4 mt-4">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>{t('common.created')}:</strong> {new Date(selectedPolicy.created_date).toLocaleString()}
                  </p>
                  {selectedPolicy.updated_date && (
                    <p>
                      <strong>{t('common.updated')}:</strong> {new Date(selectedPolicy.updated_date).toLocaleString()}
                    </p>
                  )}
                  <p><strong>ID:</strong> {selectedPolicy.id}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                {modalMode === 'view' ? t('common.close') : t('common.cancel')}
              </Button>
              {modalMode !== 'view' && (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  {modalMode === 'create' ? t('common.create') : t('common.saveChanges')}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">{t('loanPolicies.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('loanPolicies.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPolicyToDelete(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default LoanPolicies;
