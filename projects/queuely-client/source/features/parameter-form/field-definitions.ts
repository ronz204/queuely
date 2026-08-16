import type { RawParameterInput } from "@stores/simulation";

export type ParameterFieldDefinition = {
  key: keyof RawParameterInput;
  label: string;
  symbol: string;
  unit: string;
};

export const PARAMETER_FIELD_DEFINITIONS: ParameterFieldDefinition[] = [
  { key: "amplitude", label: "Amplitud del pico", symbol: "A", unit: "pedidos/min" },
  { key: "peakTime", label: "Instante del pico", symbol: "t₀", unit: "min" },
  { key: "sigma", label: "Ancho del pico (σ)", symbol: "σ", unit: "min" },
  { key: "serviceRate", label: "Tasa de servicio", symbol: "μ", unit: "pedidos/min" },
  { key: "horizon", label: "Horizonte de estudio", symbol: "T", unit: "min" },
  { key: "points", label: "Puntos de integración", symbol: "N", unit: "pts" },
];
