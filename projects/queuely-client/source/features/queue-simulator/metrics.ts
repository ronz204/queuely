import { averageValue, integrate, type IntegrationMethod } from "@features/integral-analysis-engine";
import type { CriticalInterval } from "./critical-interval";
import type { RateFunction } from "./queue-series";

export function computeBacklog(
  arrival: RateFunction,
  service: RateFunction,
  criticalInterval: CriticalInterval | null,
  points: number,
  method: IntegrationMethod = "simpson",
): number {
  if (!criticalInterval) {
    return 0;
  }

  const excessRate: RateFunction = (t) => Math.max(0, arrival(t) - service(t));
  return integrate(excessRate, criticalInterval.start, criticalInterval.end, points, method);
}

export function averageArrivalRateDuringCriticalInterval(
  arrival: RateFunction,
  criticalInterval: CriticalInterval | null,
  points: number,
  method: IntegrationMethod = "simpson",
): number {
  if (!criticalInterval) {
    return 0;
  }

  return averageValue(arrival, criticalInterval.start, criticalInterval.end, points, method);
}
