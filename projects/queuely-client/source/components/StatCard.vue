<script setup lang="ts">
type Props = {
  label: string;
  symbol: string;
  symbolColor: string;
  value: string;
  unit: string;
};

defineProps<Props>();
</script>

<template>
  <div class="rounded-lg border border-ink-700 bg-ink-900 p-4">
    <div class="flex items-baseline justify-between gap-2">
      <span class="text-xs font-medium text-ink-400">{{ label }}</span>
      <span class="whitespace-nowrap font-mono text-xs font-medium" :style="{ color: symbolColor }">{{ symbol }}</span>
    </div>
    <div class="mt-2 font-mono text-2xl font-semibold text-ink-50">
      {{ value }}<span class="ml-1 text-xs font-medium text-ink-500">{{ unit }}</span>
    </div>
  </div>
</template>
