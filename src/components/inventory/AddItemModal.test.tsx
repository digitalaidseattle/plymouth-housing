import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import AddItemModal from './AddItemModal';
import { UserContext } from '../contexts/UserContext';
import { InventoryItem, ClientPrincipal } from '../../types/interfaces';
import '@testing-library/jest-dom';

const mockUUID = 'a-random-uuid';
vi.stubGlobal('crypto', {
    randomUUID: () => mockUUID
});

const mockFetchData = vi.fn();
const mockHandleAddClose = vi.fn();
const mockSetShowResults = vi.fn();

const originalData: InventoryItem[] = [
    { id: 1, name: 'Item 1', type: 'General', quantity: 10, description: 'Desc 1', category: 'Cat 1', status: 'Active' },
    { id: 2, name: 'Item 2', type: 'Welcome Basket', quantity: 5, description: 'Desc 2', category: 'Cat 2', status: 'Active' },
];

const mockUser: ClientPrincipal = {
    userDetails: 'test-user',
    userID: '123',
    userRoles: ['admin']
};

const userContextValue = {
    user: mockUser,
    setUser: vi.fn(),
    loggedInUserId: 456,
    setLoggedInUserId: vi.fn(),
    activeVolunteers: [],
    setActiveVolunteers: vi.fn(),
    isLoading: false,
};

const renderComponent = () => {
    return render(
        <UserContext.Provider value={userContextValue}>
            <AddItemModal
                addModal={true}
                handleAddClose={mockHandleAddClose}
                fetchData={mockFetchData}
                originalData={originalData}
                showResults={false}
                setShowResults={mockSetShowResults}
            />
        </UserContext.Provider>
    );
};

describe('AddItemModal', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    it('should handle a successful transaction', async () => {
        const mockSuccessResponse = { value: [{ Status: 'Success', message: mockUUID }] };
        (fetch as Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockSuccessResponse),
        });

        renderComponent();

        // There is no label, so we get the first combobox for the type
        const typeSelect = screen.getAllByRole('combobox')[0];
        fireEvent.mouseDown(typeSelect);
        await waitFor(() => {
            fireEvent.click(screen.getByRole('option', { name: 'General' }));
        });

        // The second combobox is for the item name
        const autocomplete = screen.getAllByRole('combobox')[1];
        fireEvent.change(autocomplete, { target: { value: 'Item 1' } });
        await waitFor(() => {
            // This will be in a listbox
            fireEvent.click(screen.getByRole('option', { name: /Item 1/ }));
        });

        const quantityInput = screen.getByRole('spinbutton');
        fireEvent.change(quantityInput, { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const fetchCall = (fetch as Mock).mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);
            expect(body.item[0].quantity).toBe(5);
            expect(body.new_transaction_id).toBe(mockUUID);
            expect(mockFetchData).toHaveBeenCalledTimes(1);
            expect(mockSetShowResults).toHaveBeenCalledWith(true);
        });
    });

    it('should handle a failing transaction (duplicate)', async () => {
        const mockErrorResponse = { value: [{ Status: 'Error', message: 'Transaction with this ID already exists.' }] };
        (fetch as Mock).mockResolvedValue({
            ok: true, // The server returns 200 OK but with an error status in the body
            json: () => Promise.resolve(mockErrorResponse),
        });

        renderComponent();

        // Simulate user input
        const typeSelect = screen.getAllByRole('combobox')[0];
        fireEvent.mouseDown(typeSelect);
        await waitFor(() => {
            fireEvent.click(screen.getByRole('option', { name: 'General' }));
        });

        const autocomplete = screen.getAllByRole('combobox')[1];
        fireEvent.change(autocomplete, { target: { value: 'Item 1' } });
        await waitFor(() => {
            fireEvent.click(screen.getByRole('option', { name: /Item 1/ }));
        });

        const quantityInput = screen.getByRole('spinbutton');
        fireEvent.change(quantityInput, { target: { value: '5' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(screen.getByText('This transaction has already been submitted.')).toBeInTheDocument();
            expect(mockFetchData).not.toHaveBeenCalled();
            expect(mockSetShowResults).not.toHaveBeenCalled();
        });
    });
});