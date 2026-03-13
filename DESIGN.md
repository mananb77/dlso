# DLSO Visualizer — Design Document

## 1. Project Overview

### The Problem

During junior year, Manan was running 13–18 hour days split between academics (APCS, math, problem-solving) and collaborating with 2–4 different teams daily. The schedule was deteriorating his health — sleep had dropped to around 6 hours a night. The question became: **how do you allocate a fixed 24 hours across work, sleep, and leisure to maximize overall life satisfaction?**

Rather than guessing, Manan turned the question into a math problem. He collected data on his own sleep and working hours going back to freshman year, fit 9th-degree Maclaurin Series polynomials to model how satisfaction varies with hours spent on each activity, and solved the resulting constrained optimization problem. The result — the **Daily Life Satisfaction Optimization (DLSO) Model** — told him to target ~8.7h effort, ~9.1h sleep, and ~4.3h leisure. Applying the model raised his average sleep from 6 to 7.5 hours, improving both productivity and happiness.

### What We're Building

The **DLSO Visualizer** is an interactive web app that brings this model to life. It lets anyone explore the tradeoffs Manan discovered — how satisfaction from effort peaks and then drops off with overwork, how sleep has diminishing returns past ~9 hours, and how the weighted combination of all three produces a clear optimal allocation.

The app lets users:

- See the 9th-degree polynomial satisfaction curves for each activity
- Adjust hours via sliders (with the 24h constraint enforced in real time)
- View the weighted total satisfaction score update live
- Identify optimal peaks and compare them to their own allocation

### Why a Visualizer

The essay (`hello.md`) describes the model in ~350 words with truncated equations. A static description can't convey the shape of the tradeoffs — how steep the dropoff is when you sleep too little, or why 15h of effort sometimes makes sense for big projects. An interactive tool makes the math tangible: drag a slider and watch satisfaction respond.

## 2. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 | Component model, hooks |
| Build | Vite 6 | Fast HMR, zero-config TS |
| Language | TypeScript | Type safety for math logic |
| Charts | Recharts | Composable, React-native charting |
| Styling | Tailwind CSS v4 | Utility-first, minimal config |

## 3. Architecture

### Project Structure

```
dlso/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root layout
│   ├── index.css                 # Tailwind imports
│   ├── model/
│   │   ├── polynomials.ts        # Coefficient definitions & evaluators
│   │   └── optimizer.ts          # Weighted sum, constraint logic
│   ├── hooks/
│   │   └── useDLSO.ts            # State + derived calculations
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── SatisfactionChart.tsx  # Individual polynomial curve
│   │   ├── TotalChart.tsx         # Combined weighted view
│   │   ├── SliderPanel.tsx        # Three sliders with constraint
│   │   ├── ScoreCard.tsx          # Numeric satisfaction readout
│   │   └── OptimalBadge.tsx       # Shows optimal peak values
│   └── lib/
│       └── utils.ts              # Formatting, clamping helpers
```

### Data Flow

```
SliderPanel (user input)
    │
    ▼
useDLSO hook (state + constraint enforcement)
    │
    ├──► polynomials.ts  →  per-activity satisfaction values
    ├──► optimizer.ts    →  weighted total satisfaction
    │
    ▼
App.tsx distributes derived data to:
    ├── SatisfactionChart (curve + current-point marker)
    ├── TotalChart (combined weighted curve)
    ├── ScoreCard (numeric display)
    └── OptimalBadge (peak annotations)
```

## 4. Mathematical Model

### 4.1 Decision Variables

| Variable | Symbol | Domain | Description |
|----------|--------|--------|-------------|
| Effort   | x      | [0, 24] | Hours spent on work/study |
| Sleep    | y      | [0, 24] | Hours spent sleeping |
| Leisure  | z      | [0, 24] | Hours spent on leisure |

**Constraint:** `x + y + z = 24`

### 4.2 Satisfaction Polynomials (9th-degree Maclaurin Series)

Each polynomial is of the form:

```
S(t) = a₉t⁹ + a₈t⁸ + a₇t⁷ + a₆t⁶ + a₅t⁵ + a₄t⁴ + a₃t³ + a₂t² + a₁t + a₀
```

