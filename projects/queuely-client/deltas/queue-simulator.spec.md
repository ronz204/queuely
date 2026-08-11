# Queue Simulator — Spec

## Objective

Compute `Q(t)`, the queue size at every instant (never negative), and the total accumulated backlog `D` over the interval where arrivals exceed service capacity, using the project's numerical integration engine.

## Scope

In scope:
- Computing `Q(t)` over a grid of instants via the Fundamental Theorem of Calculus, clipped to never go negative.
- Detecting the critical interval where `λ(t) > μ(t)`.
- Computing `D`, the area between the arrival and service curves over that critical interval.
- Computing the average value of `λ(t)` over that same critical interval, using the integration engine.
- Defining the constant service rate `μ(t) = μ₀` — a trivial pure function, kept in this slice rather than given a slice of its own since it doesn't warrant one.

Out of scope:
- Any non-constant service rate (stepped or time-varying) — not part of the current model.
- Persisting results between sessions.

## Technical context

Consumes `λ(t)` from `demand-generator` and the integrator from `integral-analysis-engine`. Its output is consumed by `dashboard`, which orchestrates recomputation, and by `visualization`, which renders the resulting series and metrics.

## Implementation

- A pure function for the constant service rate `μ(t) = μ₀`.
- A pure function computing the `Q(t)` series over a time grid, applying the non-negativity clip at every point.
- A pure function finding the critical interval where `λ(t) > μ(t)`.
- A pure function computing the backlog `D` over the critical interval, via the integration engine.
- Lives under this slice's own feature directory in the project's feature-based source layout.

## Acceptance criteria

- [ ] `Q(t)` is never negative at any point in the computed series.
- [ ] With the model's default parameters (amplitude 140 orders/min, peak time 40 min, width 12 min, service rate 60 orders/min, horizon 90 min — see `dashboard.spec.md`), the peak of `Q(t)` occurs strictly after `t = 40`, not at the same instant.
- [ ] With those same default parameters, `Q(t)` returns to (or reaches near) zero before `t = 90`.
- [ ] `D` and `Q(t)` at the end of the horizon are reported as distinct values — they are complementary metrics, not the same quantity under two names.

## How to test

With the default parameters (amplitude 140, peak time 40, width 12, service rate 60, horizon 90), compute the `Q(t)` series and confirm the minimum value across the series is `>= 0`. Locate the instant where `Q(t)` peaks and confirm it is later than `t = 40`. Confirm `Q(t)` reaches zero (or near zero) before `t = 90`. Compute `D` with both Simpson's rule and the trapezoidal rule and confirm the two results differ by less than 1%.

## Risks / edge cases

- A service rate too low relative to the arrival amplitude and study horizon leaves a residual backlog that never drains to zero — this must be visually evident in the resulting series, not silently absorbed.
- The critical-interval detection currently assumes a single interval where `λ(t) > μ(t)`, which holds for a constant `μ(t)` and a single-peaked Gaussian `λ(t)`; it should not hard-code that assumption in a way that would silently misbehave if a non-constant `μ(t)` were introduced later.
