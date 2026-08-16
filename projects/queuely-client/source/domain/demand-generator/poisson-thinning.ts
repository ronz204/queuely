import { arrivalRate, type GaussianArrivalParameters } from "./arrival-rate";

export type ArrivalEvent = {
  time: number;
  rate: number;
};

/**
 * Seeded from the arrival parameters themselves (not an unseeded system RNG), so the same
 * parameter set always reproduces the same events — this keeps the live-recompute dashboard
 * visually stable across recomputes of an unchanged parameter set.
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;

  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(params: GaussianArrivalParameters & { horizon: number }): number {
  const { amplitude, peakTime, sigma, horizon } = params;
  return Math.floor(amplitude * 997 + peakTime * 131 + sigma * 71 + horizon * 17);
}

export function generateArrivalEvents(params: GaussianArrivalParameters & { horizon: number }): ArrivalEvent[] {
  const { horizon } = params;
  const lambdaMax = Math.max(params.amplitude, 1e-3);
  const random = mulberry32(seedFrom(params));
  const events: ArrivalEvent[] = [];

  let t = 0;
  while (t < horizon) {
    const interArrival = -Math.log(Math.max(random(), 1e-9)) / lambdaMax;
    t += interArrival;
    if (t >= horizon) break;

    const rate = arrivalRate(t, params);
    if (random() <= rate / lambdaMax) {
      events.push({ time: t, rate });
    }
  }

  return events;
}