**Effort — S_effort(x):**
Known endpoints from `hello.md`:
- a₉ = 1.29e-7
- a₈ = -1.59e-5
- a₁ = 312.79
- a₀ = -283.46
- (Intermediate coefficients a₇–a₂ are truncated in the source with "…"; they must be reconstructed or approximated to produce the described peaks at x ≈ 8.7h and x ≈ 15.0h.)

**Leisure — S_leisure(y):**
- a₉ = 5.03e-9
- a₈ = 7.67e-7
- a₁ = -5.24
- a₀ = 2.58
- (Peak near y ≈ 4.3h)

**Sleep — S_sleep(z):**
- a₉ = -4.73e-9
- a₈ = -4.08e-8
- a₁ = 2.12
- a₀ = -0.12
- (Peak near z ≈ 9.1h)

> **Implementation note:** The source text truncates middle coefficients. For the visualizer, we will define plausible full 10-coefficient arrays that reproduce the stated peak locations and endpoint values. These will be stored in `src/model/polynomials.ts` as typed constant arrays, with a generic `evaluate(coefficients, t)` function using Horner's method for numerical stability.

### 4.3 Weighted Total Satisfaction

```
Total = (10/24) · S_effort(x) + (8/24) · S_sleep(z) + (6/24) · S_leisure(y)
```

Weights reflect the user's personal priority ranking: Effort (10/24 ≈ 41.7%), Sleep (8/24 ≈ 33.3%), Leisure (6/24 = 25%).

### 4.4 Optimal Values (from the model)

| Activity | Optimal Hours | Notes |
|----------|--------------|-------|
| Effort   | 8.7h (primary), 15.0h (secondary) | Secondary peak for heavy project days |
| Sleep    | 9.1h | |
| Leisure  | 4.3h | User notes they're okay with less |

## 5. Component Design

### `App.tsx`
- Calls `useDLSO()` hook
- Renders layout: Header, SliderPanel on left, charts on right, ScoreCard below
- Passes derived state down as props

### `Header.tsx`
- Title: "Daily Life Satisfaction Optimization"
- Subtitle with brief description
- Props: none

### `SliderPanel.tsx`
- Three range sliders for Effort, Sleep, Leisure
- Each slider: 0–24 range, step 0.1
- Displays current value next to each slider
- Enforces 24h constraint: when one slider moves, the other two adjust proportionally
- Props: `values: { effort: number; sleep: number; leisure: number }`, `onChange: (values) => void`

### `SatisfactionChart.tsx`
- Renders a single polynomial curve (0–24h on x-axis, satisfaction on y-axis)
- Plots the curve as a smooth line (sample every 0.1h = 240 points)
- Shows a dot marker at the user's current hours value
- Shows a dashed vertical line at the optimal peak
- Props: `label: string`, `coefficients: number[]`, `currentValue: number`, `optimalValue: number`, `color: string`

### `TotalChart.tsx`
- Cannot be a simple 2D line chart (3 variables)
- Instead: a stacked bar or grouped display showing each weighted component's contribution at the current allocation
- Also shows the total score prominently
- Props: `scores: { effort: number; sleep: number; leisure: number; total: number }`

### `ScoreCard.tsx`
- Large numeric display of the current total satisfaction
- Color-coded: green near optimal, yellow/red when far
- Shows percentage of theoretical maximum
- Props: `current: number`, `optimal: number`

### `OptimalBadge.tsx`
- Small inline badge showing "Optimal: 8.7h" next to a slider or chart
- Props: `label: string`, `value: number`

## 6. UI/UX Design

### Layout (desktop-first, responsive)

```
┌──────────────────────────────────────────────────┐
│  Header                                          │
├───────────────┬──────────────────────────────────┤
│               │  SatisfactionChart (Effort)       │
│  SliderPanel  │  SatisfactionChart (Sleep)        │
│               │  SatisfactionChart (Leisure)       │
│  ScoreCard    ├──────────────────────────────────┤
│               │  TotalChart (weighted breakdown)  │
├───────────────┴──────────────────────────────────┤
│  Footer (model attribution)                      │
└──────────────────────────────────────────────────┘
```

On mobile: single-column stack (sliders on top, charts below).

### Color Scheme

