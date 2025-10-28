/**
 * Dashboard Redux Slice Tests
 * Tests statistics fetching, auto-refresh, and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import dashboardReducer, {
  fetchDashboardStats,
  fetchRecentLoans,
} from './dashboardSlice';

vi.mock('../../services/dashboardService', () => ({
  getDashboardStats: vi.fn(),
  getRecentLoans: vi.fn(),
}));

describe('dashboardSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      stats: null,
      recentLoans: [],
      loading: false,
      error: null,
    };
  });

  it('should have correct initial state', () => {
    const state = dashboardReducer(undefined, { type: '@@INIT' });
    expect(state.stats).toBeNull();
    expect(state.recentLoans).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchDashboardStats', () => {
    it('should set loading on pending', () => {
      const state = dashboardReducer(initialState, {
        type: fetchDashboardStats.pending.type,
      });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update stats on success', () => {
      const mockStats = {
        circulation: { active_loans: 100, overdue_items: 5 },
        collection: { total_items: 5000 },
        users: { total_users: 500 },
      };

      const state = dashboardReducer(initialState, {
        type: fetchDashboardStats.fulfilled.type,
        payload: mockStats,
      });

      expect(state.loading).toBe(false);
      expect(state.stats).toEqual(mockStats);
      expect(state.error).toBeNull();
    });

    it('should set error on failure', () => {
      const error = 'Failed to fetch stats';
      const state = dashboardReducer(initialState, {
        type: fetchDashboardStats.rejected.type,
        error: { message: error },
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('fetchRecentLoans', () => {
    it('should update recent loans on success', () => {
      const mockLoans = [
        { id: '1', user: 'John', item: 'Book 1' },
        { id: '2', user: 'Jane', item: 'Book 2' },
      ];

      const state = dashboardReducer(initialState, {
        type: fetchRecentLoans.fulfilled.type,
        payload: { items: mockLoans },
      });

      expect(state.recentLoans).toEqual(mockLoans);
    });
  });
});
