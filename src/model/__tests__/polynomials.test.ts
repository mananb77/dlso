import { describe, it, expect } from 'vitest';
import {
  evaluate,
  effortCoefficients,
  sleepCoefficients,
  leisureCoefficients,
  generateCurve,
} from '../polynomials';

describe('evaluate', () => {
  it('returns a0 when t=0', () => {
    expect(evaluate(effortCoefficients, 0)).toBeCloseTo(-2);
    expect(evaluate(leisureCoefficients, 0)).toBeCloseTo(-1);
    expect(evaluate(sleepCoefficients, 0)).toBeCloseTo(-2);
  });

  it('returns a finite number for typical inputs', () => {
    expect(Number.isFinite(evaluate(effortCoefficients, 8.7))).toBe(true);
    expect(Number.isFinite(evaluate(sleepCoefficients, 9.1))).toBe(true);
    expect(Number.isFinite(evaluate(leisureCoefficients, 4.3))).toBe(true);
  });
});

describe('effort polynomial', () => {
  it('peaks near x=8.7', () => {
    const curve = generateCurve(effortCoefficients);
    let peak = curve[0];
    for (const p of curve) {
      if (p.satisfaction > peak.satisfaction) peak = p;
    }
    expect(peak.hours).toBeGreaterThan(6);
    expect(peak.hours).toBeLessThan(11);
  });
});

describe('sleep polynomial', () => {
  it('peaks near z=9.1', () => {
    const curve = generateCurve(sleepCoefficients);
    let peak = curve[0];
    for (const p of curve) {
      if (p.satisfaction > peak.satisfaction) peak = p;
    }
    expect(peak.hours).toBeGreaterThan(7);
    expect(peak.hours).toBeLessThan(12);
  });
});

describe('leisure polynomial', () => {
  it('peaks near y=4.3', () => {
    const curve = generateCurve(leisureCoefficients);
    let peak = curve[0];
    for (const p of curve) {
      if (p.satisfaction > peak.satisfaction) peak = p;
    }
    expect(peak.hours).toBeGreaterThan(2);
    expect(peak.hours).toBeLessThan(7);
  });
});

describe('generateCurve', () => {
  it('generates 241 points for 0-24 with step 0.1', () => {
    const curve = generateCurve(effortCoefficients);
    expect(curve.length).toBe(241);
    expect(curve[0].hours).toBe(0);
    expect(curve[curve.length - 1].hours).toBe(24);
  });
});
