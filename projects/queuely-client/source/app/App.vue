<script setup lang="ts">
import { ParameterForm } from "@features/parameter-form";
import { ScenarioComparison } from "@features/scenario-comparison";
import { ArrivalServiceChart, MetricsPanel, QueueChart, StatusBadges } from "@features/visualization";
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <header class="flex flex-wrap items-end justify-between gap-3 border-b border-ink-700 pb-4">
      <h1 class="text-xl font-bold tracking-tight text-ink-50">Queuely</h1>
      <StatusBadges />
    </header>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <ParameterForm class="lg:w-80 lg:shrink-0" />

      <main class="flex min-w-0 flex-1 flex-col gap-6">
        <MetricsPanel />
        <ArrivalServiceChart />
        <QueueChart />
        <ScenarioComparison />
      </main>
    </div>
  </div>
</template>
