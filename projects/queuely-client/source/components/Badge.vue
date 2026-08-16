<script setup lang="ts">
type Props = {
  tone: "danger" | "success";
};

defineProps<Props>();
</script>

<template>
  <div
    class="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold"
    :class="tone === 'danger' ? 'border-danger/50 bg-danger/15 text-danger' : 'border-success/45 bg-success/15 text-success'"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="tone === 'danger' ? 'bg-danger' : 'bg-success'"></span>
    <slot />
  </div>
</template>
