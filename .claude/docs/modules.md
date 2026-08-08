# Queuely — Modules & Requirements

Technical specification of Queuely's four simulation modules and the cross-cutting requirements they share. All four run client-side, in the same browser process, with no network boundary between them.

---

## Cross-Cutting Requirements

These apply to every module and follow directly from the physical/mathematical constraints of the model, not from generic engineering caution.

- **Parameter validation.** Inputs like the Gaussian's amplitude, peak time, and width, the constant service rate, the study horizon, and the number of integration points must be rejected if they're physically meaningless (a negative amplitude or width, a zero or negative service rate, a non-positive horizon) — these don't fail loudly on their own, they silently produce degenerate output (division by zero in traffic intensity, a Gaussian that never integrates to anything meaningful) if left unchecked.
- **Non-negativity invariant on queue size.** A computed queue size must never be reported as negative — this is a physical constraint (a queue can't hold a negative count of orders), and it must be enforced at the point the queue size is computed, not re-derived or re-checked by whichever module consumes it downstream.
- **Numerical integration must be verifiably convergent.** Any computation that relies on numerical integration (queue size, backlog, average arrival rate) must be checkable by increasing the point count and confirming the result stabilizes. This is the actual correctness check for these values, since there's no closed-form result to compare against directly.
- **Pure, deterministic core computations.** Because every module runs in the same thread with no backend to isolate side effects, each module's core computation should be a pure function of its inputs — deterministic given the same parameters (with the explicit exception of the randomized event-generation step), safe to re-run repeatedly as dashboard inputs change, and testable in isolation from the rest of the system.
- **No automated test suite for the current scope.** Correctness instead relies on the convergence check above and on validating the integrator against a function with a known analytical result before trusting it on the model's actual functions. This is a deliberate scope decision for a short, single-person timeline, not an oversight — it should be revisited if the timeline or team size changes.

---

## Demand Generator

Produces the continuous arrival-rate curve and the discrete arrival events derived from it.

- **Inputs:** the Gaussian's amplitude, peak time, and width; the study horizon.
- **Outputs:** an evaluatable continuous arrival-rate function (and/or a sampled series of it), plus a list of discrete arrival timestamps generated via rejection-based thinning against the curve's maximum value.
- **Depends on:** nothing — a self-contained function of its own inputs.
- **Consumed by:** Queue Simulator (to compare against the service rate), Visualization Module (to plot the curve and the discrete events).

## Queue Simulator

Computes queue size over time and the total accumulated backlog.

- **Inputs:** the arrival-rate function (from Demand Generator), the service-rate function, a time grid over the study horizon.
- **Outputs:** a queue-size series (never negative, per the cross-cutting invariant above), the interval where arrivals exceed service, and the total backlog accumulated over that interval.
- **Depends on:** Demand Generator's arrival-rate output, the Integral Analysis Engine's numerical integrator.
- **Consumed by:** Visualization Module; also indirectly feeds whichever computation needs the average arrival rate over the same critical interval.

## Integral Analysis Engine

Generic numerical integration, reusable by any other module.

- **Inputs:** any function of time and an interval, plus a chosen number of integration points.
- **Outputs:** an approximate definite integral over that interval; the average value of a function over an interval (the integral divided by the interval's width).
- **Depends on:** nothing — deliberately generic and unaware of the specific arrival/service/queue functions, so it can be validated independently against a function with a known analytical integral.
- **Consumed by:** Queue Simulator (queue size, backlog), and whichever computation reports the average arrival rate during the demand peak.

## Visualization Module

Renders the model's curves and derived metrics, and reacts to parameter changes.

- **Inputs:** the series and values produced by the other three modules.
- **Outputs:** rendered charts of the arrival rate, service rate, queue size, and derived metrics (backlog, peak time, average arrival rate).
- **Depends on:** Demand Generator, Queue Simulator, and Integral Analysis Engine outputs.
- **Consumed by:** nothing — this is the terminal, user-facing module.

## Scenario comparison

Running multiple parameter sets side by side within one session is application state — a list of stored parameter sets and their computed outputs — not a fifth simulation module. No module needs its own "comparison" responsibility; this is composition of the four modules' existing outputs over time within a session.

---

## Non-goals

- No module persists anything between browser sessions — closing or refreshing the page discards all scenarios.
- No module implements a service rate that varies over time or steps up in stages — only a constant service rate is in scope currently. A time-varying service rate is a natural extension of the same module contracts, not something the current architecture blocks, but it isn't part of the current requirements.
