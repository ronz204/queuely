# Simulation — Spec

## Objective

Combine the arrival-rate curve, the queue-size series, and the numerical integrator's outputs into one coherent `SimulationResult` for a given parameter set — the single orchestration point the rest of the app calls to get "the current answer" from the mathematical model.

## Scope

In scope:
- Building the time grid over the study horizon at the requested point count.
- Calling `demand-generator` for `λ(t)` and the discrete Poisson events, `queue-simulator` for `Q(t)`, the critical interval, backlog `D`, and average `λ(t)` during the critical interval, and combining them into one `SimulationResult`.
- Locating the peak of `Q(t)` (its value and instant) from the computed series.
- Deriving the `isOverloaded` flag from whether backlog `D` is meaningfully above zero.
- Defining the `SimulationParameters`, `SimulationSeries`, `SimulationMetrics`, and `SimulationResult` types that every other slice reading simulation output depends on.

Out of scope:
- The math itself for arrival rate, queue size, or integration — delegated to `demand-generator`, `queue-simulator`, and `integral-analysis-engine` respectively; this slice only combines their outputs.
- Deciding when to recompute, holding the current parameter set, or validating input — that's the simulation store's responsibility (see `parameter-form.spec.md`).
- Rendering anything — delegated to `visualization`.

## Technical context

This is the domain layer's composition point — a pure domain service, not application state: it takes a `SimulationParameters` value and returns a `SimulationResult` value, with no reactivity, no I/O, and no knowledge of Vue. It sits alongside `demand-generator`, `queue-simulator`, and `integral-analysis-engine` as one of the project's domain modules, and is the only one of the four that depends on the other three rather than being self-contained. The simulation store (see `parameter-form.spec.md`) is its sole caller — it invokes this on every valid parameter change and holds the returned `SimulationResult` in reactive state.

## Implementation

- A pure function building an evenly-spaced time grid of `points + 1` instants over `[0, horizon]`.
- A pure function taking a `SimulationParameters` value and returning a `SimulationResult`: evaluates the Gaussian arrival rate and constant service rate at each grid instant, calls into `queue-simulator` for the queue-size series/critical interval/backlog/average arrival rate, calls into `demand-generator` for the discrete event list, and scans the queue-size series for its peak value and instant.
- The `SimulationParameters`/`SimulationSeries`/`SimulationMetrics`/`SimulationResult` type definitions, exported for every slice that consumes simulation output.
- Lives in its own domain module, the innermost layer of the project's layered source structure — depends only on the other domain modules (`demand-generator`, `queue-simulator`), never on application state or UI.

## Acceptance criteria

- [ ] Given a valid `SimulationParameters` value, the returned `SimulationResult`'s series (`times`, `arrivalRate`, `serviceRate`, `queueSize`) all have the same length (`points + 1`).
- [ ] `metrics.peakQueueSize` and `metrics.peakQueueTime` correspond to the same index in the `queueSize`/`times` series — the reported peak value actually occurs at the reported peak instant.
- [ ] `metrics.isOverloaded` is `true` whenever `metrics.backlog` is meaningfully above zero, and `false` when there is no critical interval.
- [ ] Calling the function twice with the identical parameter set returns series with identical values (deterministic, given the seeded event generation in `demand-generator`).

## How to test

With the default parameters (amplitude 140, peak time 40, width 12, service rate 60, horizon 90, points 180 — see `parameter-form.spec.md`), call the orchestration function and confirm all four series arrays have length 181, that the index of the maximum `queueSize` value matches `metrics.peakQueueTime`'s position in `times`, and that `metrics.isOverloaded` is `true` (amplitude 140 exceeds service rate 60 near the peak).

## Risks / edge cases

- Calling into three domain modules on every parameter change is what the simulation store's debounce (see `parameter-form.spec.md`) exists to throttle — this slice itself has no throttling of its own, by design, since it's meant to stay a pure function safe to call as often as needed.
- If a future non-Gaussian arrival shape or non-constant service rate is introduced, this is the one slice whose inner calls would need to change — everything downstream only depends on the `SimulationResult` shape, not on how it was computed.
