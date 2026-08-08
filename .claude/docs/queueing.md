# Queueing Theory — Domain Concepts

The queueing-theory vocabulary and concepts underlying Queuely — the "what are we modeling" side, as a systems engineer would recognize it, independent of how the calculus is actually carried out.

## Anatomy of a queueing system

A queueing system has three parts:

1. **Arrival source** — where the customers/orders entering the system come from.
2. **The queue** — where arrivals wait once they've entered but haven't been served yet.
3. **The server(s)** — what processes/serves, removing items from the queue.

In Queuely: **customers** are e-commerce orders, the **queue** is the buffer of orders pending processing, and the **server** is the system's processing capacity (inventory, payments, and logistics collapsed into a single service rate).

## Kendall notation (A/S/c)

The standard way to classify a queueing system with three symbols: `A/S/c`

- **A** — the arrival process (e.g. `M` = Markovian/Poisson, `D` = deterministic, `G` = general)
- **S** — the service process (same classification as A)
- **c** — number of servers

A classic `M/M/1` system has Poisson arrivals, exponential service, and 1 server. It's the most studied queueing system and has closed-form formulas for everything (average wait time, average queue length, etc.) — but those formulas **assume constant rates** (`λ` and `μ` don't change over time).

### Why Queuely isn't a classic M/M/1

Queuely is closer to an **`M(t)/M/1`** system — one where the arrival rate `λ(t)` varies over time (the Gaussian). This is called a **non-stationary** or **transient** system, and it's exactly why the project can't use the classical closed-form queueing formulas — they don't exist for the general non-stationary case. This is the underlying mathematical reason the project relies on simulation plus integral calculus instead of textbook queueing formulas: **classical queueing theory solves the stationary case with algebra; Queuely solves the non-stationary case with integrals.**

## Traffic intensity (ρ)

```
ρ(t) = λ(t) / μ(t)
```

Read "rho" — it measures how loaded the system is relative to its capacity:

- **ρ(t) < 1** → the system processes faster than orders arrive. The queue tends to drain.
- **ρ(t) = 1** → the system is exactly at the limit of its capacity.
- **ρ(t) > 1** → more orders arrive than can be processed. The queue grows — this is the state during the peak of the high-demand event.

### Stability condition

In classical queueing theory (constant rates), the long-run stability condition is `ρ < 1` — if it doesn't hold, the queue grows without bound forever. In Queuely, because `λ(t)` varies and eventually decreases again (it's a Gaussian, not a function that grows indefinitely), the system is **temporarily unstable** (`ρ(t) > 1`) during the peak, but is expected to return to stability (`ρ(t) < 1`) afterward. That window of temporary instability is exactly what generates the backlog `D`.

## Busy period

The continuous time interval during which the system has at least one order queued or in process — i.e. `Q(t) > 0`. In Queuely, the critical busy period starts when `λ(t)` exceeds `μ(t)` and ends when the queue finally drains, which can happen **after** `λ(t)` has already dropped back below `μ(t)`, because there's still accumulated backlog left to work off. This connects directly to `Q(t)`: the busy period is the interval where `Q(t) > 0`, ending at the first instant `Q(t)` returns to 0.

## Little's Law

One of the most general relations in queueing theory, valid for nearly any system in steady state:

```
L = λ · W
```

Where:
- `L` = average number of customers/orders in the system
- `λ` = average arrival rate
- `W` = average time a customer/order spends in the system

### Applicability to Queuely (with caution)

Little's Law assumes a system in **steady state** (conditions don't change over time) — Queuely is explicitly non-stationary during the peak, so the law doesn't apply literally at every instant `t`. It's still useful as an **approximation or sanity check** over windows where the system behaves relatively stably — for example, comparing the average of `Q(t)` over the whole event against `λ_average · W_average`.

## Reference vocabulary

| Term | In queueing theory | In Queuely |
|---|---|---|
| Customer | Entity that arrives and waits for service | E-commerce order |
| Server | Entity that serves/processes | Processing capacity (inventory + payments + logistics, simplified) |
| Queue / buffer | Space where unserved customers wait | `Q(t)`, the size of the pending-orders queue |
| System | Queue + server together | The full order-processing pipeline |
| Arrival rate | `λ`, customers per unit time | `λ(t)`, orders/minute, Gaussian |
| Service rate | `μ`, service capacity per unit time | `μ(t)`, orders/minute the system can process |
| Traffic intensity | `ρ = λ/μ` | `ρ(t) = λ(t)/μ(t)`, varies over time |
| Steady state / stationary | Rates don't change over time, system reaches equilibrium | **Doesn't apply directly to Queuely** — the system is transient by design |
| Busy period | Interval with at least one customer in the system | Interval where `Q(t) > 0` |
| Backlog | Accumulated unprocessed work | `D`, the definite integral of the excess arrival rate over the critical interval |

## Invariants this implies for the implementation

- `Q(t)` should never go negative — it measures a real physical count of orders waiting.
- The peak of `Q(t)` should occur **after** the peak of `λ(t)`, not at the same instant — the queue keeps growing while `ρ(t) > 1`, which persists for a while after `λ(t)` starts declining, until `λ(t)` crosses back below `μ(t)`.
- The system should return to `Q(t) = 0` at some point after the event, assuming `μ(t)` is sufficient to drain the backlog. If `Q(t)` never returns to 0 in the simulation, that signals either a misconfigured (too low) service rate or an implementation bug.
