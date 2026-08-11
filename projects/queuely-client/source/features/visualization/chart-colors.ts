/**
 * Canvas rendering (Chart.js) can't consume CSS custom properties directly, so these mirror
 * the color tokens defined in source/style.css's @theme block — keep both in sync by hand.
 */
export const CHART_COLORS = {
  arrival: "oklch(0.75 0.14 195)",
  service: "oklch(0.78 0.13 70)",
  queue: "oklch(0.74 0.15 305)",
  queueFill: "oklch(0.74 0.15 305 / 0.22)",
  queuePeak: "oklch(0.9 0.1 305)",
  backlog: "oklch(0.62 0.17 25)",
  backlogFill: "oklch(0.62 0.17 25 / 0.28)",
  event: "oklch(0.88 0.05 100)",
  eventStroke: "oklch(0.205 0.016 260)",
  grid: "oklch(0.30 0.02 260)",
  axisText: "oklch(0.55 0.014 260)",
} as const;
