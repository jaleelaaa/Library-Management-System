import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';

interface Location {
  id: string;
  name: string;
  code: string;
  description?: string;
  discovery_display_name?: string;
  library_id?: string;
  campus_id?: string;
  institution_id?: string;
  primary_service_point_id?: string;
  is_active: boolean;
  created_date: string;
  updated_date?: string;
}

interface Library {
  id: string;
  name: string;
  code: string;
}

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [libraryFilter, setLibraryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const token = useSelector((state: RootState) => state.auth.token);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchLocations();
    fetchLibraries();
  }, [currentPage, libraryFilter, activeFilter]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (libraryFilter) params.library_id = libraryFilter;
      if (activeFilter !== '') params.is_active = activeFilter;

      const response = await axios.get('/api/v1/inventory/locations', {
        ...axiosConfig,
        params,
      });
      setLocations(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchLibraries = async () => {
    try {
      const response = await axios.get('/api/v1/inventory/libraries', {
        ...axiosConfig,
        params: { page: 1, page_size: 100 },
      });
      setLibraries(response.data.items);
    } catch (err) {
      console.error('Failed to fetch libraries:', err);
    }
  };

  const handleCreate = () => {
    setSelectedLocation(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await axios.delete(`/api/v1/inventory/locations/${id}`, axiosConfig);
      fetchLocations();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete location');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const locationData: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: formData.get('description') || null,
      discovery_display_name: formData.get('discovery_display_name') || null,
      library_id: formData.get('library_id') || null,
      is_active: formData.get('is_active') === 'on',
    };

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/inventory/locations', locationData, axiosConfig);
      } else if (modalMode === 'edit' && selectedLocation) {
        await axios.put(`/api/v1/inventory/locations/${selectedLocation.id}`, locationData, axiosConfig);
      }
      setShowModal(false);
      fetchLocations();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save location');
    }
  };

  const getLibraryName = (libraryId?: string) => {
    if (!libraryId) return 'N/A';
    const library = libraries.find((l) => l.id === libraryId);
    return library ? `${library.name} (${library.code})` : libraryId;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Locations</h2>
        <p className="text-gray-600 mt-2">Manage physical locations for items</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Library
          </label>
          <select
            value={libraryFilter}
            onChange={(e) => {
              setLibraryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Libraries</option>
            {libraries.map((library) => (
              <option key={library.id} value={library.id}>
                {library.name} ({library.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={activeFilter.toString()}
            onChange={(e) => {
              setActiveFilter(e.target.value === '' ? '' : e.target.value === 'true');
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleCreate}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Location
          </button>
          <button
            onClick={fetchLocations}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Refresh
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
                    Code
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Library
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
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No locations found. Create your first location to get started.
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{location.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        {location.description && (
                          <div className="text-xs text-gray-500">{location.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getLibraryName(location.library_id)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            location.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {location.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleView(location)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
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
              {modalMode === 'create' ? 'Create Location' : modalMode === 'edit' ? 'Edit Location' : 'View Location'}
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
                      defaultValue={selectedLocation?.code || ''}
                      required
                      disabled={modalMode === 'view' || modalMode === 'edit'}
                      placeholder="MAIN-ST"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    {modalMode === 'edit' && (
                      <p className="mt-1 text-xs text-gray-500">Code cannot be changed after creation</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedLocation?.name || ''}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="Main Stacks"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedLocation?.description || ''}
                    disabled={modalMode === 'view'}
                    rows={3}
                    placeholder="Enter location description..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discovery Display Name
                  </label>
                  <input
                    type="text"
                    name="discovery_display_name"
                    defaultValue={selectedLocation?.discovery_display_name || ''}
                    disabled={modalMode === 'view'}
                    placeholder="Name shown in public catalog"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Library
                  </label>
                  <select
                    name="library_id"
                    defaultValue={selectedLocation?.library_id || ''}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">No Library</option>
                    {libraries.map((library) => (
                      <option key={library.id} value={library.id}>
                        {library.name} ({library.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={selectedLocation?.is_active ?? true}
                    disabled={modalMode === 'view'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ms-2 block text-sm text-gray-900">
                    Active location
                  </label>
                </div>

                {selectedLocation && modalMode === 'view' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created: {new Date(selectedLocation.created_date).toLocaleString()}</p>
                      {selectedLocation.updated_date && (
                        <p>Updated: {new Date(selectedLocation.updated_date).toLocaleString()}</p>
                      )}
                      <p>ID: {selectedLocation.id}</p>
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

export default Locations;
