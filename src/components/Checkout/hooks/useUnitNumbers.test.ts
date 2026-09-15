/**
 *  useUnitNumbers.test.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUnitNumbers } from './useUnitNumbers';
import * as residentService from '../../../services/residentService';
import type { Unit, ClientPrincipal } from '../../../types/interfaces';

vi.mock('../../../services/residentService');

const dummyUser: ClientPrincipal = {
  userId: '1',
  userDetails: 'Test User',
  userRoles: ['admin'],
};

const mockUnits: Unit[] = [
  { id: 10, unit_number: '201' },
  { id: 11, unit_number: '202' },
  { id: 12, unit_number: 'welcome' },
  { id: 13, unit_number: '' },
];

describe('useUnitNumbers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters out empty and welcome units on success', async () => {
    vi.mocked(residentService.getUnitNumbers).mockResolvedValue(mockUnits);
    const setSelectedUnit = vi.fn();

    const { result } = renderHook(() => useUnitNumbers(setSelectedUnit));

    await act(async () => {
      await result.current.fetchUnitNumbers(dummyUser, 1);
    });

    expect(result.current.unitNumberValues.map((u) => u.unit_number)).toEqual([
      '201',
      '202',
    ]);
  });

  it('clears unit options and selected unit before fetching (no stale state during load)', async () => {
    // Seed the hook with a resolved response, then re-fetch with a slow one
    // and assert options are cleared during the loading window.
    let resolveSecond: (v: Unit[]) => void;
    vi.mocked(residentService.getUnitNumbers)
      .mockResolvedValueOnce(mockUnits)
      .mockReturnValueOnce(
        new Promise<Unit[]>((r) => {
          resolveSecond = r;
        }),
      );
    const setSelectedUnit = vi.fn();

    const { result } = renderHook(() => useUnitNumbers(setSelectedUnit));

    // First fetch populates values.
    await act(async () => {
      await result.current.fetchUnitNumbers(dummyUser, 1);
    });
    expect(result.current.unitNumberValues).toHaveLength(2);

    // Kick off the second fetch but don't await it — check state mid-flight.
    setSelectedUnit.mockClear();
    let pending: Promise<void>;
    act(() => {
      pending = result.current.fetchUnitNumbers(dummyUser, 2);
    });

    // Options should be empty right away, before the second fetch resolves.
    expect(result.current.unitNumberValues).toEqual([]);
    expect(result.current.isLoadingUnits).toBe(true);
    // selectedUnit is cleared eagerly too, so a stale unit can't be submitted.
    expect(setSelectedUnit).toHaveBeenCalledWith({ id: 0, unit_number: '' });

    // Let the fetch resolve so the hook settles.
    await act(async () => {
      resolveSecond!(mockUnits);
      await pending!;
    });
    expect(result.current.isLoadingUnits).toBe(false);
  });

  it('clears selected unit on fetch error (regression guard for PIT-518)', async () => {
    vi.mocked(residentService.getUnitNumbers).mockRejectedValue(
      new Error('Backend exploded'),
    );
    const setSelectedUnit = vi.fn();

    const { result } = renderHook(() => useUnitNumbers(setSelectedUnit));

    await act(async () => {
      await result.current.fetchUnitNumbers(dummyUser, 1);
    });

    // selectedUnit must have been reset (was previously left stale on error).
    expect(setSelectedUnit).toHaveBeenCalledWith({ id: 0, unit_number: '' });
    expect(result.current.unitNumberValues).toEqual([]);
    expect(result.current.apiError).toBe(
      'An error occurred while loading unit numbers. Please try again.',
    );
  });

  it('surfaces a connection-specific message when the fetch fails with a TypeError', async () => {
    vi.mocked(residentService.getUnitNumbers).mockRejectedValue(
      new TypeError('Failed to fetch'),
    );
    const setSelectedUnit = vi.fn();

    const { result } = renderHook(() => useUnitNumbers(setSelectedUnit));

    await act(async () => {
      await result.current.fetchUnitNumbers(dummyUser, 1);
    });

    expect(result.current.apiError).toBe(
      'Unable to load unit numbers. Please check your connection and try again.',
    );
  });

  it('toggles isLoadingUnits around the fetch', async () => {
    let resolve: (v: Unit[]) => void;
    vi.mocked(residentService.getUnitNumbers).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const setSelectedUnit = vi.fn();

    const { result } = renderHook(() => useUnitNumbers(setSelectedUnit));

    let pending: Promise<void>;
    act(() => {
      pending = result.current.fetchUnitNumbers(dummyUser, 1);
    });
    expect(result.current.isLoadingUnits).toBe(true);

    await act(async () => {
      resolve!(mockUnits);
      await pending!;
    });
    await waitFor(() => expect(result.current.isLoadingUnits).toBe(false));
  });
});
