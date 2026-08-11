<script setup lang="ts">
import type { SavedScenario } from "@shared/types";

type Props = {
  scenarios: SavedScenario[];
  disabled: boolean;
};

type Emits = {
  save: [];
  delete: [id: string];
};

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-ink-700 bg-ink-900 p-5">
    <div class="flex flex-wrap items-center justify-between gap-2.5">
      <div>
        <h2 class="text-sm font-semibold text-ink-50">Comparación de escenarios</h2>
        <p class="mt-0.5 text-xs text-ink-400">Guardá el escenario actual para superponerlo en los charts de arriba.</p>
      </div>
      <button
        type="button"
        :disabled="disabled"
        class="cursor-pointer whitespace-nowrap rounded-md border border-arrival/50 bg-arrival/15 px-4 py-2 text-xs font-semibold text-arrival transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('save')"
      >
        Guardar escenario actual
      </button>
    </div>

    <template v-if="scenarios.length > 0">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="scenario in scenarios"
          :key="scenario.id"
          class="flex items-center gap-2 rounded-md border border-ink-600 bg-ink-800 px-2.5 py-1.5"
        >
          <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: scenario.color }"></span>
          <span class="text-xs font-medium text-ink-50">{{ scenario.label }}</span>
          <button
            type="button"
            class="cursor-pointer px-0.5 font-mono text-sm font-semibold text-ink-500 hover:text-ink-200"
            @click="emit('delete', scenario.id)"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-xs">
          <thead>
            <tr class="border-b border-ink-700">
              <th class="px-1.5 py-2 text-left font-medium text-ink-400">Escenario</th>
              <th class="px-1.5 py-2 text-right font-medium text-ink-400">D</th>
              <th class="px-1.5 py-2 text-right font-medium text-ink-400">Q_max</th>
              <th class="px-1.5 py-2 text-right font-medium text-ink-400">t(Q_max)</th>
              <th class="px-1.5 py-2 text-right font-medium text-ink-400">λ̄ crítico</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="scenario in scenarios" :key="scenario.id" class="border-b border-ink-800">
              <td class="flex items-center gap-1.5 px-1.5 py-2">
                <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: scenario.color }"></span>
                {{ scenario.label }}
              </td>
              <td class="px-1.5 py-2 text-right font-mono">{{ scenario.result.metrics.backlog.toFixed(1) }}</td>
              <td class="px-1.5 py-2 text-right font-mono">{{ scenario.result.metrics.peakQueueSize.toFixed(1) }}</td>
              <td class="px-1.5 py-2 text-right font-mono">{{ scenario.result.metrics.peakQueueTime.toFixed(1) }}</td>
              <td class="px-1.5 py-2 text-right font-mono">{{ scenario.result.metrics.averageArrivalRate.toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-else class="rounded-lg border border-dashed border-ink-600 p-5 text-center text-xs text-ink-500">
      No hay escenarios guardados todavía.
    </div>
  </div>
</template>
