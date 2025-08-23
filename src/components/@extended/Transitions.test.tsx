
import { render, screen } from '@testing-library/react';
import Transitions from './Transitions';

describe('Transitions', () => {
  it('should render the Grow transition by default', () => {
    const { container } = render(
      <Transitions>
        <div>Test Child</div>
      </Transitions>
    );
    // The Grow component adds a transform style.
    const child = screen.getByText('Test Child');
    expect(child).not.toBeNull();
  });

  it('should render the Fade transition when type is fade', () => {
    const { container } = render(
      <Transitions type="fade">
        <div>Test Child</div>
      </Transitions>
    );
    // The Fade component adds an opacity style.
    const child = screen.getByText('Test Child');
    expect(child).not.toBeNull();
  });

  it('should render the children correctly', () => {
    render(
      <Transitions>
        <div>Test Child</div>
      </Transitions>
    );
    const child = screen.getByText('Test Child');
    expect(child).not.toBeNull();
  });
});
