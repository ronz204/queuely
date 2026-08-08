# Queuely — Problem Domain

The problem Queuely models, and why it requires integral calculus rather than discrete counting.

## The imbalance problem

During a high-demand event, order arrivals occur at a rate that varies strongly over time — there is a peak around certain hours, then a decline. The system processing those orders (inventory, payments, logistics) has a service capacity that doesn't always keep pace with the peak.

When the arrival rate `λ(t)` exceeds the service rate `μ(t)`, orders accumulate in a queue. If that imbalance lasts long enough or is large enough, it produces a **backlog** — an accumulated delay that can take hours to absorb even after the demand peak has already passed.

## Questions the model must answer

1. How does the queue size `Q(t)` evolve over the course of the event?
2. What is the total accumulated backlog `D` by the end of the study period?
3. At what point does the queue reach its maximum?
4. What is the average arrival rate during the window of highest demand?
5. How accurate is the continuous model (Gaussian) compared to the discrete simulation (Poisson)?

## Why integral calculus, not counting

`λ(t)` and `μ(t)` are continuous functions of time, not fixed numbers. Questions like "how many orders arrived in total between two times?" or "what was the average arrival rate during the peak?" aren't answered by counting — they're answered by **integrating**.

Concretely:

- **`D` (accumulated backlog)** is the definite integral of `(λ(t) − μ(t))` over the interval where `λ(t) > μ(t)`. It is literally the area between the two curves.
- **The average value of `λ(t)`** during the peak uses the mean value theorem for integrals.
- **`Q(t)`**, the queue size at any instant, is a cumulative function built from the Fundamental Theorem of Calculus applied to the net rate of change.
- Because `λ(t)` is Gaussian, many of these integrals **have no elementary closed-form solution** (the integral of a Gaussian isn't elementary) — which is why the model needs **numerical integration** (trapezoidal, Simpson) to evaluate them in practice.

In short: "how bad does the queue get, and when?" is, mathematically, a problem of areas under curves — the natural domain of integral calculus.

## Non-goals

Queuely does not aim to predict real demand for a specific store, or to replace a production queueing system (message brokers, task queues, and similar infrastructure). The goal is to demonstrate, with a rigorous mathematical model and a working simulation, how integral calculus describes and predicts the behavior of a queueing system under stress.
