import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import WelcomeBasketBuildingDialog from './WelcomeBasketBuildingDialog';
import { UserContext } from '../contexts/UserContext';
import * as CheckoutAPICalls from './CheckoutAPICalls';

// Mock the CheckoutAPICalls module
vi.mock('./CheckoutAPICalls', () => ({
  getUnitNumbers: vi.fn(),
  getResidents: vi.fn(),
  findResident: vi.fn(),
  addResident: vi.fn(),
}));

describe('WelcomeBasketBuildingDialog', () => {
  const mockUser = {
    id: 1,
    userDetails: 'Test User',
    userRoles: ['volunteer'],
    userID: 'testuser'
  };

  const mockUserContext = {
    user: mockUser,
    setUser: vi.fn(),
    loggedInUserId: null,
    setLoggedInUserId: vi.fn(),
    activeVolunteers: [],
    setActiveVolunteers: vi.fn(),
    isLoading: false,
  };

  const mockBuildings = [
    { id: 1, name: 'Building A', code: 'A' },
    { id: 2, name: 'Building B', code: 'B' },
  ];

  const mockWelcomeUnits = [
    { id: 1, unit_number: 'welcome' },
    { id: 2, unit_number: '101' },
  ];

  const mockAdminResidents = {
    value: [
      { id: 100, name: 'admin' },
      { name: 'Other Resident' },
    ],
  };

  const defaultProps = {
    showDialog: true,
    handleShowDialog: vi.fn(),
    buildings: mockBuildings,
    setResidentInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.cursor = 'default';
  });

  const renderComponent = (props = {}) => {
    return render(
      <UserContext.Provider value={mockUserContext}>
        <WelcomeBasketBuildingDialog {...defaultProps} {...props} />
      </UserContext.Provider>
    );
  };

  describe('Rendering', () => {
    test('renders dialog when showDialog is true', () => {
      renderComponent();
      expect(screen.getByText('provide building code to continue')).toBeInTheDocument();
      expect(screen.getByLabelText('Building Code')).toBeInTheDocument();
    });

    test('does not render dialog when showDialog is false', () => {
      renderComponent({ showDialog: false });
      expect(screen.queryByText('provide building code to continue')).not.toBeInTheDocument();
    });

    test('only shows Building Code field', () => {
      renderComponent();
      expect(screen.getByLabelText('Building Code')).toBeInTheDocument();
      expect(screen.queryByLabelText('Unit Number')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Resident Name')).not.toBeInTheDocument();
    });

    test('renders continue button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  describe('Building Selection', () => {
    test('validates only building is required', async () => {
      renderComponent();

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const buildingInput = screen.getByLabelText('Building Code');
        expect(buildingInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    test('shows error when no building is selected', async () => {
      renderComponent();

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Please select a building/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Success Cases', () => {
    test('submits successfully with existing admin resident', async () => {
      const handleShowDialog = vi.fn();
      const setResidentInfo = vi.fn();
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;
      const findResidentMock = CheckoutAPICalls.findResident as Mock;

      getUnitNumbersMock.mockResolvedValue(mockWelcomeUnits);
      getResidentsMock.mockResolvedValue(mockAdminResidents);
      findResidentMock.mockResolvedValue({ value: [{ id: 100, name: 'admin' }] });

      renderComponent({
        handleShowDialog,
        setResidentInfo,
      });

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(getUnitNumbersMock).toHaveBeenCalledWith(mockUser, 1);
        expect(getResidentsMock).toHaveBeenCalledWith(mockUser, 1);
      });

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith({
          id: 100,
          name: 'admin',
          unit: mockWelcomeUnits[0],
          building: mockBuildings[0],
        });
        expect(handleShowDialog).toHaveBeenCalled();
      });
    });

    test('creates admin resident if it does not exist', async () => {
      const handleShowDialog = vi.fn();
      const setResidentInfo = vi.fn();
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;
      const findResidentMock = CheckoutAPICalls.findResident as Mock;
      const addResidentMock = CheckoutAPICalls.addResident as Mock;

      getUnitNumbersMock.mockResolvedValue(mockWelcomeUnits);
      getResidentsMock.mockResolvedValue({ value: [{ name: 'Other Resident' }] });
      findResidentMock.mockResolvedValue({ value: [] });
      addResidentMock.mockResolvedValue({ value: [{ id: 200, name: 'admin' }] });

      renderComponent({
        handleShowDialog,
        setResidentInfo,
      });

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(findResidentMock).toHaveBeenCalledWith(mockUser, 'admin', 1);
        expect(addResidentMock).toHaveBeenCalledWith(mockUser, 'admin', 1);
      });

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith({
          id: 200,
          name: 'admin',
          unit: mockWelcomeUnits[0],
          building: mockBuildings[0],
        });
        expect(handleShowDialog).toHaveBeenCalled();
      });
    });

    test('uses existing admin if findResident returns it', async () => {
      const handleShowDialog = vi.fn();
      const setResidentInfo = vi.fn();
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;
      const findResidentMock = CheckoutAPICalls.findResident as Mock;
      const addResidentMock = CheckoutAPICalls.addResident as Mock;

      getUnitNumbersMock.mockResolvedValue(mockWelcomeUnits);
      getResidentsMock.mockResolvedValue({ value: [{ name: 'Other Resident' }] });
      findResidentMock.mockResolvedValue({ value: [{ id: 150, name: 'admin' }] });

      renderComponent({
        handleShowDialog,
        setResidentInfo,
      });

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(findResidentMock).toHaveBeenCalledWith(mockUser, 'admin', 1);
        expect(addResidentMock).not.toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith({
          id: 150,
          name: 'admin',
          unit: mockWelcomeUnits[0],
          building: mockBuildings[0],
        });
      });
    });
  });

  describe('Form Submission - Error Cases', () => {
    test('shows error when no welcome unit exists for selected building', async () => {
      const unitsWithoutWelcome = [
        { id: 2, unit_number: '101' },
        { id: 3, unit_number: '102' },
      ];
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      getUnitNumbersMock.mockResolvedValue(unitsWithoutWelcome);

      renderComponent();

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/No welcome unit found for this building/i)).toBeInTheDocument();
      });
    });

    test('prevents submission when no welcome unit exists', async () => {
      const unitsWithoutWelcome = [
        { id: 2, unit_number: '101' },
        { id: 3, unit_number: '102' },
      ];
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;
      const handleShowDialog = vi.fn();

      getUnitNumbersMock.mockResolvedValue(unitsWithoutWelcome);

      renderComponent({
        handleShowDialog,
      });

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(getUnitNumbersMock).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(getResidentsMock).not.toHaveBeenCalled();
        expect(handleShowDialog).not.toHaveBeenCalled();
      });
    });

    test('shows error message when unit fetch fails', async () => {
      const error = new TypeError('Failed to fetch');
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      getUnitNumbersMock.mockRejectedValue(error);

      renderComponent();

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Unable to connect/i)).toBeInTheDocument();
      });
    });

    test('shows error message when resident fetch fails', async () => {
      const error = new TypeError('Failed to fetch');
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;

      getUnitNumbersMock.mockResolvedValue(mockWelcomeUnits);
      getResidentsMock.mockRejectedValue(error);

      renderComponent();

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Unable to connect/i)).toBeInTheDocument();
      });
    });

    test('shows generic error message for non-network errors', async () => {
      const error = new Error('Server error');
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      getUnitNumbersMock.mockRejectedValue(error);

      renderComponent();

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/An error occurred while submitting/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows wait cursor while submitting', async () => {
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;

      getUnitNumbersMock.mockImplementation(() => {
        expect(document.body.style.cursor).toBe('wait');
        return new Promise(resolve => setTimeout(() => resolve(mockWelcomeUnits), 100));
      });
      getResidentsMock.mockResolvedValue(mockAdminResidents);

      renderComponent();

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(document.body.style.cursor).toBe('default');
      });
    });

    test('disables building field while submitting', async () => {
      const getUnitNumbersMock = CheckoutAPICalls.getUnitNumbers as Mock;
      const getResidentsMock = CheckoutAPICalls.getResidents as Mock;
      const findResidentMock = CheckoutAPICalls.findResident as Mock;

      getUnitNumbersMock.mockResolvedValue(mockWelcomeUnits);
      getResidentsMock.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(mockAdminResidents), 200));
      });
      findResidentMock.mockResolvedValue({ value: [{ id: 100 }] });

      renderComponent();

      const buildingSelect = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingSelect);
      const buildingOption = await screen.findByRole('option', { name: /A \(Building A\)/i });
      fireEvent.click(buildingOption);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const buildingInput = screen.getByTestId('test-id-select-building').querySelector('input');
        expect(buildingInput).toBeDisabled();
        expect(continueButton).toBeDisabled();
      });
    });
  });

});
