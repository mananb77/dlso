# The DLSO Model — A Mathematical Guide

## Overview

The **Daily Life Satisfaction Optimization (DLSO)** model treats the question _"How should I spend my 24 hours?"_ as a constrained optimization problem. It was developed by Manan Bhargava during his junior year of high school, when 13–18 hour work days had dropped his sleep to ~6 hours a night. Rather than guessing at a better schedule, he collected data on his own sleep and working hours going back to freshman year, fit polynomial curves to the data, and solved for the allocation that maximizes overall life satisfaction.

The result: **~8.7h effort, ~9.1h sleep, ~4.3h leisure**. Applying the model raised his average sleep from 6 to 7.5 hours.

---

## 1. Motivation — The Problem That Started It All

During junior year, Manan was running 13–18 hour days split between APCS (solving the Eight-Queens problem, building K-means object tracking algorithms), math, problem-solving practice, and collaborating with 2–4 different teams daily. The schedule was unsustainable — sleep had dropped to around 6 hours a night, and the combination of sleep deprivation and relentless effort was degrading both health and the quality of work itself.

The core tension: every hour spent working is an hour not spent sleeping or recovering. But how do you know when you've crossed the line from productive into counterproductive? Intuition fails here because the effects are gradual and the feedback loops are delayed — you don't feel the cost of one lost hour of sleep until days later.

Manan's insight was to reframe this as a **math problem**. If satisfaction from each activity can be measured and modeled as a function of hours, and if the total hours are constrained to 24, then the question "how should I spend my time?" becomes a standard constrained optimization problem with a concrete, computable answer.

---

## 2. Data Collection — Building the Foundation

The model rests on **self-reported longitudinal data** spanning freshman year through junior year (~3 school years, roughly 900+ daily observations). Each day, Manan logged:

- **Hours** spent on each of the three activities (effort, sleep, leisure)
- **Satisfaction ratings** — a subjective 1–100 score for how satisfied he felt with each activity that day

This dataset captures the natural variation in daily schedules: light homework days vs. finals weeks, weekends vs. weekdays, periods of illness, project sprints, and recovery days. The variation is what makes polynomial fitting possible — you need data points across the full range of each variable to see where the curve bends.

### Why Self-Reported Data Works Here

The model is inherently personal. It doesn't claim to describe universal human satisfaction — it describes _one person's_ experienced relationship between hours and satisfaction. Self-reported ratings, despite their subjectivity, are the most direct measurement of what the model is trying to optimize: the person's own felt sense of a well-spent day.

### The Three Activities

The model simplifies a day into three buckets:

| Variable | Symbol | What It Includes |
|----------|--------|-----------------|
| **Effort** | x | Classes, homework, studying, problem-solving, team projects, coding, competitive math prep |
| **Sleep** | z | Nighttime sleep and naps |
| **Leisure** | y | Exercise, socializing, meals, entertainment, health activities, downtime |

This is a deliberate simplification. Real days include transition time, commuting, chores, and activities that blur boundaries (is eating lunch with your study group effort or leisure?). But three categories are enough to capture the essential tradeoff: work vs. rest vs. everything else.

---

## 3. The Mathematical Framework

### 3.1 Decision Variables and Constraint

The three variables `x` (effort), `y` (leisure), and `z` (sleep) each live in `[0, 24]` and must satisfy:

```
x + y + z = 24
```

This **equality constraint** is the heart of the model. It makes the tradeoffs inescapable and quantifiable: every hour added to one activity must come from another. There are no free hours.

### 3.2 Satisfaction Functions — 9th-Degree Maclaurin Series

For each activity, Manan fit a **9th-degree polynomial** to the (hours, satisfaction) data using least-squares regression. The general form is:

```
S(t) = a₉t⁹ + a₈t⁸ + a₇t⁷ + a₆t⁶ + a₅t⁵ + a₄t⁴ + a₃t³ + a₂t² + a₁t + a₀
```

These are called **Maclaurin series** because they are polynomial expansions centered at `t = 0`. The 10 coefficients (`a₀` through `a₉`) are determined by the least-squares fit to the data.

