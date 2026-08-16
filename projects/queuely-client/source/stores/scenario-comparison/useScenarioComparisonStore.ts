import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import type { SimulationResult } from "@domain/simulation";
import { scenarioColor } from "./palette";

export type SavedScenario = {
  id: string;
  label: string;
  color: string;
  result: SimulationResult;
};

export const useScenarioComparisonStore = defineStore("scenario-comparison", () => {
  const scenarios = ref<SavedScenario[]>([]);
  let scenarioCounter = 0;

  function saveScenario(result: SimulationResult) {
    scenarioCounter += 1;
    const scenario: SavedScenario = {
      id: crypto.randomUUID(),
      label: `Escenario ${scenarioCounter}`,
      color: scenarioColor(scenarios.value.length),
      // `result` arrives as a Vue reactive Proxy (it's a ref's `.value`); structuredClone can't
      // clone a Proxy directly ("could not be cloned"), so unwrap to the plain object first.
      result: structuredClone(toRaw(result)),
    };
    // Reassign instead of mutating in place: the chart components watch `scenarios` by
    // reference, and Vue's shallow reactivity only notifies on a reference change — an
    // in-place `.push()` left the array identity unchanged, so saved scenarios never reached
    // the chart overlay even though the list/table (driven by v-for, which deep-tracks) updated.
    scenarios.value = [...scenarios.value, scenario];
  }

  function deleteScenario(id: string) {
    scenarios.value = scenarios.value.filter((scenario) => scenario.id !== id);
  }

  return { scenarios, saveScenario, deleteScenario };
});
