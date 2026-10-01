/**
 *  DrawerFooter.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import DrawerFooter from './index';

const cacheAgedBy = (milliseconds: number) => {
  sessionStorage.setItem(
    'categorizedItems',
    JSON.stringify({ data: [], cachedAt: Date.now() - milliseconds }),
  );
};

describe('DrawerFooter', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('reports the age of the inventory cache in minutes', () => {
    cacheAgedBy(14 * 60 * 1000);

    render(<DrawerFooter />);

    expect(screen.getByText('Inventory updated 14 minutes ago')).toBeInTheDocument();
  });

  test('switches to hours for an older cache', () => {
    cacheAgedBy(3 * 60 * 60 * 1000);

    render(<DrawerFooter />);

    expect(screen.getByText('Inventory updated 3 hours ago')).toBeInTheDocument();
  });

  test('reports an empty cache', () => {
    render(<DrawerFooter />);

    expect(screen.getByText('Inventory not loaded yet')).toBeInTheDocument();
  });

  test('treats a cache past its TTL as not loaded', () => {
    cacheAgedBy(13 * 60 * 60 * 1000);

    render(<DrawerFooter />);

    expect(screen.getByText('Inventory not loaded yet')).toBeInTheDocument();
  });

  test('ages the label while mounted', () => {
    vi.useFakeTimers();
    cacheAgedBy(0);

    render(<DrawerFooter />);
    expect(screen.getByText('Inventory updated just now')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });

    expect(screen.getByText('Inventory updated 2 minutes ago')).toBeInTheDocument();
  });
});
