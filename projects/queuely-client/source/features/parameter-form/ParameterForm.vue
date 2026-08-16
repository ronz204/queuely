<script setup lang="ts">
import { useSimulationStore } from "@stores/simulation";
import TextField from "@components/TextField.vue";
import { PARAMETER_FIELD_DEFINITIONS } from "./field-definitions";

const simulationStore = useSimulationStore();
</script>

<template>
  <aside class="sticky top-6 flex flex-col gap-4 self-start rounded-lg border border-ink-700 bg-ink-900 p-5">
    <div>
      <h2 class="text-sm font-semibold text-ink-50">Parámetros del modelo</h2>
      <p class="mt-1 text-xs text-ink-400">El recálculo ocurre automáticamente al corregir un valor inválido.</p>
    </div>

    <TextField
      v-for="field in PARAMETER_FIELD_DEFINITIONS"
      :key="field.key"
      :label="field.label"
      :symbol="field.symbol"
      :unit="field.unit"
      :model-value="simulationStore.raw[field.key]"
      :error="simulationStore.errors[field.key]"
      @update:model-value="(value) => simulationStore.setField(field.key, value)"
    />
  </aside>
</template>
