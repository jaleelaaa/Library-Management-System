import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer, {
  fetchInstances,
  createInstance,
  updateInstance,
  deleteInstance,
  setSearchQuery,
} from './inventorySlice';
import * as inventoryService from '../../services/inventoryService';

vi.mock('../../services/inventoryService');

describe('inventorySlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        inventory: inventoryReducer,
      },
    });
    vi.clearAllMocks();
  });

  it('should handle initial state', () => {
    const state = store.getState().inventory;
    expect(state.instances).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.searchQuery).toBe('');
  });

  it('should handle setSearchQuery', () => {
    store.dispatch(setSearchQuery('test book'));
    const state = store.getState().inventory;
    expect(state.searchQuery).toBe('test book');
  });

  describe('fetchInstances', () => {
    it('should fetch instances successfully', async () => {
      const mockInstances = {
        items: [
          {
            id: '1',
            title: 'Test Book 1',
            subtitle: 'Subtitle 1',
            instance_type: 'text',
            contributors: [],
            publication: [],
          },
          {
            id: '2',
            title: 'Test Book 2',
            subtitle: 'Subtitle 2',
            instance_type: 'text',
            contributors: [],
            publication: [],
          },
        ],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      };

      vi.mocked(inventoryService.fetchInstances).mockResolvedValue(mockInstances);

      await store.dispatch(fetchInstances({ page: 1, pageSize: 10 }));

      const state = store.getState().inventory;
      expect(state.instances).toEqual(mockInstances.items);
      expect(state.total).toBe(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetchInstances failure', async () => {
      const errorMessage = 'Failed to fetch instances';
      vi.mocked(inventoryService.fetchInstances).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchInstances({ page: 1, pageSize: 10 }));

      const state = store.getState().inventory;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('createInstance', () => {
    it('should create instance successfully', async () => {
      const newInstance = {
        id: '3',
        title: 'New Book',
        subtitle: 'New Subtitle',
        instance_type: 'text',
        contributors: [],
        publication: [],
      };

      vi.mocked(inventoryService.createInstance).mockResolvedValue(newInstance);

      await store.dispatch(
        createInstance({
          title: 'New Book',
          subtitle: 'New Subtitle',
          instance_type: 'text',
        })
      );

      const state = store.getState().inventory;
      expect(state.instances).toContainEqual(newInstance);
      expect(state.loading).toBe(false);
    });

    it('should handle createInstance failure', async () => {
      const errorMessage = 'Failed to create instance';
      vi.mocked(inventoryService.createInstance).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(
        createInstance({
          title: 'New Book',
          instance_type: 'text',
        })
      );

      const state = store.getState().inventory;
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateInstance', () => {
    it('should update instance successfully', async () => {
      const initialInstance = {
        id: '1',
        title: 'Original Title',
        subtitle: 'Original Subtitle',
        instance_type: 'text',
        contributors: [],
        publication: [],
      };

      vi.mocked(inventoryService.fetchInstances).mockResolvedValue({
        items: [initialInstance],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      await store.dispatch(fetchInstances({ page: 1, pageSize: 10 }));

      const updatedInstance = {
        ...initialInstance,
        title: 'Updated Title',
      };

      vi.mocked(inventoryService.updateInstance).mockResolvedValue(updatedInstance);

      await store.dispatch(
        updateInstance({ id: '1', updates: { title: 'Updated Title' } })
      );

      const state = store.getState().inventory;
      const instance = state.instances.find((i) => i.id === '1');
      expect(instance?.title).toBe('Updated Title');
    });
  });

  describe('deleteInstance', () => {
    it('should delete instance successfully', async () => {
      const instances = [
        {
          id: '1',
          title: 'Book 1',
          subtitle: 'Subtitle 1',
          instance_type: 'text',
          contributors: [],
          publication: [],
        },
        {
          id: '2',
          title: 'Book 2',
          subtitle: 'Subtitle 2',
          instance_type: 'text',
          contributors: [],
          publication: [],
        },
      ];

      vi.mocked(inventoryService.fetchInstances).mockResolvedValue({
        items: instances,
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      await store.dispatch(fetchInstances({ page: 1, pageSize: 10 }));

      vi.mocked(inventoryService.deleteInstance).mockResolvedValue(undefined);

      await store.dispatch(deleteInstance('1'));

      const state = store.getState().inventory;
      expect(state.instances).toHaveLength(1);
      expect(state.instances.find((i) => i.id === '1')).toBeUndefined();
    });
  });

  it('should handle search with query parameter', async () => {
    const searchResults = {
      items: [
        {
          id: '1',
          title: 'Search Result Book',
          subtitle: 'Found',
          instance_type: 'text',
          contributors: [],
          publication: [],
        },
      ],
      total: 1,
      page: 1,
      page_size: 10,
      total_pages: 1,
    };

    vi.mocked(inventoryService.fetchInstances).mockResolvedValue(searchResults);

    store.dispatch(setSearchQuery('Search Result'));
    await store.dispatch(fetchInstances({ page: 1, pageSize: 10, q: 'Search Result' }));

    const state = store.getState().inventory;
    expect(state.instances).toEqual(searchResults.items);
    expect(state.searchQuery).toBe('Search Result');
  });
});
