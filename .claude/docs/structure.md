# Queuely — Architecture

How Queuely is actually built: a single client-side application, no server, no database.

---

## Core Architectural Decision: Pure Client-Side SPA, No Backend

Queuely runs entirely in the browser. There is no backend service and no network boundary anywhere in the system.

This follows directly from what the computations actually require: evaluating a Gaussian, generating discrete events via rejection-based thinning, and running trapezoidal/Simpson numerical integration are all lightweight — sub-millisecond even at thousands of points. There is no performance case for offloading any of this to a server, and no meaningful gap in library maturity between running it in the browser versus anywhere else (unlike, for example, document/OCR processing, where one ecosystem can be genuinely more mature than another). Keeping everything client-side also means there's nothing to deploy beyond static files — no server process, no database, no environment/secrets management.

This is a scope-bound decision, not a permanent stance. If the project later needs to persist scenarios across sessions, or needs computation heavy enough to block the UI thread, that would be the trigger to reconsider — not before.

---

## Service Map

```
┌────────────────────────────────────────────┐
│           Single-Page Application            │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │        Dashboard (parameter inputs)    │    │
│  └───────────────────┬────────────────────┘    │
│                      │ reactive state           │
│                      ▼                          │
│  ┌──────────────────────────────────────┐    │
│  │  Simulation modules (pure functions)   │    │
│  │  demand generation → queue simulation  │    │
│  │  → numerical integration               │    │
│  └───────────────────┬────────────────────┘    │
│                      │ computed series          │
│                      ▼                          │
│  ┌──────────────────────────────────────┐    │
│  │           Chart rendering              │    │
│  └──────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

Everything in this diagram runs in one browser tab, in one process. There is no separate service to deploy, scale, or coordinate with.

---

## Stack and Rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | Vue 3 | Reactive state maps directly onto the dashboard's core interaction: adjust a parameter, recompute, re-render — no manual DOM update logic needed. |
| Build tool | Vite | Standard build tool for Vue 3 projects; fast dev server, minimal configuration for a project this size. |
| Language | TypeScript | The simulation modules pass structured data between each other (parameter sets, time series, interval bounds) — static typing catches shape mismatches between modules at build time rather than at runtime, which matters more here than in the UI layer alone. |
| Charting | Chart.js, used directly (no framework-specific wrapper) | Charts are updated imperatively from computed series rather than through a reactive wrapper component — this keeps the charting layer decoupled from the framework's reactivity model, appropriate for a well-understood, self-contained library. |
| State management | Framework-native reactivity, no external state library | The state involved — the current parameter set, the computed series, a list of saved scenarios for comparison — is small and doesn't justify a dedicated state-management dependency. |
| Persistence | None | See Non-goals. |
| Backend | None | See Core Architectural Decision above. |

---

## Data Flow

1. The user adjusts parameters on the dashboard (the Gaussian's amplitude/peak/width, the constant service rate, the study horizon, the integration point count).
2. The parameter change updates the application's reactive state.
3. The simulation modules recompute synchronously, in memory: the arrival-rate curve and discrete events, then the queue-size series and backlog using the numerical integrator.
4. The chart rendering layer reads the recomputed series and updates the plots.
5. To compare scenarios, the user captures the current parameter set together with its computed outputs into a list held in the same reactive state. There is no request/response cycle and no external call anywhere in this flow — every step is a function call within the same process.

---

## Non-goals

- **No backend, no API.** All computation happens in the browser; nothing to deploy beyond static files.
- **No database, no persistence across sessions.** Scenario comparison holds state only for the current browser session — refreshing the page discards it.
- **No authentication.** Single-user, local tool; there is no identity to authenticate.
- **No automated tests, no CI/CD, for the current scope.** A short, single-person timeline doesn't justify that ceremony yet; correctness instead relies on validating the numerical integrator against a function with a known analytical result and checking that results converge as point count increases. This should be revisited if the timeline or team size changes.
- **No service-rate variants beyond constant.** A time-varying or stepped service rate is not part of the current scope.
