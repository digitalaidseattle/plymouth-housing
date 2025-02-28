import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CenteredLayout from './CenteredLayout';

describe('CenteredLayout Component', () => {
  test('renders children correctly', () => {
    render(
      <CenteredLayout>
        <div data-testid="child">Test Child</div>
      </CenteredLayout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('applies correct container styles', () => {
    const { container } = render(
      <CenteredLayout>
        <div>Child</div>
      </CenteredLayout>
    );
    // Check that the outermost container has minHeight and paddingTop as defined in sx
    expect(container.firstChild).toHaveStyle('min-height: 90vh');
    expect(container.firstChild).toHaveStyle('padding-top: 25vh');
  });

  test('has correct layout structure', () => {
    const { container } = render(
      <CenteredLayout>
        <div data-testid="child">Child Content</div>
      </CenteredLayout>
    );
    // Check that the outermost element is rendered (a Grid container)
    expect(container.firstChild).toBeInTheDocument();

    // Check that a Stack component is present (MUI Stack adds the class "MuiStack-root")
    const stackElement = container.querySelector('.MuiStack-root');
    expect(stackElement).toBeInTheDocument();

    // Ensure the child element is rendered inside the Stack
    const child = screen.getByTestId('child');
    expect(stackElement).toContainElement(child);
  });
});
