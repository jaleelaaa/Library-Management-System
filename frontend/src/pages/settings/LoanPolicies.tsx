import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';

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
  const [policies, setPolicies] = useState<LoanPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPolicy, setSelectedPolicy] = useState<LoanPolicy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
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
      setPolicies(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch loan policies');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan policy?')) return;

    try {
      await axios.delete(`/api/v1/circulation/loan-policies/${id}`, axiosConfig);
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete loan policy');
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
      setError(err.response?.data?.detail || 'Failed to save loan policy');
    }
  };

  const INTERVALS = ['Days', 'Weeks', 'Months'];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Loan Policies</h2>
          <p className="text-gray-600 mt-2">Configure circulation rules and loan periods</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Loan Policy
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
          <button onClick={() => setError(null)} className="ml-4 text-sm underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
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
                    Loan Period
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renewability
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
                      No loan policies found. Create your first policy to get started.
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
                        <div className="text-sm text-gray-900">
                          {policy.loan_period_duration} {policy.loan_period_interval}
                        </div>
                        {policy.grace_period_duration > 0 && (
                          <div className="text-xs text-gray-500">
                            Grace: {policy.grace_period_duration} {policy.grace_period_interval}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {policy.renewable ? (
                          <div className="text-sm text-gray-900">
                            <span className="text-green-600">✓ Yes</span>
                            <div className="text-xs text-gray-500">
                              {policy.number_of_renewals_allowed} renewals
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">✗ No</div>
                        )}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Create Loan Policy' : modalMode === 'edit' ? 'Edit Loan Policy' : 'View Loan Policy'}
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
                      placeholder="STANDARD_LOAN"
                      maxLength={50}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {modalMode === 'create' && (
                      <p className="mt-1 text-xs text-gray-500">Unique code (e.g., STANDARD_LOAN, SHORT_TERM)</p>
                    )}
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
                    placeholder="Standard Loan Policy"
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
                    placeholder="Description of this loan policy"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Loan Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="number"
                        name="loan_period_duration"
                        min="1"
                        defaultValue={selectedPolicy?.loan_period_duration || 14}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interval *
                      </label>
                      <select
                        name="loan_period_interval"
                        defaultValue={selectedPolicy?.loan_period_interval || 'Days'}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {INTERVALS.map(interval => (
                          <option key={interval} value={interval}>{interval}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Renewability</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Renewable *
                      </label>
                      <select
                        name="renewable"
                        defaultValue={selectedPolicy?.renewable ? 'true' : 'false'}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Renewals *
                      </label>
                      <input
                        type="number"
                        name="number_of_renewals_allowed"
                        min="0"
                        defaultValue={selectedPolicy?.number_of_renewals_allowed || 3}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Renewal Duration *
                      </label>
                      <input
                        type="number"
                        name="renewal_period_duration"
                        min="1"
                        defaultValue={selectedPolicy?.renewal_period_duration || 14}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Renewal Interval *
                      </label>
                      <select
                        name="renewal_period_interval"
                        defaultValue={selectedPolicy?.renewal_period_interval || 'Days'}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {INTERVALS.map(interval => (
                          <option key={interval} value={interval}>{interval}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Grace Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="number"
                        name="grace_period_duration"
                        min="0"
                        defaultValue={selectedPolicy?.grace_period_duration || 0}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">Period after due date before overdue fees apply</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interval *
                      </label>
                      <select
                        name="grace_period_interval"
                        defaultValue={selectedPolicy?.grace_period_interval || 'Days'}
                        required
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {INTERVALS.map(interval => (
                          <option key={interval} value={interval}>{interval}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Recall Configuration (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Interval Duration
                      </label>
                      <input
                        type="number"
                        name="recall_return_interval_duration"
                        min="1"
                        defaultValue={selectedPolicy?.recall_return_interval_duration || ''}
                        disabled={modalMode === 'view'}
                        placeholder="Leave blank if not applicable"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Return Interval
                      </label>
                      <select
                        name="recall_return_interval_interval"
                        defaultValue={selectedPolicy?.recall_return_interval_interval || 'Days'}
                        disabled={modalMode === 'view'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {INTERVALS.map(interval => (
                          <option key={interval} value={interval}>{interval}</option>
                        ))}
                      </select>
                    </div>
                  </div>
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

export default LoanPolicies;
