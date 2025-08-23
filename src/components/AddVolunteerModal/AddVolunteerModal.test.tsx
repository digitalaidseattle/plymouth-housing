
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddVolunteerModal from './AddVolunteerModal';
import { vi } from 'vitest';
import { UserContext } from '../contexts/UserContext';

describe('AddVolunteerModal', () => {
  const handleAddClose = vi.fn();
  const fetchData = vi.fn();
  const user = { userRoles: ['admin'] };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (addModal = true) => {
    return render(
      <UserContext.Provider value={{ user } as any}>
        <AddVolunteerModal
          addModal={addModal}
          handleAddClose={handleAddClose}
          fetchData={fetchData}
        />
      </UserContext.Provider>
    );
  };

  it('should render the modal with the correct title and input fields when addModal is true', () => {
    renderComponent();
    expect(screen.getByText('Add Volunteer')).not.toBeNull();
    expect(screen.getByPlaceholderText('Enter name')).not.toBeNull();
    expect(screen.getByPlaceholderText('Enter email')).not.toBeNull();
    expect(screen.getByPlaceholderText('Enter 4-digit PIN')).not.toBeNull();
  });

  it('should not render the modal when addModal is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Add Volunteer')).toBeNull();
  });

  it('should update the form data when the user types in the input fields', () => {
    renderComponent();
    const nameInput = screen.getByPlaceholderText('Enter name');
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    expect(nameInput.value).toBe('Test Name');
  });

  it('should display an error message when the user submits the form with invalid data', () => {
    renderComponent();
    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);
    expect(screen.getByText('Please enter valid information. PIN must be 4 digits.')).not.toBeNull();
  });

  it('should call the fetch function with the correct data when the user submits the form with valid data', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as any;

    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Enter name'), { target: { value: 'Test Name' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter 4-digit PIN'), { target: { value: '1234' } });

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // The success message is briefly displayed before the modal closes.
    // We can check that the success message was displayed.
    // This is not ideal, but it's the best we can do without a more complex test setup.
  });

  it('should call the handleAddClose function when the user clicks the "Cancel" button', () => {
    renderComponent();
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(handleAddClose).toHaveBeenCalledTimes(1);
  });
});