#### Why Polynomials?

Polynomials are a natural choice for curve fitting because:

1. **Universality** — by the Weierstrass approximation theorem, any continuous function on a closed interval can be approximated arbitrarily well by a polynomial of sufficient degree
2. **Differentiability** — polynomials are infinitely differentiable, making it easy to find peaks (set the derivative to zero)
3. **Closed form** — the satisfaction at any point can be computed directly, no iterative methods needed
4. **Interpretability** — the coefficients, while not individually meaningful, collectively define a curve whose shape (peaks, valleys, inflection points) tells a story

#### Why 9th Degree Specifically?

The degree was chosen to balance **expressiveness** and **overfitting**:

| Degree | Capabilities | Limitations |
|--------|-------------|-------------|
| 1–2 | Linear/quadratic trends | Can't model peaks or diminishing returns |
| 3–4 | Single peak, basic curvature | Can't capture effort's double-peak or sleep's asymmetric dropoff |
| 5–6 | Multiple inflection points | May miss subtle features in the tails |
| **9** | **Multiple peaks, asymmetric shapes, nuanced tails** | **Sufficient for all observed patterns** |
| 10+ | Marginally more flexible | High risk of overfitting to noise; Runge's phenomenon at boundaries |

The 9th degree is the sweet spot: it can model the effort curve's two peaks (at 8.7h and 15h), the sleep curve's sharp left dropoff and gentle right decline, and the leisure curve's early peak and steep falloff — all features visible in the data.

### 3.3 The Original Polynomial Coefficients

From Manan's original work, the fitted polynomials are (middle coefficients truncated in the source with "…"):

**Effort Satisfaction — S_effort(x):**
```
S_effort(x) = (1.29×10⁻⁷)x⁹ + (-1.59×10⁻⁵)x⁸ + a₇x⁷ + a₆x⁶ + a₅x⁵
            + a₄x⁴ + a₃x³ + a₂x² + (312.79)x + (-283.46)
```

Known coefficients:
- `a₉ = 1.29 × 10⁻⁷` — the highest-order term is positive but tiny, meaning the curve eventually rises for very large x (beyond the practical domain)
- `a₈ = -1.59 × 10⁻⁵` — the negative x⁸ term pulls the curve back down, creating the falloff after the peaks
- `a₁ = 312.79` — the large positive linear term drives the steep initial rise (going from 0 to 4 hours of effort rapidly increases satisfaction)
- `a₀ = -283.46` — the large negative intercept means zero effort yields strongly negative satisfaction (doing nothing feels bad)

**Sleep Satisfaction — S_sleep(z):**
```
S_sleep(z) = (-4.73×10⁻⁹)z⁹ + (-4.08×10⁻⁸)z⁸ + a₇z⁷ + a₆z⁶ + a₅z⁵
           + a₄z⁴ + a₃z³ + a₂z² + (2.12)z + (-0.12)
```

Known coefficients:
- `a₉ = -4.73 × 10⁻⁹` — negative, ensuring the curve drops for very high sleep values
- `a₈ = -4.08 × 10⁻⁸` — also negative, reinforcing the decline past the peak
- `a₁ = 2.12` — moderate positive slope at the origin; the initial rise is gentler than effort's
- `a₀ = -0.12` — near zero; even zero sleep gives a nearly neutral (not deeply negative) baseline, which makes sense since the satisfaction penalty from no sleep manifests through the curve shape, not the intercept

**Leisure Satisfaction — S_leisure(y):**
```
S_leisure(y) = (5.03×10⁻⁹)y⁹ + (7.67×10⁻⁷)y⁸ + a₇y⁷ + a₆y⁶ + a₅y⁵
             + a₄y⁴ + a₃y³ + a₂y² + (-5.24)y + (2.58)
```

