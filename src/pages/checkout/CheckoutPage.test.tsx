import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock categories and building codes data
// vi.mock('../../data/checkoutPage', () => ({
//   categories: [
//     {
//       id: 1,
//       name: 'Electronics',
//       items: [
//         { id: 'item1', name: 'Laptop' },
//         { id: 'item2', name: 'Phone' },
//       ],
//     },
//   ],
//   buildingCodes: [
//     { code: 'B1', name: 'Building 1' },
//     { code: 'B2', name: 'Building 2' },
//   ],
// }));

describe('CheckoutPage', () => {
  beforeEach(() => {
    render(<CheckoutPage />);
  });

  it('renders the checkout page correctly', () => {
    // Check if the heading is rendered
    expect(screen.getByText('Checkout')).toBeInTheDocument();

    // Check if categories and items are rendered
    // expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    // expect(screen.getByText(/Laptop/i)).toBeInTheDocument();
    // expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  });

  // it('renders the building code select with correct label', () => {
  //   expect(screen.getByLabelText('Building Code')).toBeInTheDocument();
  // });

  // it('updates selected value when an option is chosen', () => {
  //   const select = screen.getByLabelText('Building Code');

  //   // Open the dropdown
  //   fireEvent.mouseDown(select);

  //   // Click the first option
  //   const firstOption = screen.getByText('B1 (Building 1)');
  //   fireEvent.click(firstOption);

  //   // Verify the selection
  //   expect(select).toHaveTextContent('B1 (Building 1)');
  // });

  // it('adds an item to the cart and shows item quantity', () => {
  //   // Check if the cart is initially empty (no summary button visible)
  //   expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();

  //   // Add item to the cart
  //   const addItemButton = screen.getAllByTestId('AddIcon')[0];
  //   fireEvent.click(addItemButton);

  //   // Check if the quantity is updated and item is added to the cart
  //   expect(screen.getByText('1 items selected')).toBeInTheDocument();
  //   expect(screen.getByTestId('test-id-quantity')); // Check for quantity
  // });

  // it('removes an item from the cart', () => {
  //   // Add item to the cart
  //   const addItemButton = screen.getAllByTestId('AddIcon')[0];
  //   fireEvent.click(addItemButton);

  //   // Check if the item is added
  //   expect(screen.getByText('1 items selected')).toBeInTheDocument();

  //   // Remove the item
  //   const removeItemButton = screen.getAllByTestId('RemoveIcon')[0];
  //   fireEvent.click(removeItemButton);

  //   // Check if the cart is empty again
  //   expect(screen.queryByText(/items selected/i)).not.toBeInTheDocument();
  // });

  // it('shows checkout dialog when "Continue" is clicked', () => {
  //   // Add item to the cart
  //   const addItemButton = screen.getAllByTestId('AddIcon')[0];
  //   fireEvent.click(addItemButton);

  //   // Click the continue button to open the checkout dialog
  //   const continueButton = screen.getByText(/Continue/i);
  //   fireEvent.click(continueButton);

  //   // Check if the checkout dialog is open
  //   expect(screen.getByText(/Checkout Summary/i)).toBeInTheDocument();
  // });
});
