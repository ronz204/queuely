# Parameter Form — Spec

## Objective

Provide the model's parameter inputs (Gaussian amplitude, peak time, and width; constant service rate; study horizon; integration point count) with inline validation, and orchestrate a live, debounced recomputation via the simulation domain service whenever the parameter set changes and is valid.

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
- Reactive state holding the current parameter set, its validation errors, and the current `SimulationResult`.
- Debouncing the recomputation trigger so rapid successive edits to one field don't recompute on every keystroke.

Out of scope:
- The computation itself — delegated to `simulation` (which in turn delegates to `demand-generator`, `queue-simulator`, and `integral-analysis-engine`); this slice only decides *when* to call it.
- Chart rendering — delegated to `visualization`.
- Saving scenarios — delegated to `scenario-comparison`; this slice only exposes the current `SimulationResult` for that slice to capture, it doesn't own the saved list.

## Technical context

This is the application-state layer of the architecture: a Pinia store holds the raw string form input, per-field validation errors, and the current `SimulationResult`, recomputing via `simulation`'s orchestration function whenever the parsed parameter set is valid. The form component is a thin UI layer on top — one field per parameter, reading the store directly (no props/emits from a parent) and calling the store's field-update action on each edit.

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

- A Pinia store owning the raw parameter-input state (one string per field), the per-field validation errors, and the current `SimulationResult`.
- Validation logic converting the raw string input into a typed parameter set or a set of per-field error messages, colocated with the store since it's the store's own input contract.
- A debounced trigger, owned by the store, that revalidates on every field edit and, only when the full parameter set is valid, calls `simulation`'s orchestration function and stores the result.
- A form component, one field per parameter, each bound to the store's raw value/error for that field and calling the store's field-update action on change — reads the store directly rather than receiving state through props.
- Lives across two layers of the project's layered source structure: the reactive state and validation in the application-state layer, the UI in the feature layer.

## Acceptance criteria

- [ ] Setting a parameter to an invalid value shows an inline error message under that specific field, and no recomputation happens — the previous output is not silently replaced by a degenerate one.
- [ ] Correcting an invalid value clears its error and automatically triggers recomputation, with no separate user action required.
- [ ] Rapid successive edits to the same field trigger at most one recomputation after the edits settle (debounce is observable), not one per keystroke.

## How to test

Manually in the browser: open the app, set the width parameter to a negative value, and confirm an inline error appears under that field and no chart update occurs. Restore a valid width and confirm the charts update automatically with no further action.

## Risks / edge cases

- Too aggressive a debounce delay makes the UI feel unresponsive; too little defeats the point of debouncing, though the underlying computation itself is cheap enough (sub-millisecond even at thousands of points) that this is a UX concern, not a performance one.
- A partially invalid parameter set must not leave the last valid output on screen disguised as current — it must be visually clear that the displayed output is stale/frozen while a field is invalid.
