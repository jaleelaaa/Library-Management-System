/**
 * Tests for circulationSlice Redux state management
 * Covers check-out, check-in, renewals, and loans management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import circulationReducer, {
  checkOut,
  checkIn,
  renewLoan,
  fetchLoans,
  fetchRequests,
  createRequest,
  cancelRequest,
  setFilters,
  clearFilters,
} from './circulationSlice';
import type { CirculationState } from './circulationSlice';

// Mock API
vi.mock('../../services/circulationService', () => ({
  checkOut: vi.fn(),
  checkIn: vi.fn(),
  renewLoan: vi.fn(),
  getLoans: vi.fn(),
  getRequests: vi.fn(),
  createRequest: vi.fn(),
  cancelRequest: vi.fn(),
}));

describe('circulationSlice', () => {
  let initialState: CirculationState;

  beforeEach(() => {
    initialState = {
      loans: [],
      requests: [],
      loading: false,
      error: null,
      filters: {
        status: undefined,
        overdueOnly: false,
      },
      pagination: {
        total: 0,
        skip: 0,
        limit: 10,
      },
    };
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = circulationReducer(undefined, { type: '@@INIT' });

      expect(state.loans).toEqual([]);
      expect(state.requests).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('action creators', () => {
    it('should set filters', () => {
      const state = circulationReducer(
        initialState,
        setFilters({ status: 'open', overdueOnly: true })
      );

      expect(state.filters.status).toBe('open');
      expect(state.filters.overdueOnly).toBe(true);
    });

    it('should clear filters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: { status: 'open', overdueOnly: true },
      };

      const state = circulationReducer(stateWithFilters, clearFilters());

      expect(state.filters.status).toBeUndefined();
      expect(state.filters.overdueOnly).toBe(false);
    });
  });

  describe('fetchLoans async thunk', () => {
    it('should set loading state on pending', () => {
      const state = circulationReducer(initialState, {
        type: fetchLoans.pending.type,
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update loans on success', () => {
      const mockLoans = [
        {
          id: '1',
          user_id: 'user-1',
          item_id: 'item-1',
          checkout_date: '2025-10-01',
          due_date: '2025-10-15',
          status: 'open',
        },
        {
          id: '2',
          user_id: 'user-2',
          item_id: 'item-2',
          checkout_date: '2025-10-05',
          due_date: '2025-10-19',
          status: 'open',
        },
      ];

      const state = circulationReducer(initialState, {
        type: fetchLoans.fulfilled.type,
        payload: {
          items: mockLoans,
          total: 2,
          skip: 0,
          limit: 10,
        },
      });

      expect(state.loading).toBe(false);
      expect(state.loans).toHaveLength(2);
      expect(state.pagination.total).toBe(2);
    });

    it('should set error on failure', () => {
      const error = 'Failed to fetch loans';
      const state = circulationReducer(initialState, {
        type: fetchLoans.rejected.type,
        error: { message: error },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('checkOut async thunk', () => {
    it('should add new loan on success', () => {
      const newLoan = {
        id: '3',
        user_id: 'user-3',
        item_id: 'item-3',
        checkout_date: '2025-10-26',
        due_date: '2025-11-09',
        status: 'open',
      };

      const state = circulationReducer(initialState, {
        type: checkOut.fulfilled.type,
        payload: newLoan,
      });

      expect(state.loans).toHaveLength(1);
      expect(state.loans[0].id).toBe('3');
    });

    it('should set loading during checkout', () => {
      const state = circulationReducer(initialState, {
        type: checkOut.pending.type,
      });

      expect(state.loading).toBe(true);
    });
  });

  describe('checkIn async thunk', () => {
    it('should update loan status on check-in', () => {
      const stateWithLoan = {
        ...initialState,
        loans: [
          {
            id: '1',
            user_id: 'user-1',
            item_id: 'item-1',
            checkout_date: '2025-10-01',
            due_date: '2025-10-15',
            status: 'open',
          },
        ],
      };

      const state = circulationReducer(stateWithLoan, {
        type: checkIn.fulfilled.type,
        payload: { id: '1', status: 'closed' },
      });

      expect(state.loans[0].status).toBe('closed');
    });
  });

  describe('renewLoan async thunk', () => {
    it('should update loan due date on renewal', () => {
      const stateWithLoan = {
        ...initialState,
        loans: [
          {
            id: '1',
            user_id: 'user-1',
            item_id: 'item-1',
            checkout_date: '2025-10-01',
            due_date: '2025-10-15',
            status: 'open',
            renewals_remaining: 2,
          },
        ],
      };

      const state = circulationReducer(stateWithLoan, {
        type: renewLoan.fulfilled.type,
        payload: {
          id: '1',
          due_date: '2025-10-29',
          renewals_remaining: 1,
        },
      });

      expect(state.loans[0].due_date).toBe('2025-10-29');
      expect(state.loans[0].renewals_remaining).toBe(1);
    });

    it('should handle renewal error', () => {
      const error = 'Maximum renewals reached';
      const state = circulationReducer(initialState, {
        type: renewLoan.rejected.type,
        error: { message: error },
      });

      expect(state.error).toBe(error);
    });
  });

  describe('fetchRequests async thunk', () => {
    it('should load requests on success', () => {
      const mockRequests = [
        {
          id: '1',
          user_id: 'user-1',
          item_id: 'item-1',
          request_type: 'hold',
          status: 'open',
          queue_position: 1,
        },
      ];

      const state = circulationReducer(initialState, {
        type: fetchRequests.fulfilled.type,
        payload: {
          items: mockRequests,
          total: 1,
        },
      });

      expect(state.requests).toHaveLength(1);
      expect(state.requests[0].queue_position).toBe(1);
    });
  });

  describe('createRequest async thunk', () => {
    it('should add new request', () => {
      const newRequest = {
        id: '2',
        user_id: 'user-2',
        item_id: 'item-2',
        request_type: 'hold',
        status: 'open',
        queue_position: 2,
      };

      const state = circulationReducer(initialState, {
        type: createRequest.fulfilled.type,
        payload: newRequest,
      });

      expect(state.requests).toHaveLength(1);
      expect(state.requests[0].id).toBe('2');
    });
  });

  describe('cancelRequest async thunk', () => {
    it('should remove cancelled request', () => {
      const stateWithRequest = {
        ...initialState,
        requests: [
          {
            id: '1',
            user_id: 'user-1',
            item_id: 'item-1',
            request_type: 'hold',
            status: 'open',
          },
        ],
      };

      const state = circulationReducer(stateWithRequest, {
        type: cancelRequest.fulfilled.type,
        meta: { arg: '1' },
      });

      expect(state.requests).toHaveLength(0);
    });
  });

  describe('overdue loans', () => {
    it('should filter overdue loans', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const stateWithLoans = {
        ...initialState,
        loans: [
          {
            id: '1',
            user_id: 'user-1',
            item_id: 'item-1',
            due_date: yesterday.toISOString(),
            status: 'open',
          },
          {
            id: '2',
            user_id: 'user-2',
            item_id: 'item-2',
            due_date: tomorrow.toISOString(),
            status: 'open',
          },
        ],
      };

      const overdueLoans = stateWithLoans.loans.filter(
        (loan) => new Date(loan.due_date) < today && loan.status === 'open'
      );

      expect(overdueLoans).toHaveLength(1);
      expect(overdueLoans[0].id).toBe('1');
    });
  });
});
