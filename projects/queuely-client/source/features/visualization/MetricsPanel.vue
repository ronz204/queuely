<script setup lang="ts">
import { useSimulationStore } from "@stores/simulation";
import StatCard from "@components/StatCard.vue";
import { CHART_COLORS } from "./chart-colors";

const simulationStore = useSimulationStore();
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <StatCard
      label="Backlog acumulado"
      symbol="D"
      :symbol-color="CHART_COLORS.backlog"
      :value="simulationStore.result.metrics.backlog.toFixed(1)"
      unit="pedidos"
    />
    <StatCard
      label="Pico de cola"
      symbol="Q_max"
      :symbol-color="CHART_COLORS.queue"
      :value="simulationStore.result.metrics.peakQueueSize.toFixed(1)"
      unit="pedidos"
    />
    <StatCard
      label="Instante del pico"
      symbol="t(Q_max)"
      :symbol-color="CHART_COLORS.queue"
      :value="simulationStore.result.metrics.peakQueueTime.toFixed(1)"
      unit="min"
    />
    <StatCard
      label="λ promedio (crítico)"
      symbol="λ̄"
      :symbol-color="CHART_COLORS.arrival"
      :value="simulationStore.result.metrics.averageArrivalRate.toFixed(1)"
      unit="pedidos/min"
    />
  </div>
</template>
