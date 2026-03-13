import { evaluate, effortCoefficients, sleepCoefficients, leisureCoefficients } from './polynomials';
import type { CurvePoint } from './polynomials';

const EFFORT_WEIGHT = 10 / 24;
const SLEEP_WEIGHT = 8 / 24;
const LEISURE_WEIGHT = 6 / 24;

export function computeWeightedTotal(
  effortHours: number,
  sleepHours: number,
  leisureHours: number,
): number {
  const effortScore = evaluate(effortCoefficients, effortHours);
  const sleepScore = evaluate(sleepCoefficients, sleepHours);
  const leisureScore = evaluate(leisureCoefficients, leisureHours);
  return (
    EFFORT_WEIGHT * effortScore +
    SLEEP_WEIGHT * sleepScore +
    LEISURE_WEIGHT * leisureScore
  );
}

export function computeWeightedComponents(
  effortHours: number,
  sleepHours: number,
  leisureHours: number,
) {
  const effortScore = evaluate(effortCoefficients, effortHours);
  const sleepScore = evaluate(sleepCoefficients, sleepHours);
  const leisureScore = evaluate(leisureCoefficients, leisureHours);
  return {
    effort: EFFORT_WEIGHT * effortScore,
    sleep: SLEEP_WEIGHT * sleepScore,
    leisure: LEISURE_WEIGHT * leisureScore,
    total:
      EFFORT_WEIGHT * effortScore +
      SLEEP_WEIGHT * sleepScore +
      LEISURE_WEIGHT * leisureScore,
  };
}

export type Activity = 'effort' | 'sleep' | 'leisure';

/**
 * When one activity changes, redistribute remaining hours proportionally among others.
 */
export function enforceConstraint(
  changed: Activity,
  newValue: number,
  current: { effort: number; sleep: number; leisure: number },
): { effort: number; sleep: number; leisure: number } {
  const clamped = Math.max(0, Math.min(24, newValue));
  const remaining = 24 - clamped;

  const others = (['effort', 'sleep', 'leisure'] as const).filter(
    (a) => a !== changed,
  );
  const otherSum = others.reduce((sum, a) => sum + current[a], 0);

  const result = { ...current, [changed]: clamped };

  if (otherSum === 0) {
    // Split remaining equally
    for (const a of others) {
      result[a] = remaining / others.length;
    }
  } else {
    for (const a of others) {
      result[a] = Math.max(0, Math.min(24, current[a] * (remaining / otherSum)));
    }
  }

  // Re-normalize to handle floating point drift
  const total = result.effort + result.sleep + result.leisure;
  if (Math.abs(total - 24) > 0.001) {
    const scale = 24 / total;
    for (const a of others) {
      result[a] *= scale;
    }
  }

  return result;
}

/**
 * Find the peak (maximum) from pre-computed curve points.
 */
export function findPeak(points: CurvePoint[]): CurvePoint {
  let best = points[0];
  for (const p of points) {
    if (p.satisfaction > best.satisfaction) {
      best = p;
    }
  }
  return best;
}
