export type ServiceRateParameters = {
  rate: number;
};

export function serviceRate(_t: number, params: ServiceRateParameters): number {
  return params.rate;
}
