import type { ArrivalEvent } from "@features/demand-generator";
import type { CriticalInterval } from "@features/queue-simulator";

export type SimulationParameters = {
  amplitude: number;
  peakTime: number;
  sigma: number;
  serviceRate: number;
  horizon: number;
  points: number;
};

export type SimulationSeries = {
  times: number[];
  arrivalRate: number[];
  serviceRate: number[];
  queueSize: number[];
};

export type SimulationMetrics = {
  backlog: number;
  peakQueueSize: number;
  peakQueueTime: number;
  averageArrivalRate: number;
  isOverloaded: boolean;
};

export type SimulationResult = {
  parameters: SimulationParameters;
  series: SimulationSeries;
  events: ArrivalEvent[];
  metrics: SimulationMetrics;
  criticalInterval: CriticalInterval | null;
};

export type SavedScenario = {
  id: string;
  label: string;
  color: string;
  result: SimulationResult;
};
