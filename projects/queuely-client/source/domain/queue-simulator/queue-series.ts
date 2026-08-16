export type RateFunction = (t: number) => number;

/**
 * Clips at zero on every step (not just the final reported series) — once the queue drains,
 * excess service capacity can't create a negative debt that has to be paid back before the
 * queue starts growing again, since a queue physically cannot hold a negative count of orders.
 */
export function computeQueueSeries(arrival: RateFunction, service: RateFunction, timeGrid: number[]): number[] {
  const queue: number[] = [0];

  for (let i = 1; i < timeGrid.length; i++) {
    const dt = timeGrid[i] - timeGrid[i - 1];
    const netRate = arrival(timeGrid[i - 1]) - service(timeGrid[i - 1]);
    queue.push(Math.max(0, queue[i - 1] + netRate * dt));
  }

  return queue;
}
