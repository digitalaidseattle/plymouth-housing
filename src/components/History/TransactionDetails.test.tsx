/**
 *  TransactionDetails.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TransactionDetails from './TransactionDetails';
import { getEditTransactionData } from '../../services/checkoutService';
import type { CheckoutTransaction } from '../../types/interfaces';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../services/checkoutService', () => ({
  getEditTransactionData: vi.fn(),
}));

const ERROR_TEXT = 'Could not load transaction details. Please try again.';

const transaction = {
  id: 1,
  item_type: 'general',
  resident_name: 'Resident',
  building_code: 'B',
  building_name: 'Building',
  unit_number: '1',
  transaction_date: '2026-01-01T00:00:00Z',
  items: [],
} as unknown as CheckoutTransaction;

const renderDetails = (showDialog: boolean) => (
  <TransactionDetails
    checkoutTransaction={transaction}
    userList={null}
    showDialog={showDialog}
    onClose={vi.fn()}
  />
);

describe('TransactionDetails load error snackbar', () => {
  beforeEach(() => {
    vi.mocked(getEditTransactionData).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('shows the error when loading fails', async () => {
    vi.mocked(getEditTransactionData).mockRejectedValue(new Error('boom'));
    render(renderDetails(true));
    expect(await screen.findByText(ERROR_TEXT)).toBeInTheDocument();
  });

  test('does not show a stale error after closing and reopening', async () => {
    vi.mocked(getEditTransactionData).mockRejectedValueOnce(new Error('boom'));
    const { rerender } = render(renderDetails(true));
    await screen.findByText(ERROR_TEXT);

    rerender(renderDetails(false));
    vi.mocked(getEditTransactionData).mockResolvedValue(null as never);
    rerender(renderDetails(true));

    await waitFor(() =>
      expect(getEditTransactionData).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(screen.queryByText(ERROR_TEXT)).not.toBeInTheDocument(),
    );
  });
});
