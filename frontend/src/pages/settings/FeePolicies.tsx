import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPolicy, setSelectedPolicy] = useState<FeePolicy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');

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
      setPolicies(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch fee policies');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee policy?')) return;

    try {
      await axios.delete(`/api/v1/fees/fee-policies/${id}`, axiosConfig);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete fee policy');
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
      setError(err.response?.data?.detail || 'Failed to save fee policy');
    }
  };

  const FEE_TYPES = ['overdue', 'lost_item', 'damaged_item', 'processing', 'replacement', 'lost_item_processing', 'manual'];

  const getFeeTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fee Policies</h2>
          <p className="text-gray-600 mt-2">Configure automated fee amounts and rules</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Fee Policy
          </button>
          <button
            onClick={fetchPolicies}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
          <button onClick={() => setError(null)} className="ms-4 text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={feeTypeFilter}
          onChange={(e) => setFeeTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Fee Types</option>
          {FEE_TYPES.map(type => (
            <option key={type} value={type}>{getFeeTypeLabel(type)}</option>
          ))}
        </select>

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
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
                    Code
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amounts
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No fee policies found. Create your first policy to get started.
                    </td>
                  </tr>
                ) : (
                  policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{policy.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                        {policy.description && (
                          <div className="text-xs text-gray-500">{policy.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getFeeTypeLabel(policy.fee_type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600 space-y-1">
                          {policy.initial_amount !== null && policy.initial_amount !== undefined && (
                            <div>Initial: ${policy.initial_amount.toFixed(2)}</div>
                          )}
                          {policy.per_day_amount !== null && policy.per_day_amount !== undefined && (
                            <div>Per Day: ${policy.per_day_amount.toFixed(2)}</div>
                          )}
                          {policy.max_amount !== null && policy.max_amount !== undefined && (
                            <div>Max: ${policy.max_amount.toFixed(2)}</div>
                          )}
                          {policy.grace_period_days > 0 && (
                            <div>Grace: {policy.grace_period_days} days</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          policy.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleView(policy)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(policy)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(policy.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
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
              {modalMode === 'create' ? 'Create Fee Policy' : modalMode === 'edit' ? 'Edit Fee Policy' : 'View Fee Policy'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      defaultValue={selectedPolicy?.code || ''}
                      required
                      disabled={modalMode !== 'create'}
                      placeholder="OVERDUE_STD"
                      maxLength={50}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {modalMode === 'create' && (
                      <p className="mt-1 text-xs text-gray-500">Unique code (e.g., OVERDUE_STD, LOST_ITEM)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Type *
                    </label>
                    <select
                      name="fee_type"
                      defaultValue={selectedPolicy?.fee_type || 'overdue'}
                      required
                      disabled={modalMode !== 'create'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {FEE_TYPES.map(type => (
                        <option key={type} value={type}>{getFeeTypeLabel(type)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedPolicy?.name || ''}
                    required
                    disabled={modalMode === 'view'}
                    placeholder="Standard Overdue Policy"
                    maxLength={255}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedPolicy?.description || ''}
                    disabled={modalMode === 'view'}
                    rows={2}
                    placeholder="Description of this fee policy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Fee Amounts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Initial Amount
                      </label>
                      <input
                        type="number"
                        name="initial_amount"
                        step="0.01"
                        min="0"
                        defaultValue={selectedPolicy?.initial_amount || ''}
                        disabled={modalMode === 'view'}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">Initial charge when fee is created</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Per Day Amount
                      </label>
                      <input
                        type="number"
                        name="per_day_amount"
                        step="0.01"
                        min="0"
                        defaultValue={selectedPolicy?.per_day_amount || ''}
                        disabled={modalMode === 'view'}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">Daily rate (for overdue fees)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Amount
                      </label>
                      <input
                        type="number"
                        name="max_amount"
                        step="0.01"
                        min="0"
                        defaultValue={selectedPolicy?.max_amount || ''}
                        disabled={modalMode === 'view'}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">Maximum charge cap</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grace Period (Days)
                      </label>
                      <input
                        type="number"
                        name="grace_period_days"
                        min="0"
                        defaultValue={selectedPolicy?.grace_period_days || 0}
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">Days before fees start accruing</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="is_active"
                    defaultValue={selectedPolicy?.is_active ? 'true' : 'false'}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {selectedPolicy && modalMode === 'view' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Created:</strong> {new Date(selectedPolicy.created_date).toLocaleString()}</p>
                      {selectedPolicy.updated_date && (
                        <p><strong>Updated:</strong> {new Date(selectedPolicy.updated_date).toLocaleString()}</p>
                      )}
                      <p><strong>ID:</strong> {selectedPolicy.id}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Create' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePolicies;
