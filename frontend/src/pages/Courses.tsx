import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCourseReserves,
  setSelectedCourse,
  setFilters
} from '../store/slices/coursesSlice'
import { GraduationCap, Plus, Edit, Trash2, Search, Filter, X, Eye, Calendar, CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-react'
import type { Course, CourseCreate } from '../types/course'
import { useLanguage } from '../contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const Courses = () => {
  const dispatch = useAppDispatch()
  const { t } = useLanguage()
  const { courses, selectedCourse, reserves, loading, meta, filters, error } = useAppSelector(state => state.courses)

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<{ id: string, name: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<CourseCreate>>({
    name: '',
    code: '',
    department_id: undefined,
    term: '',
    start_date: undefined,
    end_date: undefined,
    instructor_id: undefined,
    is_active: true,
    description: ''
  })

  // Filter states
  const [filterActive, setFilterActive] = useState<string>('all')
  const [filterTerm, setFilterTerm] = useState('')

  useEffect(() => {
    dispatch(fetchCourses(filters))
  }, [dispatch])

  const handleSearch = () => {
    const newFilters = { ...filters, search: searchTerm, page: 1 }
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses(newFilters))
  }

  const handleApplyFilters = () => {
    const newFilters = {
      ...filters,
      is_active: filterActive === 'all' ? undefined : filterActive === 'active',
      term: filterTerm || undefined,
      page: 1
    }
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses(newFilters))
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilterActive('all')
    setFilterTerm('')
    const newFilters = { page: 1, page_size: 20, search: undefined, is_active: undefined, term: undefined }
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses(newFilters))
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses(newFilters))
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      name: '',
      code: '',
      department_id: undefined,
      term: '',
      start_date: undefined,
      end_date: undefined,
      instructor_id: undefined,
      is_active: true,
      description: ''
    })
    setShowModal(true)
  }

  const openEditModal = (course: Course) => {
    setModalMode('edit')
    dispatch(setSelectedCourse(course))
    setFormData({
      name: course.name,
      code: course.code,
      department_id: course.department_id,
      term: course.term || '',
      start_date: course.start_date,
      end_date: course.end_date,
      instructor_id: course.instructor_id,
      is_active: course.is_active,
      description: course.description || ''
    })
    setShowModal(true)
  }

  const openViewModal = async (course: Course) => {
    setModalMode('view')
    dispatch(setSelectedCourse(course))
    await dispatch(fetchCourseById(course.id))
    await dispatch(fetchCourseReserves(course.id))
    setShowModal(true)
  }

  const confirmDelete = (course: Course) => {
    setCourseToDelete({ id: course.id, name: course.name })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!courseToDelete) return

    await dispatch(deleteCourse(courseToDelete.id))
    dispatch(fetchCourses(filters))
    setDeleteDialogOpen(false)
    setCourseToDelete(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (modalMode === 'create') {
      await dispatch(createCourse(formData as CourseCreate))
      setShowModal(false)
      dispatch(fetchCourses(filters))
    } else if (modalMode === 'edit' && selectedCourse) {
      await dispatch(updateCourse({ courseId: selectedCourse.id, courseData: formData }))
      setShowModal(false)
      dispatch(fetchCourses(filters))
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3 me-1" />
        {t('common.active')}
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200">
        <XCircle className="w-3 h-3 me-1" />
        {t('common.inactive')}
      </Badge>
    )
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-lime-500 to-emerald-500 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            {t('courses.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('courses.subtitle')}</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 me-2" />
            {t('courses.newCourse')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">{t('common.error')}</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('courses.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="ps-10 h-11"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700"
              >
                {t('common.search')}
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={`border-lime-200 text-lime-600 hover:bg-lime-50 ${
                  (filterActive !== 'all' || filterTerm) ? 'ring-2 ring-lime-500' : ''
                }`}
              >
                <Filter className="w-5 h-5 me-2" />
                {t('common.filters')}
              </Button>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent>
                <div className="pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('courses.status')}</Label>
                      <Select value={filterActive} onValueChange={setFilterActive}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('courses.allCourses')}</SelectItem>
                          <SelectItem value="active">{t('courses.activeOnly')}</SelectItem>
                          <SelectItem value="inactive">{t('courses.inactiveOnly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('courses.term')}</Label>
                      <Input
                        type="text"
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        placeholder={t('courses.termPlaceholder')}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleApplyFilters}
                      className="bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700"
                    >
                      {t('courses.applyFilters')}
                    </Button>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 me-2" />
                      {t('courses.clearFilters')}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !courses || courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-lime-100 to-emerald-100 rounded-full">
                    <GraduationCap className="w-12 h-12 text-lime-600" />
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">{t('courses.noCourses')}</p>
                <p className="text-gray-500">{t('courses.noCoursesHint')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">{t('courses.table.course')}</TableHead>
                        <TableHead className="font-semibold">{t('courses.table.term')}</TableHead>
                        <TableHead className="font-semibold">{t('courses.table.dates')}</TableHead>
                        <TableHead className="font-semibold">{t('courses.table.status')}</TableHead>
                        <TableHead className="font-semibold text-end">{t('courses.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {courses.map((course, index) => (
                          <motion.tr
                            key={course.id}
                            variants={item}
                            initial="hidden"
                            animate="show"
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors border-b"
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500" />
                                  {course.name}
                                </div>
                                <div className="text-sm text-gray-500">{course.code}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {course.term || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4 text-lime-500" />
                                <span className="text-sm">{formatDate(course.start_date)}</span>
                              </div>
                              {course.end_date && (
                                <div className="text-xs text-gray-500 ms-6">{t('common.to')} {formatDate(course.end_date)}</div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(course.is_active)}</TableCell>
                            <TableCell className="text-end">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openViewModal(course)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditModal(course)}
                                  className="text-lime-600 hover:text-lime-800 hover:bg-lime-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete(course)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

                {/* Pagination */}
                {meta && meta.total_pages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {t('courses.pagination.showing')} {meta.page} {t('courses.pagination.of')} {meta.total_pages} ({meta.total_items} {t('courses.pagination.totalCourses')})
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePageChange(meta.page - 1)}
                        disabled={meta.page === 1}
                        variant="outline"
                      >
                        {t('common.previous')}
                      </Button>
                      <Button
                        onClick={() => handlePageChange(meta.page + 1)}
                        disabled={meta.page === meta.total_pages}
                        variant="outline"
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit/View Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
              {modalMode === 'create' ? t('courses.modal.create') : modalMode === 'edit' ? t('courses.modal.edit') : t('courses.modal.view')}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'create' ? 'Create a new course with schedule and details' : modalMode === 'edit' ? 'Update course information and settings' : 'View course details and reserves'}
            </DialogDescription>
          </DialogHeader>

          {modalMode === 'view' && selectedCourse ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label className="text-gray-700">{t('courses.form.name')}</Label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedCourse.name}</p>
                </div>
                <div>
                  <Label className="text-gray-700">{t('courses.form.code')}</Label>
                  <p className="text-gray-900 mt-1">{selectedCourse.code}</p>
                </div>
                <div>
                  <Label className="text-gray-700">{t('courses.form.status')}</Label>
                  <div className="mt-1">{getStatusBadge(selectedCourse.is_active)}</div>
                </div>
                {selectedCourse.term && (
                  <div className="col-span-2">
                    <Label className="text-gray-700">{t('courses.form.term')}</Label>
                    <p className="text-gray-900 mt-1">{selectedCourse.term}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-700">{t('courses.form.startDate')}</Label>
                  <p className="text-gray-900 mt-1">{formatDate(selectedCourse.start_date)}</p>
                </div>
                <div>
                  <Label className="text-gray-700">{t('courses.form.endDate')}</Label>
                  <p className="text-gray-900 mt-1">{formatDate(selectedCourse.end_date)}</p>
                </div>
                {selectedCourse.description && (
                  <div className="col-span-2">
                    <Label className="text-gray-700">{t('courses.form.description')}</Label>
                    <p className="text-gray-900 mt-1">{selectedCourse.description}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-lime-500" />
                    {t('courses.reserves.title')} ({reserves.length})
                  </Label>
                  {reserves.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('courses.reserves.noReserves')}</p>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        {reserves.map((reserve, idx) => (
                          <div key={idx} className="p-3 border-b last:border-b-0">
                            <p className="text-sm text-gray-700">{t('courses.reserves.itemId')}: {reserve.item_id}</p>
                            {reserve.reserve_type && (
                              <p className="text-xs text-gray-500">{t('courses.reserves.type')}: {reserve.reserve_type}</p>
                            )}
                            {reserve.loan_period && (
                              <p className="text-xs text-gray-500">{t('courses.reserves.loanPeriod')}: {reserve.loan_period}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.close')}
                </Button>
                <Button
                  onClick={() => openEditModal(selectedCourse)}
                  className="bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700"
                >
                  {t('courses.button.editCourse')}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('courses.form.basicInfo')}</h3>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">{t('courses.form.name')} *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('courses.form.namePlaceholder')}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">{t('courses.form.code')} *</Label>
                  <Input
                    id="code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder={t('courses.form.codePlaceholder')}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">{t('courses.form.term')}</Label>
                  <Input
                    id="term"
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder={t('courses.form.termFallPlaceholder')}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lime-500" />
                    {t('courses.form.startDate')}
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lime-500" />
                    {t('courses.form.endDate')}
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">{t('courses.form.description')}</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder={t('courses.form.descriptionPlaceholder')}
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                  />
                  <Label
                    htmlFor="is_active"
                    className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('courses.form.activeCourse')}
                  </Label>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700"
                >
                  {loading ? t('courses.saving') : modalMode === 'create' ? t('courses.button.createCourse') : t('courses.button.updateCourse')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {t('courses.deleteConfirm')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the course "{courseToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default Courses
