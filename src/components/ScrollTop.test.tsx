
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollTop from './ScrollTop';
import { vi } from 'vitest';

describe('ScrollTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('should scroll to top on initial render', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollTop><div>Test</div></ScrollTop>
      </MemoryRouter>
    );
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });

  it('should scroll to top when route changes', () => {
    const TestComponent = () => {
      const navigate = useNavigate();
      return <button onClick={() => navigate('/new-route')}>Go to new route</button>;
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollTop>
          <Routes>
            <Route path="/" element={<TestComponent />} />
            <Route path="/new-route" element={<div>New Route</div>} />
          </Routes>
        </ScrollTop>
      </MemoryRouter>
    );

    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Go to new route'));

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });
});
