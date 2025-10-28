import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';

interface Library {
  id: string;
  name: string;
  code: string;
  created_date: string;
  updated_date?: string;
  tenant_id: string;
}

const Libraries: React.FC = () => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  const token = useSelector((state: RootState) => state.auth.token);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchLibraries();
  }, [currentPage]);

  const fetchLibraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/inventory/libraries', {
        ...axiosConfig,
        params: { page: currentPage, page_size: pageSize },
      });
      setLibraries(response.data.items);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch libraries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedLibrary(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (library: Library) => {
    setSelectedLibrary(library);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (library: Library) => {
    setSelectedLibrary(library);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this library? This may affect associated locations.')) return;

    try {
      await axios.delete(`/api/v1/inventory/libraries/${id}`, axiosConfig);
      fetchLibraries();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete library');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const libraryData: any = {
      name: formData.get('name'),
      code: formData.get('code'),
    };

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/inventory/libraries', libraryData, axiosConfig);
      } else if (modalMode === 'edit' && selectedLibrary) {
        await axios.put(`/api/v1/inventory/libraries/${selectedLibrary.id}`, libraryData, axiosConfig);
      }
      setShowModal(false);
      fetchLibraries();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save library');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Libraries</h2>
          <p className="text-gray-600 mt-2">Manage library branches and organizational units</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Library
          </button>
          <button
            onClick={fetchLibraries}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

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
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {libraries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No libraries found. Create your first library to get started.
                    </td>
                  </tr>
                ) : (
                  libraries.map((library) => (
                    <tr key={library.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{library.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{library.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(library.created_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleView(library)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(library)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(library.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modalMode === 'create' ? 'Create Library' : modalMode === 'edit' ? 'Edit Library' : 'View Library'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={selectedLibrary?.code || ''}
                    required
                    disabled={modalMode === 'view' || modalMode === 'edit'}
                    placeholder="MAIN"
                    maxLength={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  {modalMode === 'edit' && (
                    <p className="mt-1 text-xs text-gray-500">Code cannot be changed after creation</p>
                  )}
                  {modalMode === 'create' && (
                    <p className="mt-1 text-xs text-gray-500">Unique code to identify this library (e.g., MAIN, BRANCH1)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedLibrary?.name || ''}
                    required
                    disabled={modalMode === 'view'}
                    placeholder="Main Library"
                    maxLength={255}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Full name of the library</p>
                </div>

                {selectedLibrary && modalMode === 'view' && (
                  <div className="border-t pt-4 mt-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Created:</strong> {new Date(selectedLibrary.created_date).toLocaleString()}</p>
                      {selectedLibrary.updated_date && (
                        <p><strong>Updated:</strong> {new Date(selectedLibrary.updated_date).toLocaleString()}</p>
                      )}
                      <p><strong>ID:</strong> {selectedLibrary.id}</p>
                      <p><strong>Tenant ID:</strong> {selectedLibrary.tenant_id}</p>
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

export default Libraries;
