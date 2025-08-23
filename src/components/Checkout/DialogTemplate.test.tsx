
import { render, screen, fireEvent } from '@testing-library/react';
import DialogTemplate from './DialogTemplate';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Dialog } from '@mui/material';

const theme = createTheme();

// Mock the Dialog component to prevent its default onClose behavior
vi.mock('@mui/material/Dialog', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: vi.fn(({ children, onClose, ...props }) => (
      <div {...props} data-testid="mock-dialog">
        {children}
      </div>
    )),
  };
});

describe('DialogTemplate', () => {
  const handleShowDialog = vi.fn();
  const handleSubmit = vi.fn();

  const renderComponent = (showDialog = true) => {
    return render(
      <ThemeProvider theme={theme}>
        <DialogTemplate
          showDialog={showDialog}
          handleShowDialog={handleShowDialog}
          handleSubmit={handleSubmit}
          title="Test Title"
          submitButtonText="Submit"
          backButtonText="Back"
        >
          <div>Test Children</div>
        </DialogTemplate>
      </ThemeProvider>
    );
  };

  it('should render the dialog with the correct title and children when showDialog is true', () => {
    renderComponent();
    expect(screen.getByText('Test Title')).not.toBeNull();
    expect(screen.getByText('Test Children')).not.toBeNull();
  });

  it('should not render the dialog when showDialog is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Test Title')).toBeNull();
  });

  it('should call the handleShowDialog function when the close button is clicked', () => {
    renderComponent();
    const closeButton = screen.getByTestId('CloseIcon');
    fireEvent.click(closeButton);
    expect(handleShowDialog).toHaveBeenCalledTimes(1);
  });

  it('should call the handleShowDialog function when the back button is clicked', () => {
    renderComponent();
    const backButton = screen.getByRole('button', { name: 'Back' });
    fireEvent.click(backButton);
    expect(handleShowDialog).toHaveBeenCalledTimes(1);
  });

  it('should call the handleSubmit function when the submit button is clicked', () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
