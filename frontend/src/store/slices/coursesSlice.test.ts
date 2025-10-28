/**
 * Courses Redux Slice Tests
 * Tests course management and reserves
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import coursesReducer, {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  fetchCourseReserves,
  addReserve,
  removeReserve,
  setFilters,
} from './coursesSlice';

vi.mock('../../services/coursesService', () => ({
  getCourses: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  getCourseReserves: vi.fn(),
  addCourseReserve: vi.fn(),
  removeCourseReserve: vi.fn(),
}));

describe('coursesSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      courses: [],
      reserves: [],
      loading: false,
      error: null,
      filters: {
        status: undefined,
        term: undefined,
      },
      pagination: {
        total: 0,
        skip: 0,
        limit: 10,
      },
    };
  });

  it('should have correct initial state', () => {
    const state = coursesReducer(undefined, { type: '@@INIT' });
    expect(state.courses).toEqual([]);
    expect(state.reserves).toEqual([]);
    expect(state.loading).toBe(false);
  });

  describe('fetchCourses', () => {
    it('should set loading on pending', () => {
      const state = coursesReducer(initialState, {
        type: fetchCourses.pending.type,
      });
      expect(state.loading).toBe(true);
    });

    it('should update courses on success', () => {
      const mockCourses = [
        {
          id: '1',
          course_code: 'CS101',
          course_name: 'Intro to CS',
          term: 'Fall 2025',
          is_active: true,
        },
        {
          id: '2',
          course_code: 'MATH201',
          course_name: 'Calculus I',
          term: 'Fall 2025',
          is_active: true,
        },
      ];

      const state = coursesReducer(initialState, {
        type: fetchCourses.fulfilled.type,
        payload: { items: mockCourses, total: 2 },
      });

      expect(state.loading).toBe(false);
      expect(state.courses).toHaveLength(2);
      expect(state.pagination.total).toBe(2);
    });

    it('should set error on failure', () => {
      const error = 'Failed to fetch courses';
      const state = coursesReducer(initialState, {
        type: fetchCourses.rejected.type,
        error: { message: error },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('createCourse', () => {
    it('should add new course', () => {
      const newCourse = {
        id: '3',
        course_code: 'ENG101',
        course_name: 'English Lit',
        term: 'Spring 2026',
      };

      const state = coursesReducer(initialState, {
        type: createCourse.fulfilled.type,
        payload: newCourse,
      });

      expect(state.courses).toHaveLength(1);
      expect(state.courses[0].course_code).toBe('ENG101');
    });
  });

  describe('updateCourse', () => {
    it('should update existing course', () => {
      const stateWithCourse = {
        ...initialState,
        courses: [
          {
            id: '1',
            course_code: 'CS101',
            course_name: 'Old Name',
            term: 'Fall 2025',
          },
        ],
      };

      const state = coursesReducer(stateWithCourse, {
        type: updateCourse.fulfilled.type,
        payload: {
          id: '1',
          course_code: 'CS101',
          course_name: 'New Name',
          term: 'Fall 2025',
        },
      });

      expect(state.courses[0].course_name).toBe('New Name');
    });
  });

  describe('deleteCourse', () => {
    it('should remove course', () => {
      const stateWithCourse = {
        ...initialState,
        courses: [{ id: '1', course_code: 'CS101' }],
      };

      const state = coursesReducer(stateWithCourse, {
        type: deleteCourse.fulfilled.type,
        meta: { arg: '1' },
      });

      expect(state.courses).toHaveLength(0);
    });
  });

  describe('course reserves', () => {
    it('should fetch reserves for a course', () => {
      const mockReserves = [
        { id: '1', course_id: 'course1', item_id: 'item1', title: 'Book 1' },
        { id: '2', course_id: 'course1', item_id: 'item2', title: 'Book 2' },
      ];

      const state = coursesReducer(initialState, {
        type: fetchCourseReserves.fulfilled.type,
        payload: mockReserves,
      });

      expect(state.reserves).toHaveLength(2);
    });

    it('should add reserve to course', () => {
      const newReserve = {
        id: '3',
        course_id: 'course1',
        item_id: 'item3',
        title: 'Book 3',
      };

      const state = coursesReducer(initialState, {
        type: addReserve.fulfilled.type,
        payload: newReserve,
      });

      expect(state.reserves).toHaveLength(1);
    });

    it('should remove reserve from course', () => {
      const stateWithReserves = {
        ...initialState,
        reserves: [{ id: '1', course_id: 'course1', item_id: 'item1' }],
      };

      const state = coursesReducer(stateWithReserves, {
        type: removeReserve.fulfilled.type,
        meta: { arg: '1' },
      });

      expect(state.reserves).toHaveLength(0);
    });
  });

  describe('filters', () => {
    it('should set filters', () => {
      const state = coursesReducer(
        initialState,
        setFilters({ status: 'active', term: 'Fall 2025' })
      );

      expect(state.filters.status).toBe('active');
      expect(state.filters.term).toBe('Fall 2025');
    });
  });
});
