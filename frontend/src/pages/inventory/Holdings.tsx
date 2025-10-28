import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';

interface Holding {
  id: string;
  instance_id: string;
  permanent_location_id?: string;
  temporary_location_id?: string;
  call_number?: string;
  call_number_prefix?: string;
  call_number_suffix?: string;
  shelving_title?: string;
  acquisition_method?: string;
  receipt_status?: string;
  notes: any[];
  holdings_statements: any[];
  discovery_suppress: boolean;
  tags: string[];
  created_date: string;
  updated_date?: string;
}

interface Instance {
  id: string;
  title: string;
}

interface Location {
  id: string;
  name: string;
  code: string;
}

const Holdings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [instanceFilter, setInstanceFilter] = useState('');

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const token = useSelector((state: RootState) => state.auth.token);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchHoldings();
    fetchInstances();
    fetchLocations();
  }, [currentPage, instanceFilter]);

  const fetchHoldings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (instanceFilter) params.instance_id = instanceFilter;

      const response = await axios.get('/api/v1/inventory/holdings', {
        ...axiosConfig,
        params,
      });
      setHoldings(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch holdings');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstances = async () => {
    try {
      const response = await axios.get('/api/v1/inventory/instances', {
        ...axiosConfig,
        params: { page: 1, page_size: 100 },
      });
      setInstances(response.data.items);
    } catch (err) {
      console.error('Failed to fetch instances:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/v1/inventory/locations', {
        ...axiosConfig,
        params: { page: 1, page_size: 100 },
      });
      setLocations(response.data.items);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleCreate = () => {
    setSelectedHolding(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (holding: Holding) => {
    setSelectedHolding(holding);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (holding: Holding) => {
    setSelectedHolding(holding);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('holdings.deleteConfirm'))) return;

    try {
      await axios.delete(`/api/v1/inventory/holdings/${id}`, axiosConfig);
      fetchHoldings();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('holdings.deleteFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const holdingData: any = {
      instance_id: formData.get('instance_id'),
      call_number: formData.get('call_number') || null,
      call_number_prefix: formData.get('call_number_prefix') || null,
      call_number_suffix: formData.get('call_number_suffix') || null,
      shelving_title: formData.get('shelving_title') || null,
      permanent_location_id: formData.get('permanent_location_id') || null,
      temporary_location_id: formData.get('temporary_location_id') || null,
      acquisition_method: formData.get('acquisition_method') || null,
      receipt_status: formData.get('receipt_status') || null,
      discovery_suppress: formData.get('discovery_suppress') === 'on',
      notes: [],
      holdings_statements: [],
      tags: [],
    };

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/inventory/holdings', holdingData, axiosConfig);
      } else if (modalMode === 'edit' && selectedHolding) {
        await axios.put(`/api/v1/inventory/holdings/${selectedHolding.id}`, holdingData, axiosConfig);
      }
      setShowModal(false);
      fetchHoldings();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save holding');
    }
  };

  const getInstanceTitle = (instanceId: string) => {
    const instance = instances.find((i) => i.id === instanceId);
    return instance ? instance.title : instanceId;
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return 'N/A';
    const location = locations.find((l) => l.id === locationId);
    return location ? `${location.name} (${location.code})` : locationId;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('holdings.title')}</h1>
        <p className="text-gray-600 mt-2">{t('holdings.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('holdings.filterByInstance')}
          </label>
          <select
            value={instanceFilter}
            onChange={(e) => {
              setInstanceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('holdings.allInstances')}</option>
            {instances.map((instance) => (
              <option key={instance.id} value={instance.id}>
                {instance.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + {t('holdings.newHolding')}
          </button>
          <button
            onClick={fetchHoldings}
            className="ml-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('holdings.table.callNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('holdings.table.instance')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('holdings.table.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('holdings.table.shelvingTitle')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('holdings.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('holdings.noHoldings')}
                    </td>
                  </tr>
                ) : (
                  holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {holding.call_number_prefix && `${holding.call_number_prefix} `}
                          {holding.call_number || 'N/A'}
                          {holding.call_number_suffix && ` ${holding.call_number_suffix}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getInstanceTitle(holding.instance_id)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getLocationName(holding.permanent_location_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{holding.shelving_title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleView(holding)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('common.view')}
                        </button>
                        <button
                          onClick={() => handleEdit(holding)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(holding.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('common.delete')}
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
                {t('common.previous')}
              </button>
              <span className="px-4 py-2 text-gray-700">
                {t('holdings.pagination', { page: currentPage, totalPages })}
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
              {modalMode === 'create' ? t('holdings.modal.create') : modalMode === 'edit' ? t('holdings.modal.edit') : t('holdings.modal.view')}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('holdings.form.instance')} *
                  </label>
                  <select
                    name="instance_id"
                    defaultValue={selectedHolding?.instance_id || ''}
                    required
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">{t('holdings.form.selectInstance')}</option>
                    {instances.map((instance) => (
                      <option key={instance.id} value={instance.id}>
                        {instance.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.callNumberPrefix')}
                    </label>
                    <input
                      type="text"
                      name="call_number_prefix"
                      defaultValue={selectedHolding?.call_number_prefix || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.callNumber')}
                    </label>
                    <input
                      type="text"
                      name="call_number"
                      defaultValue={selectedHolding?.call_number || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.callNumberSuffix')}
                    </label>
                    <input
                      type="text"
                      name="call_number_suffix"
                      defaultValue={selectedHolding?.call_number_suffix || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('holdings.form.shelvingTitle')}
                  </label>
                  <input
                    type="text"
                    name="shelving_title"
                    defaultValue={selectedHolding?.shelving_title || ''}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.permanentLocation')}
                    </label>
                    <select
                      name="permanent_location_id"
                      defaultValue={selectedHolding?.permanent_location_id || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">{t('holdings.form.selectLocation')}</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.temporaryLocation')}
                    </label>
                    <select
                      name="temporary_location_id"
                      defaultValue={selectedHolding?.temporary_location_id || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">{t('holdings.form.selectLocation')}</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.acquisitionMethod')}
                    </label>
                    <input
                      type="text"
                      name="acquisition_method"
                      defaultValue={selectedHolding?.acquisition_method || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('holdings.form.receiptStatus')}
                    </label>
                    <input
                      type="text"
                      name="receipt_status"
                      defaultValue={selectedHolding?.receipt_status || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="discovery_suppress"
                    defaultChecked={selectedHolding?.discovery_suppress || false}
                    disabled={modalMode === 'view'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {t('holdings.form.suppressDiscovery')}
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {modalMode === 'view' ? t('common.close') : t('common.cancel')}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? t('holdings.button.create') : t('holdings.button.save')}
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

export default Holdings;
