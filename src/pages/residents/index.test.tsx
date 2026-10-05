/**
 *  index.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ResidentsPage from './index';
import { UserContext } from '../../components/contexts/UserContext';
import React from 'react';

vi.mock('../../services/residentService', () => ({
  getBuildings: vi.fn().mockResolvedValue([
    { id: 1, name: 'Alpha House', code: 'AH' },
    { id: 2, name: 'Beta House', code: 'BH' },
  ]),
  getAllResidents: vi.fn().mockResolvedValue([]),
}));

vi.mock('./useResidentsByBuilding', () => ({
  useResidentsByBuilding: vi.fn(),
}));

vi.mock('./ResidentEditDialog', () => ({
  default: ({
    showDialog,
    resident,
    onCancel,
    onSave,
  }: {
    showDialog: boolean;
    resident: {
      id: number;
      name: string;
      unit: { id: number; unit_number: string };
      building: { id: number; name: string; code: string };
    } | null;
    onCancel: () => void;
    onSave: (
      name: string,
      building: { id: number; name: string; code: string },
      unit: { id: number; unit_number: string },
    ) => Promise<void>;
  }) =>
    showDialog && resident ? (
      <div role="dialog">
        <div>Mock Edit Resident Dialog</div>
        <div>{resident.name}</div>
        <button
          onClick={() =>
            onSave('Alice Smyth', resident.building, {
              id: 20,
              unit_number: '202',
            })
          }
        >
          Save
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

import * as residentService from '../../services/residentService';
import { useResidentsByBuilding } from './useResidentsByBuilding';

const mockHook = vi.mocked(useResidentsByBuilding);

const dummyUser = {
  userId: '1',
  userDetails: 'Test',
  userRoles: ['admin'],
  claims: [],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserContext.Provider
    value={{
      user: dummyUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false,
      pinVerified: false,
      setPinVerifiedForUserId: vi.fn(),
    }}
  >
    {children}
  </UserContext.Provider>
);

const buildingData = [
  {
    unit: { id: 10, unit_number: '101' },
    residents: [{ id: 1, name: 'Alice Smith' }],
  },
  {
    unit: { id: 20, unit_number: '202' },
    residents: [
      { id: 2, name: 'Bob Jones' },
      { id: 3, name: 'Carol Jones' },
    ],
  },
  {
    unit: { id: 30, unit_number: '303' },
    residents: [],
  },
];

const selectBuilding = (name: string) => {
  fireEvent.mouseDown(screen.getByLabelText('Building'));
  fireEvent.click(screen.getByRole('option', { name }));
};

describe('ResidentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHook.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      updateResidentName: vi.fn(),
    });
  });

  test('renders building dropdown', async () => {
    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Building')).toBeInTheDocument();
    });
  });

  test('loads buildings on mount', async () => {
    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(residentService.getBuildings).toHaveBeenCalled();
    });
  });

  test('shows unit and resident rows after building data loads', async () => {
    mockHook.mockReturnValue({
      data: buildingData,
      isLoading: false,
      error: null,
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('Carol Jones')).toBeInTheDocument();
    });
  });

  test('shows dash for units with no residents', async () => {
    mockHook.mockReturnValue({
      data: buildingData,
      isLoading: false,
      error: null,
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('303')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  test('shows loading spinner while fetching', () => {
    mockHook.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error snackbar when hook reports an error', async () => {
    mockHook.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Failed to load residents',
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to load residents',
      );
    });
  });

  test('renders all units when data is loaded', async () => {
    mockHook.mockReturnValue({
      data: buildingData,
      isLoading: false,
      error: null,
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('202')).toBeInTheDocument();
      expect(screen.getByText('303')).toBeInTheDocument();
    });
  });

  test('opens the edit dialog for a resident', async () => {
    mockHook.mockReturnValue({
      data: buildingData,
      isLoading: false,
      error: null,
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => screen.getByText('Alice Smith'));

    selectBuilding('AH — Alpha House');

    fireEvent.click(screen.getByLabelText('Edit Alice Smith'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Alice Smith');
  });

  test('saves a resident with the selected unit', async () => {
    const updateResidentName = vi.fn().mockResolvedValue(undefined);

    mockHook.mockReturnValue({
      data: buildingData,
      isLoading: false,
      error: null,
      updateResidentName,
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => screen.getByText('Alice Smith'));

    selectBuilding('AH — Alpha House');

    fireEvent.click(screen.getByLabelText('Edit Alice Smith'));

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateResidentName).toHaveBeenCalledWith(1, 'Alice Smyth', 20);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Resident updated.');
  });

  test('closes the edit dialog when cancelled', async () => {
    mockHook.mockReturnValue({
      data: buildingData,
      isLoading: false,
      error: null,
      updateResidentName: vi.fn(),
    });

    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => screen.getByText('Alice Smith'));

    selectBuilding('AH — Alpha House');

    fireEvent.click(screen.getByLabelText('Edit Alice Smith'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders search input alongside building dropdown', async () => {
    render(
      <Wrapper>
        <ResidentsPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Search resident by name…'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Building')).toBeInTheDocument();
    });
  });
});
