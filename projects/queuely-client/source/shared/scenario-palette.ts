// Each hue is >=50° from every other hue in this list (so consecutive scenarios never
// look alike) and >=20° from the fixed hues already in use for λ/μ/Q/backlog/events
// (25, 70, 100, 195, 305 — see chart-colors.ts), so a saved scenario's overlay never
// gets confused with the current curve or with another fixed series at a glance.
const SCENARIO_HUES = [45, 105, 165, 225, 275, 345];

export function scenarioColor(index: number): string {
  const hue = SCENARIO_HUES[index % SCENARIO_HUES.length];
  return `oklch(0.72 0.15 ${hue})`;
}
