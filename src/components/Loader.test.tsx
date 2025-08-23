
import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
  it('should render the LinearProgress component', () => {
    render(<Loader />);
    const linearProgress = screen.getByRole('progressbar');
    expect(linearProgress).not.toBeNull();
  });
});
