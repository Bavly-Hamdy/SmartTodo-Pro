import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // Change the value
    rerender({ value: 'changed', delay: 300 });
    
    // Value should still be initial immediately
    expect(result.current).toBe('initial');
    
    // Fast forward time
    jest.advanceTimersByTime(300);
    
    // Value should now be changed
    expect(result.current).toBe('changed');
  });

  it('should reset timer on new value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // Change value
    rerender({ value: 'first', delay: 300 });
    
    // Advance time but not enough to trigger
    jest.advanceTimersByTime(150);
    expect(result.current).toBe('initial');
    
    // Change value again
    rerender({ value: 'second', delay: 300 });
    
    // Advance time but not enough to trigger
    jest.advanceTimersByTime(150);
    expect(result.current).toBe('initial');
    
    // Advance time to trigger
    jest.advanceTimersByTime(150);
    expect(result.current).toBe('second');
  });

  it('should work with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'changed', delay: 100 });
    expect(result.current).toBe('initial');
    
    jest.advanceTimersByTime(100);
    expect(result.current).toBe('changed');
  });

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    rerender({ value: 42, delay: 300 });
    expect(result.current).toBe(0);
    
    jest.advanceTimersByTime(300);
    expect(result.current).toBe(42);
  });

  it('should work with objects', () => {
    const initialObj = { name: 'John', age: 30 };
    const changedObj = { name: 'Jane', age: 25 };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 300 } }
    );

    rerender({ value: changedObj, delay: 300 });
    expect(result.current).toEqual(initialObj);
    
    jest.advanceTimersByTime(300);
    expect(result.current).toEqual(changedObj);
  });
}); 