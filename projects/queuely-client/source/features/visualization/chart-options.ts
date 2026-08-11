import type { ChartOptions } from "chart.js";
import { CHART_COLORS } from "./chart-colors";

const TICK_FONT = { family: "'IBM Plex Mono', monospace", size: 11 };

export function buildBaseChartOptions(): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    // Disabled rather than tweened: this is a live-recompute dashboard (debounced, no "run"
    // button), so a mid-transition frame would show a curve that matches neither the old nor
    // the new parameter set — confusing to read, and misleading if screenshotted mid-tween.
    animation: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: CHART_COLORS.eventStroke,
        titleFont: TICK_FONT,
        bodyFont: TICK_FONT,
        padding: 8,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        type: "linear",
        grid: { color: CHART_COLORS.grid },
        ticks: { color: CHART_COLORS.axisText, font: TICK_FONT },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: CHART_COLORS.grid },
        ticks: { color: CHART_COLORS.axisText, font: TICK_FONT },
        border: { display: false },
      },
    },
  };
}
