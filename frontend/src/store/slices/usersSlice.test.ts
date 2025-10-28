import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import usersReducer, {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setSearchQuery,
  setFilters,
  clearFilters,
} from './usersSlice';
import * as usersService from '../../services/usersService';

// Mock the users service
vi.mock('../../services/usersService');

describe('usersSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: usersReducer,
      },
    });
    vi.clearAllMocks();
  });

  it('should handle initial state', () => {
    const state = store.getState().users;
    expect(state.users).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.searchQuery).toBe('');
  });

  it('should handle setSearchQuery', () => {
    store.dispatch(setSearchQuery('test query'));
    const state = store.getState().users;
    expect(state.searchQuery).toBe('test query');
  });

  it('should handle setFilters', () => {
    const filters = { status: 'active', patronGroup: 'faculty' };
    store.dispatch(setFilters(filters));
    const state = store.getState().users;
    expect(state.filters).toEqual(filters);
  });

  it('should handle clearFilters', () => {
    store.dispatch(setFilters({ status: 'active' }));
    store.dispatch(clearFilters());
    const state = store.getState().users;
    expect(state.filters).toEqual({});
  });

  describe('fetchUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = {
        items: [
          { id: '1', username: 'user1', email: 'user1@test.com', full_name: 'User One' },
          { id: '2', username: 'user2', email: 'user2@test.com', full_name: 'User Two' },
        ],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      };

      vi.mocked(usersService.fetchUsers).mockResolvedValue(mockUsers);

      await store.dispatch(fetchUsers({ page: 1, pageSize: 10 }));

      const state = store.getState().users;
      expect(state.users).toEqual(mockUsers.items);
      expect(state.total).toBe(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle fetchUsers failure', async () => {
      const errorMessage = 'Failed to fetch users';
      vi.mocked(usersService.fetchUsers).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchUsers({ page: 1, pageSize: 10 }));

      const state = store.getState().users;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should set loading state during fetchUsers', () => {
      vi.mocked(usersService.fetchUsers).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      store.dispatch(fetchUsers({ page: 1, pageSize: 10 }));

      const state = store.getState().users;
      expect(state.loading).toBe(true);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const newUser = {
        id: '3',
        username: 'newuser',
        email: 'newuser@test.com',
        full_name: 'New User',
      };

      vi.mocked(usersService.createUser).mockResolvedValue(newUser);

      await store.dispatch(
        createUser({
          username: 'newuser',
          email: 'newuser@test.com',
          full_name: 'New User',
          password: 'password123',
        })
      );

      const state = store.getState().users;
      expect(state.users).toContainEqual(newUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle createUser failure', async () => {
      const errorMessage = 'Failed to create user';
      vi.mocked(usersService.createUser).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(
        createUser({
          username: 'newuser',
          email: 'newuser@test.com',
          full_name: 'New User',
          password: 'password123',
        })
      );

      const state = store.getState().users;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // First add a user
      const initialUser = {
        id: '1',
        username: 'user1',
        email: 'user1@test.com',
        full_name: 'User One',
      };

      vi.mocked(usersService.fetchUsers).mockResolvedValue({
        items: [initialUser],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      await store.dispatch(fetchUsers({ page: 1, pageSize: 10 }));

      // Update the user
      const updatedUser = {
        ...initialUser,
        full_name: 'Updated User One',
      };

      vi.mocked(usersService.updateUser).mockResolvedValue(updatedUser);

      await store.dispatch(
        updateUser({ id: '1', updates: { full_name: 'Updated User One' } })
      );

      const state = store.getState().users;
      const user = state.users.find((u) => u.id === '1');
      expect(user?.full_name).toBe('Updated User One');
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle updateUser failure', async () => {
      const errorMessage = 'Failed to update user';
      vi.mocked(usersService.updateUser).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(
        updateUser({ id: '1', updates: { full_name: 'Updated' } })
      );

      const state = store.getState().users;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // First add users
      const users = [
        { id: '1', username: 'user1', email: 'user1@test.com', full_name: 'User One' },
        { id: '2', username: 'user2', email: 'user2@test.com', full_name: 'User Two' },
      ];

      vi.mocked(usersService.fetchUsers).mockResolvedValue({
        items: users,
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      await store.dispatch(fetchUsers({ page: 1, pageSize: 10 }));

      // Delete a user
      vi.mocked(usersService.deleteUser).mockResolvedValue(undefined);

      await store.dispatch(deleteUser('1'));

      const state = store.getState().users;
      expect(state.users).toHaveLength(1);
      expect(state.users.find((u) => u.id === '1')).toBeUndefined();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle deleteUser failure', async () => {
      const errorMessage = 'Failed to delete user';
      vi.mocked(usersService.deleteUser).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(deleteUser('1'));

      const state = store.getState().users;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  it('should handle pagination state', async () => {
    const mockUsers = {
      items: Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        username: `user${i}`,
        email: `user${i}@test.com`,
        full_name: `User ${i}`,
      })),
      total: 25,
      page: 2,
      page_size: 10,
      total_pages: 3,
    };

    vi.mocked(usersService.fetchUsers).mockResolvedValue(mockUsers);

    await store.dispatch(fetchUsers({ page: 2, pageSize: 10 }));

    const state = store.getState().users;
    expect(state.currentPage).toBe(2);
    expect(state.total).toBe(25);
    expect(state.totalPages).toBe(3);
  });
});
