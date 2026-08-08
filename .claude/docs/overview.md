# Queuely — Overview

Queuely simulates a processing queue for e-commerce orders during a high-demand event (a Black Friday-type spike), and applies integral calculus to model, analyze, and visualize how that queue behaves. It is built as an academic exercise in applying integral calculus techniques to a real queueing scenario, which is why the model favors rigorous calculus tooling (definite integrals, numerical integration) over simpler engineering heuristics.

## The core imbalance

When an online store experiences a demand spike, orders arrive faster than the system can process them. Queuely models that imbalance mathematically and simulates it in code: an arrival rate that temporarily exceeds a service rate, producing a growing queue and, if sustained, an accumulated backlog.

## The mathematical model at a glance

Four quantities relate to each other:

| Symbol | Represents | How it's modeled |
|---|---|---|
| `λ(t)` | Order arrival rate | Gaussian function (continuous shape of the demand curve) |
| `μ(t)` | Service rate (processing speed) | System-defined function |
| `Q(t)` | Queue size over time | Cumulative function, derived from `λ(t) - μ(t)` |
| `D` | Accumulated backlog (delayed orders) | Definite integral over the study interval |

Two layers describe the same phenomenon and are complementary, not redundant:

- The **Gaussian** defines the continuous, idealized shape of the demand peak — how many orders "on average" arrive at each instant.
- The **non-homogeneous Poisson process** uses that Gaussian as its rate `λ(t)` to generate discrete, individual events (each real order entering the system, with its own randomness).

## Calculus tools applied

- Definite integrals
- Area between curves (to compare `λ(t)` vs `μ(t)`)
- Mean value of a function
- Fundamental Theorem of Calculus
- Numerical integration — trapezoidal rule and Simpson's rule (for when no closed-form analytical solution exists)

The numerical methods are not optional extras: `λ(t)` being Gaussian means several of the integrals in the model have no elementary closed form, so numerical approximation is the only practical way to evaluate them.

## Architecture: four conceptual modules

1. **Demand generator** — produces `λ(t)` (Gaussian) and generates discrete events via the non-homogeneous Poisson process.
2. **Queue simulator** — uses `λ(t)` and `μ(t)` to compute `Q(t)` and the backlog `D` over time.
3. **Integral analysis engine** — applies the calculus tools (integrals, area between curves, average value, Simpson/trapezoidal) to the generated data.
4. **Visualization module** — plots `λ(t)`, `μ(t)`, `Q(t)`, and the derived metrics so the analysis can be read at a glance.
