import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpinUpDialog from './SpinUpDialog';
import { SETTINGS } from '../../types/constants';

describe('SpinUpDialog Component', () => {
  test('shows loading state when retryCount is 0', () => {
    render(<SpinUpDialog open={true} retryCount={0} />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows retrying state with attempt count when retryCount > 0', () => {
    render(<SpinUpDialog open={true} retryCount={2} />);

    expect(screen.getByText(/Database is starting up/i)).toBeInTheDocument();
    expect(screen.getByText(`Please wait while the database is starting... (Attempt 2 of ${SETTINGS.database_retry_attempts})`)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('does not render dialog content when open is false', () => {
    render(<SpinUpDialog open={false} retryCount={3} />);

    expect(screen.queryByText(/Database is starting up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Attempt 3 of/i)).not.toBeInTheDocument();
  });
});
