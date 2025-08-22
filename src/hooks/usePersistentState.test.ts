
import { renderHook, act } from '@testing-library/react';
import usePersistentState from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => usePersistentState('testKey', 'initialValue'));
    expect(result.current[0]).toBe('initialValue');
  });

  it('should initialize with the value from localStorage if it exists', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => usePersistentState('testKey', 'initialValue'));
    expect(result.current[0]).toBe('storedValue');
  });

  it('should update the value in localStorage when the state is updated', () => {
    const { result } = renderHook(() => usePersistentState('testKey', 'initialValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('newValue'));
  });

  it('should remove the value from localStorage when the state is set to null', () => {
    localStorage.setItem('testKey', JSON.stringify('storedValue'));
    const { result } = renderHook(() => usePersistentState<string | null>('testKey', 'initialValue'));

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBe(null);
    expect(localStorage.getItem('testKey')).toBe(null);
  });

  it('should remove the value from localStorage when the state is set to an empty array', () => {
    localStorage.setItem('testKey', JSON.stringify(['item1']));
    const { result } = renderHook(() => usePersistentState<string[] | []>('testKey', ['initialValue']));

    act(() => {
      result.current[1]([]);
    });

    expect(result.current[0]).toEqual([]);
    expect(localStorage.getItem('testKey')).toBe(null);
  });
});
