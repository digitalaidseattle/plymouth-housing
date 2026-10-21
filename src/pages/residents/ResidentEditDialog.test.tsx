/**
 *  ResidentEditDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import ResidentEditDialog from './ResidentEditDialog';
import { Building, Unit } from '../../types/interfaces';
import { UserContext } from '../../components/contexts/UserContext';
import * as residentService from '../../services/residentService';

vi.mock('../../services/residentService', async () => {
  const actual = await vi.importActual<
    typeof import('../../services/residentService')
  >('../../services/residentService');

  return {
    ...actual,
    getUnitNumbers: vi.fn(),
  };
});

describe('ResidentEditDialog', () => {
  const mockUser = {
    id: 1,
    userDetails: 'Test User',
    userRoles: ['admin'],
    userId: 'testuser',
  };

  const mockUserContext = {
    user: mockUser,
    setUser: vi.fn(),
    loggedInUserId: null,
    setLoggedInUserId: vi.fn(),
    activeVolunteers: [],
    setActiveVolunteers: vi.fn(),
    isLoading: false,
    pinVerified: false,
    setPinVerifiedForUserId: vi.fn(),
  };

  const mockBuildings: Building[] = [
    { id: 1, name: 'Building A', code: 'A' },
    { id: 2, name: 'Building B', code: 'B' },
  ];

  const mockUnitsA: Unit[] = [
    { id: 10, unit_number: '101' },
    { id: 11, unit_number: '102' },
  ];

  const mockUnitsB: Unit[] = [
    { id: 20, unit_number: '201' },
    { id: 21, unit_number: '202' },
  ];

  const mockResident = {
    id: 1,
    name: 'Alice',
    building: mockBuildings[0],
    unit: mockUnitsA[0],
  };

  const defaultProps = {
    showDialog: true,
    resident: mockResident,
    buildings: mockBuildings,
    onCancel: vi.fn(),
    onSave: vi.fn(),
  };

  const waitForInitialUnits = async () => {
    await waitFor(() => {
      expect(residentService.getUnitNumbers).toHaveBeenCalledWith(
        mockUser,
        1,
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Name/i })).not.toBeDisabled();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.cursor = 'default';

    const getUnitNumbersMock = residentService.getUnitNumbers as Mock;
    getUnitNumbersMock.mockImplementation(
      async (_user, buildingId) => {
        return buildingId === 1 ? mockUnitsA : mockUnitsB;
      },
    );
  });

  const renderComponent = (props = {}) => {
    return render(
      <UserContext.Provider value={mockUserContext}>
        <ResidentEditDialog {...defaultProps} {...props} />
      </UserContext.Provider>,
    );
  };

  describe('Rendering', () => {
    test('renders resident information and current location', async () => {
      renderComponent();

      expect(
        screen.getByRole('heading', { name: 'Edit Resident' }),
      ).toBeInTheDocument();

      expect(screen.getByRole('textbox', { name: /Name/i })).toHaveValue('Alice');

      expect(
        screen.getByText('Current location: A · Unit 101'),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(residentService.getUnitNumbers).toHaveBeenCalledWith(
          mockUser,
          1,
        );
      });
    });

    test('renders building and unit fields', async () => {
      renderComponent();

      const comboboxes = screen.getAllByRole('combobox');

      expect(comboboxes).toHaveLength(2);
      expect(comboboxes[0]).toBeInTheDocument();
      expect(comboboxes[1]).toBeInTheDocument();

      await waitFor(() => {
        expect(residentService.getUnitNumbers).toHaveBeenCalledWith(
          mockUser,
          1,
        );
      });
    });
  });

  describe('Building Selection', () => {
    test('loads units for the selected building', async () => {
      renderComponent();

      await waitFor(() => {
        expect(residentService.getUnitNumbers).toHaveBeenCalledWith(
          mockUser,
          1,
        );
      });

      const buildingSelect = screen.getByLabelText('Building');
      fireEvent.mouseDown(buildingSelect);

      const buildingOption = await screen.findByRole('option', {
        name: /B \(Building B\)/i,
      });

      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(residentService.getUnitNumbers).toHaveBeenCalledWith(
          mockUser,
          2,
        );
      });
    });
  });

  describe('Editing', () => {
    test('allows the resident name to be edited', async () => {
        renderComponent();

        await waitForInitialUnits();

        const nameInput = screen.getByRole('textbox', { name: /Name/i });

        fireEvent.change(nameInput, {
          target: { value: 'Alicia' },
        });

        expect(nameInput).toHaveValue('Alicia');
      });

    test('allows the resident unit to be edited', async () => {
      renderComponent();

      await waitForInitialUnits();

      const unitInput = screen.getAllByRole('combobox')[1];

      fireEvent.mouseDown(unitInput);

      const unitOption = await screen.findByRole('option', {
        name: '102',
      });

      fireEvent.click(unitOption);

      expect(unitInput).toHaveValue('102');
    });

    test('calls onSave with the edited resident information', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      renderComponent({ onSave });

      await waitForInitialUnits();

      const nameInput = screen.getByRole('textbox', { name: /Name/i });

      fireEvent.change(nameInput, {
        target: { value: 'Alicia' },
      });

      const unitInput = screen.getAllByRole('combobox')[1];

      fireEvent.mouseDown(unitInput);

      const unitOption = await screen.findByRole('option', {
        name: '102',
      });

      fireEvent.click(unitOption);

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          'Alicia',
          mockBuildings[0],
          mockUnitsA[1],
        );
      });
    });
  });

  describe('Validation', () => {
    test('does not save when the name is empty', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);

      renderComponent({ onSave });

      await waitForInitialUnits();

      const nameInput = screen.getByRole('textbox', { name: /Name/i });

      fireEvent.change(nameInput, {
        target: { value: '' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('Cancel', () => {
    test('calls onCancel when the dialog is closed', () => {
      const onCancel = vi.fn();

      renderComponent({ onCancel });

      fireEvent.click(
        screen.getByRole('button', { name: 'Close dialog' }),
      );

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Saving State', () => {
    test('disables the form while saving', () => {
      renderComponent({ isSaving: true });

      expect(
        screen.getByRole('textbox', { name: /Name/i }),
      ).toBeDisabled();

      expect(screen.getAllByRole('combobox')[0]).toBeDisabled();
      expect(screen.getAllByRole('combobox')[1]).toBeDisabled();

      expect(
        screen.getByRole('button', { name: 'Save' }),
      ).toBeDisabled();
    });
  });
});
