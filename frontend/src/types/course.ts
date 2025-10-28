export interface Course {
  id: string
  name: string
  code: string
  department_id?: string
  term?: string
  start_date?: string
  end_date?: string
  instructor_id?: string
  is_active: boolean
  description?: string
  tenant_id: string
  created_date: string
  updated_date?: string
  created_by_user_id?: string
  updated_by_user_id?: string
}

export interface CourseCreate {
  name: string
  code: string
  department_id?: string
  term?: string
  start_date?: string
  end_date?: string
  instructor_id?: string
  is_active?: boolean
  description?: string
}

export interface CourseUpdate {
  name?: string
  code?: string
  department_id?: string
  term?: string
  start_date?: string
  end_date?: string
  instructor_id?: string
  is_active?: boolean
  description?: string
}

export interface Reserve {
  id: string
  course_id: string
  item_id: string
  reserve_type?: string
  loan_period?: string
  tenant_id: string
  created_date: string
  updated_date?: string
}

export interface ReserveCreate {
  item_id: string
  reserve_type?: string
  loan_period?: string
}

export interface CourseFilters {
  page?: number
  page_size?: number
  search?: string
  is_active?: boolean
  term?: string
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}
