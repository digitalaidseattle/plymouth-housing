
import { render, screen } from '@testing-library/react';
import AnimateButton from './AnimateButton';

describe('AnimateButton', () => {
  it('should render its children', () => {
    render(
      <AnimateButton>
        <div>Test Child</div>
      </AnimateButton>
    );
    const child = screen.getByText('Test Child');
    expect(child).not.toBeNull();
  });

  // Note: The animation logic in this component is currently commented out.
  // This test only verifies that the component renders its children.
  // If the animation logic is re-enabled, this test should be updated.
});
