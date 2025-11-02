import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Eye, RefreshCw, Search, CheckCircle2, XCircle, Building2 } from 'lucide-react';

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
  const { t } = useLanguage();
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

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
      setLocations(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('locations.error.fetch'));
      setLocations([]);
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
      setLibraries(response.data.items || []);
    } catch (err) {
      console.error('Failed to fetch libraries:', err);
      setLibraries([]);
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

  const handleDeleteClick = (id: string) => {
    setLocationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await axios.delete(`/api/v1/inventory/locations/${locationToDelete}`, axiosConfig);
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
      fetchLocations();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('locations.error.delete'));
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const libraryId = formData.get('library_id');
    const locationData: any = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: formData.get('description') || null,
      discovery_display_name: formData.get('discovery_display_name') || null,
      library_id: libraryId === 'none' ? null : libraryId || null,
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
      setError(err.response?.data?.detail || t('locations.error.save'));
    }
  };

  const getLibraryName = (libraryId?: string) => {
    if (!libraryId) return 'N/A';
    const library = libraries.find((l) => l.id === libraryId);
    return library ? `${library.name} (${library.code})` : libraryId;
  };

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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-900 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  {t('locations.title')}
                </h1>
              </div>
              <Button
                onClick={handleCreate}
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md"
              >
                <Plus className="w-4 h-4 me-2" />
                {t('locations.new')}
              </Button>
            </div>
            <p className="text-gray-600 mt-2 text-base">{t('locations.subtitle')}</p>
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
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Library Filter */}
              <div>
                <Label className="text-gray-700 mb-2">{t('locations.filterByLibrary')}</Label>
                <Select
                  value={libraryFilter || undefined}
                  onValueChange={(value) => {
                    setLibraryFilter(value === 'all' ? '' : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('locations.allLibraries')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('locations.allLibraries')}</SelectItem>
                    {libraries.map((library) => (
                      <SelectItem key={library.id} value={library.id}>
                        {library.name} ({library.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-gray-700 mb-2">{t('locations.filterByStatus')}</Label>
                <Select
                  value={activeFilter === '' ? 'all' : activeFilter.toString()}
                  onValueChange={(value) => {
                    setActiveFilter(value === 'all' ? '' : value === 'true');
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('locations.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('locations.allStatuses')}</SelectItem>
                    <SelectItem value="true">{t('common.active')}</SelectItem>
                    <SelectItem value="false">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex items-end gap-2">
                <Button
                  onClick={fetchLocations}
                  variant="outline"
                  className="flex-1 md:flex-none"
                >
                  <RefreshCw className="w-4 h-4 me-2" />
                  {t('common.refresh')}
                </Button>
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
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-32" />
                  </div>
                ))}
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-4"
                >
                  <Building2 className="w-10 h-10 text-orange-600" />
                </motion.div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {t('locations.noLocations')}
                </p>
                <p className="text-gray-500">{t('locations.noLocations.desc')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-orange-50 to-amber-50">
                    <TableHead className="font-semibold">{t('locations.code')}</TableHead>
                    <TableHead className="font-semibold">{t('locations.name')}</TableHead>
                    <TableHead className="font-semibold">{t('locations.library')}</TableHead>
                    <TableHead className="font-semibold">{t('common.status')}</TableHead>
                    <TableHead className="font-semibold text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {locations.map((location) => (
                      <motion.tr
                        key={location.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b hover:bg-orange-50/30 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium text-gray-900">{location.code}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{location.name}</div>
                          {location.description && (
                            <div className="text-xs text-gray-500 mt-1">{location.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">{getLibraryName(location.library_id)}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(location.is_active)}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(location)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 me-1" />
                              {t('common.view')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(location)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <Edit className="w-4 h-4 me-1" />
                              {t('common.edit')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(location.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-900 to-amber-600 bg-clip-text text-transparent">
              {t(`locations.modal.${modalMode}`)}
            </DialogTitle>
            <DialogDescription>{t(`locations.modal.${modalMode}Desc`)}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code" className="text-gray-700">
                  {t('locations.code')} *
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={selectedLocation?.code || ''}
                  required
                  disabled={modalMode === 'view' || modalMode === 'edit'}
                  placeholder="MAIN-ST"
                  className="mt-1"
                />
                {modalMode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500">{t('locations.codeImmutable')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  {t('locations.name')} *
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedLocation?.name || ''}
                  required
                  disabled={modalMode === 'view'}
                  placeholder={t('locations.namePlaceholder')}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700">
                {t('locations.description')}
              </Label>
              <textarea
                id="description"
                name="description"
                defaultValue={selectedLocation?.description || ''}
                disabled={modalMode === 'view'}
                rows={3}
                placeholder={t('locations.descriptionPlaceholder')}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="discovery_display_name" className="text-gray-700">
                {t('locations.discoveryDisplayName')}
              </Label>
              <Input
                id="discovery_display_name"
                name="discovery_display_name"
                defaultValue={selectedLocation?.discovery_display_name || ''}
                disabled={modalMode === 'view'}
                placeholder={t('locations.discoveryPlaceholder')}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">{t('locations.discoveryHelp')}</p>
            </div>

            <div>
              <Label htmlFor="library_id" className="text-gray-700">
                {t('locations.library')}
              </Label>
              <Select
                name="library_id"
                defaultValue={selectedLocation?.library_id || 'none'}
                disabled={modalMode === 'view'}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('locations.noLibrary')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('locations.noLibrary')}</SelectItem>
                  {libraries.map((library) => (
                    <SelectItem key={library.id} value={library.id}>
                      {library.name} ({library.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={selectedLocation?.is_active ?? true}
                disabled={modalMode === 'view'}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded disabled:opacity-50"
              />
              <Label htmlFor="is_active" className="text-gray-900 cursor-pointer">
                {t('locations.activeLocation')}
              </Label>
            </div>

            {selectedLocation && modalMode === 'view' && (
              <div className="border-t pt-4 mt-4">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    {t('common.created')}: {new Date(selectedLocation.created_date).toLocaleString()}
                  </p>
                  {selectedLocation.updated_date && (
                    <p>
                      {t('common.updated')}: {new Date(selectedLocation.updated_date).toLocaleString()}
                    </p>
                  )}
                  <p>ID: {selectedLocation.id}</p>
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
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
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
            <AlertDialogTitle className="text-red-600">{t('locations.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('locations.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLocationToDelete(null)}>
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

export default Locations;
