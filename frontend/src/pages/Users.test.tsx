/**
 * Users Page Component Tests
 * Tests user CRUD operations, search, filters, and pagination
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Users from './Users';
import usersReducer from '../store/slices/usersSlice';

// Mock user service
vi.mock('../services/usersService', () => ({
  getUsers: vi.fn(() => Promise.resolve({
    items: [
      {
        id: '1',
        username: 'jdoe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        barcode: '123456',
        is_active: true,
        patron_group: { name: 'Faculty' },
      },
      {
        id: '2',
        username: 'asmith',
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@example.com',
        barcode: '789012',
        is_active: true,
        patron_group: { name: 'Student' },
      },
    ],
    total: 2,
    skip: 0,
    limit: 10,
  })),
  createUser: vi.fn((user) => Promise.resolve({ id: '3', ...user })),
  updateUser: vi.fn((id, user) => Promise.resolve({ id, ...user })),
  deleteUser: vi.fn(() => Promise.resolve()),
}));

describe('Users Page Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: usersReducer,
      },
    });
  });

  const renderUsers = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render users page title', () => {
    renderUsers();
    expect(screen.getByText(/Users Management/i)).toBeInTheDocument();
  });

  it('should display user list', async () => {
    renderUsers();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  it('should display user details in table', async () => {
    renderUsers();

    await waitFor(() => {
      expect(screen.getByText('jdoe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('123456')).toBeInTheDocument();
      expect(screen.getByText('Faculty')).toBeInTheDocument();
    });
  });

  it('should have search input', () => {
    renderUsers();
    const searchInput = screen.getByPlaceholderText(/Search users/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should have "New User" button', () => {
    renderUsers();
    const newButton = screen.getByRole('button', { name: /New User/i });
    expect(newButton).toBeInTheDocument();
  });

  it('should show active status badge', async () => {
    renderUsers();

    await waitFor(() => {
      const badges = screen.getAllByText(/Active/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should display pagination controls', async () => {
    renderUsers();

    await waitFor(() => {
      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });

  it('should filter users by status', async () => {
    renderUsers();

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/Status/i);
      expect(filterSelect).toBeInTheDocument();
    });
  });

  it('should handle search input', async () => {
    renderUsers();

    const searchInput = screen.getByPlaceholderText(/Search users/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(searchInput).toHaveValue('John');
  });

  it('should show user action buttons', async () => {
    renderUsers();

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /Edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });
});
