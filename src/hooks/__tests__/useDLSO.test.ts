import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDLSO } from '../useDLSO';

describe('useDLSO', () => {
  it('initial state sums to 24', () => {
    const { result } = renderHook(() => useDLSO());
    const { effort, sleep, leisure } = result.current.state;
    expect(effort + sleep + leisure).toBeCloseTo(24);
  });

  it('setActivity updates the target and redistributes others', () => {
    const { result } = renderHook(() => useDLSO());

    act(() => {
      result.current.setActivity('effort', 12);
    });

    expect(result.current.state.effort).toBe(12);
    const sum =
      result.current.state.effort +
      result.current.state.sleep +
      result.current.state.leisure;
    expect(sum).toBeCloseTo(24);
  });

  it('resetToOptimal returns to optimal values', () => {
    const { result } = renderHook(() => useDLSO());

    act(() => {
      result.current.setActivity('effort', 20);
    });

    act(() => {
      result.current.resetToOptimal();
    });

    expect(result.current.state.effort).toBeCloseTo(8.7);
    expect(result.current.state.sleep).toBeCloseTo(9.1);
    expect(result.current.state.leisure).toBeCloseTo(6.2);
  });

  it('derived scores are finite numbers', () => {
    const { result } = renderHook(() => useDLSO());
    expect(Number.isFinite(result.current.scores.total)).toBe(true);
    expect(Number.isFinite(result.current.scores.effort)).toBe(true);
    expect(Number.isFinite(result.current.scores.sleep)).toBe(true);
    expect(Number.isFinite(result.current.scores.leisure)).toBe(true);
  });

  it('curves have 241 points each', () => {
    const { result } = renderHook(() => useDLSO());
    expect(result.current.curves.effort).toHaveLength(241);
    expect(result.current.curves.sleep).toHaveLength(241);
    expect(result.current.curves.leisure).toHaveLength(241);
  });
});
