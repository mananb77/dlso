/**
 * 9th-degree Maclaurin series polynomial coefficients for satisfaction curves.
 * Coefficients are ordered [a9, a8, a7, a6, a5, a4, a3, a2, a1, a0]
 * (highest degree first for Horner's method).
 *
 * Peaks:
 *   Effort: ~8.7h (primary), ~14h (secondary)
 *   Sleep:  ~9.1h
 *   Leisure: ~4.3h
 */

// Effort: peaks near 8.7h (primary) and 14h (secondary), drops off at extremes
export const effortCoefficients = [
  -5e-11,       // a9
  0,            // a8
  0,            // a7
  8.3333e-5,    // a6
  -5.72e-3,     // a5
  0.14718,      // a4
  -1.72798,     // a3
  8.25413,      // a2
  0,            // a1
  -2,           // a0
];

// Leisure: peak near 4.3h, steep dropoff after
export const leisureCoefficients = [
  -1.5e-9,      // a9
  0,            // a8
  0,            // a7
  0,            // a6
  0,            // a5
  0.0733999,    // a4
  -1.88882,     // a3
  9.46858,      // a2
  0,            // a1
  -1,           // a0
];

// Sleep: peak near 9.1h, strong dropoff below 6h
export const sleepCoefficients = [
  -2.5e-11,     // a9
  0,            // a8
  0,            // a7
  0,            // a6
  0,            // a5
  1.03093e-2,   // a4
  -0.4,         // a3
  3.75258,      // a2
  0,            // a1
  -2,           // a0
];

/**
 * Evaluate a polynomial using Horner's method.
 * coefficients: [a_n, a_{n-1}, ..., a_1, a_0] (highest degree first)
 */
export function evaluate(coefficients: readonly number[], t: number): number {
  let result = 0;
  for (const coeff of coefficients) {
    result = result * t + coeff;
  }
  return result;
}

export type CurvePoint = { hours: number; satisfaction: number };

/**
 * Generate curve points for a polynomial over [0, maxHours] with the given step.
 */
export function generateCurve(
  coefficients: readonly number[],
  maxHours: number = 24,
  step: number = 0.1,
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const numPoints = Math.round(maxHours / step) + 1;
  for (let i = 0; i < numPoints; i++) {
    const t = Math.round(i * step * 10) / 10;
    points.push({
      hours: t,
      satisfaction: evaluate(coefficients, t),
    });
  }
  return points;
}
