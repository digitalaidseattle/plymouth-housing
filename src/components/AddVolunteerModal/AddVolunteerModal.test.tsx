import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AddVolunteerModal from './AddVolunteerModal';
import { UserContext } from '../contexts/UserContext';
import * as userService from '../../services/userService';

vi.mock('../../services/userService');

const mockUser = {
  userID: '1',
  userDetails: 'Admin User',
  userRoles: ['admin'],
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserContext.Provider
    value={{
      user: mockUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false,
    }}
  >
    {children}
  </UserContext.Provider>
);

describe('AddVolunteerModal', () => {
  const mockHandleAddClose = vi.fn();
  const mockFetchData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillFormAndSubmit = () => {
    fireEvent.change(screen.getByPlaceholderText('Enter name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter 4-digit PIN'), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
  };

  const renderModal = () => {
    render(
      <Wrapper>
        <AddVolunteerModal
          addModal={true}
          handleAddClose={mockHandleAddClose}
          fetchData={mockFetchData}
        />
      </Wrapper>,
    );
  };

  const mockErrorWithStatus = (message: string, status: number) => {
    const error = new Error(message) as Error & { status: number };
    error.status = status;
    vi.spyOn(userService, 'createUser').mockRejectedValue(error);
  };

  test('shows duplicate volunteer message on 409 Conflict', async () => {
    mockErrorWithStatus('Failed to fetch data: Conflict', 409);
    renderModal();
    fillFormAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(
          'A volunteer with this name or email already exists. Please check the People page for the existing volunteer.',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows permission error on 401 Unauthorized', async () => {
    mockErrorWithStatus('Failed to fetch data: Unauthorized', 401);
    renderModal();
    fillFormAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(
          'You do not have permission to add volunteers. Please log out and log back in, or contact an admin.',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows permission error on 403 Forbidden', async () => {
    mockErrorWithStatus('Failed to fetch data: Forbidden', 403);
    renderModal();
    fillFormAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(
          'You do not have permission to add volunteers. Please log out and log back in, or contact an admin.',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows server unavailable message on 500 error', async () => {
    mockErrorWithStatus('Failed to fetch data: Internal Server Error', 500);
    renderModal();
    fillFormAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(
          'The server is currently unavailable. Please wait a moment and try again.',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows connection error when no status code (network failure)', async () => {
    vi.spyOn(userService, 'createUser').mockRejectedValue(
      new Error('Failed to fetch'),
    );
    renderModal();
    fillFormAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Unable to connect to the server. Please check your internet connection and try again.',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows generic fallback message for unexpected status codes', async () => {
    mockErrorWithStatus('Failed to fetch data: I\'m a teapot', 418);
    renderModal();
    fillFormAndSubmit();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Something went wrong while adding the volunteer. Please try again.',
        ),
      ).toBeInTheDocument();
    });
  });
});
