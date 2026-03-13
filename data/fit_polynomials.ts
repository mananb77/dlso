/**
 * Fits 9th-degree polynomials to the daily satisfaction dataset using
 * least-squares regression (normal equation: β = (XᵀX)⁻¹Xᵀy).
 *
 * Outputs the coefficients in the format used by src/model/polynomials.ts
 * and reports fit quality (R², peak locations).
 */

import { readFileSync } from 'fs';

// ── Matrix utilities (no numpy needed) ──────────────────────────────────────

function transpose(m: number[][]): number[][] {
  const rows = m.length, cols = m[0].length;
  const t: number[][] = Array.from({ length: cols }, () => new Array(rows));
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      t[j][i] = m[i][j];
  return t;
}

function matMul(a: number[][], b: number[][]): number[][] {
  const m = a.length, n = b[0].length, p = b.length;
  const c: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let k = 0; k < p; k++)
      for (let j = 0; j < n; j++)
        c[i][j] += a[i][k] * b[k][j];
  return c;
}

function matVecMul(a: number[][], v: number[]): number[] {
  return a.map(row => row.reduce((s, val, j) => s + val * v[j], 0));
}

/** Solve Ax = b via Gaussian elimination with partial pivoting */
function solve(A: number[][], b: number[]): number[] {
  const n = A.length;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-15) {
      throw new Error(`Singular matrix at column ${col}`);
    }

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }
  return x;
}

/**
 * Fit polynomial of given degree using least squares.
 * Returns coefficients [a_n, a_{n-1}, ..., a_1, a_0] (highest degree first).
 */
function polyfit(xs: number[], ys: number[], degree: number): number[] {
  const n = xs.length;
  const cols = degree + 1;

  // Build Vandermonde matrix (each row: [1, x, x², ..., x^degree])
  const X: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(cols);
    row[0] = 1;
    for (let j = 1; j < cols; j++) {
      row[j] = row[j - 1] * xs[i];
    }
    X.push(row);
  }

  // Normal equation: (XᵀX)β = Xᵀy
  const Xt = transpose(X);
  const XtX = matMul(Xt, X);
  const Xty = matVecMul(Xt, ys);

  // Solve for β = [a0, a1, ..., a_degree]
  const beta = solve(XtX, Xty);

  // Reverse to get [a_degree, ..., a1, a0] (highest first for Horner)
  return beta.reverse();
}

function evaluate(coeffs: number[], t: number): number {
  let result = 0;
  for (const c of coeffs) result = result * t + c;
  return result;
}

function rSquared(xs: number[], ys: number[], coeffs: number[]): number {
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < xs.length; i++) {
    const yPred = evaluate(coeffs, xs[i]);
    ssRes += (ys[i] - yPred) ** 2;
    ssTot += (ys[i] - yMean) ** 2;
  }
  return 1 - ssRes / ssTot;
}

function findPeak(coeffs: number[], lo = 0, hi = 24, step = 0.01): { hours: number; value: number } {
  let best = { hours: lo, value: -Infinity };
  for (let t = lo; t <= hi; t += step) {
    const v = evaluate(coeffs, t);
    if (v > best.value) best = { hours: Math.round(t * 100) / 100, value: v };
  }
  return best;
}

function findLocalMaxima(coeffs: number[]): { hours: number; value: number }[] {
  const maxima: { hours: number; value: number }[] = [];
  for (let t = 0.1; t <= 23.9; t += 0.01) {
    const prev = evaluate(coeffs, t - 0.01);
    const curr = evaluate(coeffs, t);
    const next = evaluate(coeffs, t + 0.01);
    if (curr > prev && curr > next) {
      maxima.push({ hours: Math.round(t * 100) / 100, value: Math.round(curr * 100) / 100 });
    }
  }
  return maxima;
}

// ── Load data ───────────────────────────────────────────────────────────────

const csv = readFileSync('data/daily_satisfaction.csv', 'utf-8');
const lines = csv.trim().split('\n');
const header = lines[0].split(',');
const data = lines.slice(1).map(line => {
  const vals = line.split(',');
  return {
    effort_hours: parseFloat(vals[3]),
    sleep_hours: parseFloat(vals[4]),
    leisure_hours: parseFloat(vals[5]),
    effort_satisfaction: parseFloat(vals[6]),
    sleep_satisfaction: parseFloat(vals[7]),
    leisure_satisfaction: parseFloat(vals[8]),
    overall_satisfaction: parseFloat(vals[9]),
  };
});

console.log(`Loaded ${data.length} records\n`);

// ── Fit polynomials ─────────────────────────────────────────────────────────

const DEGREE = 9;

const fits = [
  {
    name: 'Effort',
    xs: data.map(d => d.effort_hours),
    ys: data.map(d => d.effort_satisfaction),
    varName: 'effortCoefficients',
  },
  {
    name: 'Sleep',
    xs: data.map(d => d.sleep_hours),
    ys: data.map(d => d.sleep_satisfaction),
    varName: 'sleepCoefficients',
  },
  {
    name: 'Leisure',
    xs: data.map(d => d.leisure_hours),
    ys: data.map(d => d.leisure_satisfaction),
    varName: 'leisureCoefficients',
  },
];

console.log('='.repeat(70));
for (const fit of fits) {
  const coeffs = polyfit(fit.xs, fit.ys, DEGREE);
  const r2 = rSquared(fit.xs, fit.ys, coeffs);
  const peak = findPeak(coeffs);
  const maxima = findLocalMaxima(coeffs);

  console.log(`\n${fit.name} Satisfaction`);
  console.log('-'.repeat(40));
  console.log(`R² = ${r2.toFixed(4)}`);
  console.log(`Global peak: ${peak.hours}h (value: ${peak.value.toFixed(1)})`);
  console.log(`Local maxima:`, maxima);
  console.log(`\nCoefficients [a9, a8, ..., a1, a0]:`);
  coeffs.forEach((c, i) => {
    console.log(`  a${DEGREE - i} = ${c.toExponential(6)}`);
  });

  // Sample values
  console.log(`\nSample values:`);
  for (const x of [0, 2, 4, 6, 8, 9, 10, 12, 15, 18, 20, 24]) {
    console.log(`  S(${x}) = ${evaluate(coeffs, x).toFixed(1)}`);
  }

  // TypeScript export format
  console.log(`\n// TypeScript:`);
  console.log(`export const ${fit.varName} = [`);
  coeffs.forEach((c, i) => {
    const label = `a${DEGREE - i}`;
    console.log(`  ${c.toExponential(8)},    // ${label}`);
  });
  console.log(`];`);
}

console.log('\n' + '='.repeat(70));

// Also output the raw (x, y) pairs binned by hour for verification
console.log('\n\nBinned averages (for plotting verification):');
for (const fit of fits) {
  console.log(`\n${fit.name}:`);
  const bins = new Map<number, number[]>();
  for (let i = 0; i < fit.xs.length; i++) {
    const bin = Math.round(fit.xs[i]);
    if (!bins.has(bin)) bins.set(bin, []);
    bins.get(bin)!.push(fit.ys[i]);
  }
  const sorted = [...bins.entries()].sort((a, b) => a[0] - b[0]);
  for (const [bin, vals] of sorted) {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    console.log(`  ${bin}h: avg=${avg.toFixed(1)} (n=${vals.length})`);
  }
}
