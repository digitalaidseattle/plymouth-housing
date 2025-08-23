
import { render, screen } from '@testing-library/react';
import CheckedoutListItem from './CheckedoutListItem';

describe('CheckedoutListItem', () => {
  it('should render the item name and the number of times it has been checked out', () => {
    render(<CheckedoutListItem itemName="Test Item" timesCheckedOut={3} />);
    expect(screen.getByText('Test Item')).not.toBeNull();
    expect(screen.getByText('Checked out 3x')).not.toBeNull();
  });
});
