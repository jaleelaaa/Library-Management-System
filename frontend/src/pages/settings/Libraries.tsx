/**
 * Libraries Page - Redesigned with shadcn/ui
 * Manage library branches and organizational units
 */

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import axios from 'axios'
import { useLanguage } from '../../contexts/LanguageContext'
import { Library, Plus, Edit, Trash2, Eye, RefreshCw, Search, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// shadcn components
import { Card, CardContent, CardDescription, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

interface LibraryType {
  id: string
  name: string
  code: string
  created_date: string
  updated_date?: string
  tenant_id: string
}

const Libraries = () => {
  const { t } = useLanguage()
  const [libraries, setLibraries] = useState<LibraryType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryType | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [libraryToDelete, setLibraryToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  const token = useSelector((state: RootState) => state.auth.token)

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  useEffect(() => {
    fetchLibraries()
  }, [currentPage])

  const fetchLibraries = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/v1/inventory/libraries', {
        ...axiosConfig,
        params: { page: currentPage, page_size: pageSize },
      })
      setLibraries(response.data.items)
      setTotal(response.data.total)
    } catch (err: any) {
      setError(err.response?.data?.detail || t('libraries.error.fetch'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedLibrary(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEdit = (library: LibraryType) => {
    setSelectedLibrary(library)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleView = (library: LibraryType) => {
    setSelectedLibrary(library)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDeleteClick = (id: string) => {
    setLibraryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!libraryToDelete) return

    try {
      await axios.delete(`/api/v1/inventory/libraries/${libraryToDelete}`, axiosConfig)
      setDeleteDialogOpen(false)
      setLibraryToDelete(null)
      fetchLibraries()
    } catch (err: any) {
      setError(err.response?.data?.detail || t('libraries.error.delete'))
      setDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const libraryData: any = {
      name: formData.get('name'),
      code: formData.get('code'),
    }

    try {
      if (modalMode === 'create') {
        await axios.post('/api/v1/inventory/libraries', libraryData, axiosConfig)
      } else if (modalMode === 'edit' && selectedLibrary) {
        await axios.put(`/api/v1/inventory/libraries/${selectedLibrary.id}`, libraryData, axiosConfig)
      }
      setShowModal(false)
      fetchLibraries()
    } catch (err: any) {
      setError(err.response?.data?.detail || t('libraries.error.save'))
    }
  }

  const filteredLibraries = libraries.filter((library) => {
    const query = searchQuery.toLowerCase()
    return (
      library.name?.toLowerCase().includes(query) ||
      library.code?.toLowerCase().includes(query)
    )
  })

  const isViewMode = modalMode === 'view'
  const dialogTitle =
    modalMode === 'create'
      ? t('libraries.modal.create')
      : modalMode === 'edit'
      ? t('libraries.modal.edit')
      : t('libraries.modal.view')

  const dialogDescription =
    modalMode === 'create'
      ? t('libraries.modal.createDesc')
      : modalMode === 'edit'
      ? t('libraries.modal.editDesc')
      : t('libraries.modal.viewDesc')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-violet-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl">
                    <Library className="w-8 h-8 text-white" />
                  </div>
                  {t('libraries.title')}
                </h1>
              </div>
              <Button onClick={handleCreate} size="lg" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-md">
                <Plus className="w-4 h-4 me-2" />
                {t('libraries.new')}
              </Button>
            </div>
            <CardDescription className="text-base mt-2">
              {t('libraries.subtitle')}
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
        >
          {error}
        </motion.div>
      )}

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder={t('libraries.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                onClick={fetchLibraries}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common.refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Libraries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredLibraries.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 mb-4"
                >
                  <Building2 className="w-10 h-10 text-purple-600" />
                </motion.div>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  {t('libraries.noLibraries')}
                </p>
                <p className="text-gray-500">{t('libraries.noLibraries.desc')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <TableHead>{t('libraries.table.code')}</TableHead>
                      <TableHead>{t('libraries.table.name')}</TableHead>
                      <TableHead>{t('libraries.table.created')}</TableHead>
                      <TableHead className="text-end">{t('libraries.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredLibraries.map((library, index) => (
                        <motion.tr
                          key={library.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-purple-50/50 transition-colors"
                        >
                          <TableCell className="font-semibold">{library.code}</TableCell>
                          <TableCell>{library.name}</TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(library.created_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleView(library)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleEdit(library)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-purple-50 hover:text-purple-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(library.id)}
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
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
        </div>
      )}

      {/* Create/Edit/View Dialog */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
                <Library className="w-5 h-5 text-white" />
              </div>
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">{t('libraries.form.code')} *</Label>
              <Input
                id="code"
                name="code"
                defaultValue={selectedLibrary?.code || ''}
                required
                disabled={isViewMode || modalMode === 'edit'}
                placeholder="MAIN"
                maxLength={50}
              />
              {modalMode === 'edit' && (
                <p className="text-xs text-gray-500">{t('libraries.codeImmutable')}</p>
              )}
              {modalMode === 'create' && (
                <p className="text-xs text-gray-500">{t('libraries.codeHelp')}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('libraries.form.name')} *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedLibrary?.name || ''}
                required
                disabled={isViewMode}
                placeholder={t('libraries.namePlaceholder')}
                maxLength={255}
              />
              <p className="text-xs text-gray-500">{t('libraries.nameHelp')}</p>
            </div>

            {/* View Mode Additional Info */}
            {selectedLibrary && isViewMode && (
              <div className="border-t pt-4 mt-4">
                <div className="text-xs text-gray-500 space-y-2">
                  <p>
                    <strong>{t('libraries.created')}:</strong>{' '}
                    {new Date(selectedLibrary.created_date).toLocaleString()}
                  </p>
                  {selectedLibrary.updated_date && (
                    <p>
                      <strong>{t('libraries.updated')}:</strong>{' '}
                      {new Date(selectedLibrary.updated_date).toLocaleString()}
                    </p>
                  )}
                  <p>
                    <strong>ID:</strong> {selectedLibrary.id}
                  </p>
                  <p>
                    <strong>Tenant ID:</strong> {selectedLibrary.tenant_id}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                {isViewMode ? t('common.close') : t('common.cancel')}
              </Button>
              {!isViewMode && (
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  {modalMode === 'create' ? t('common.create') : t('common.update')}
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
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              {t('libraries.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('libraries.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Libraries
