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
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiEye, FiBookOpen, FiCalendar } from 'react-icons/fi'
import type { Course, CourseCreate } from '../types/course'
import { useLanguage } from '../contexts/LanguageContext'

const Courses = () => {
  const dispatch = useAppDispatch()
  const { t, isRTL } = useLanguage()
  const { courses, selectedCourse, reserves, loading, meta, filters, error } = useAppSelector(state => state.courses)

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
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
      is_active: filterActive,
      term: filterTerm || undefined,
      page: 1
    }
    dispatch(setFilters(newFilters))
    dispatch(fetchCourses(newFilters))
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilterActive(undefined)
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

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all associated reserves.')) {
      await dispatch(deleteCourse(courseId))
      dispatch(fetchCourses(filters))
    }
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
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('courses.title')}</h1>
          <p className="text-gray-600 mt-1">{t('courses.subtitle')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
        >
          <FiPlus /> {t('courses.newCourse')}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="folio-card mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('courses.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition"
          >
            {t('common.search')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition ${
              (filterActive !== undefined || filterTerm) ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <FiFilter /> {t('common.filters')}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.status')}</label>
                <select
                  value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
                  onChange={(e) => setFilterActive(e.target.value === 'all' ? undefined : e.target.value === 'active')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">{t('courses.allCourses')}</option>
                  <option value="active">{t('courses.activeOnly')}</option>
                  <option value="inactive">{t('courses.inactiveOnly')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.term')}</label>
                <input
                  type="text"
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  placeholder={t('courses.termPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition"
              >
                {t('courses.applyFilters')}
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
              >
                {t('courses.clearFilters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Courses Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('courses.loading')}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiBookOpen className="mx-auto text-5xl mb-4 text-gray-400" />
            <p className="text-xl mb-2">{t('courses.noCourses')}</p>
            <p>{t('courses.noCoursesHint')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('courses.table.course')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('courses.table.term')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('courses.table.dates')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('courses.table.status')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('courses.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {course.term || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          <span>{formatDate(course.start_date)}</span>
                        </div>
                        {course.end_date && (
                          <div className="text-xs text-gray-500">{t('common.to')} {formatDate(course.end_date)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(course.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openViewModal(course)}
                            className="text-blue-600 hover:text-blue-800"
                            title={t('courses.view')}
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(course)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title={t('courses.edit')}
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-800"
                            title={t('courses.delete')}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  {t('courses.pagination.showing')} {meta.page} {t('courses.pagination.of')} {meta.total_pages} ({meta.total_items} {t('courses.pagination.totalCourses')})
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.total_pages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit/View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? t('courses.modal.create') : modalMode === 'edit' ? t('courses.modal.edit') : t('courses.modal.view')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedCourse ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.name')}</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedCourse.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.code')}</label>
                    <p className="text-gray-900">{selectedCourse.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.status')}</label>
                    {getStatusBadge(selectedCourse.is_active)}
                  </div>
                  {selectedCourse.term && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.term')}</label>
                      <p className="text-gray-900">{selectedCourse.term}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.startDate')}</label>
                    <p className="text-gray-900">{formatDate(selectedCourse.start_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.endDate')}</label>
                    <p className="text-gray-900">{formatDate(selectedCourse.end_date)}</p>
                  </div>
                  {selectedCourse.description && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.description')}</label>
                      <p className="text-gray-900">{selectedCourse.description}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('courses.reserves.title')} ({reserves.length})</label>
                    {reserves.length === 0 ? (
                      <p className="text-gray-500 text-sm">{t('courses.reserves.noReserves')}</p>
                    ) : (
                      <div className="border rounded-md">
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
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('common.close')}
                  </button>
                  <button
                    onClick={() => openEditModal(selectedCourse)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                  >
                    {t('courses.button.editCourse')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('courses.form.basicInfo')}</h3>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.name')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('courses.form.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.code')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('courses.form.codePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.term')}</label>
                    <input
                      type="text"
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('courses.form.termFallPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.startDate')}</label>
                    <input
                      type="date"
                      value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.endDate')}</label>
                    <input
                      type="date"
                      value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('courses.form.description')}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                      placeholder={t('courses.form.descriptionPlaceholder')}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('courses.form.activeCourse')}</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
                  >
                    {loading ? t('courses.saving') : modalMode === 'create' ? t('courses.button.createCourse') : t('courses.button.updateCourse')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses
