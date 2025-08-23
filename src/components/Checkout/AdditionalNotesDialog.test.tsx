
import { render, screen, fireEvent } from '@testing-library/react';
import AdditionalNotesDialog from './AdditionalNotesDialog';
import { vi } from 'vitest';

describe('AdditionalNotesDialog', () => {
  const handleShowDialog = vi.fn();
  const addItemToCart = vi.fn();
  const item = { id: 1, name: 'Test Item', quantity: 1, description: '' };
  const residentInfo = { id: 1, name: 'Test Resident', unit: { id: 1, unit_number: '1' }, building: { id: 1, name: 'Test Building', code: 'TB' } };
  const checkoutHistory = [
    { item_id: 1, timesCheckedOut: 1, additionalNotes: 'Note 1' },
    { item_id: 166, timesCheckedOut: 2, additionalNotes: 'Note 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (showDialog = true) => {
    return render(
      <AdditionalNotesDialog
        showDialog={showDialog}
        handleShowDialog={handleShowDialog}
        item={item}
        residentInfo={residentInfo}
        addItemToCart={addItemToCart}
        checkoutHistory={checkoutHistory}
      />
    );
  };

  it('should render the dialog with the correct title and content when showDialog is true', () => {
    renderComponent();
    expect(screen.getByText('Enter Test Item Details')).not.toBeNull();
    expect(screen.getByText('Previously checked out')).not.toBeNull();
  });

  it('should not render the dialog when showDialog is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Enter Test Item Details')).toBeNull();
  });

  it('should display the checkout history for the item', () => {
    renderComponent();
    expect(screen.getByText('Note 2')).not.toBeNull();
  });

  it('should call the addItemToCart function with the correct data when the user submits the form with valid data', () => {
    renderComponent();
    const input = screen.getByLabelText('Name of appliance');
    fireEvent.change(input, { target: { value: 'Test Note' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    const addButton = screen.getByRole('button', { name: 'add to cart' });
    fireEvent.click(addButton);
    expect(addItemToCart).toHaveBeenCalledWith({ ...item, additional_notes: 'Test Note' });
  });

  it('should display an error message when the user submits the form with invalid data', () => {
    renderComponent();
    const addButton = screen.getByRole('button', { name: 'add to cart' });
    fireEvent.click(addButton);
    expect(screen.getByText('Please enter the name of the appliance')).not.toBeNull();
  });

  it('should call the handleShowDialog function when the user clicks the "cancel" button', () => {
    renderComponent();
    const cancelButton = screen.getByRole('button', { name: 'cancel' });
    fireEvent.click(cancelButton);
    expect(handleShowDialog).toHaveBeenCalledTimes(1);
  });
});
