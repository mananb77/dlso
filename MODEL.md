# The DLSO Model — A Mathematical Guide

## Overview

The **Daily Life Satisfaction Optimization (DLSO)** model treats the question _"How should I spend my 24 hours?"_ as a constrained optimization problem. It was developed by Manan Bhargava during his junior year of high school, when 13–18 hour work days had dropped his sleep to ~6 hours a night. Rather than guessing at a better schedule, he collected data on his own sleep and working hours going back to freshman year, fit polynomial curves to the data, and solved for the allocation that maximizes overall life satisfaction.

The result: **~8.7h effort, ~9.1h sleep, ~4.3h leisure**. Applying the model raised his average sleep from 6 to 7.5 hours.

---

## 1. Decision Variables

The model partitions each day into three activities:

| Variable | Symbol | Domain | Description |
|----------|--------|--------|-------------|
| Effort | x | [0, 24] | Hours spent on work, study, academics |
| Sleep | z | [0, 24] | Hours spent sleeping |
| Leisure | y | [0, 24] | Hours spent on leisure, health, social |

### The Constraint

Every day has exactly 24 hours:

```
x + y + z = 24
```

This is the core constraint. Increasing one activity necessarily decreases the others. The model makes this tradeoff explicit and quantifiable.

---

## 2. Satisfaction Functions

Each activity has a **satisfaction function** — a 9th-degree polynomial (Maclaurin series) fit to historical data:

```
S(t) = a₉t⁹ + a₈t⁸ + a₇t⁷ + a₆t⁶ + a₅t⁵ + a₄t⁴ + a₃t³ + a₂t² + a₁t + a₀
```

These polynomials capture the nonlinear relationship between hours and satisfaction. Key insight: **more is not always better**. Each curve rises, peaks, and eventually falls — capturing diminishing returns and the penalty of excess.

### Effort Satisfaction — S_effort(x)

```
S_effort(x) = (1.29×10⁻⁷)x⁹ + (-1.59×10⁻⁵)x⁸ + … + (312.79)x + (-283.46)
```

**Shape:** Rises steeply from 0, peaks around **8.7 hours** (primary optimum), dips slightly, then shows a secondary peak near **15 hours** before dropping sharply.

**Interpretation:**
- Below 6h: Unsatisfying — not enough time to make meaningful progress
- 8–9h: Sweet spot for most days — deep work without burnout
- 13–15h: A secondary peak exists for intensive project days
- Above 17h: Steep satisfaction dropoff — diminishing returns, fatigue, health impact

### Sleep Satisfaction — S_sleep(z)

```
S_sleep(z) = (-4.73×10⁻⁹)z⁹ + (-4.08×10⁻⁸)z⁸ + … + (2.12)z + (-0.12)
```

**Shape:** Strong upward curve that peaks at **9.1 hours**, then gently declines.

**Interpretation:**
- Below 5h: Very low satisfaction — sleep deprivation has severe cognitive and health effects
- 6–7h: Rising quickly — each additional hour matters a lot
- 9.1h: Optimal — full recovery without wasting productive hours
- Above 10h: Slight decline — oversleep correlates with grogginess and lost opportunity

### Leisure Satisfaction — S_leisure(y)

```
S_leisure(y) = (5.03×10⁻⁹)y⁹ + (7.67×10⁻⁷)y⁸ + … + (-5.24)y + (2.58)
```

**Shape:** Peaks early at **4.3 hours**, then drops off steeply.

**Interpretation:**
- 0–2h: Rising — some leisure is essential for mental health
- 4.3h: Optimal — enough time for exercise, socializing, and rest
- Above 6h: Diminishing returns — too much idle time reduces satisfaction
- The steep dropoff reflects that the model's author values productivity; others might see a gentler decline here

---

## 3. Weighted Total Satisfaction

Individual satisfaction scores are combined into a single objective function using personal priority weights:

```
Total = (10/24) · S_effort(x) + (8/24) · S_sleep(z) + (6/24) · S_leisure(y)
```

| Activity | Weight | Percentage | Rationale |
|----------|--------|------------|-----------|
| Effort | 10/24 | 41.7% | Highest priority — academic and professional growth |
| Sleep | 8/24 | 33.3% | Critical for health and cognitive function |
| Leisure | 6/24 | 25.0% | Important but flexible — "okay with less" |

The weights sum to 1 (= 24/24), making the total a weighted average. These weights are subjective and reflect the author's personal values — a different person might weight sleep or leisure more heavily.

---

## 4. The Optimization Problem

Formally, the DLSO model solves:

```
maximize    (10/24)·S_effort(x) + (8/24)·S_sleep(z) + (6/24)·S_leisure(y)

subject to  x + y + z = 24
            x, y, z ≥ 0
```

