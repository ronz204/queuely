<script setup lang="ts">
import { computed } from "vue";
import { useSimulationStore } from "@stores/simulation";
import Badge from "@components/Badge.vue";

const simulationStore = useSimulationStore();
const overloaded = computed(() => simulationStore.result.metrics.isOverloaded);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Badge v-if="overloaded" tone="danger">Sobrecargado en el intervalo crítico</Badge>
    <Badge v-else tone="success">Dentro de capacidad</Badge>
    <Badge v-if="simulationStore.isFrozen" tone="danger">Resultados congelados</Badge>
  </div>
</template>
