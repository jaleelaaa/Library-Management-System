/**
 * Acquisitions Redux Slice Tests
 * Tests vendor, PO, invoice, and fund management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import acquisitionsReducer, {
  fetchVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  setFilters,
  clearFilters,
} from './acquisitionsSlice';

vi.mock('../../services/acquisitionsService', () => ({
  getVendors: vi.fn(),
  createVendor: vi.fn(),
  updateVendor: vi.fn(),
  deleteVendor: vi.fn(),
}));

describe('acquisitionsSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      vendors: [],
      purchaseOrders: [],
      invoices: [],
      funds: [],
      loading: false,
      error: null,
      filters: {},
      pagination: {
        total: 0,
        skip: 0,
        limit: 10,
      },
    };
  });

  it('should have correct initial state', () => {
    const state = acquisitionsReducer(undefined, { type: '@@INIT' });
    expect(state.vendors).toEqual([]);
    expect(state.purchaseOrders).toEqual([]);
    expect(state.loading).toBe(false);
  });

  describe('fetchVendors', () => {
    it('should set loading on pending', () => {
      const state = acquisitionsReducer(initialState, {
        type: fetchVendors.pending.type,
      });
      expect(state.loading).toBe(true);
    });

    it('should update vendors on success', () => {
      const mockVendors = [
        { id: '1', name: 'Vendor A', code: 'VA001' },
        { id: '2', name: 'Vendor B', code: 'VB002' },
      ];

      const state = acquisitionsReducer(initialState, {
        type: fetchVendors.fulfilled.type,
        payload: { items: mockVendors, total: 2 },
      });

      expect(state.loading).toBe(false);
      expect(state.vendors).toHaveLength(2);
      expect(state.pagination.total).toBe(2);
    });
  });

  describe('createVendor', () => {
    it('should add new vendor', () => {
      const newVendor = { id: '3', name: 'Vendor C', code: 'VC003' };

      const state = acquisitionsReducer(initialState, {
        type: createVendor.fulfilled.type,
        payload: newVendor,
      });

      expect(state.vendors).toHaveLength(1);
      expect(state.vendors[0].id).toBe('3');
    });
  });

  describe('updateVendor', () => {
    it('should update existing vendor', () => {
      const stateWithVendor = {
        ...initialState,
        vendors: [{ id: '1', name: 'Old Name', code: 'V001' }],
      };

      const state = acquisitionsReducer(stateWithVendor, {
        type: updateVendor.fulfilled.type,
        payload: { id: '1', name: 'New Name', code: 'V001' },
      });

      expect(state.vendors[0].name).toBe('New Name');
    });
  });

  describe('deleteVendor', () => {
    it('should remove vendor', () => {
      const stateWithVendor = {
        ...initialState,
        vendors: [{ id: '1', name: 'Vendor A' }],
      };

      const state = acquisitionsReducer(stateWithVendor, {
        type: deleteVendor.fulfilled.type,
        meta: { arg: '1' },
      });

      expect(state.vendors).toHaveLength(0);
    });
  });

  describe('filters', () => {
    it('should set filters', () => {
      const state = acquisitionsReducer(
        initialState,
        setFilters({ status: 'active' })
      );
      expect(state.filters.status).toBe('active');
    });

    it('should clear filters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: { status: 'active', vendor: 'V001' },
      };

      const state = acquisitionsReducer(stateWithFilters, clearFilters());
      expect(state.filters).toEqual({});
    });
  });
});