Known coefficients:
- `a₉ = 5.03 × 10⁻⁹` — positive but very small
- `a₈ = 7.67 × 10⁻⁷` — positive, suggesting the curve has upward pressure at high values (tempered by the middle coefficients)
- `a₁ = -5.24` — **negative** linear term, meaning the first hour of leisure actually _decreases_ satisfaction from the intercept. This is counterintuitive but suggests that very small amounts of leisure (0–1h) feel rushed and unsatisfying — you need enough time to actually relax
- `a₀ = 2.58` — slightly positive intercept; the baseline without leisure isn't terrible (the penalty comes from the curve shape at low values)

### 3.4 What the Truncated Coefficients Mean

The original essay presents the polynomials with "…" in the middle, omitting coefficients `a₂` through `a₇`. These six coefficients per polynomial (18 total) are what shape the curves between the endpoints and the tails. They control:

- **Where the peaks occur** — the derivative `S'(t) = 0` depends on all coefficients
- **How sharp the peaks are** — wider peaks mean more tolerance for deviation from optimal
- **The depth of valleys** — how much satisfaction drops between effort's two peaks
- **Asymmetry** — the sleep curve drops faster on the left (deprivation) than the right (oversleep)

In the visualizer, these middle coefficients are reconstructed to produce curves that match the stated peak locations and exhibit the described qualitative behavior.

---

## 4. The Objective Function — Weighted Total Satisfaction

Individual satisfaction scores are combined into a single number using personal priority weights:

```
Total = (10/24) · S_effort(x) + (8/24) · S_sleep(z) + (6/24) · S_leisure(y)
```

### The Weights and Their Meaning

| Activity | Weight | Percentage | Rationale |
|----------|--------|------------|-----------|
| Effort | 10/24 | 41.7% | Highest priority — academic growth, career building, intellectual fulfillment |
| Sleep | 8/24 | 33.3% | Critical for health, cognition, and sustaining effort quality |
| Leisure | 6/24 | 25.0% | Important but flexible — "okay with less" |

The weights are expressed as fractions of 24 (summing to 24/24 = 1), creating a weighted average. This is an elegant choice: each weight can be interpreted as "how many of the 24 hours' worth of importance does this activity carry?"

### Why These Specific Weights?

The weights encode **personal values**, not objective truth. Manan chose 10:8:6 because:

- **Effort dominates** — as a student preparing for college with deep interests in math and CS, academic work is the primary driver of long-term satisfaction
- **Sleep is close behind** — the experience of running on 6 hours made the cost of sleep deprivation viscerally clear. Sleep isn't just rest; it's the foundation that makes effort productive
- **Leisure is valued but sacrificeable** — exercise, socializing, and downtime matter, but on a busy day, leisure is the first thing to compress

A different person — say, a professional athlete or a retiree — would have very different weights. The DLSO framework is general; only the parameters are personal.

### The Effect of Weights on the Solution

The weights don't just scale the satisfaction scores — they shift where the optimal allocation lands. Higher effort weight pulls the solution toward more work hours; higher sleep weight pulls toward more sleep. Because the satisfaction curves have different shapes (effort has a secondary peak, sleep has a sharp left dropoff), the interaction between weights and curve shapes produces a solution that isn't simply proportional to the weights.

---

## 5. The Optimization Problem — Formal Statement

```
maximize    f(x, y, z) = (10/24)·S_effort(x) + (8/24)·S_sleep(z) + (6/24)·S_leisure(y)

subject to  g(x, y, z): x + y + z = 24
            x ≥ 0,  y ≥ 0,  z ≥ 0
```

This is a **constrained nonlinear optimization** problem with:
- 3 decision variables
- 1 equality constraint
- 3 inequality constraints (non-negativity)
- A non-convex objective function (9th-degree polynomials can have multiple local maxima)

### 5.1 Method of Lagrange Multipliers

The classical approach. Introduce a Lagrange multiplier λ for the equality constraint and solve:

```
∇f = λ · ∇g
```

This gives the system:

```
(10/24) · S'_effort(x) = λ
(6/24) · S'_leisure(y) = λ
(8/24) · S'_sleep(z)   = λ
x + y + z = 24
```

