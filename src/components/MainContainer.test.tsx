
import { render, screen } from '@testing-library/react';
import MainContainer from './MainContainer';

describe('MainContainer', () => {
  it('should render the title and children', () => {
    render(<MainContainer title="Test Title">Test Children</MainContainer>);
    const title = screen.getByText('Test Title');
    const children = screen.getByText('Test Children');
    expect(title).not.toBeNull();
    expect(children).not.toBeNull();
  });

  it('should render the children when content is false', () => {
    render(<MainContainer title="Test Title" content={false}>Test Children</MainContainer>);
    const children = screen.getByText('Test Children');
    expect(children).not.toBeNull();
  });

  it('should render the PageHeading when a title is provided', () => {
    render(<MainContainer title="Test Title">Test Children</MainContainer>);
    const title = screen.getByText('Test Title');
    expect(title).not.toBeNull();
  });

  it('should not render the PageHeading when a title is not provided', () => {
    render(<MainContainer>Test Children</MainContainer>);
    const title = screen.queryByRole('heading');
    expect(title).toBeNull();
  });
});
