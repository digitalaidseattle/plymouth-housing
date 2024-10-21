import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock categories and building codes data
vi.mock('../../data/checkoutPage', () => ({
  categories: [
    { id: 1, name: 'Electronics', items: [{ id: 'item1', name: 'Laptop' }, { id: 'item2', name: 'Phone' }] },
  ],
  buildingCodes: [{ code: 'B1', name: 'Building 1' }, { code: 'B2', name: 'Building 2' }]
}));

describe('CheckoutPage', () => {
  it('renders the checkout page correctly', () => {
    render(<CheckoutPage />);

    // Check if the heading is rendered
    expect(screen.getByText(/Check out/i)).toBeInTheDocument();

    // Check if categories and items are rendered
    expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    expect(screen.getByText(/Laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  });

  it('allows selecting a building code', () => {
    render(<CheckoutPage />);

    // Open the building code selector
    fireEvent.mouseDown(screen.getByTestId('test-id-select-building-code'));
    
    // Select a building code
    fireEvent.click(screen.getByText("B1 (Building 1)"));

    // Check if the selected building code is displayed
    expect(screen.getByLabelText(/Building Code/i)).toHaveTextContent('B1');
  });

  it('adds an item to the cart and shows item quantity', () => {
    render(<CheckoutPage />);

    // Check if the cart is initially empty (no summary button visible)
    expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();

    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Check if the quantity is updated and item is added to the cart
    expect(screen.getByText('1 items selected')).toBeInTheDocument();
    expect(screen.getByTestId('test-id-quantity')); // Check for quantity
  }); 

  it('removes an item from the cart', () => {
    render(<CheckoutPage />);

    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Check if the item is added
    expect(screen.getByText('1 items selected')).toBeInTheDocument();

    // Remove the item
    const removeItemButton = screen.getAllByTestId('RemoveIcon')[0];
    fireEvent.click(removeItemButton);

    // Check if the cart is empty again
    expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();
  });

  it('shows checkout dialog when "Continue" is clicked', () => {
    render(<CheckoutPage />);

    // Add item to the cart
    const addItemButton = screen.getAllByTestId('AddIcon')[0];
    fireEvent.click(addItemButton);

    // Click the continue button to open the checkout dialog
    const continueButton = screen.getByText(/Continue/i);
    fireEvent.click(continueButton);

    // Check if the checkout dialog is open
    expect(screen.getByText(/Checkout Summary/i)).toBeInTheDocument();
  });
});