This is a **constrained nonlinear optimization** problem. With 9th-degree polynomials, the objective function has multiple local optima, making it nontrivial to solve analytically.

### Solution Methods

1. **Analytical (Lagrange multipliers):** Form the Lagrangian with the equality constraint, take partial derivatives, and solve the resulting system. With degree-9 polynomials, this yields an 8th-degree system — solvable but messy.

2. **Numerical (grid search):** Evaluate the total satisfaction across a grid of (x, y, z) triples satisfying the constraint. The visualizer uses this approach — pre-computing 240 points per curve and scanning for peaks.

3. **Calculus of each component:** Since the weights are fixed and the constraint is linear, the optimal allocation is approximately where each weighted marginal satisfaction is equal:

```
(10/24) · S'_effort(x*) ≈ (8/24) · S'_sleep(z*) ≈ (6/24) · S'_leisure(y*)
```

---

## 5. Optimal Solution

| Activity | Optimal Hours | Remaining |
|----------|--------------|-----------|
| Effort | 8.7h | — |
| Sleep | 9.1h | — |
| Leisure | 4.3h | — |
| **Unallocated** | **1.9h** | Buffer/transition time |

The three optima sum to 22.1 hours, leaving ~1.9 hours of "slack" that gets distributed across activities. In the visualizer, the initial allocation is set to (8.7, 9.1, 6.2), distributing the slack into leisure.

### Secondary Peak (Effort)

The effort curve has a secondary peak at **~15 hours**. This reflects the reality that on heavy project days (hackathons, deadlines, competition prep), pushing to 15 hours can still yield high satisfaction — but the window is narrow, and going beyond 17 hours drops satisfaction rapidly.

---

## 6. Constraint Enforcement

When the user adjusts one slider in the visualizer, the other two must change to maintain the 24-hour constraint. The redistribution algorithm:

1. User sets activity A to value v
2. Remaining hours = 24 − v
3. Current sum of other two = otherSum
4. If otherSum = 0: split remaining equally
5. Otherwise: scale each proportionally — `other_i = other_i × (remaining / otherSum)`
6. Clamp all values to [0, 24]

This preserves the _ratio_ between the other two activities while absorbing the change, which feels natural — if you sleep more, both work and leisure shrink proportionally rather than one absorbing all the change.

---

## 7. Data Collection

The model was built on self-reported data collected from freshman through junior year (~3 school years). Each data point represents one day with:

- Hours spent on effort, sleep, and leisure
- A satisfaction rating (1–100) for each activity
- An overall satisfaction score

The 9th-degree polynomials were fit to this data using least-squares regression. The high degree was chosen to capture the nuanced, non-monotonic relationship between hours and satisfaction — particularly the secondary effort peak and the sharp sleep deprivation penalty.

### Why 9th Degree?

- **Degree 1–3:** Too simple — can't capture the double-peak in effort or the asymmetric sleep curve
- **Degree 4–6:** Can capture one peak but miss subtleties
- **Degree 9:** Flexible enough to model the observed patterns while still being a closed-form polynomial (Maclaurin series)
- **Higher degrees:** Risk overfitting to noise in the data

---

## 8. Limitations and Extensions

### Limitations

- **Individual-specific:** The polynomials and weights reflect one person's data and values. A different person would have different curves.
- **Static model:** Satisfaction functions likely change over time (seasons, life stages, health). The current model uses a single set of curves.
- **Three categories:** Effort/Sleep/Leisure is a simplification. Real time allocation includes commuting, eating, chores, etc.
- **Independence assumption:** The model treats each satisfaction function as independent of the others. In reality, sleep quality affects effort satisfaction and vice versa.

### Potential Extensions

- **Adaptive polynomials:** Refit curves periodically as new data comes in
- **Deep Neural Network:** As mentioned in the original essay — use a DNN to analyze daily calendar data and provide personalized optimization in real time
- **Multi-day optimization:** Account for sleep debt, recovery days, and weekly cycles
- **Interaction terms:** Model how sleep quality affects next-day effort satisfaction
- **Personalization:** Allow users to input their own data and generate custom curves

---

## 9. Key Takeaways

1. **The relationship between hours and satisfaction is nonlinear.** There are real, quantifiable diminishing returns and tipping points.
2. **Sleep deprivation is expensive.** The steep satisfaction dropoff below 7 hours of sleep makes it one of the highest-leverage changes you can make.
3. **More effort ≠ more satisfaction.** The primary peak at 8.7h shows that focused, bounded work outperforms marathon sessions most days.
4. **Some leisure is essential.** Even for someone who weights effort at 42%, the model still prescribes 4+ hours of leisure.
5. **Making tradeoffs explicit helps.** The act of quantifying preferences and constraints — even imperfectly — leads to better decisions than intuition alone.
