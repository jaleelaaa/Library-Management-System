import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'
import type { Course, CourseCreate, CourseUpdate, CourseFilters, Reserve, ReserveCreate, PaginationMeta } from '../../types/course'

interface CoursesState {
  courses: Course[]
  selectedCourse: Course | null
  reserves: Reserve[]
  loading: boolean
  error: string | null
  meta: PaginationMeta | null
  filters: CourseFilters
}

const initialState: CoursesState = {
  courses: [],
  selectedCourse: null,
  reserves: [],
  loading: false,
  error: null,
  meta: null,
  filters: {
    page: 1,
    page_size: 20,
    search: undefined,
    is_active: undefined,
    term: undefined
  }
}

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (filters: CourseFilters = {}) => {
    const response = await api.get('/courses/', { params: filters })
    return response.data
  }
)

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}`)
    return response.data
  }
)

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: CourseCreate) => {
    const response = await api.post('/courses/', courseData)
    return response.data
  }
)

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: CourseUpdate }) => {
    const response = await api.put(`/courses/${courseId}`, courseData)
    return response.data
  }
)

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId: string) => {
    await api.delete(`/courses/${courseId}`)
    return courseId
  }
)

export const fetchCourseReserves = createAsyncThunk(
  'courses/fetchCourseReserves',
  async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/reserves`)
    return response.data
  }
)

export const createCourseReserve = createAsyncThunk(
  'courses/createCourseReserve',
  async ({ courseId, reserveData }: { courseId: string; reserveData: ReserveCreate }) => {
    const response = await api.post(`/courses/${courseId}/reserves`, reserveData)
    return response.data
  }
)

export const deleteCourseReserve = createAsyncThunk(
  'courses/deleteCourseReserve',
  async (reserveId: string) => {
    await api.delete(`/courses/reserves/${reserveId}`)
    return reserveId
  }
)

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload
    },
    setFilters: (state, action: PayloadAction<CourseFilters>) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearReserves: (state) => {
      state.reserves = []
    }
  },
  extraReducers: (builder) => {
    // Fetch courses
    builder.addCase(fetchCourses.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.loading = false
      state.courses = action.payload.data
      state.meta = action.payload.meta
    })
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch courses'
    })

    // Fetch course by ID
    builder.addCase(fetchCourseById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCourseById.fulfilled, (state, action) => {
      state.loading = false
      state.selectedCourse = action.payload
    })
    builder.addCase(fetchCourseById.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch course'
    })

    // Create course
    builder.addCase(createCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createCourse.fulfilled, (state, action) => {
      state.loading = false
      state.courses.unshift(action.payload)
    })
    builder.addCase(createCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to create course'
    })

    // Update course
    builder.addCase(updateCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateCourse.fulfilled, (state, action) => {
      state.loading = false
      const index = state.courses.findIndex(course => course.id === action.payload.id)
      if (index !== -1) {
        state.courses[index] = action.payload
      }
      if (state.selectedCourse?.id === action.payload.id) {
        state.selectedCourse = action.payload
      }
    })
    builder.addCase(updateCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to update course'
    })

    // Delete course
    builder.addCase(deleteCourse.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteCourse.fulfilled, (state, action) => {
      state.loading = false
      state.courses = state.courses.filter(course => course.id !== action.payload)
      if (state.selectedCourse?.id === action.payload) {
        state.selectedCourse = null
      }
    })
    builder.addCase(deleteCourse.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to delete course'
    })

    // Fetch course reserves
    builder.addCase(fetchCourseReserves.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCourseReserves.fulfilled, (state, action) => {
      state.loading = false
      state.reserves = action.payload
    })
    builder.addCase(fetchCourseReserves.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch reserves'
    })

    // Create reserve
    builder.addCase(createCourseReserve.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createCourseReserve.fulfilled, (state, action) => {
      state.loading = false
      state.reserves.push(action.payload)
    })
    builder.addCase(createCourseReserve.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to create reserve'
    })

    // Delete reserve
    builder.addCase(deleteCourseReserve.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteCourseReserve.fulfilled, (state, action) => {
      state.loading = false
      state.reserves = state.reserves.filter(reserve => reserve.id !== action.payload)
    })
    builder.addCase(deleteCourseReserve.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to delete reserve'
    })
  },
})

export const { setSelectedCourse, setFilters, clearError, clearReserves } = coursesSlice.actions
export default coursesSlice.reducer
