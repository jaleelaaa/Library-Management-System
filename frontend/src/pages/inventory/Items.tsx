import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { sanitizeSearchQuery } from '../../utils/sanitize';

interface Item {
  id: string;
  holding_id: string;
  barcode?: string;
  accession_number?: string;
  item_identifier?: string;
  status: string;
  material_type_id?: string;
  permanent_location_id?: string;
  temporary_location_id?: string;
  effective_location_id?: string;
  permanent_loan_type_id?: string;
  temporary_loan_type_id?: string;
  copy_number?: string;
  volume?: string;
  enumeration?: string;
  chronology?: string;
  number_of_pieces: number;
  description_of_pieces?: string;
  notes: any[];
  circulation_notes: any[];
  discovery_suppress: boolean;
  tags: string[];
  created_date: string;
  updated_date?: string;
}

interface Holding {
  id: string;
  call_number?: string;
  instance_id: string;
}

interface Location {
  id: string;
  name: string;
  code: string;
}

const STATUS_OPTIONS = [
  'available',
  'checked_out',
  'in_transit',
  'awaiting_pickup',
  'on_order',
  'in_process',
  'missing',
  'withdrawn',
  'lost',
  'damaged',
];

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  checked_out: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  awaiting_pickup: 'bg-purple-100 text-purple-800',
  on_order: 'bg-gray-100 text-gray-800',
  in_process: 'bg-indigo-100 text-indigo-800',
  missing: 'bg-orange-100 text-orange-800',
  withdrawn: 'bg-red-100 text-red-800',
  lost: 'bg-red-100 text-red-800',
  damaged: 'bg-red-100 text-red-800',
};

const Items: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [holdingFilter, setHoldingFilter] = useState('');

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const token = useSelector((state: RootState) => state.auth.token);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchItems();
    fetchHoldings();
    fetchLocations();
  }, [currentPage, statusFilter, holdingFilter]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (searchBarcode) params.barcode = searchBarcode;
      if (statusFilter) params.status = statusFilter;
      if (holdingFilter) params.holding_id = holdingFilter;

      const response = await axios.get('/api/v1/inventory/items', {
        ...axiosConfig,
        params,
      });
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async () => {
    try {
      const response = await axios.get('/api/v1/inventory/holdings', {
        ...axiosConfig,
        params: { page: 1, page_size: 100 },
      });
      setHoldings(response.data.items);
    } catch (err) {
      console.error('Failed to fetch holdings:', err);
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
    setSelectedItem(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item: Item) => {
    setSelectedItem(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('items.deleteConfirm'))) return;

    try {
      await axios.delete(`/api/v1/inventory/items/${id}`, axiosConfig);
      await fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('items.deleteFailed'));
    }
  };

  const handleBarcodeSearch = () => {
    // Sanitize barcode search before making the API call
    const sanitizedBarcode = sanitizeSearchQuery(searchBarcode);
    setSearchBarcode(sanitizedBarcode);
    setCurrentPage(1);
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const itemData: any = {
      holding_id: formData.get('holding_id'),
      barcode: formData.get('barcode') || null,
      accession_number: formData.get('accession_number') || null,
      item_identifier: formData.get('item_identifier') || null,
      status: formData.get('status') || 'available',
      permanent_location_id: formData.get('permanent_location_id') || null,
      temporary_location_id: formData.get('temporary_location_id') || null,
      copy_number: formData.get('copy_number') || null,
      volume: formData.get('volume') || null,
      enumeration: formData.get('enumeration') || null,
      chronology: formData.get('chronology') || null,
      number_of_pieces: parseInt(formData.get('number_of_pieces') as string) || 1,
      description_of_pieces: formData.get('description_of_pieces') || null,
      discovery_suppress: formData.get('discovery_suppress') === 'on',
      notes: [],
      circulation_notes: [],
      tags: [],
    };

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/inventory/items', itemData, axiosConfig);
      } else if (modalMode === 'edit' && selectedItem) {
        await axios.put(`/api/v1/inventory/items/${selectedItem.id}`, itemData, axiosConfig);
      }
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('items.failedToSave'));
    }
  };

  const getHoldingDisplay = (holdingId: string) => {
    const holding = holdings.find((h) => h.id === holdingId);
    return holding ? holding.call_number || holding.id.substring(0, 8) : holdingId.substring(0, 8);
  };

  const getLocationName = (locationId?: string) => {
    if (!locationId) return t('common.notAvailable');
    const location = locations.find((l) => l.id === locationId);
    return location ? `${location.name} (${location.code})` : locationId;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('items.title')}</h1>
        <p className="text-gray-600 mt-2">{t('items.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('items.searchByBarcode')}
          </label>
          <div className="flex">
            <input
              type="text"
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              placeholder={t('items.barcodePlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleBarcodeSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              {t('common.search')}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('items.filterByStatus')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('items.allStatuses')}</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {t(`items.status.${status}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('items.filterByHolding')}
          </label>
          <select
            value={holdingFilter}
            onChange={(e) => {
              setHoldingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('items.allHoldings')}</option>
            {holdings.map((holding) => (
              <option key={holding.id} value={holding.id}>
                {holding.call_number || holding.id.substring(0, 8)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleCreate}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + {t('items.newItem')}
          </button>
          <button
            onClick={fetchItems}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('items.table.barcode')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('items.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('items.table.holding')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('items.table.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('items.table.copyVolume')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('items.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t('items.noItems')}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.barcode || t('items.noBarcode')}
                        </div>
                        {item.accession_number && (
                          <div className="text-xs text-gray-500">{t('items.accession')}: {item.accession_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {t(`items.status.${item.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getHoldingDisplay(item.holding_id)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getLocationName(item.permanent_location_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.copy_number && `c.${item.copy_number}`}
                          {item.volume && ` v.${item.volume}`}
                          {!item.copy_number && !item.volume && t('common.notAvailable')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('common.view')}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
                {t('items.pagination', { page: currentPage, totalPages })}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? t('items.modal.create') : modalMode === 'edit' ? t('items.modal.edit') : t('items.modal.view')}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('items.form.holding')} *
                  </label>
                  <select
                    name="holding_id"
                    defaultValue={selectedItem?.holding_id || ''}
                    required
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">{t('items.form.selectHolding')}</option>
                    {holdings.map((holding) => (
                      <option key={holding.id} value={holding.id}>
                        {holding.call_number || holding.id.substring(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.barcode')}
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      defaultValue={selectedItem?.barcode || ''}
                      disabled={modalMode === 'view'}
                      placeholder={t('items.form.barcodePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.accessionNumber')}
                    </label>
                    <input
                      type="text"
                      name="accession_number"
                      defaultValue={selectedItem?.accession_number || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.status')} *
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedItem?.status || 'available'}
                      required
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.itemIdentifier')}
                    </label>
                    <input
                      type="text"
                      name="item_identifier"
                      defaultValue={selectedItem?.item_identifier || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.permanentLocation')}
                    </label>
                    <select
                      name="permanent_location_id"
                      defaultValue={selectedItem?.permanent_location_id || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">{t('items.form.selectLocation')}</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.temporaryLocation')}
                    </label>
                    <select
                      name="temporary_location_id"
                      defaultValue={selectedItem?.temporary_location_id || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">{t('items.form.selectLocation')}</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.copyNumber')}
                    </label>
                    <input
                      type="text"
                      name="copy_number"
                      defaultValue={selectedItem?.copy_number || ''}
                      disabled={modalMode === 'view'}
                      placeholder={t('items.form.copyPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.volume')}
                    </label>
                    <input
                      type="text"
                      name="volume"
                      defaultValue={selectedItem?.volume || ''}
                      disabled={modalMode === 'view'}
                      placeholder={t('items.form.volumePlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.enumeration')}
                    </label>
                    <input
                      type="text"
                      name="enumeration"
                      defaultValue={selectedItem?.enumeration || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.chronology')}
                    </label>
                    <input
                      type="text"
                      name="chronology"
                      defaultValue={selectedItem?.chronology || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.numberOfPieces')}
                    </label>
                    <input
                      type="number"
                      name="number_of_pieces"
                      defaultValue={selectedItem?.number_of_pieces || 1}
                      min="1"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items.form.descriptionOfPieces')}
                    </label>
                    <input
                      type="text"
                      name="description_of_pieces"
                      defaultValue={selectedItem?.description_of_pieces || ''}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="discovery_suppress"
                    defaultChecked={selectedItem?.discovery_suppress || false}
                    disabled={modalMode === 'view'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    {t('items.form.suppressDiscovery')}
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
                    {modalMode === 'create' ? t('items.button.create') : t('items.button.save')}
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

export default Items;
