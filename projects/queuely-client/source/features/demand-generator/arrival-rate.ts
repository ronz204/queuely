export type GaussianArrivalParameters = {
  amplitude: number;
  peakTime: number;
  sigma: number;
};

export function arrivalRate(t: number, params: GaussianArrivalParameters): number {
  const { amplitude, peakTime, sigma } = params;
  return amplitude * Math.exp(-((t - peakTime) ** 2) / (2 * sigma * sigma));
}
