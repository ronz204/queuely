<script setup lang="ts">
import Badge from "@designs/Badge.vue";

type Props = {
  overloaded: boolean;
  frozen: boolean;
};

defineProps<Props>();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Badge v-if="overloaded" tone="danger">Sobrecargado en el intervalo crítico</Badge>
    <Badge v-else tone="success">Dentro de capacidad</Badge>
    <Badge v-if="frozen" tone="danger">Resultados congelados</Badge>
  </div>
</template>
