import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout } from './authSlice';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should have initial state', () => {
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should handle login', () => {
    const loginPayload = {
      token: 'test-token-123',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    };

    store.dispatch(login(loginPayload));

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('test-token-123');
    expect(state.user).toEqual(loginPayload.user);
  });

  it('should handle logout', () => {
    // First login
    const loginPayload = {
      token: 'test-token-123',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    };
    store.dispatch(login(loginPayload));

    // Then logout
    store.dispatch(logout());

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should persist token in localStorage on login', () => {
    const loginPayload = {
      token: 'persist-token-456',
      user: {
        id: '2',
        username: 'persistuser',
        email: 'persist@example.com',
        firstName: 'Persist',
        lastName: 'User',
      },
    };

    store.dispatch(login(loginPayload));

    // Check if token is in localStorage
    const storedToken = localStorage.getItem('token');
    expect(storedToken).toBe('persist-token-456');
  });

  it('should remove token from localStorage on logout', () => {
    // Login first
    const loginPayload = {
      token: 'remove-token-789',
      user: {
        id: '3',
        username: 'removeuser',
        email: 'remove@example.com',
        firstName: 'Remove',
        lastName: 'User',
      },
    };
    store.dispatch(login(loginPayload));

    // Then logout
    store.dispatch(logout());

    // Check if token is removed from localStorage
    const storedToken = localStorage.getItem('token');
    expect(storedToken).toBeNull();
  });
});
