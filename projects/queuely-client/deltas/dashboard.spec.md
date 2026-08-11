# Dashboard — Spec

## Objective

Provide the model's parameter inputs (Gaussian amplitude, peak time, and width; constant service rate; study horizon; integration point count) with inline validation, and orchestrate a live, debounced recomputation of the other simulation slices whenever the parameter set changes and is valid.

## Scope

In scope:
- The parameter input form.
- Inline, per-field validation, matching the bounds validated in the reference design prototype:
  - Amplitude: must be a finite number `> 0` and `<= 1000`.
  - Peak time: must be a finite number within `[0, horizon]` (validated only once the horizon itself is valid).
  - Width (standard deviation): must be a finite number `> 0` and `<= horizon` (validated only once the horizon itself is valid).
  - Service rate: must be a finite number `> 0` and `<= 1000`.
  - Horizon: must be a finite number `> 0` and `<= 500`.
  - Integration point count: must be an integer between `10` and `2000` inclusive.

  While any field is invalid, no recomputation happens and no output is rendered from a degenerate parameter set.
- Reactive state holding the current parameter set.
- Debouncing the recomputation trigger so rapid successive edits to one field don't recompute on every keystroke.

Out of scope:
- The computation itself — delegated to `demand-generator`, `queue-simulator`, and `integral-analysis-engine`.
- Chart rendering — delegated to `visualization`.
- Saving scenarios — delegated to `scenario-comparison`; this slice only exposes the action that triggers a save, it doesn't own the saved list.

## Technical context

This is the application-layer piece of the architecture: parameter inputs feeding reactive state, which the simulation modules recompute from. There is no routing library and no external state-management library in this project — state here is framework-native reactivity (refs/reactive objects) composed through composables, consistent with the rest of the codebase.

Default parameter values, used as the initial state and referenced by this and other slices' acceptance criteria:

| Parameter | Symbol | Default | Max |
|---|---|---|---|
| Gaussian amplitude | `A` | 140 orders/min | 1000 |
| Gaussian peak time | `μ_t` | 40 min | horizon |
| Gaussian width (std. dev.) | `σ` | 12 min | horizon |
| Constant service rate | `μ₀` | 60 orders/min | 1000 |
| Study horizon | `T_max` | 90 min | 500 |
| Integration point count | `n` | 180 | 2000 (min 10) |

`μ₀` is set below `A` so the system is temporarily overloaded (`ρ(t) > 1`) near the peak, which is what produces a non-trivial backlog to observe. `T_max` extends well past the peak, leaving enough margin for the queue to drain back to zero within the study horizon under these defaults.

## Implementation

- A composable owning the reactive parameter-set state and its validation.
- A form component, one field per parameter, each with its own inline error message.
- A debounced reactive trigger that recomputes by calling into `demand-generator`, `queue-simulator`, and `integral-analysis-engine`, firing only when the full parameter set is valid.
- Lives under this slice's own feature directory in the project's feature-based source layout.

## Acceptance criteria

- [ ] Setting a parameter to an invalid value shows an inline error message under that specific field, and no recomputation happens — the previous output is not silently replaced by a degenerate one.
- [ ] Correcting an invalid value clears its error and automatically triggers recomputation, with no separate user action required.
- [ ] Rapid successive edits to the same field trigger at most one recomputation after the edits settle (debounce is observable), not one per keystroke.

## How to test

Manually in the browser: open the dashboard, set the width parameter to a negative value, and confirm an inline error appears under that field and no chart update occurs. Restore a valid width and confirm the charts update automatically with no further action.

## Risks / edge cases

- Too aggressive a debounce delay makes the UI feel unresponsive; too little defeats the point of debouncing, though the underlying computation itself is cheap enough (sub-millisecond even at thousands of points) that this is a UX concern, not a performance one.
- A partially invalid parameter set must not leave the last valid output on screen disguised as current — it must be visually clear that the displayed output is stale/frozen while a field is invalid.
