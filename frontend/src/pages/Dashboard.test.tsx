/**
 * Dashboard Component Tests
 * Tests real-time statistics, auto-refresh, and quick actions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from './Dashboard';
import dashboardReducer from '../store/slices/dashboardSlice';

// Mock the dashboard service
vi.mock('../services/dashboardService', () => ({
  getDashboardStats: vi.fn(() => Promise.resolve({
    circulation: {
      active_loans: 150,
      overdue_items: 12,
      pending_requests: 8,
    },
    collection: {
      total_items: 5000,
      total_instances: 3500,
    },
    users: {
      total_users: 500,
      active_users: 450,
    },
    financial: {
      total_fines: 1250.50,
    },
  })),
  getRecentLoans: vi.fn(() => Promise.resolve({
    items: [
      {
        id: '1',
        user: { name: 'John Doe' },
        item: { title: 'Test Book 1' },
        checkout_date: '2025-10-20',
        due_date: '2025-11-03',
      },
    ],
  })),
}));

describe('Dashboard Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        dashboard: dashboardReducer,
      },
    });
  });

  const renderDashboard = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render dashboard title', () => {
    renderDashboard();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should display statistics cards', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Active Loans/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Items/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
      expect(screen.getByText(/Overdue Items/i)).toBeInTheDocument();
    });
  });

  it('should display correct statistics values', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Active loans
      expect(screen.getByText('5000')).toBeInTheDocument(); // Total items
      expect(screen.getByText('500')).toBeInTheDocument(); // Total users
      expect(screen.getByText('12')).toBeInTheDocument(); // Overdue items
    });
  });

  it('should show loading state initially', () => {
    renderDashboard();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should display recent activity section', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    });
  });

  it('should display quick action buttons', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Check Out\/In/i)).toBeInTheDocument();
      expect(screen.getByText(/Search Catalog/i)).toBeInTheDocument();
    });
  });

  it('should have refresh button', async () => {
    renderDashboard();

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /Refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it('should handle error state gracefully', async () => {
    // Mock error
    const errorStore = configureStore({
      reducer: {
        dashboard: dashboardReducer,
      },
      preloadedState: {
        dashboard: {
          stats: null,
          recentLoans: [],
          loading: false,
          error: 'Failed to load dashboard',
        },
      },
    });

    render(
      <Provider store={errorStore}>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Failed to load dashboard/i)).toBeInTheDocument();
  });
});
