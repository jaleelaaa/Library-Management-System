import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

describe('Sidebar Component', () => {
  const renderSidebar = () => {
    return render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  };

  it('renders all navigation items', () => {
    renderSidebar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Patron Groups')).toBeInTheDocument();
    expect(screen.getByText('Circulation')).toBeInTheDocument();
    expect(screen.getByText('Acquisitions')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Fees & Fines')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders navigation links with correct paths', () => {
    renderSidebar();

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const inventoryLink = screen.getByRole('link', { name: /inventory/i });
    expect(inventoryLink).toHaveAttribute('href', '/inventory');

    const feesLink = screen.getByRole('link', { name: /fees & fines/i });
    expect(feesLink).toHaveAttribute('href', '/fees');
  });

  it('has proper styling classes', () => {
    renderSidebar();

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('folio-sidebar');
  });
});
