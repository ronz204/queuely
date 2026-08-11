import type { SimulationParameters } from "@shared/types";

export type RawParameterInput = {
  amplitude: string;
  peakTime: string;
  sigma: string;
  serviceRate: string;
  horizon: string;
  points: string;
};

export type ValidationErrors = Partial<Record<keyof RawParameterInput, string>>;

export type ValidationResult = {
  errors: ValidationErrors;
  parameters: SimulationParameters | null;
};

export function validateParameters(raw: RawParameterInput): ValidationResult {
  const errors: ValidationErrors = {};

  const amplitude = Number(raw.amplitude);
  if (!(amplitude > 0) || !Number.isFinite(amplitude)) {
    errors.amplitude = "Debe ser mayor que 0";
  } else if (amplitude > 1000) {
    errors.amplitude = "Máximo 1000";
  }

  const horizon = Number(raw.horizon);
  if (!(horizon > 0) || !Number.isFinite(horizon)) {
    errors.horizon = "Debe ser mayor que 0";
  } else if (horizon > 500) {
    errors.horizon = "Máximo 500 min";
  }

  const peakTime = Number(raw.peakTime);
  if (!Number.isFinite(peakTime)) {
    errors.peakTime = "Debe ser un número";
  } else if (!errors.horizon && (peakTime < 0 || peakTime > horizon)) {
    errors.peakTime = `Debe estar entre 0 y ${horizon}`;
  }

  const sigma = Number(raw.sigma);
  if (!(sigma > 0) || !Number.isFinite(sigma)) {
    errors.sigma = "Debe ser mayor que 0";
  } else if (!errors.horizon && sigma > horizon) {
    errors.sigma = `Debe ser ≤ ${horizon}`;
  }

  const serviceRate = Number(raw.serviceRate);
  if (!(serviceRate > 0) || !Number.isFinite(serviceRate)) {
    errors.serviceRate = "Debe ser mayor que 0";
  } else if (serviceRate > 1000) {
    errors.serviceRate = "Máximo 1000";
  }

  const points = Number(raw.points);
  if (!Number.isFinite(points) || Math.floor(points) !== points) {
    errors.points = "Debe ser un entero";
  } else if (points < 10 || points > 2000) {
    errors.points = "Entre 10 y 2000";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, parameters: null };
  }

  return {
    errors,
    parameters: { amplitude, peakTime, sigma, serviceRate, horizon, points },
  };
}
