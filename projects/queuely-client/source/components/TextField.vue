<script setup lang="ts">
type Props = {
  label: string;
  symbol?: string;
  unit?: string;
  error?: string | null;
  modelValue: string;
};

type Emits = {
  "update:modelValue": [value: string];
};

defineProps<Props>();
const emit = defineEmits<Emits>();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="flex items-baseline justify-between">
      <span class="text-xs font-medium text-ink-200">{{ label }}</span>
      <span v-if="symbol" class="font-mono text-xs font-medium text-ink-500">{{ symbol }}</span>
    </label>
    <div
      class="flex items-center gap-2 rounded-md border px-2.5"
      :class="error ? 'border-danger/60 bg-danger/10' : 'border-ink-600 bg-ink-800'"
    >
      <input
        type="text"
        inputmode="decimal"
        :value="modelValue"
        class="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-sm font-medium text-ink-50 outline-none"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span
        v-if="unit"
        class="whitespace-nowrap font-mono text-xs font-semibold"
        :class="error ? 'text-danger/80' : 'text-ink-500'"
      >
        {{ unit }}
      </span>
    </div>
    <span v-if="error" class="text-xs font-medium text-danger/90">{{ error }}</span>
  </div>
</template>
