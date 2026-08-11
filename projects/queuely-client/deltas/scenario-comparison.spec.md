# Scenario Comparison — Spec

## Objective

Let the current parameter set, together with its computed outputs, be captured into a session-held list, and let several captured scenarios be compared against each other — curves overlaid on the same charts, plus a summary metrics table — with no persistence across sessions.

## Scope

In scope:
- Saving the current parameter set and its computed series/metrics as an immutable snapshot into a list.
- Holding that list in memory for the current session, with no fixed size limit.
- Overlaying the `λ(t)`/`Q(t)` curves of every saved scenario on the same charts.
- A summary table comparing backlog `D`, `Q(t)`'s peak value and instant, and average `λ(t)` across saved scenarios.
- Removing a saved scenario from the list.

Out of scope:
- Persistence across sessions or page reloads — the list is discarded on refresh, by design.
- Editing an already-saved scenario — a save is an immutable capture, not an editable draft.
- Exporting the comparison.

## Technical context

This is application state composing outputs already produced by `queue-simulator` and `dashboard` — it is not a fifth simulation module and doesn't reimplement any computation of its own; running multiple parameter sets side by side within one session is composition of the existing modules' outputs over time, nothing more.

## Implementation

- A composable holding a reactive list of saved scenarios, each a parameter set paired with a snapshot of its computed series and metrics.
- A save action that pushes a deep, immutable copy of the current state — not a reference to the live reactive state — so later changes to the dashboard's parameters cannot mutate an already-saved scenario.
- A component rendering the summary table and feeding each saved scenario's series into `visualization` for the overlay.
- Lives under this slice's own feature directory in the project's feature-based source layout.

## Acceptance criteria

- [ ] Saving the current scenario twice with two different parameter sets produces two independent list entries, each with its own frozen values.
- [ ] Changing the dashboard's parameters after a save does not alter the values already saved (confirms the saved copy is deep, not a live reference).
- [ ] Removing a saved scenario removes it from both the chart overlay and the summary table.
- [ ] Reloading the page clears the list — expected, documented behavior, not a bug.

## How to test

Manually in the browser: adjust parameters and save scenario A; adjust parameters again and save scenario B; confirm the overlay shows both curves as visually distinct series and the table lists both with their own metrics. Change the current parameters again and confirm A and B's saved entries in the list remain unchanged.

## Risks / edge cases

- Saving a mutable reference instead of a deep copy of the parameter set/series is the most likely bug in this composable — it would silently corrupt already-saved scenarios as the dashboard's live state keeps changing.
- An unbounded list can grow indefinitely across a very long session — accepted as a known, non-blocking risk given the overall application state is small.
