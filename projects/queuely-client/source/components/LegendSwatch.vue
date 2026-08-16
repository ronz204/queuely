<script setup lang="ts">
type Props = {
  color: string;
  shape?: "line" | "dashed" | "dot" | "square";
};

withDefaults(defineProps<Props>(), { shape: "line" });
</script>

<template>
  <span class="flex items-center gap-1.5 text-xs font-medium text-ink-300">
    <span v-if="shape === 'line'" class="inline-block h-0.5 w-3.5" :style="{ backgroundColor: color }"></span>
    <span
      v-else-if="shape === 'dashed'"
      class="inline-block h-0 w-3.5 border-t-2 border-dashed"
      :style="{ borderColor: color }"
    ></span>
    <span v-else-if="shape === 'dot'" class="inline-block h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: color }"></span>
    <span v-else class="inline-block h-2.5 w-2.5 border" :style="{ backgroundColor: color, borderColor: color }"></span>
    <slot />
  </span>
</template>
