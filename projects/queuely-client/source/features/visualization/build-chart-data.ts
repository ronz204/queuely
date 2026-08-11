import type { SavedScenario, SimulationResult } from "@shared/types";
import { CHART_COLORS } from "./chart-colors";

export type Point = { x: number; y: number };

function toPoints(times: number[], values: number[]): Point[] {
  return times.map((t, i) => ({ x: t, y: values[i] }));
}

function backlogAreaPoints(result: SimulationResult): (Point | null)[] {
  const { criticalInterval, series } = result;
  if (!criticalInterval) {
    return series.times.map(() => null);
  }

  return series.times.map((t, i) =>
    t >= criticalInterval.start && t <= criticalInterval.end ? { x: t, y: series.arrivalRate[i] } : null,
  );
}

/**
 * Return types are left inferred rather than annotated with Chart.js's own `ChartData<...>`:
 * that interface declares a mixed-type dataset's `type` field as optional, which is incompatible
 * with the required-literal `type` a per-dataset override needs — annotating with it here would
 * re-widen `"line"`/`"scatter"` back to `"line" | undefined` and reintroduce the mismatch. Each
 * dataset keeps its literal `type` via `as const` instead, and Chart.js itself validates the
 * final shape structurally at the `new Chart(...)`/`chart.data =` call site.
 */
export function buildArrivalServiceChartData(result: SimulationResult, scenarios: SavedScenario[], showEvents: boolean) {
  const backlogDataset = {
    type: "line" as const,
    label: "backlog D",
    data: backlogAreaPoints(result),
    borderColor: "transparent",
    backgroundColor: CHART_COLORS.backlogFill,
    pointRadius: 0,
    fill: "+1" as const,
    spanGaps: false,
  };

  const serviceDataset = {
    type: "line" as const,
    label: "μ(t)",
    data: toPoints(result.series.times, result.series.serviceRate),
    borderColor: CHART_COLORS.service,
    borderDash: [6, 4],
    borderWidth: 2,
    pointRadius: 0,
    fill: false as const,
  };

  const arrivalDataset = {
    type: "line" as const,
    label: "λ(t)",
    data: toPoints(result.series.times, result.series.arrivalRate),
    borderColor: CHART_COLORS.arrival,
    borderWidth: 2.5,
    pointRadius: 0,
    fill: false as const,
  };

  const eventsDataset = {
    type: "scatter" as const,
    label: "eventos Poisson",
    data: result.events.map((event) => ({ x: event.time, y: event.rate })),
    backgroundColor: CHART_COLORS.event,
    borderColor: CHART_COLORS.eventStroke,
    borderWidth: 1,
    pointRadius: 3.2,
  };

  const scenarioDatasets = scenarios.map((scenario) => ({
    type: "line" as const,
    label: scenario.label,
    data: toPoints(scenario.result.series.times, scenario.result.series.arrivalRate),
    borderColor: scenario.color,
    borderWidth: 1.4,
    pointRadius: 0,
    fill: false as const,
  }));

  return {
    datasets: [backlogDataset, serviceDataset, arrivalDataset, ...(showEvents ? [eventsDataset] : []), ...scenarioDatasets],
  };
}

export function buildQueueChartData(result: SimulationResult, scenarios: SavedScenario[]) {
  const queueDataset = {
    type: "line" as const,
    label: "Q(t)",
    data: toPoints(result.series.times, result.series.queueSize),
    borderColor: CHART_COLORS.queue,
    backgroundColor: CHART_COLORS.queueFill,
    borderWidth: 2.5,
    pointRadius: 0,
    fill: "origin" as const,
  };

  const peakLineDataset = {
    type: "line" as const,
    label: "pico",
    data: [
      { x: result.metrics.peakQueueTime, y: 0 },
      { x: result.metrics.peakQueueTime, y: result.metrics.peakQueueSize },
    ],
    borderColor: CHART_COLORS.axisText,
    borderDash: [4, 3],
    borderWidth: 1,
    pointRadius: 0,
    fill: false as const,
  };

  const peakPointDataset = {
    type: "scatter" as const,
    label: "pico Q",
    data: [{ x: result.metrics.peakQueueTime, y: result.metrics.peakQueueSize }],
    backgroundColor: CHART_COLORS.queuePeak,
    pointRadius: 3.5,
  };

  const scenarioDatasets = scenarios.map((scenario) => ({
    type: "line" as const,
    label: scenario.label,
    data: toPoints(scenario.result.series.times, scenario.result.series.queueSize),
    borderColor: scenario.color,
    borderWidth: 1.4,
    pointRadius: 0,
    fill: false as const,
  }));

  return {
    datasets: [queueDataset, peakLineDataset, peakPointDataset, ...scenarioDatasets],
  };
}
