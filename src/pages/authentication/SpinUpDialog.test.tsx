import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpinUpDialog from './SpinUpDialog';

describe('SpinUpDialog Component', () => {
  test('renders dialog with title, progress indicator, and retry text when open is true', () => {
    render(<SpinUpDialog open={true} retryCount={2} />);
    
    // Check that the dialog title is rendered.
    expect(screen.getByText(/Database is starting up/i)).toBeInTheDocument();
    
    // Check that the retry text includes the correct retry count.
    expect(screen.getByText(/Attempt 2 of/i)).toBeInTheDocument();
    
    // Check that the progress indicator is rendered (CircularProgress usually has role "progressbar").
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('does not render dialog content when open is false', () => {
    render(<SpinUpDialog open={false} retryCount={3} />);
    
    // When open is false, the dialog should not display its content.
    expect(screen.queryByText(/Database is starting up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Attempt 3 of/i)).not.toBeInTheDocument();
  });
});
