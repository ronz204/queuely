import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { runSimulation, type SimulationParameters, type SimulationResult } from "@domain/simulation";
import { type RawParameterInput, type ValidationErrors, validateParameters } from "./validation";

const DEFAULT_PARAMETERS: SimulationParameters = {
  amplitude: 140,
  peakTime: 40,
  sigma: 12,
  serviceRate: 60,
  horizon: 90,
  points: 180,
};

const DEBOUNCE_MS = 200;

function toRawInput(params: SimulationParameters): RawParameterInput {
  return {
    amplitude: String(params.amplitude),
    peakTime: String(params.peakTime),
    sigma: String(params.sigma),
    serviceRate: String(params.serviceRate),
    horizon: String(params.horizon),
    points: String(params.points),
  };
}

export const useSimulationStore = defineStore("simulation", () => {
  const raw = reactive<RawParameterInput>(toRawInput(DEFAULT_PARAMETERS));
  const errors = ref<ValidationErrors>({});
  const result = ref<SimulationResult>(runSimulation(DEFAULT_PARAMETERS));

  let debounceHandle: ReturnType<typeof setTimeout> | undefined;

  function recompute() {
    const validation = validateParameters(raw);
    errors.value = validation.errors;

    if (validation.parameters) {
      result.value = runSimulation(validation.parameters);
    }
  }

  function setField(key: keyof RawParameterInput, value: string) {
    raw[key] = value;

    if (debounceHandle) {
      clearTimeout(debounceHandle);
    }
    debounceHandle = setTimeout(recompute, DEBOUNCE_MS);
  }

  const isFrozen = computed(() => Object.keys(errors.value).length > 0);

  return { raw, errors, result, isFrozen, setField };
});
