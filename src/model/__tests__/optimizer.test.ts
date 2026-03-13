import { describe, it, expect } from 'vitest';
import {
  computeWeightedTotal,
  computeWeightedComponents,
  enforceConstraint,
} from '../optimizer';
import { evaluate, effortCoefficients, sleepCoefficients, leisureCoefficients } from '../polynomials';

describe('computeWeightedTotal', () => {
  it('uses correct weights (10/24, 8/24, 6/24)', () => {
    const e = 8, s = 9, l = 7;
    const expected =
      (10 / 24) * evaluate(effortCoefficients, e) +
      (8 / 24) * evaluate(sleepCoefficients, s) +
      (6 / 24) * evaluate(leisureCoefficients, l);
    expect(computeWeightedTotal(e, s, l)).toBeCloseTo(expected);
  });
});

describe('computeWeightedComponents', () => {
  it('total equals sum of components', () => {
    const result = computeWeightedComponents(8, 9, 7);
    expect(result.total).toBeCloseTo(result.effort + result.sleep + result.leisure);
  });
});

describe('enforceConstraint', () => {
  it('always sums to 24', () => {
    const result = enforceConstraint('effort', 10, { effort: 8, sleep: 9, leisure: 7 });
    expect(result.effort + result.sleep + result.leisure).toBeCloseTo(24);
  });

  it('handles one value at 24', () => {
    const result = enforceConstraint('effort', 24, { effort: 8, sleep: 9, leisure: 7 });
    expect(result.effort).toBe(24);
    expect(result.sleep).toBeCloseTo(0);
    expect(result.leisure).toBeCloseTo(0);
  });

  it('handles one value at 0', () => {
    const result = enforceConstraint('effort', 0, { effort: 8, sleep: 9, leisure: 7 });
    expect(result.effort).toBe(0);
    expect(result.sleep + result.leisure).toBeCloseTo(24);
  });

  it('handles all equal values', () => {
    const result = enforceConstraint('effort', 12, { effort: 8, sleep: 8, leisure: 8 });
    expect(result.effort + result.sleep + result.leisure).toBeCloseTo(24);
    expect(result.effort).toBe(12);
    // Others should be equal
    expect(result.sleep).toBeCloseTo(result.leisure);
  });

  it('handles zero other sum by splitting equally', () => {
    const result = enforceConstraint('effort', 12, { effort: 24, sleep: 0, leisure: 0 });
    expect(result.effort).toBe(12);
    expect(result.sleep).toBeCloseTo(6);
    expect(result.leisure).toBeCloseTo(6);
  });

  it('clamps to valid range', () => {
    const result = enforceConstraint('effort', 30, { effort: 8, sleep: 9, leisure: 7 });
    expect(result.effort).toBe(24);
    expect(result.effort + result.sleep + result.leisure).toBeCloseTo(24);
  });
});
