<script setup lang="ts">
import { REGION_COLORS } from '@/composables/useRegions'

const props = defineProps<{
  chosenRegions: string[]
}>()
</script>

<template>
  <div class="mt-1.5 flex flex-wrap gap-1">
    <span
      v-for="region in chosenRegions"
      :key="region"
      class="rounded px-1.5 py-0.5 text-xs font-medium"
      :class="REGION_COLORS[region] ?? 'bg-gray-600 text-gray-200'"
    >
      {{ region }}
    </span>
  </div>
</template>
