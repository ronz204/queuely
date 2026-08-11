import type { RateFunction } from "./queue-series";

export type CriticalInterval = {
  start: number;
  end: number;
};

/**
 * Assumes a single contiguous interval where arrivals exceed service, which holds for a
 * constant service rate and a single-peaked Gaussian arrival rate — it does not hard-code
 * that assumption into its shape, so a future non-constant service rate wouldn't silently
 * misbehave, it would just report the first-to-last overloaded instant as one span.
 */
export function findCriticalInterval(arrival: RateFunction, service: RateFunction, timeGrid: number[]): CriticalInterval | null {
  const overloadedTimes = timeGrid.filter((t) => arrival(t) > service(t));

  if (overloadedTimes.length === 0) {
    return null;
  }

  return {
    start: overloadedTimes[0],
    end: overloadedTimes[overloadedTimes.length - 1],
  };
}