The first three equations say: **at the optimum, the weighted marginal satisfaction must be equal across all activities.** This makes intuitive sense — if an extra hour of sleep would give you more weighted satisfaction than an extra hour of work, you haven't found the optimum yet.

Since `S'(t)` is an 8th-degree polynomial for each activity, this system has many solutions. The global maximum must be found by evaluating all critical points and comparing.

### 5.2 Numerical Grid Search

A more practical approach (and what the visualizer uses):

1. Discretize each variable: x ∈ {0.0, 0.1, 0.2, …, 24.0}
2. For each valid triple (x, y, z) where x + y + z = 24, compute `f(x, y, z)`
3. Return the triple with the highest value

With 0.1h resolution, this evaluates ~29,000 triples — trivial for a modern computer.

### 5.3 Independent Peak Analysis

A useful approximation: find each curve's peak independently, then check if the peaks are compatible with the constraint.

- Effort peaks at x* ≈ 8.7h
- Sleep peaks at z* ≈ 9.1h
- Leisure peaks at y* ≈ 4.3h
- Sum: 8.7 + 9.1 + 4.3 = 22.1h < 24h ✓

Since the independent peaks sum to less than 24, there's slack — meaning each activity can sit at or near its individual peak without conflict. The remaining 1.9 hours can be distributed without significant satisfaction loss. This is a lucky outcome; if the peaks summed to more than 24, the optimization would require painful tradeoffs.

---

## 6. The Solution — Optimal Daily Allocation

| Activity | Optimal Hours | Satisfaction at Peak | Notes |
|----------|--------------|---------------------|-------|
| Effort | **8.7h** | High | Primary peak; deep focused work |
| Sleep | **9.1h** | High | Full recovery without oversleep |
| Leisure | **4.3h** | Moderate-high | Exercise, social, downtime |
| Buffer | **1.9h** | — | Transitions, meals, flexibility |

### The Secondary Effort Peak

The effort satisfaction curve has a distinctive **double-hump shape** with peaks at 8.7h and ~15h. This isn't a mathematical artifact — it reflects a real pattern in the data:

- **8.7h peak:** The normal productive day. Enough time for classes, homework, and focused project work. Sustainable daily.
- **15h peak:** The sprint day. Happens during hackathons, competition prep, or project deadlines. Satisfaction can remain high because the work is engaging and the stakes are clear — but only if it's occasional, not chronic.
- **The valley between (10–13h):** An awkward middle ground. Too long for a normal day (fatigue sets in) but not long enough for the "flow state" that sustains 15-hour sprints.

### Real-World Impact

After computing the optimal allocation, Manan restructured his schedule to target these peaks. The most significant change: **raising average sleep from 6 to 7.5 hours**. This meant reducing effort from the unsustainable 13–18h range toward the 8–10h range — a loss of working hours that was more than compensated by:

- Higher quality of work during those hours (better cognition, fewer mistakes)
- Improved physical health
- Greater overall life satisfaction

The model quantified what intuition vaguely suggested: running on 6 hours of sleep wasn't just uncomfortable, it was _suboptimal even by the model's own effort-heavy weighting_.

---

## 7. Constraint Enforcement in the Visualizer

When the user drags a slider, the other two must adjust to maintain `x + y + z = 24`. The algorithm uses **proportional redistribution**:

1. User sets activity A to new value `v`
2. Clamp: `v = clamp(v, 0, 24)`
3. Remaining hours: `r = 24 - v`
4. Sum of the other two activities: `s = B + C`
5. If `s = 0`: split remaining equally → `B = C = r/2`
6. Otherwise: scale proportionally → `B = B × (r/s)`, `C = C × (r/s)`
7. Clamp all values to `[0, 24]` and re-normalize if needed

### Why Proportional (Not Equal) Redistribution?

Consider: you're at (8, 9, 7) and increase effort to 12. The 4 hours must come from somewhere.

- **Equal redistribution:** Sleep → 7, Leisure → 5. Takes 2h from each regardless of current values.
- **Proportional redistribution:** Sleep → 9 × (12/16) = 6.75, Leisure → 7 × (12/16) = 5.25. Takes more from the larger allocation.

