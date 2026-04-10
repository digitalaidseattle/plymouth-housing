import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { UserContext } from '../../components/contexts/UserContext';
import { useResidentsByBuilding } from './useResidentsByBuilding';
import * as residentService from '../../services/residentService';

vi.mock('../../services/residentService');

const dummyUser = {
  userId: '1',
  userDetails: 'Test User',
  userRoles: ['admin'],
  claims: [],
};

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(UserContext.Provider, {
    value: {
      user: dummyUser,
      setUser: vi.fn(),
      loggedInUserId: 1,
      setLoggedInUserId: vi.fn(),
      activeVolunteers: [],
      setActiveVolunteers: vi.fn(),
      isLoading: false,
    },
    children,
  });

const mockRows = [
  {
    id: 1,
    name: 'Alice',
    unit_id: 10,
    unit_number: '2',
    building_id: 1,
    building_name: 'B',
    building_code: 'B1',
  },
  {
    id: 2,
    name: 'Bob',
    unit_id: 10,
    unit_number: '2',
    building_id: 1,
    building_name: 'B',
    building_code: 'B1',
  },
  {
    id: 3,
    name: 'Carol',
    unit_id: 20,
    unit_number: '10',
    building_id: 1,
    building_name: 'B',
    building_code: 'B1',
  },
];

describe('useResidentsByBuilding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty data when buildingId is null', () => {
    const { result } = renderHook(() => useResidentsByBuilding(null), {
      wrapper,
    });
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('groups flat rows into units with residents', async () => {
    vi.mocked(residentService.getResidentsByBuilding).mockResolvedValue(
      mockRows,
    );

    const { result } = renderHook(() => useResidentsByBuilding(1), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
    const unit2 = result.current.data.find((d) => d.unit.unit_number === '2');
    expect(unit2?.residents).toHaveLength(2);
    expect(unit2?.residents.map((r) => r.name)).toEqual(['Alice', 'Bob']);
  });

  it('sorts units numerically by unit_number', async () => {
    vi.mocked(residentService.getResidentsByBuilding).mockResolvedValue(
      mockRows,
    );

    const { result } = renderHook(() => useResidentsByBuilding(1), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const unitNumbers = result.current.data.map((d) => d.unit.unit_number);
    expect(unitNumbers).toEqual(['2', '10']); // numeric order, not lexicographic
  });

  it('sets isLoading true while fetching', async () => {
    let resolve: (v: typeof mockRows) => void;
    vi.mocked(residentService.getResidentsByBuilding).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );

    const { result } = renderHook(() => useResidentsByBuilding(1), { wrapper });

    expect(result.current.isLoading).toBe(true);
    resolve!(mockRows);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(residentService.getResidentsByBuilding).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useResidentsByBuilding(1), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Failed to load residents');
    expect(result.current.data).toEqual([]);
  });

  it('refetches when buildingId changes', async () => {
    vi.mocked(residentService.getResidentsByBuilding).mockResolvedValue(
      mockRows,
    );

    const { rerender } = renderHook(({ id }) => useResidentsByBuilding(id), {
      wrapper,
      initialProps: { id: 1 as number | null },
    });

    await waitFor(() =>
      expect(residentService.getResidentsByBuilding).toHaveBeenCalledTimes(1),
    );

    rerender({ id: 2 });

    await waitFor(() =>
      expect(residentService.getResidentsByBuilding).toHaveBeenCalledTimes(2),
    );
    expect(residentService.getResidentsByBuilding).toHaveBeenLastCalledWith(
      dummyUser,
      2,
    );
  });
});
