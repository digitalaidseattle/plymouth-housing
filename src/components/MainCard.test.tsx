
import { render, screen } from '@testing-library/react';
import MainCard from './MainCard';

describe('MainCard', () => {
  it('should render the title and children', () => {
    render(<MainCard title="Test Title">Test Children</MainCard>);
    const title = screen.getByText('Test Title');
    const children = screen.getByText('Test Children');
    expect(title).not.toBeNull();
    expect(children).not.toBeNull();
  });

  it('should render the secondary action', () => {
    render(<MainCard title="Test Title" secondary={<button>Action</button>}>Test Children</MainCard>);
    const action = screen.getByRole('button', { name: 'Action' });
    expect(action).not.toBeNull();
  });

  it('should apply the correct styles for border and boxShadow', () => {
    const { container } = render(<MainCard title="Test Title" border boxShadow>Test Children</MainCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.style.border).not.toBe('none');
  });

  it('should render with a dark title', () => {
    render(<MainCard title="Test Title" darkTitle>Test Children</MainCard>);
    const title = screen.getByText('Test Title');
    expect(title).not.toBeNull();
  });

  it('should render without content padding', () => {
    const { container } = render(<MainCard title="Test Title" content={false}>Test Children</MainCard>);
    const children = screen.getByText('Test Children');
    expect(children).not.toBeNull();
    const cardContent = container.querySelector('#scrollContainer');
    expect(cardContent).toBeNull();
  });
});
