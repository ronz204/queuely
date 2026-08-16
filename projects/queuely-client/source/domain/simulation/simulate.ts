import { arrivalRate, generateArrivalEvents } from "@domain/demand-generator";
import {
  averageArrivalRateDuringCriticalInterval,
  computeBacklog,
  computeQueueSeries,
  findCriticalInterval,
  serviceRate as constantServiceRate,
} from "@domain/queue-simulator";
import type { SimulationParameters, SimulationResult } from "./types";

function buildTimeGrid(horizon: number, points: number): number[] {
  const step = horizon / points;
  const grid: number[] = [];

  for (let i = 0; i <= points; i++) {
    grid.push(i * step);
  }

  return grid;
}

/** Pure domain service: stitches demand-generator, queue-simulator and the integral engine into one result. */
export function runSimulation(params: SimulationParameters): SimulationResult {
  const { amplitude, peakTime, sigma, serviceRate: rate, horizon, points } = params;
  const gaussianParams = { amplitude, peakTime, sigma };

  const arrival = (t: number) => arrivalRate(t, gaussianParams);
  const service = (t: number) => constantServiceRate(t, { rate });

  const timeGrid = buildTimeGrid(horizon, points);
  const queueSize = computeQueueSeries(arrival, service, timeGrid);
  const criticalInterval = findCriticalInterval(arrival, service, timeGrid);
  const backlog = computeBacklog(arrival, service, criticalInterval, points);
  const averageArrivalRate = averageArrivalRateDuringCriticalInterval(arrival, criticalInterval, points);
  const events = generateArrivalEvents({ amplitude, peakTime, sigma, horizon });

  let peakQueueSize = 0;
  let peakQueueTime = 0;
  for (let i = 0; i < timeGrid.length; i++) {
    if (queueSize[i] > peakQueueSize) {
      peakQueueSize = queueSize[i];
      peakQueueTime = timeGrid[i];
    }
  }

  return {
    parameters: params,
    series: {
      times: timeGrid,
      arrivalRate: timeGrid.map(arrival),
      serviceRate: timeGrid.map(service),
      queueSize,
    },
    events,
    metrics: {
      backlog,
      peakQueueSize,
      peakQueueTime,
      averageArrivalRate,
      isOverloaded: backlog > 1e-6,
    },
    criticalInterval,
  };
}
