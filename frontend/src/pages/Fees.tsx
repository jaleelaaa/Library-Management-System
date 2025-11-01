import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

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

// Removed unused interface UserSummary

type TabType = 'fees' | 'payments';

const Fees: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('fees');
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'pay' | 'waive' | 'view'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

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
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.fee_type = typeFilter;

      const response = await axios.get('/api/v1/fees/fees', {
        ...axiosConfig,
        params,
      });
      setFees(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeePayments = async (feeId: string) => {
    try {
      const response = await axios.get(`/api/v1/fees/fees/${feeId}/payments`, axiosConfig);
      setPayments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch payments');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeeTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('fees.title')}</h1>
        <p className="text-gray-600 mt-2">{t('fees.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('fees')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('fees.tabs.fees')}
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
          <button onClick={() => setError(null)} className="ms-4 text-sm underline">{t('common.dismiss')}</button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('fees.filters.allStatuses')}</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('fees.filters.allTypes')}</option>
            {FEE_TYPES.map(type => (
              <option key={type} value={type}>{getFeeTypeLabel(type)}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateFee}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + {t('fees.newFee')}
          </button>
          <button
            onClick={fetchFees}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fees.table.type')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fees.table.status')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fees.table.amount')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fees.table.remaining')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fees.table.description')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('fees.table.date')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {t('fees.noFees')}
                    </td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getFeeTypeLabel(fee.fee_type)}</div>
                        {fee.automated && (
                          <div className="text-xs text-gray-500">{t('fees.autoGenerated')}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${fee.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">${fee.remaining.toFixed(2)}</div>
                        {fee.paid_amount > 0 && (
                          <div className="text-xs text-gray-500">{t('fees.paid')}: ${fee.paid_amount.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{fee.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(fee.fee_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewFee(fee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('common.view')}
                        </button>
                        {fee.status === 'open' && (
                          <>
                            <button
                              onClick={() => handlePayFee(fee)}
                              className="text-green-600 hover:text-green-900"
                            >
                              {t('fees.pay')}
                            </button>
                            <button
                              onClick={() => handleWaiveFee(fee)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              {t('fees.waive')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.previous')}
              </button>
              <span className="px-4 py-2 text-gray-700">
                {t('common.page')} {currentPage} {t('common.of')} {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' && t('fees.modal.createFee')}
              {modalMode === 'pay' && t('fees.modal.recordPayment')}
              {modalMode === 'waive' && t('fees.modal.waiveFee')}
              {modalMode === 'view' && t('fees.modal.feeDetails')}
            </h2>

            {modalMode === 'view' && selectedFee ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.type')}</label>
                    <div className="text-sm text-gray-900">{getFeeTypeLabel(selectedFee.fee_type)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.status')}</label>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedFee.status)}`}>
                      {selectedFee.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.originalAmount')}</label>
                    <div className="text-sm text-gray-900">${selectedFee.amount.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.remaining')}</label>
                    <div className="text-sm font-bold text-gray-900">${selectedFee.remaining.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.paid')}</label>
                    <div className="text-sm text-gray-900">${selectedFee.paid_amount.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.feeDate')}</label>
                    <div className="text-sm text-gray-900">{new Date(selectedFee.fee_date).toLocaleString()}</div>
                  </div>
                </div>

                {selectedFee.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.description')}</label>
                    <div className="text-sm text-gray-900">{selectedFee.description}</div>
                  </div>
                )}

                {selectedFee.reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('fees.modal.reason')}</label>
                    <div className="text-sm text-gray-900">{selectedFee.reason}</div>
                  </div>
                )}

                {/* Payment History */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-2">{t('fees.modal.paymentHistory')}</h3>
                  {payments.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('fees.modal.noPayments')}</p>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div key={payment.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium">
                                {payment.payment_method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </div>
                              {payment.comments && (
                                <div className="text-xs text-gray-600">{payment.comments}</div>
                              )}
                              {payment.transaction_info && (
                                <div className="text-xs text-gray-500">{t('fees.modal.ref')}: {payment.transaction_info}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold">${payment.amount.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">{t('fees.modal.balance')}: ${payment.balance.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitFee}>
                <div className="space-y-4">
                  {modalMode === 'create' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.userId')} *
                        </label>
                        <input
                          type="text"
                          name="user_id"
                          required
                          placeholder={t('fees.form.userIdPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">{t('fees.form.userIdHint')}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.feeType')} *
                        </label>
                        <select
                          name="fee_type"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {FEE_TYPES.map(type => (
                            <option key={type} value={type}>{getFeeTypeLabel(type)}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.amount')} *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          step="0.01"
                          min="0"
                          required
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.description')}
                        </label>
                        <input
                          type="text"
                          name="description"
                          maxLength={500}
                          placeholder={t('fees.form.descriptionPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.reason')}
                        </label>
                        <textarea
                          name="reason"
                          rows={3}
                          placeholder={t('fees.form.reasonPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {modalMode === 'pay' && selectedFee && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <strong>{t('fees.form.fee')}:</strong> {getFeeTypeLabel(selectedFee.fee_type)}
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>{t('fees.form.remainingBalance')}:</strong> ${selectedFee.remaining.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.paymentMethod')} *
                        </label>
                        <select
                          name="payment_method"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="cash">{t('fees.paymentMethods.cash')}</option>
                          <option value="check">{t('fees.paymentMethods.check')}</option>
                          <option value="credit_card">{t('fees.paymentMethods.creditCard')}</option>
                          <option value="transfer">{t('fees.paymentMethods.transfer')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.amount')} *
                        </label>
                        <input
                          type="number"
                          name="amount"
                          step="0.01"
                          min="0.01"
                          max={selectedFee.remaining}
                          defaultValue={selectedFee.remaining}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {t('fees.form.maximum')}: ${selectedFee.remaining.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.transactionInfo')}
                        </label>
                        <input
                          type="text"
                          name="transaction_info"
                          maxLength={500}
                          placeholder={t('fees.form.transactionInfoPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.comments')}
                        </label>
                        <textarea
                          name="comments"
                          rows={2}
                          placeholder={t('fees.form.commentsPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {modalMode === 'waive' && selectedFee && (
                    <>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-700">
                          <strong>{t('fees.form.fee')}:</strong> {getFeeTypeLabel(selectedFee.fee_type)}
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>{t('fees.form.remainingBalance')}:</strong> ${selectedFee.remaining.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.action')} *
                        </label>
                        <select
                          name="payment_method"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="waive">{t('fees.actions.waive')}</option>
                          <option value="forgive">{t('fees.actions.forgive')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.amountOptional')}
                        </label>
                        <input
                          type="number"
                          name="amount"
                          step="0.01"
                          min="0.01"
                          max={selectedFee.remaining}
                          placeholder={`${selectedFee.remaining.toFixed(2)} (${t('fees.form.fullAmount')})`}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('fees.form.reason')} *
                        </label>
                        <textarea
                          name="reason"
                          rows={3}
                          required
                          placeholder={t('fees.form.waiveReasonPlaceholder')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === 'create' && t('fees.button.createFee')}
                    {modalMode === 'pay' && t('fees.button.recordPayment')}
                    {modalMode === 'waive' && t('fees.button.waiveForgive')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
