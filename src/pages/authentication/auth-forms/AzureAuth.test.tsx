import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import AzureAuth from './AzureAuth';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import * as MaterialModule from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Mock external modules
vi.mock('@azure/msal-react');
vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }));

// Mock the entire @mui/material module and manually mock useMediaQuery
vi.mock('@mui/material', async () => {
  const actualMaterial = await vi.importActual<typeof MaterialModule>('@mui/material');
  return {
    ...actualMaterial,
    useMediaQuery: vi.fn(),
  };
});
vi.mock('@mui/material/styles', () => ({
  useTheme: vi.fn(),
}));

describe('AzureAuth', () => {
  const mockLoginPopup = vi.fn();
  const mockSetActiveAccount = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks for MSAL
    (useMsal as ReturnType<typeof vi.fn>).mockReturnValue({
      instance: {
        loginPopup: mockLoginPopup,
        setActiveAccount: mockSetActiveAccount,
      },
    });

    // Setup mock for useNavigate
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);

    // Setup mock for useTheme and useMediaQuery
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      breakpoints: {
        down: vi.fn().mockImplementation((size) => `(max-width:${size})`),
      },
    });
    (MaterialModule.useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(false); // assumes larger screen size
  });

  it('renders login button with correct text', () => {
    render(<AzureAuth />);
    const loginButton = screen.getByTitle('Login with Microsoft');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Microsoft');
  });

  it('navigates to /inventory if user has admin role', async () => {
    mockLoginPopup.mockResolvedValueOnce({
      account: {},
      idTokenClaims: { roles: ['admin'] },
    });

    render(<AzureAuth />);
    const loginButton = screen.getByTitle('Login with Microsoft');
    fireEvent.click(loginButton);

    await screen.findByText('Microsoft'); // Wait for async actions
    expect(mockSetActiveAccount).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/inventory');
  });

  it('navigates to /pick-your-name if user has volunteer role', async () => {
    mockLoginPopup.mockResolvedValueOnce({
      account: {},
      idTokenClaims: { roles: ['volunteer'] },
    });

    render(<AzureAuth />);
    const loginButton = screen.getByTitle('Login with Microsoft');
    fireEvent.click(loginButton);

    await screen.findByText('Microsoft'); // Wait for async actions
    expect(mockSetActiveAccount).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/pick-your-name');
  });

  it('navigates to / if user has no specific role', async () => {
    mockLoginPopup.mockResolvedValueOnce({
      account: {},
      idTokenClaims: { roles: [] },
    });

    render(<AzureAuth />);
    const loginButton = screen.getByTitle('Login with Microsoft');
    fireEvent.click(loginButton);

    await screen.findByText('Microsoft'); // Wait for async actions
    expect(mockSetActiveAccount).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('logs an error message if login fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorMessage = 'Login failed';
    mockLoginPopup.mockRejectedValueOnce(new Error(errorMessage));

    render(<AzureAuth />);
    const loginButton = screen.getByTitle('Login with Microsoft');
    fireEvent.click(loginButton);

    await screen.findByText('Microsoft'); // Wait for async actions
    expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', new Error(errorMessage));
    consoleErrorSpy.mockRestore();
  });
});
