
import { render, screen, fireEvent } from '@testing-library/react';
import SnackbarAlert from './SnackbarAlert';
import { vi } from 'vitest';

describe('SnackbarAlert', () => {
  it('should render the alert with the correct severity and message when open is true', () => {
    render(
      <SnackbarAlert open={true} onClose={() => {}} severity="success">
        Test Message
      </SnackbarAlert>
    );
    const alert = screen.getByRole('alert');
    expect(alert).not.toBeNull();
    expect(screen.getByText('Test Message')).not.toBeNull();
  });

  it('should not render the alert when open is false', () => {
    render(
      <SnackbarAlert open={false} onClose={() => {}} severity="success">
        Test Message
      </SnackbarAlert>
    );
    const alert = screen.queryByRole('alert');
    expect(alert).toBeNull();
  });

  it('should call the onClose function when the alert is closed', () => {
    const onClose = vi.fn();
    render(
      <SnackbarAlert open={true} onClose={onClose} severity="success">
        Test Message
      </SnackbarAlert>
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
