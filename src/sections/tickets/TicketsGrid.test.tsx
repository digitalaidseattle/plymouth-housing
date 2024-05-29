/**
 *  TicketsGrid.test.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { render } from '@testing-library/react';
import { afterEach, assert, describe, it, vi } from 'vitest';
import TicketsGrid from './TicketsGrid';

describe('TicketsGrid tests', () => {

  it('should render the grid', () => {
    const element = render(<TicketsGrid />);
    assert.isNotNull(element.queryByText('Client Name'));
    assert.isNotNull(element.queryByText('Action'));
  });


  afterEach(() => {
    vi.clearAllMocks();
  });

});

