# Visualization — Spec

## Objective

Render the model's curves — `λ(t)`, `μ(t)`, `Q(t)` — and its derived metrics (backlog `D`, the instant and value of `Q(t)`'s peak, the average of `λ(t)` over the critical interval) with Chart.js, reacting to changes in the dashboard's current parameter set.

## Scope

In scope:
- A line chart overlaying `λ(t)` and `μ(t)`.
- A chart (the same or a separate one) for `Q(t)`.
- Shading the backlog `D`'s area over the critical interval.
- Markers for the discrete Poisson-generated arrival events, layered over the `λ(t)` curve, visually distinct from the continuous curve.
- A panel/labels surfacing the derived numeric metrics.

Out of scope:
- Exporting charts as images or PDF.
- Custom animation beyond Chart.js's defaults.

## Technical context

Consumes the series produced by `demand-generator`, `queue-simulator`, and `integral-analysis-engine`, as orchestrated by `dashboard`. Chart.js is used directly, with no framework-specific wrapper, and updated imperatively from computed series — this keeps the charting layer decoupled from the framework's reactivity model.

## Implementation

- A function that updates existing Chart.js instances' datasets from newly computed series, called imperatively whenever the parameter set changes and produces new output — not a full chart re-creation on every update.
- Thin Vue components responsible only for mounting/unmounting the canvas elements and invoking that update function; no reactive wrapper duplicating Chart.js's own state.
- Lives under this slice's own feature directory in the project's feature-based source layout.

## Acceptance criteria

- [ ] Changing a valid parameter in the dashboard updates the charts to reflect the new series, with no page reload.
- [ ] The backlog `D` area is visually shaded over the critical interval.
- [ ] Discrete Poisson-generated events are rendered as individual markers, visually distinguishable from the continuous `λ(t)` curve.
- [ ] The displayed numeric metrics (`D`, `Q(t)`'s peak value and instant, average `λ(t)`) match the values returned by `queue-simulator`/`integral-analysis-engine` for the same parameter set.

## How to test

Manually in the browser: load the dashboard with the default parameters (amplitude 140 orders/min, peak time 40 min, width 12 min, service rate 60 orders/min, horizon 90 min — see `dashboard.spec.md`) and confirm visually that `λ(t)` shows a Gaussian peak at `t = 40`, that `Q(t)` reaches its maximum after `t = 40`, and that the shaded `D` region approximately matches where `λ(t)` sits above the `μ(t) = 60` line.

## Risks / edge cases

- Chart.js's imperative lifecycle must be reconciled with Vue's component lifecycle — failing to destroy a chart instance on component unmount leaks memory.
- Recreating the entire chart on every recomputation instead of updating existing datasets can make the debounced live-recompute flow feel sluggish, even though the underlying numerical computation itself is effectively instant.
