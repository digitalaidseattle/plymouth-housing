
import { render, screen } from '@testing-library/react';
import PageHeading from './PageHeading';

describe('PageHeading', () => {
  it('should render the title', () => {
    render(<PageHeading title="Test Title" />);
    const title = screen.getByText('Test Title');
    expect(title).not.toBeNull();
  });
});
