import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import ResidentDetailDialog from './ResidentDetailDialog';
import { UserContext } from '../contexts/UserContext';
import * as CheckoutAPICalls from './CheckoutAPICalls';

// Mock the CheckoutAPICalls module
vi.mock('./CheckoutAPICalls', () => ({
  getUnitNumbers: vi.fn(),
  getResidents: vi.fn(),
  findResident: vi.fn(),
  addResident: vi.fn(),
  getLastResidentVisit: vi.fn(),
}));

describe('ResidentDetailDialog', () => {
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

  const mockUnits = [
    { id: 1, unit_number: '101' },
    { id: 2, unit_number: '102' },
    { id: 3, unit_number: '103' },
  ];

  const mockResidents = {
    value: [
      { name: 'John Doe' },
      { name: 'Jane Smith' },
    ],
  };

  const defaultProps = {
    showDialog: true,
    handleShowDialog: vi.fn(),
    buildings: mockBuildings,
    unitNumberValues: [],
    setUnitNumberValues: vi.fn(),
    residentInfo: {
      id: 0,
      name: '',
      unit: { id: 0, unit_number: '' },
      building: { id: 0, name: '', code: '' },
    },
    setResidentInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset cursor
    document.body.style.cursor = 'default';
  });

  const renderComponent = (props = {}) => {
    return render(
      <UserContext.Provider value={mockUserContext}>
        <ResidentDetailDialog {...defaultProps} {...props} />
      </UserContext.Provider>
    );
  };

  describe('Rendering', () => {
    test('renders dialog when showDialog is true', () => {
      renderComponent();
      expect(screen.getByText('provide details to continue')).toBeInTheDocument();
      expect(screen.getByLabelText('Building Code')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Resident Name')).toBeInTheDocument();
    });

    test('does not render dialog when showDialog is false', () => {
      renderComponent({ showDialog: false });
      expect(screen.queryByText('provide details to continue')).not.toBeInTheDocument();
    });

    test('renders continue button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  describe('Building Selection', () => {
    test('fetches unit numbers when building is selected', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);

      renderComponent();

      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);

      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalledWith(mockUser, 1);
      });
    });

    test('shows wait cursor while fetching units', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockImplementation(() => {
        expect(document.body.style.cursor).toBe('wait');
        return new Promise(resolve => setTimeout(() => resolve(mockUnits), 100));
      });

      renderComponent();

      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);

      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(document.body.style.cursor).toBe('default');
      });
    });

    test('shows error message when unit fetch fails', async () => {
      const error = new TypeError('Failed to fetch');
      (CheckoutAPICalls.getUnitNumbers as Mock).mockRejectedValue(error);

      renderComponent();

      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);

      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load unit numbers/i)).toBeInTheDocument();
      });
    });

    test('disables all fields while fetching units', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(mockUnits), 100));
      });

      renderComponent();

      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);

      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      // Fields should be disabled during loading
      await waitFor(() => {
        expect(screen.getByLabelText('Unit Number')).toBeDisabled();
        expect(screen.getByLabelText('Resident Name')).toBeDisabled();
      });

      // Fields should be enabled after loading
      await waitFor(() => {
        expect(screen.getByLabelText('Unit Number')).not.toBeDisabled();
        expect(screen.getByLabelText('Resident Name')).not.toBeDisabled();
      });
    });
  });

  describe('Unit Selection', () => {
    test('fetches residents when unit is selected', async () => {
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidents);

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalledWith(mockUser, 1);
      });
    });

    test('populates resident name with last resident when unit is selected', async () => {
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidents);

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('Jane Smith');
      });
    });

    test('shows wait cursor while fetching residents', async () => {
      (CheckoutAPICalls.getResidents as Mock).mockImplementation(() => {
        expect(document.body.style.cursor).toBe('wait');
        return new Promise(resolve => setTimeout(() => resolve(mockResidents), 100));
      });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(document.body.style.cursor).toBe('default');
      });
    });

    test('shows error message when resident fetch fails', async () => {
      const error = new TypeError('Failed to fetch');
      (CheckoutAPICalls.getResidents as Mock).mockRejectedValue(error);

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByText(/Unable to load resident data/i)).toBeInTheDocument();
      });
    });

    test('disables all fields while fetching residents', async () => {
      (CheckoutAPICalls.getResidents as Mock).mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(mockResidents), 100));
      });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      // Fields should be disabled during loading
      await waitFor(() => {
        expect(screen.getByLabelText('Building Code')).toBeDisabled();
        expect(screen.getByLabelText('Resident Name')).toBeDisabled();
      });

      // Fields should be enabled after loading
      await waitFor(() => {
        expect(screen.getByLabelText('Building Code')).not.toBeDisabled();
        expect(screen.getByLabelText('Resident Name')).not.toBeDisabled();
      });
    });

    test('clears residents when unit is cleared', async () => {
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidents);

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      // First select a unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('Jane Smith');
      });

      // Then clear the unit
      fireEvent.change(unitInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('');
      });
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors when form is submitted empty', async () => {
      renderComponent();

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Please select a building/i)).toBeInTheDocument();
        expect(screen.getByText(/Please select a unit from the list/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter the resident's name/i)).toBeInTheDocument();
      });
    });

    test('does not submit form when validation fails', async () => {
      (CheckoutAPICalls.findResident as Mock).mockResolvedValue({ value: [] });

      renderComponent();

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(CheckoutAPICalls.findResident).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    test('submits form with existing resident', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({
        value: [{ id: 1, name: 'John Doe' }],
      });
      (CheckoutAPICalls.getLastResidentVisit as Mock).mockResolvedValue({
        value: [{ transaction_date: '2025-01-15T10:30:00' }]
      });
      (CheckoutAPICalls.findResident as Mock).mockResolvedValue({
        value: [{ id: 5, name: 'John Doe' }],
      });

      const setResidentInfo = vi.fn();
      const handleShowDialog = vi.fn();

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
        setResidentInfo,
        handleShowDialog,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      // Wait for units to load
      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      // Wait for residents to load
      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Wait for resident name to be populated
      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('John Doe');
      });

      // Submit form
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(CheckoutAPICalls.findResident).toHaveBeenCalledWith(
          mockUser,
          'John Doe',
          1
        );
      });

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 5,
            name: 'John Doe',
            lastVisitDate: '2025-01-15T10:30:00'
          })
        );
        expect(handleShowDialog).toHaveBeenCalled();
      });
    });

    test('submits form with new resident', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({ value: [] });
      (CheckoutAPICalls.findResident as Mock).mockResolvedValue({ value: [] });
      (CheckoutAPICalls.addResident as Mock).mockResolvedValue({
        value: [{ id: 10, name: 'New Resident' }],
      });

      const setResidentInfo = vi.fn();
      const handleShowDialog = vi.fn();

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
        setResidentInfo,
        handleShowDialog,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      // Wait for units to load
      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      // Wait for residents to load (empty in this case)
      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Enter new resident name
      const nameInput = screen.getByLabelText('Resident Name');
      fireEvent.change(nameInput, { target: { value: 'New Resident' } });

      // Submit form
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(CheckoutAPICalls.findResident).toHaveBeenCalledWith(
          mockUser,
          'New Resident',
          1
        );
      });

      await waitFor(() => {
        expect(CheckoutAPICalls.addResident).toHaveBeenCalledWith(
          mockUser,
          'New Resident',
          1
        );
      });

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 10,
            name: 'New Resident',
          })
        );
        expect(handleShowDialog).toHaveBeenCalled();
      });
    });

    test('shows wait cursor while submitting', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({
        value: [{ name: 'John Doe' }],
      });
      (CheckoutAPICalls.findResident as Mock).mockImplementation(() => {
        expect(document.body.style.cursor).toBe('wait');
        return new Promise(resolve =>
          setTimeout(() => resolve({ value: [{ id: 5 }] }), 100)
        );
      });

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Wait for resident name to be populated
      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('John Doe');
      });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(document.body.style.cursor).toBe('default');
      });
    });

    test('shows error message when submission fails with network error', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({
        value: [{ name: 'John Doe' }],
      });
      const error = new TypeError('Failed to fetch');
      (CheckoutAPICalls.findResident as Mock).mockRejectedValue(error);

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Wait for resident name to be populated
      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('John Doe');
      });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Your system appears to be offline/i)).toBeInTheDocument();
      });
    });

    test('shows error message when submission fails with other error', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({
        value: [{ name: 'John Doe' }],
      });
      (CheckoutAPICalls.findResident as Mock).mockRejectedValue(new Error('Server error'));

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Wait for resident name to be populated
      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('John Doe');
      });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/An error occurred while submitting/i)).toBeInTheDocument();
      });
    });

    test('disables all fields while submitting', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({
        value: [{ name: 'John Doe' }],
      });
      (CheckoutAPICalls.findResident as Mock).mockImplementation(() => {
        return new Promise(resolve =>
          setTimeout(() => resolve({ value: [{ id: 5 }] }), 200)
        );
      });

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByTestId('test-id-select-unit-number').querySelector('input');
      if (unitInput) {
        fireEvent.change(unitInput, { target: { value: '101' } });
      }

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Wait for resident name to be populated
      await waitFor(() => {
        const residentInput = screen.getByLabelText('Resident Name');
        expect(residentInput).toHaveValue('John Doe');
      });

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      // Fields should be disabled during submission
      // Use querySelector to avoid ambiguity with autocomplete dropdowns
      await waitFor(() => {
        const buildingInputElement = screen.getByTestId('test-id-select-building').querySelector('input');
        const unitInputElement = screen.getByTestId('test-id-select-unit-number').querySelector('input');
        const residentInputElement = screen.getByLabelText('Resident Name');

        expect(buildingInputElement).toBeDisabled();
        expect(unitInputElement).toBeDisabled();
        expect(residentInputElement).toBeDisabled();
        expect(continueButton).toBeDisabled();
      });
    });

    test('clears API error when starting new submission', async () => {
      // First, cause an error by selecting a building
      (CheckoutAPICalls.getUnitNumbers as Mock).mockRejectedValue(new TypeError('Failed to fetch'));

      renderComponent();

      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);

      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(screen.getByText(/Unable to load unit numbers/i)).toBeInTheDocument();
      });

      // Now set up the form with complete data and mock successful API calls
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({ value: [] });
      (CheckoutAPICalls.findResident as Mock).mockResolvedValue({ value: [{ id: 5 }] });

      // Manually fill in the rest of the form
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      const nameInput = screen.getByLabelText('Resident Name');
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });

      // Click continue - error should be cleared before submission attempt
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      // The old error should disappear once we start the submission
      // (even though submission will fail due to validation)
      await waitFor(() => {
        expect(screen.queryByText(/Unable to load unit numbers/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Unit Helper Text', () => {
    test('shows "Not a valid unit" when invalid unit is entered', async () => {
      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '999' } });

      // Trigger validation by trying to submit
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText(/Not a valid unit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Last Visit Date Features', () => {
    test('fetches and displays last visit dates for residents when unit is selected', async () => {
      const mockResidentsWithIds = {
        value: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock)
        .mockResolvedValueOnce({ value: [{ transaction_date: '2025-01-15T10:30:00' }] })
        .mockResolvedValueOnce({ value: [] });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getLastResidentVisit).toHaveBeenCalledWith(mockUser, 1);
        expect(CheckoutAPICalls.getLastResidentVisit).toHaveBeenCalledWith(mockUser, 2);
      });
    });

    test('displays last visit date in autocomplete dropdown options', async () => {
      const mockResidentsWithIds = {
        value: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock)
        .mockResolvedValueOnce({ value: [{ transaction_date: '2025-01-15T10:30:00' }] })
        .mockResolvedValueOnce({ value: [] });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Open the autocomplete dropdown
      const nameInput = screen.getByLabelText('Resident Name');
      fireEvent.mouseDown(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/John Doe - Last visit: 1\/15\/2025/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith - Last visit: No previous visits/i)).toBeInTheDocument();
      });
    });

    test('displays last visit date below resident name field when resident selected', async () => {
      const mockResidentsWithIds = {
        value: [{ id: 1, name: 'John Doe' }]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock).mockResolvedValue({
        value: [{ transaction_date: '2025-01-15T10:30:00' }]
      });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByText(/last visit: 1\/15\/2025/i)).toBeInTheDocument();
      });
    });

    test('displays "none" when resident has no previous visits', async () => {
      const mockResidentsWithIds = {
        value: [{ id: 1, name: 'John Doe' }]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock).mockResolvedValue({ value: [] });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByText(/last visit: none/i)).toBeInTheDocument();
      });
    });

    test('updates last visit date when different resident is selected', async () => {
      const mockResidentsWithIds = {
        value: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock)
        .mockResolvedValueOnce({ value: [{ transaction_date: '2025-01-15T10:30:00' }] })
        .mockResolvedValueOnce({ value: [{ transaction_date: '2025-02-01T14:20:00' }] });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      // Wait for residents to load - should show Jane's date (last resident)
      await waitFor(() => {
        expect(screen.getByText(/last visit: 2\/1\/2025/i)).toBeInTheDocument();
      });

      // Open autocomplete and select John
      const nameInput = screen.getByLabelText('Resident Name');
      fireEvent.mouseDown(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/John Doe - Last visit:/i)).toBeInTheDocument();
      });

      const johnOption = screen.getByText(/John Doe - Last visit:/i);
      fireEvent.click(johnOption);

      // Should now show John's date
      await waitFor(() => {
        expect(screen.getByText(/last visit: 1\/15\/2025/i)).toBeInTheDocument();
      });
    });

    test('clears last visit date when new resident name is entered via autocomplete', async () => {
      const mockResidentsWithIds = {
        value: [{ id: 1, name: 'John Doe' }]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock).mockResolvedValue({
        value: [{ transaction_date: '2025-01-15T10:30:00' }]
      });

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByText(/last visit: 1\/15\/2025/i)).toBeInTheDocument();
      });

      // Clear the autocomplete by clicking the clear button
      const nameInput = screen.getByLabelText('Resident Name');
      const autocomplete = nameInput.closest('.MuiAutocomplete-root');
      const clearButton = autocomplete?.querySelector('.MuiAutocomplete-clearIndicator');

      expect(clearButton).toBeTruthy();
      fireEvent.click(clearButton!);

      await waitFor(() => {
        expect(screen.queryByText(/last visit: 1\/15\/2025/i)).not.toBeInTheDocument();
      });
    });

    test('continues gracefully when last visit fetch fails', async () => {
      const mockResidentsWithIds = {
        value: [{ id: 1, name: 'John Doe' }]
      };

      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock).mockRejectedValue(new Error('Network error'));

      const propsWithUnits = {
        ...defaultProps,
        unitNumberValues: mockUnits,
      };

      renderComponent(propsWithUnits);

      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('John Doe');
        expect(screen.getByText(/last visit: none/i)).toBeInTheDocument();
      });
    });

    test('passes lastVisitDate to parent when submitting with existing resident', async () => {
      const mockResidentsWithIds = {
        value: [{ id: 1, name: 'John Doe' }]
      };

      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue(mockResidentsWithIds);
      (CheckoutAPICalls.getLastResidentVisit as Mock).mockResolvedValue({
        value: [{ transaction_date: '2025-01-15T10:30:00' }]
      });
      (CheckoutAPICalls.findResident as Mock).mockResolvedValue({
        value: [{ id: 5, name: 'John Doe' }],
      });

      const setResidentInfo = vi.fn();
      const handleShowDialog = vi.fn();

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
        setResidentInfo,
        handleShowDialog,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Resident Name')).toHaveValue('John Doe');
      });

      // Submit form
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 5,
            name: 'John Doe',
            lastVisitDate: '2025-01-15T10:30:00'
          })
        );
        expect(handleShowDialog).toHaveBeenCalled();
      });
    });

    test('passes null lastVisitDate when submitting new resident', async () => {
      (CheckoutAPICalls.getUnitNumbers as Mock).mockResolvedValue(mockUnits);
      (CheckoutAPICalls.getResidents as Mock).mockResolvedValue({ value: [] });
      (CheckoutAPICalls.findResident as Mock).mockResolvedValue({ value: [] });
      (CheckoutAPICalls.addResident as Mock).mockResolvedValue({
        value: [{ id: 10, name: 'New Resident' }],
      });

      const setResidentInfo = vi.fn();
      const handleShowDialog = vi.fn();

      renderComponent({
        ...defaultProps,
        unitNumberValues: mockUnits,
        setResidentInfo,
        handleShowDialog,
      });

      // Select building
      const buildingInput = screen.getByLabelText('Building Code');
      fireEvent.mouseDown(buildingInput);
      const buildingOption = await screen.findByText('A (Building A)');
      fireEvent.click(buildingOption);

      await waitFor(() => {
        expect(CheckoutAPICalls.getUnitNumbers).toHaveBeenCalled();
      });

      // Select unit
      const unitInput = screen.getByLabelText('Unit Number');
      fireEvent.change(unitInput, { target: { value: '101' } });

      await waitFor(() => {
        expect(CheckoutAPICalls.getResidents).toHaveBeenCalled();
      });

      // Enter new resident name
      const nameInput = screen.getByLabelText('Resident Name');
      fireEvent.change(nameInput, { target: { value: 'New Resident' } });

      // Submit form
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(setResidentInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 10,
            name: 'New Resident',
            lastVisitDate: null
          })
        );
        expect(handleShowDialog).toHaveBeenCalled();
      });
    });
  });
});
