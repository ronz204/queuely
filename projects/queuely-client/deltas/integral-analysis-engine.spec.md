# Integral Analysis Engine — Spec

## Objective

Given any single-variable function and an interval `[a, b]`, approximate its definite integral (trapezoidal rule and Simpson's rule) and its average value over that interval, with no knowledge of what the function represents.

## Scope

In scope:
- Numerical integration via the trapezoidal rule.
- Numerical integration via Simpson's rule (requires an even number of subdivisions).
- Average value of a function over an interval (integral divided by the interval's width), computed with either method.

Out of scope:
- Any awareness of the domain functions that consume this engine (arrival rate, service rate, queue size) — those stay in the slices that call it.
- Persisting integration results.
- Multi-variable or double integrals — nothing in the domain requires them.

## Technical context

This is one of the four conceptual modules of the project's architecture, and the only one with no dependency on any other slice — it is deliberately generic so it can be validated independently against a function with a known analytical integral, before being trusted on the model's actual functions. It is the foundation `queue-simulator` builds on for `Q(t)` and backlog `D`, and it also supplies the average-arrival-rate metric surfaced by `visualization` via `simulation`'s orchestrated result. Per the project's recommended build order, this slice should be implemented first.

## Implementation

- A pure function that approximates a definite integral with the trapezoidal rule, taking a function, an interval, and a subdivision count.
- A pure function that approximates a definite integral with Simpson's rule, taking the same inputs. Simpson's rule requires an even subdivision count; how an odd count is handled (rounding up to the next even number vs. rejecting the input) is an implementation detail that doesn't change the contract and can be decided during implementation.
- A pure function that computes the average value of a function over an interval, delegating to either integration method.
- Lives in its own domain module — treated as one of the project's domain modules rather than folded into a generic shared-utilities directory, even though nothing else in it is domain-specific.

## Acceptance criteria

- [ ] Integrating `f(t) = t²` over `[0, 10]` with both methods converges toward the known analytical result (`1000/3 ≈ 333.33`), with relative error under 1%.
- [ ] Doubling the subdivision count on the same test function reduces the relative error versus the analytical result.
- [ ] Simpson's rule produces a smaller error than the trapezoidal rule for the same subdivision count on the same test function.
- [ ] Both the trapezoidal and Simpson implementations are pure: identical inputs produce identical outputs, and neither mutates its arguments.

## How to test

Evaluate the trapezoidal and Simpson integrators on `f(t) = t²` over `[0, 10]` with `n = 100`, and compare both results against `333.33` with a tolerance under 1%. Repeat with `n = 1000` and confirm the deviation from the analytical result has decreased for both methods, and that Simpson's deviation is smaller than the trapezoidal one at the same `n`.

## Risks / edge cases

- An odd subdivision count passed to Simpson's rule — the implementation must define and document a single consistent behavior, not leave it unhandled.
- An inverted interval (`a > b`).
- A function undefined at some point inside the interval (e.g. a division by zero) — the engine has no domain knowledge to validate this; it is the caller's responsibility to only pass functions that are well-defined on the interval given.