Proportional feels more natural because it preserves the _ratio_ between the other activities. If you were sleeping twice as much as leisure, that 2:1 ratio is maintained after redistribution. This avoids the jarring experience of one slider jumping dramatically when you adjust another.

---

## 8. Polynomial Evaluation — Horner's Method

The visualizer evaluates polynomials using **Horner's method** rather than the naive approach of computing each power of `t` separately:

```
// Naive: a₉t⁹ + a₈t⁸ + ... + a₁t + a₀
// Horner: (((...((a₉t + a₈)t + a₇)t + a₆)t + ...)t + a₁)t + a₀

function evaluate(coefficients, t) {
  let result = 0;
  for (const coeff of coefficients) {
    result = result * t + coeff;
  }
  return result;
}
```

Horner's method reduces the operation count from O(n²) to O(n) multiplications and is more numerically stable — important when dealing with coefficients spanning many orders of magnitude (from 10⁻⁹ to 10²).

---

## 9. Limitations and Future Directions

### Current Limitations

- **Individual-specific:** The polynomials and weights are fit to one person's data. A different person would need to collect their own data and refit.
- **Static model:** The satisfaction functions are fixed. In reality, they change with seasons (summer vs. school year), life stages, health status, and even mood.
- **Independence assumption:** The model treats `S_effort(x)`, `S_sleep(z)`, and `S_leisure(y)` as independent functions. In reality, sleep quality profoundly affects next-day effort satisfaction — a cross-day interaction the model ignores.
- **Three-category simplification:** Real time allocation is more granular. Commuting, eating, chores, and transition time are lumped into leisure but have different satisfaction profiles.
- **Polynomial extrapolation:** 9th-degree polynomials behave erratically outside the data range. The model is only reliable within the range of hours actually observed in the training data.

### Potential Extensions

- **Adaptive retraining:** Periodically refit the polynomials as new data accumulates, allowing the model to evolve with the user
- **Deep Neural Network integration:** As Manan noted in the original essay — a DNN could analyze calendar data, biometric signals, and self-reports to optimize in real time, adapting to daily context
- **Multi-day optimization:** Instead of optimizing each day independently, optimize over a week to account for sleep debt, recovery days, and periodic intensive work sessions
- **Interaction terms:** Add cross-variable terms like `S_effort(x, z_yesterday)` to model how yesterday's sleep affects today's effort satisfaction
- **Personalization engine:** Let any user input their own (hours, satisfaction) data and generate custom curves and weights, making the DLSO framework a general tool rather than a single-person model

---

## 10. Key Takeaways

1. **The relationship between hours and satisfaction is nonlinear.** There are real, quantifiable diminishing returns and tipping points. A little more sleep helps a lot; a little more effort past 9 hours helps less than you'd think.

2. **Sleep deprivation is measurably expensive.** The steep satisfaction dropoff below 7 hours of sleep makes it one of the highest-leverage changes you can make. The model proved that cutting work hours to gain sleep was a net-positive trade — even with effort weighted at 42%.

3. **More effort ≠ more satisfaction.** The primary peak at 8.7h shows that focused, bounded work outperforms marathon sessions on most days. The secondary peak at 15h exists but is narrow and unsustainable.

4. **Some leisure is essential, even for productivity-focused people.** Even with leisure weighted at only 25%, the model prescribes 4+ hours daily. Cutting leisure below 2 hours degrades satisfaction rapidly.

5. **Quantifying tradeoffs beats intuition.** The act of collecting data, fitting curves, and solving the optimization — even with imperfect data and a simplified model — produced a concrete, actionable answer that intuition alone could not. The model didn't tell Manan anything shocking; it told him something _specific_ and gave him the confidence to actually change his behavior.

6. **The framework is more valuable than the parameters.** The specific coefficients and weights are personal to Manan. But the framework — decompose your day, measure satisfaction, fit curves, optimize — is universally applicable. Anyone willing to collect the data can build their own DLSO model.
