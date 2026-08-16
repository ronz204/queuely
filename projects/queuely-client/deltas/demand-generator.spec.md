# Demand Generator — Spec

## Objective

Produce `λ(t)`, the continuous Gaussian arrival-rate curve, and derive from it a list of discrete arrival instants via thinning against a non-homogeneous Poisson process.

## Scope

In scope:
- Evaluating the Gaussian `λ(t)` given its amplitude, peak time, and width.
- Generating discrete arrival events via the thinning algorithm, using the Gaussian's amplitude as `λ_max` (its maximum is at the peak, where the Gaussian equals its amplitude by construction).

Out of scope:
- `μ(t)`, the service rate — that lives with `queue-simulator`, which owns the comparison between arrivals and service.
- Any non-Gaussian shape for `λ(t)` (e.g. a sinusoidal arrival rate) — not part of the current model.

## Technical context

This is one of the two foundational slices (alongside `integral-analysis-engine`) with no dependency on any other slice in the project. Its output is consumed by `queue-simulator`, which compares `λ(t)` against `μ(t)`, and by `visualization`, which plots both the continuous curve and the discrete events generated from it.

## Implementation

- A pure function evaluating the Gaussian `λ(t)` given amplitude, peak time, standard deviation, and the time `t`.
- A function generating arrival events over a given horizon, implementing the thinning algorithm: draw candidate instants from a homogeneous Poisson process at the Gaussian's maximum rate, then accept each candidate with probability `λ(t) / λ_max`. This is the one computation in the project whose cross-cutting "deterministic core" requirement is relaxed — it's seeded from a hash of the current parameter set (amplitude, peak time, width, service rate, horizon, point count) rather than an unseeded system RNG, so the same parameter set always reproduces the same events. This keeps the live-recompute dashboard visually stable (event markers don't jitter between recomputes of the same parameters) while still being effectively random across different parameter sets.
- Lives in its own domain module, one of the project's foundational domain modules with no dependency on any other slice.

## Acceptance criteria

- [ ] `λ(t)` evaluated at the peak time returns the configured amplitude.
- [ ] `λ(t)` is strictly positive across its entire domain.
- [ ] The density of events produced by thinning follows the shape of the Gaussian (e.g. binning generated events by time and comparing the resulting histogram shape against `λ(t)` qualitatively).
- [ ] With the model's default parameters (amplitude 140 orders/min, peak time 40 min, width 12 min, horizon 90 min — see `parameter-form.spec.md`), the expected number of generated events approximates the numerical integral of `λ(t)` over `[0, 90]`.
- [ ] The same parameter set always produces the same sequence of events (seeded determinism); changing any parameter changes the seed and produces a different sequence.

## How to test

Vary only the RNG seed input (by varying parameters that feed it) while holding the horizon fixed, run event generation, and confirm the average event count across many distinct parameter sets converges near the numerical integral of `λ(t)` over the same horizon (computed via `integral-analysis-engine`). Separately, confirm no generated event falls outside `[0, horizon]`, and confirm calling the function twice with the exact same parameter set returns identical events.

## Risks / edge cases

- A zero or negative standard deviation produces a degenerate or division-by-zero Gaussian — this must be rejected by parameter validation upstream, in the parameter form's validation (see `parameter-form.spec.md`), not handled here.
- A horizon short relative to peak time plus a few standard deviations truncates the Gaussian's right tail — this is expected, valid behavior, not a bug.
- Thinning can, by the seeded randomness, generate very few or zero events on a short horizon — this is not an error condition.
