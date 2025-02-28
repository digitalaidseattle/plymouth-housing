import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PinInputComponent from './PinInput';

describe('PinInput Component', () => {
  let onPinChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onPinChange = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders 4 input fields', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  it('calls onPinChange with updated pin when a valid digit is entered', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];
    fireEvent.change(firstInput, { target: { value: '5' } });
    expect(onPinChange).toHaveBeenCalledWith(['5', '', '', '']);
  });

  it('shows snackbar when non-digit is entered', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];
    fireEvent.change(firstInput, { target: { value: 'a' } });
    expect(screen.getByText(/Please enter only numbers for your PIN/i)).toBeInTheDocument();
  });

  it('moves focus to next input when a valid digit is entered', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    fireEvent.change(firstInput, { target: { value: '5' } });
    expect(document.activeElement).toBe(secondInput);
  });

  it('handles Backspace: clears current input if non-empty', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];

    fireEvent.change(firstInput, { target: { value: '5' } });
    fireEvent.keyDown(firstInput, { key: 'Backspace' });
    expect(onPinChange).toHaveBeenCalledWith(['', '', '', '']);
  });

  it('handles Backspace: if current input is empty, moves focus to previous input and clears it', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    fireEvent.change(firstInput, { target: { value: '5' } });
    // Manually focus second input
    secondInput.focus();
    expect(secondInput.value).toBe('');
    fireEvent.keyDown(secondInput, { key: 'Backspace' });
    expect(document.activeElement).toBe(firstInput);
    expect(onPinChange).toHaveBeenCalledWith(['', '', '', '']);
  });

  it('handles ArrowRight and ArrowLeft key events to change focus', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];
    const secondInput = inputs[1];
    const thirdInput = inputs[2];

    firstInput.focus();
    fireEvent.keyDown(firstInput, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(secondInput);

    fireEvent.keyDown(secondInput, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(firstInput);

    fireEvent.keyDown(secondInput, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(thirdInput);
  });

  it('temporarily shows the digit (type "text") then reverts to "password" after 1 second', () => {
    const { container } = render(<PinInputComponent onPinChange={onPinChange} />);
    const inputs = container.querySelectorAll('input');
    const firstInput = inputs[0];

    // Initially, type should be "password"
    expect(firstInput).toHaveAttribute('type', 'password');

    fireEvent.change(firstInput, { target: { value: '5' } });
    // Immediately after change, type should be "text"
    expect(firstInput).toHaveAttribute('type', 'text');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(firstInput).toHaveAttribute('type', 'password');
  });
});
