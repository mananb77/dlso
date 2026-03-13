import { useState, useMemo, useCallback } from 'react';
import {
  effortCoefficients,
  sleepCoefficients,
  leisureCoefficients,
  evaluate,
  generateCurve,
} from '../model/polynomials';
import type { CurvePoint } from '../model/polynomials';
import { enforceConstraint, findPeak, computeWeightedComponents } from '../model/optimizer';
import type { Activity } from '../model/optimizer';

export interface DLSOState {
  effort: number;
  sleep: number;
  leisure: number;
}

const OPTIMAL: DLSOState = { effort: 8.7, sleep: 9.1, leisure: 6.2 };

export function useDLSO() {
  const [state, setState] = useState<DLSOState>(OPTIMAL);

  const curves = useMemo(
    () => ({
      effort: generateCurve(effortCoefficients),
      sleep: generateCurve(sleepCoefficients),
      leisure: generateCurve(leisureCoefficients),
    }),
    [],
  );

  const optimals = useMemo(
    () => ({
      effort: findPeak(curves.effort).hours,
      sleep: findPeak(curves.sleep).hours,
      leisure: findPeak(curves.leisure).hours,
    }),
    [curves],
  );

  const scores = useMemo(() => {
    const effortScore = evaluate(effortCoefficients, state.effort);
    const sleepScore = evaluate(sleepCoefficients, state.sleep);
    const leisureScore = evaluate(leisureCoefficients, state.leisure);
    const components = computeWeightedComponents(state.effort, state.sleep, state.leisure);
    return {
      effort: effortScore,
      sleep: sleepScore,
      leisure: leisureScore,
      weightedEffort: components.effort,
      weightedSleep: components.sleep,
      weightedLeisure: components.leisure,
      total: components.total,
    };
  }, [state]);

  const optimalTotal = useMemo(() => {
    return computeWeightedComponents(optimals.effort, optimals.sleep, optimals.leisure).total;
  }, [optimals]);

  const setActivity = useCallback(
    (activity: Activity, hours: number) => {
      setState((prev) => enforceConstraint(activity, hours, prev));
    },
    [],
  );

  const resetToOptimal = useCallback(() => {
    setState(OPTIMAL);
  }, []);

  return {
    state,
    curves,
    optimals,
    scores,
    optimalTotal,
    setActivity,
    resetToOptimal,
  } as const;
}

export type { CurvePoint };
