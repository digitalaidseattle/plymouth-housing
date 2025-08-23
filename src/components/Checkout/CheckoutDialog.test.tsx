
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutDialog } from './CheckoutDialog';
import { vi } from 'vitest';
import { UserContext } from '../contexts/UserContext';
import * as api from './CheckoutAPICalls';

vi.mock('./CategorySection', () => ({
  default: () => <div>Category Section</div>,
}));

describe('CheckoutDialog', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const removeItemFromCart = vi.fn();
  const addItemToCart = vi.fn();
  const setCheckoutItems = vi.fn();
  const setActiveSection = vi.fn();
  const fetchData = vi.fn();
  const setResidentInfo = vi.fn();

  const checkoutItems = [
    { id: 1, category: 'Test Category', items: [{ id: 1, name: 'Test Item', quantity: 1, description: '' }], checkout_limit: 2, categoryCount: 1 },
  ];
  const welcomeBasketData = [
    { id: 2, category: 'Welcome Basket', items: [{ id: 2, name: 'Welcome Basket Item', quantity: 1, description: '' }], checkout_limit: 1, categoryCount: 1 },
  ];
  const residentInfo = { id: 1, name: 'Test Resident', unit: { id: 1, unit_number: '1' }, building: { id: 1, name: 'Test Building', code: 'TB' } };

  const renderComponent = (open = true, items = checkoutItems) => {
    return render(
      <UserContext.Provider value={{ user: { userRoles: ['admin'] }, loggedInUserId: 1 } as any}>
        <CheckoutDialog
          open={open}
          onClose={onClose}
          onSuccess={onSuccess}
          checkoutItems={items}
          welcomeBasketData={welcomeBasketData}
          removeItemFromCart={removeItemFromCart}
          addItemToCart={addItemToCart}
          setCheckoutItems={setCheckoutItems}
          selectedBuildingCode="TB"
          setActiveSection={setActiveSection}
          fetchData={fetchData}
          activeSection=""
          residentInfo={residentInfo}
          setResidentInfo={setResidentInfo}
        />
      </UserContext.Provider>
    );
  };

  it('should render the dialog with the correct title and content when open is true', () => {
    renderComponent();
    expect(screen.getByText('Checkout Summary')).not.toBeNull();
    expect(screen.getByText('Total Items Checked Out:')).not.toBeNull();
  });

  it('should not render the dialog when open is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Checkout Summary')).toBeNull();
  });

  it('should call the onClose function when the "Return to Checkout Page" button is clicked', () => {
    renderComponent();
    const returnButton = screen.getByText('Return to Checkout Page');
    fireEvent.click(returnButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call processGeneralItems when checking out general items', async () => {
    const processGeneralItemsSpy = vi.spyOn(api, 'processGeneralItems').mockResolvedValue({ value: [{ Status: 'Success' }] });
    renderComponent();
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    await waitFor(() => expect(processGeneralItemsSpy).toHaveBeenCalledTimes(1));
  });
});
