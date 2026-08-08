# Queuely — Mathematical Model

The calculus model backing the simulation. Every derived quantity in the project traces back to a formula in this document.

## Pipeline shape

```
λ(t) [Gaussian, continuous]
    ├──> non-homogeneous Poisson process ──> discrete events (individual orders)
    └──> together with μ(t) ──> Q(t) [queue size] ──> D [accumulated backlog]
                                                     └──> derived metrics (average, peak, etc.)
```

`λ(t)` is the starting point for everything. It branches into a continuous direction (toward `Q(t)` and the integrals) and a discrete direction (toward individual Poisson events). Both branches describe the same phenomenon from different angles and are compared against each other during analysis.

## Notation reference

| Symbol / operation | Meaning | Note |
|---|---|---|
| `t` | Time variable — the only independent variable in the model | Everything else (`λ`, `μ`, `Q`) is a function of `t` |
| `f(t)` | General notation: "a function evaluated at `t`" | `λ(t)` reads "lambda evaluated at instant t" — **not** lambda multiplied by t |
| `λ`, `μ` | Greek letters used by queueing-theory convention: λ = arrival, μ = service | Don't confuse `μ` (service rate) with `μ_t` (the Gaussian's center) — they share a letter by statistical convention but are unrelated quantities |
| `exp(x)` | The exponential function, equivalent to `e^x`, `e ≈ 2.71828` | In the Gaussian, the exponent is always ≤ 0, so `exp(...)` yields a value between 0 and 1 |
| `σ` | Standard deviation — how "wide" something is | `σ²` appears in the Gaussian's denominator |
| `∫ₐᵇ f(t) dt` | Definite integral of `f` between limits `a` and `b` | The result is **a number** (an area), not a function |
| `dt` | An infinitesimal increment of `t` | In numerical integration, `dt` is approximated by a finite step `h` |
| `dQ/dt` | The derivative of `Q` with respect to `t` | The instantaneous rate of change of the queue |
| `max(0, x)` | The larger of 0 and `x` | Clips results that have no physical meaning if negative (e.g. a queue can't have negative size) |
| `t₀, t₁, ..., tᵢ, ..., tₙ` | Discrete points enumerated within a continuous interval | Used when approximating an integral as a sum over many points |
| `h` | The step: distance between consecutive points when an interval is divided into `n` equal parts | `h = (b - a) / n` |
| `n` | Number of subdivisions used in numerical integration | Higher `n` = more precision, more computational cost |
| `P(event)` | Probability notation | Used in the Poisson process to decide whether a candidate event is accepted or rejected |
| `A`, `μ₀`, `T_max` | Model constants/parameters | Configured when the simulation is set up; don't change with `t` |

## Arrival rate λ(t) — Gaussian

```
λ(t) = A · exp( -(t - μ_t)² / (2σ²) )
```

| Parameter | Controls | Typical example |
|---|---|---|
| `A` | Peak height — the maximum arrival rate (orders/minute at the instant of highest demand) | 500 orders/min |
| `μ_t` | Instant at which the demand peak occurs | `t = 120` (minute 120 of the simulation) |
| `σ` | How "wide" the peak is — a larger `σ` means high demand lasts longer | 30 minutes |

The function is symmetric around `μ_t`: it rises from a low value to a maximum at `t = μ_t`, then falls again — `A` sets the peak height, `σ` sets its width.

**Key property:** `λ(t)` is always positive and smooth (infinitely differentiable), but **its integral has no elementary closed form** — there is no simple function `F(t)` such that `F'(t) = λ(t)`. This is what forces the use of numerical integration for every quantity derived from `λ(t)`.

## Non-homogeneous Poisson process — from continuous to discrete

`λ(t)` describes an *average* rate — it doesn't say exactly when each individual order arrives, only the expected density of arrivals at each instant. The non-homogeneous Poisson process is the mechanism that turns that rate into a concrete list of arrival instants: `t₁, t₂, t₃, ...`

It's called "non-homogeneous" because a homogeneous Poisson process has a constant rate; this one's rate changes over time — it's literally `λ(t)`, the Gaussian above.

### Thinning algorithm

The standard method, and the simplest to implement correctly:

1. Find `λ_max`, the maximum value of `λ(t)` on the study interval (for the Gaussian, this is simply `A`, the value at `t = μ_t`).
2. Generate an auxiliary **homogeneous** Poisson process with constant rate `λ_max` (inter-event times follow an exponential distribution with parameter `λ_max`).
3. For each candidate event at instant `t` generated in step 2, **accept it with probability** `λ(t) / λ_max`, discard it otherwise.
4. The accepted events are the real arrivals of the non-homogeneous process.

This works because at instants where `λ(t)` is low (far from the peak), most candidates are rejected, so few arrivals occur there; near the peak, `λ(t) ≈ λ_max`, so almost all candidates are accepted. The resulting event density follows the shape of the Gaussian.

```
t = 0
events = []
while t < T_max:
    t += exponential_random(1 / λ_max)   # next candidate
    if t >= T_max: break
    u = uniform_random(0, 1)
    if u <= λ(t) / λ_max:
        events.append(t)
return events
```

## Service rate μ(t)

Represents how many orders the system can process per unit time. Unlike `λ(t)`, it doesn't have to be Gaussian:

- **Constant:** `μ(t) = μ₀` — fixed capacity, the simplest case and the recommended starting point.
- **Stepped:** `μ(t)` increases in discrete steps, simulating "spinning up more servers" at certain moments.
- **Time-varying:** used to model, for example, capacity degradation under stress.

A constant `μ(t) = μ₀` is sufficient for a first working version — it lets the rest of the model be validated before adding complexity. The non-constant variants are a natural extension, not an initial requirement.

## Queue size Q(t)

The queue grows when more orders arrive than are processed, and shrinks when more are processed than arrive. Its rate of change is the difference between arrival and service:

```
dQ/dt = λ(t) - μ(t)
```

Integrating both sides from the start (`t=0`) to an instant `t` (Fundamental Theorem of Calculus):

```
Q(t) = Q(0) + ∫₀ᵗ [λ(s) - μ(s)] ds
```

`s` is used as the integration variable (instead of `t`) because `t` is already the integral's upper limit — this avoids conflating "the instant up to which I'm integrating" with "the variable sweeping through the interval." In plain terms: `Q(t)` is the accumulated area under the curve of (arrival minus service), from the start up to `t`.

**Physical constraint:** `Q(t)` cannot be negative — there's no such thing as a negative number of orders waiting. If the integral yields a negative value (more was processed than arrived, so the queue would mathematically dip below zero), it must be clipped:

```
Q(t) = max(0, Q(0) + ∫₀ᵗ [λ(s) - μ(s)] ds)
```

This matters for the implementation: the raw integral can produce physically meaningless negative values, so the code must apply the `max(0, ...)`. The initial condition is normally `Q(0) = 0` — the simulation starts with an empty queue, before the demand event begins.

## Backlog D — area between curves

`D` is the total accumulated delayed orders over the whole period where arrivals exceeded service. It's the area between the curves `λ(t)` and `μ(t)`, counted **only where `λ(t) > μ(t)`** (where delay is actually generated, not where the system is ahead):

```
D = ∫ [λ(t) - μ(t)] dt,  evaluated only over {t : λ(t) > μ(t)}
```

In practice: find the interval (or intervals) `[t_a, t_b]` where `λ(t) > μ(t)` — with constant `μ(t)`, this is usually a single interval around the Gaussian's peak — then integrate `(λ(t) - μ(t))` over that interval.

`D` is distinct from `Q(t_final)`: `Q(t)` is the queue size at a single instant (it can drop back to 0 after the peak), while `D` is the **total accumulated** imbalance across the entire critical interval. They are complementary metrics, not the same thing under two names.

## Average value of a function

```
f_average = (1 / (b - a)) · ∫ₐᵇ f(t) dt
```

This is the total area under the curve, spread evenly across the width of the interval — divide the area by the interval width and the result is the height of a rectangle with that same area and width. In Queuely, this answers "what was the average arrival rate during the window of highest demand?": define the window `[a, b]` of interest (typically the same interval where `λ(t) > μ(t)` used for `D`) and apply the formula with `f(t) = λ(t)`.

## Numerical integration

Because `λ(t)` is Gaussian and its integral has no elementary closed form, there's no simple algebraic formula for `∫λ(t)dt` — it must be approximated numerically, evaluating the function at discrete points. This applies to every integral in the model: `Q(t)`, `D`, and the average value.

### Trapezoidal rule

Divide `[a, b]` into `n` equal sub-intervals of width `h = (b - a) / n`, approximating the area under each sub-interval as a trapezoid:

```
∫ₐᵇ f(t) dt ≈ h · [ f(t₀)/2 + f(t₁) + f(t₂) + ... + f(tₙ₋₁) + f(tₙ)/2 ]
```

where `tᵢ = a + i·h`. The endpoints carry half weight because each interior trapezoid shares an edge with its neighbor (counted once), while the two boundary points (`t₀` and `tₙ`) belong to only one trapezoid each. Simple to implement; approximation error is proportional to `h²` (doubling `n` roughly quarters the error).

### Simpson's rule

More accurate than the trapezoidal rule for the same number of points, because it fits a parabola to each segment instead of a straight line. Requires `n` even:

```
∫ₐᵇ f(t) dt ≈ (h/3) · [ f(t₀) + 4f(t₁) + 2f(t₂) + 4f(t₃) + 2f(t₄) + ... + 4f(tₙ₋₁) + f(tₙ) ]
```

Coefficient pattern: endpoints = 1, odd indices = 4, even interior indices = 2. This `1, 4, 2, 4, 2, ..., 4, 1` pattern comes from fitting an exact parabola to each set of three consecutive points and integrating that parabola analytically. Error is proportional to `h⁴` — substantially more accurate than the trapezoidal rule for the same point count.

### Which to use, and how many points

Simpson's rule is the primary method (more accurate); the trapezoidal rule serves as a comparison/validation method — running both over the same data and checking that results converge is a good way to catch implementation errors. For a smooth Gaussian like `λ(t)`, `n` between 100 and 1000 over the study interval gives more than sufficient precision; when in doubt, doubling `n` and checking the result doesn't change significantly confirms convergence has been reached.

## Recommended build order

Each step depends on the previous one:

1. Implement `λ(t)` (Gaussian) and `μ(t)` (constant) as pure functions.
2. Implement a generic numerical integrator (trapezoidal and Simpson) that accepts any function and interval.
3. Use the integrator to compute `Q(t)` over a grid of instants, applying `max(0, ...)`.
4. Use the integrator to compute `D` over the critical interval.
5. Compute the average value of `λ(t)` over that same interval.
6. Implement the non-homogeneous Poisson process (thinning) as an independent branch, compared against `λ(t)` at the end.

Each of these steps is independently testable — verifying that, say, Simpson's rule gives the correct result on a known function (try `f(t) = t²`, whose analytical integral is known) doesn't require the rest of the system.
