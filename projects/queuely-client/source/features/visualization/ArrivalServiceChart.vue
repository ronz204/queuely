<script setup lang="ts">
import { Chart } from "chart.js";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useScenarioComparisonStore } from "@stores/scenario-comparison";
import { useSimulationStore } from "@stores/simulation";
import LegendSwatch from "@components/LegendSwatch.vue";
import { buildArrivalServiceChartData, type Point } from "./build-chart-data";
import { CHART_COLORS } from "./chart-colors";
import { buildBaseChartOptions } from "./chart-options";
import "./register-chart";

const simulationStore = useSimulationStore();
const scenarioStore = useScenarioComparisonStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart<"line" | "scatter", Point[]> | null = null;

onMounted(() => {
  if (!canvasRef.value) return;

  chart = new Chart<"line" | "scatter", Point[]>(canvasRef.value, {
    type: "line",
    data: buildArrivalServiceChartData(simulationStore.result, scenarioStore.scenarios, true),
    options: buildBaseChartOptions(),
  });
});

watch(
  () => [simulationStore.result, scenarioStore.scenarios] as const,
  () => {
    if (!chart) return;
    chart.data = buildArrivalServiceChartData(simulationStore.result, scenarioStore.scenarios, true);
    chart.update();
  },
);

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});
</script>

<template>
  <div class="rounded-lg border border-ink-700 bg-ink-900 p-5">
    <div class="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
      <h2 class="text-sm font-semibold text-ink-50">Llegada λ(t) vs. servicio μ(t)</h2>
      <div class="flex flex-wrap gap-3.5">
        <LegendSwatch :color="CHART_COLORS.arrival">λ(t)</LegendSwatch>
        <LegendSwatch :color="CHART_COLORS.service" shape="dashed">μ(t)</LegendSwatch>
        <LegendSwatch :color="CHART_COLORS.backlog" shape="square">backlog D</LegendSwatch>
        <LegendSwatch :color="CHART_COLORS.event" shape="dot">eventos Poisson</LegendSwatch>
        <LegendSwatch v-for="scenario in scenarioStore.scenarios" :key="scenario.id" :color="scenario.color">{{ scenario.label }}</LegendSwatch>
      </div>
    </div>
    <div class="relative">
      <canvas ref="canvasRef" class="block h-chart w-full rounded-lg"></canvas>
      <div v-if="simulationStore.isFrozen" class="pointer-events-none absolute inset-0 rounded-lg bg-ink-950/55"></div>
    </div>
  </div>
</template>