| Element | Color | Tailwind |
|---------|-------|----------|
| Effort curve | Blue | `blue-500` |
| Sleep curve | Indigo | `indigo-500` |
| Leisure curve | Amber | `amber-500` |
| Optimal markers | Emerald | `emerald-400` |
| Background | Near-black | `slate-950` |
| Card surfaces | Dark gray | `slate-900` |
| Text | Light | `slate-100` |

Dark theme by default (matches a "late-night optimizer" aesthetic).

### Interaction Patterns

- **Sliders** are the primary input. Dragging one redistributes the remaining hours across the other two proportionally.
- **Hover** on chart curves shows a tooltip with exact (hours, satisfaction) values.
- **Click** on an optimal peak marker snaps that slider to the optimal value.
- Smooth transitions on chart updates (Recharts `animationDuration={300}`).

## 7. State Management

### `useDLSO` Hook

```typescript
interface DLSOState {
  effort: number;    // hours, 0–24
  sleep: number;     // hours, 0–24
  leisure: number;   // hours, 0–24
}

interface DLSODerived {
  scores: {
    effort: number;
    sleep: number;
    leisure: number;
    total: number;
  };
  curves: {
    effort: Point[];   // pre-computed for charting
    sleep: Point[];
    leisure: Point[];
  };
  optimals: {
    effort: number;
    sleep: number;
    leisure: number;
    total: number;     // max achievable total
  };
}

function useDLSO(): {
  state: DLSOState;
  derived: DLSODerived;
  setActivity: (activity: keyof DLSOState, hours: number) => void;
  resetToOptimal: () => void;
}
```

### Constraint Enforcement

When the user sets activity `A` to value `v`:

1. Remaining = `24 - v`
2. Current sum of the other two = `otherSum`
3. If `otherSum === 0`, split remaining equally
4. Otherwise, scale each proportionally: `other_i = other_i * (remaining / otherSum)`
5. Clamp all values to `[0, 24]`, re-normalize if needed

### Curve Pre-computation

On mount (and only once), compute 240 points per curve (0.0 to 24.0, step 0.1). Store in `useMemo`. The per-activity satisfaction at the user's current hours is computed on every state change (cheap — single polynomial eval).

### Optimal Finding

On mount, scan each curve's pre-computed points for the maximum. Store as `optimals`. For Effort, also identify the secondary peak.

## 8. Implementation Phases

### Phase 1: Scaffold
- `npm create vite@latest` with React + TypeScript
- Install Recharts, Tailwind CSS v4
- Set up `index.css`, dark theme base

### Phase 2: Math Core
- Define polynomial coefficients in `polynomials.ts`
- Implement `evaluate()` using Horner's method
- Implement weighted total in `optimizer.ts`
- Unit-verify: check that `evaluate(effortCoeffs, 8.7)` is near a local max

### Phase 3: State Hook
- Build `useDLSO` with constraint logic
- Pre-compute curves
- Find and store optimal peaks

### Phase 4: UI Shell
- `App.tsx` layout with Tailwind grid
- `Header`, `SliderPanel`, `ScoreCard` components
- Wire sliders to `useDLSO`

### Phase 5: Charts
- `SatisfactionChart` with curve, marker, optimal line
- `TotalChart` with weighted breakdown
- Tooltips and animation

### Phase 6: Polish
- Responsive layout
- Click-to-snap on optimal markers
- Color transitions on ScoreCard
- Favicon, page title

## 9. Verification Plan

| Check | Method |
|-------|--------|
| Polynomials produce correct peaks | Log `evaluate(coeffs, optimalHours)` and nearby values; confirm local max |
| Constraint always sums to 24 | After every `setActivity` call, assert `effort + sleep + leisure === 24` (within float tolerance) |
| Sliders reflect state | Move one slider → verify the other two update visually and numerically |
| Charts render correctly | Visual check: curves should be smooth, marker dot on the curve, optimal line at the right x |
| Weighted total matches formula | Manually compute `(10/24)*S_e + (8/24)*S_s + (6/24)*S_l` for a known input; compare to displayed score |
| Responsive layout | Resize browser to mobile width; verify single-column stack |
| No negative hours | Drag a slider to 24; verify others go to 0 (not negative) |
| Reset to optimal works | Click reset; verify sliders snap to 8.7, 9.1, 4.3 and remaining ~1.9h is redistributed |
