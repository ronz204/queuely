<script setup lang="ts">
import StatCard from "@designs/StatCard.vue";
import type { SimulationMetrics } from "@shared/types";
import { CHART_COLORS } from "./chart-colors";

type Props = {
  metrics: SimulationMetrics;
};

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <StatCard label="Backlog acumulado" symbol="D" :symbol-color="CHART_COLORS.backlog" :value="metrics.backlog.toFixed(1)" unit="pedidos" />
    <StatCard
      label="Pico de cola"
      symbol="Q_max"
      :symbol-color="CHART_COLORS.queue"
      :value="metrics.peakQueueSize.toFixed(1)"
      unit="pedidos"
    />
    <StatCard
      label="Instante del pico"
      symbol="t(Q_max)"
      :symbol-color="CHART_COLORS.queue"
      :value="metrics.peakQueueTime.toFixed(1)"
      unit="min"
    />
    <StatCard
      label="λ promedio (crítico)"
      symbol="λ̄"
      :symbol-color="CHART_COLORS.arrival"
      :value="metrics.averageArrivalRate.toFixed(1)"
      unit="pedidos/min"
    />
  </div>
</template>
