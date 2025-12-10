import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Catalog from './index';
import { UserContext } from '../../components/contexts/UserContext';
import * as useCatalogModule from './useCatalog';

const dummyUser = {
  userID: "1",
  userDetails: "Test Admin",
  userRoles: ["admin"],
  claims: []
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserContext.Provider
    value={{
      user: dummyUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false
    }}
  >
    {children}
  </UserContext.Provider>
);

describe('Catalog Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('shows loading spinner while data is loading', () => {
    const mockUseCatalog = {
      items: [],
      categories: [],
      isLoading: true,
      error: null,
      fetchData: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: vi.fn(),
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error message when there is an error', () => {
    const mockUseCatalog = {
      items: [],
      categories: [],
      isLoading: false,
      error: 'Failed to fetch data',
      fetchData: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: vi.fn(),
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('retries fetching data when retry button is clicked', () => {
    const mockFetchData = vi.fn();
    const mockClearError = vi.fn();
    const mockUseCatalog = {
      items: [],
      categories: [],
      isLoading: false,
      error: 'Failed to fetch data',
      fetchData: mockFetchData,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: mockClearError,
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockClearError).toHaveBeenCalled();
    expect(mockFetchData).toHaveBeenCalled();
  });

  test('shows ItemsTable by default', () => {
    const mockItems = [
      {
        id: 1,
        name: 'Test Item',
        type: 'General',
        category_id: 1,
        category_name: 'Food',
        description: 'Test',
        quantity: 10,
        threshold: 5,
        items_per_basket: null,
      },
    ];

    const mockUseCatalog = {
      items: mockItems,
      categories: [{ id: 1, name: 'Food', item_limit: 3 }],
      isLoading: false,
      error: null,
      fetchData: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: vi.fn(),
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  test('switches to Categories tab when clicked', () => {
    const mockCategories = [
      { id: 1, name: 'Food', item_limit: 3 },
      { id: 2, name: 'Hygiene', item_limit: 5 },
    ];

    const mockUseCatalog = {
      items: [],
      categories: mockCategories,
      isLoading: false,
      error: null,
      fetchData: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: vi.fn(),
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    const categoriesTab = screen.getByText('Categories');
    fireEvent.click(categoriesTab);

    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Hygiene')).toBeInTheDocument();
  });

  test('fetches data on mount', () => {
    const mockFetchData = vi.fn();
    const mockUseCatalog = {
      items: [],
      categories: [],
      isLoading: false,
      error: null,
      fetchData: mockFetchData,
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: vi.fn(),
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    expect(mockFetchData).toHaveBeenCalled();
  });

  test('renders with both items and categories', () => {
    const mockItems = [
      {
        id: 1,
        name: 'Apples',
        type: 'General',
        category_id: 1,
        category_name: 'Food',
        description: 'Fresh apples',
        quantity: 50,
        threshold: 10,
        items_per_basket: null,
      },
    ];

    const mockCategories = [
      { id: 1, name: 'Food', item_limit: 3 },
    ];

    const mockUseCatalog = {
      items: mockItems,
      categories: mockCategories,
      isLoading: false,
      error: null,
      fetchData: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      clearError: vi.fn(),
    };

    vi.spyOn(useCatalogModule, 'useCatalog').mockReturnValue(mockUseCatalog);

    render(<Catalog />, { wrapper });

    expect(screen.getByText('Apples')).toBeInTheDocument();

    const categoriesTab = screen.getByText('Categories');
    fireEvent.click(categoriesTab);

    expect(screen.getByText('Food')).toBeInTheDocument();
  });
});
