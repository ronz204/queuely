<script setup lang="ts">
import { computed } from "vue";
import { ParameterForm, useSimulationParameters } from "@features/dashboard";
import { ScenarioComparison, useScenarioComparison } from "@features/scenario-comparison";
import { ArrivalServiceChart, MetricsPanel, QueueChart, StatusBadges } from "@features/visualization";

const { raw, errors, result, isFrozen, setField } = useSimulationParameters();
const { scenarios, saveScenario, deleteScenario } = useScenarioComparison();

const overloaded = computed(() => result.value.metrics.isOverloaded);
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <header class="flex flex-wrap items-end justify-between gap-3 border-b border-ink-700 pb-4">
      <h1 class="text-xl font-bold tracking-tight text-ink-50">Queuely</h1>
      <StatusBadges :overloaded="overloaded" :frozen="isFrozen" />
    </header>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <ParameterForm class="lg:w-80 lg:shrink-0" :raw="raw" :errors="errors" @change="setField" />

      <main class="flex min-w-0 flex-1 flex-col gap-6">
        <MetricsPanel :metrics="result.metrics" />
        <ArrivalServiceChart :result="result" :scenarios="scenarios" :show-events="true" :frozen="isFrozen" />
        <QueueChart :result="result" :scenarios="scenarios" :frozen="isFrozen" />
        <ScenarioComparison :scenarios="scenarios" :disabled="isFrozen" @save="saveScenario(result)" @delete="deleteScenario" />
      </main>
    </div>
  </div>
</template>
