/**
 * Generates a synthetic but realistic dataset modeling Manan's daily schedule
 * from freshman year through junior year (~3 school years).
 *
 * Each row is one day with:
 *   - date
 *   - effort_hours (work/study)
 *   - sleep_hours
 *   - leisure_hours
 *   - effort_satisfaction (1–100 self-reported)
 *   - sleep_satisfaction (1–100)
 *   - leisure_satisfaction (1–100)
 *   - overall_satisfaction (1–100)
 *
 * The data reflects patterns from hello.md:
 *   - Freshman year: lighter workload (~6–8h effort), more sleep (~8–9h)
 *   - Sophomore year: ramping up (~8–12h effort), sleep starts dropping
 *   - Junior year: intense (~13–18h effort), sleep drops to ~6h
 *   - Satisfaction follows realistic nonlinear patterns with noise
 */

// Seed-able pseudo-random number generator (mulberry32)
function makeRng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(42);

function gaussNoise(mean: number, std: number): number {
  const u1 = rng();
  const u2 = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * "True" satisfaction functions — what we want the polynomial fit to recover.
 * These are hand-crafted to match the described behavior.
 */
function trueEffortSatisfaction(hours: number): number {
  // Rises from 0, peaks around 8.7, dips, secondary peak around 15, drops hard after
  // Modeled as sum of two Gaussians
  const primary = 85 * Math.exp(-0.5 * ((hours - 8.7) / 3.2) ** 2);
  const secondary = 65 * Math.exp(-0.5 * ((hours - 15.0) / 2.5) ** 2);
  const penalty = hours < 1 ? -20 * (1 - hours) : 0;
  const overwork = hours > 18 ? -3 * (hours - 18) ** 2 : 0;
  return primary + secondary + penalty + overwork + 5;
}

function trueSleepSatisfaction(hours: number): number {
  // Peaks around 9.1, sharp dropoff below 5h, gentle decline above 10h
  const peak = 90 * Math.exp(-0.5 * ((hours - 9.1) / 2.8) ** 2);
  const deprivation = hours < 5 ? -15 * (5 - hours) ** 1.5 : 0;
  const oversleep = hours > 11 ? -2 * (hours - 11) ** 2 : 0;
  return peak + deprivation + oversleep + 3;
}

function trueLeisureSatisfaction(hours: number): number {
  // Peaks around 4.3, diminishing returns, drops with too much
  const peak = 75 * Math.exp(-0.5 * ((hours - 4.3) / 2.0) ** 2);
  const none = hours < 0.5 ? -25 * (0.5 - hours) : 0;
  const tooMuch = hours > 7 ? -1.5 * (hours - 7) ** 2 : 0;
  return peak + none + tooMuch + 8;
}

interface DayRecord {
  date: string;
  day_of_week: string;
  year: string;
  effort_hours: number;
  sleep_hours: number;
  leisure_hours: number;
  effort_satisfaction: number;
  sleep_satisfaction: number;
  leisure_satisfaction: number;
  overall_satisfaction: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateDay(
  date: Date,
  baseEffort: number,
  effortStd: number,
  baseSleep: number,
  sleepStd: number,
): DayRecord {
  const dow = date.getDay();
  const isWeekend = dow === 0 || dow === 6;

  // Effort: lower on weekends
  let effort = gaussNoise(
    isWeekend ? baseEffort * 0.7 : baseEffort,
    effortStd,
  );
  effort = clamp(Math.round(effort * 4) / 4, 0.5, 20); // quarter-hour precision

  // Sleep: slightly more on weekends
  let sleep = gaussNoise(
    isWeekend ? baseSleep + 1.5 : baseSleep,
    sleepStd,
  );
  sleep = clamp(Math.round(sleep * 4) / 4, 2, 14);

  // Leisure: remainder of 24h
  let leisure = 24 - effort - sleep;
  leisure = clamp(Math.round(leisure * 4) / 4, 0.25, 12);

  // Re-normalize to 24h
  const total = effort + sleep + leisure;
  if (Math.abs(total - 24) > 0.01) {
    const scale = 24 / total;
    effort = Math.round(effort * scale * 4) / 4;
    sleep = Math.round(sleep * scale * 4) / 4;
    leisure = 24 - effort - sleep;
    leisure = Math.round(leisure * 4) / 4;
  }

  // Satisfaction scores with noise (~5-point std dev)
  const eSat = clamp(Math.round(trueEffortSatisfaction(effort) + gaussNoise(0, 5)), 1, 100);
  const sSat = clamp(Math.round(trueSleepSatisfaction(sleep) + gaussNoise(0, 5)), 1, 100);
  const lSat = clamp(Math.round(trueLeisureSatisfaction(leisure) + gaussNoise(0, 4)), 1, 100);
  const overall = clamp(
    Math.round(
      (10 / 24) * eSat + (8 / 24) * sSat + (6 / 24) * lSat + gaussNoise(0, 3),
    ),
    1,
    100,
  );

  const dateStr = date.toISOString().slice(0, 10);

  return {
    date: dateStr,
    day_of_week: DAYS[dow],
    year: dateStr < '2022-06-01' ? 'freshman' : dateStr < '2023-06-01' ? 'sophomore' : 'junior',
    effort_hours: effort,
    sleep_hours: sleep,
    leisure_hours: leisure,
    effort_satisfaction: eSat,
    sleep_satisfaction: sSat,
    leisure_satisfaction: lSat,
    overall_satisfaction: overall,
  };
}

// Generate ~3 school years of data
const records: DayRecord[] = [];
const start = new Date('2021-08-15'); // Freshman year start

for (let i = 0; i < 365 * 3; i++) {
  const date = new Date(start);
  date.setDate(date.getDate() + i);

  const dateStr = date.toISOString().slice(0, 10);

  // Skip summer breaks (July)
  if (date.getMonth() === 6) continue;

  // Parameters shift across years
  let baseEffort: number, effortStd: number, baseSleep: number, sleepStd: number;

  if (dateStr < '2022-06-01') {
    // Freshman: moderate workload
    baseEffort = 7;
    effortStd = 1.5;
    baseSleep = 8.5;
    sleepStd = 0.8;
  } else if (dateStr < '2023-06-01') {
    // Sophomore: ramping up
    baseEffort = 10;
    effortStd = 2.0;
    baseSleep = 7.5;
    sleepStd = 1.0;
  } else {
    // Junior: intense
    baseEffort = 14;
    effortStd = 2.5;
    baseSleep = 6.0;
    sleepStd = 1.2;
  }

  // Finals weeks: extra effort spikes
  const month = date.getMonth();
  if (month === 11 || month === 4) {
    // December and May
    baseEffort += 2;
    baseSleep -= 1;
  }

  records.push(generateDay(date, baseEffort, effortStd, baseSleep, sleepStd));
}

// Output CSV
const header = [
  'date',
  'day_of_week',
  'year',
  'effort_hours',
  'sleep_hours',
  'leisure_hours',
  'effort_satisfaction',
  'sleep_satisfaction',
  'leisure_satisfaction',
  'overall_satisfaction',
].join(',');

const rows = records.map((r) =>
  [
    r.date,
    r.day_of_week,
    r.year,
    r.effort_hours.toFixed(2),
    r.sleep_hours.toFixed(2),
    r.leisure_hours.toFixed(2),
    r.effort_satisfaction,
    r.sleep_satisfaction,
    r.leisure_satisfaction,
    r.overall_satisfaction,
  ].join(','),
);

console.log(header);
rows.forEach((r) => console.log(r));

// Also output summary stats to stderr
const years = ['freshman', 'sophomore', 'junior'];
for (const y of years) {
  const yr = records.filter((r) => r.year === y);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  console.error(
    `${y}: n=${yr.length}, ` +
      `effort=${avg(yr.map((r) => r.effort_hours)).toFixed(1)}h, ` +
      `sleep=${avg(yr.map((r) => r.sleep_hours)).toFixed(1)}h, ` +
      `leisure=${avg(yr.map((r) => r.leisure_hours)).toFixed(1)}h, ` +
      `satisfaction=${avg(yr.map((r) => r.overall_satisfaction)).toFixed(1)}`,
  );
}
