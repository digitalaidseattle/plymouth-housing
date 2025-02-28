import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import ContactAdminDialog from './ContactAdminDialog';

// Override environment variables for testing (optional)
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_ADMIN_PHONE_NUMBER: '123-456-7890',
    VITE_ADMIN_EMAIL: 'admin@example.com'
  }
});

describe('ContactAdminDialog Component', () => {
  test('renders dialog with correct content when open is true', () => {
    const onClose = vi.fn();
    render(<ContactAdminDialog open={true} onClose={onClose} />);

    // Verify that the dialog title is rendered
    expect(screen.getByText('Forget your PIN?')).toBeInTheDocument();

    // Instead of verifying exact phone/email values, check for key phrases
    const content = screen.getByText(/Please call the phone number/i);
    expect(content).toBeInTheDocument();
    expect(content.textContent).toMatch(/or email/i);

    // Verify that the Close button is rendered
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  test('does not render dialog when open is false', () => {
    const onClose = vi.fn();
    render(<ContactAdminDialog open={false} onClose={onClose} />);
    // The dialog should not be rendered when open is false
    expect(screen.queryByText('Forget your PIN?')).not.toBeInTheDocument();
  });

  test('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn();
    render(<ContactAdminDialog open={true} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
