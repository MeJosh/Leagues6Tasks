<script setup lang="ts">
import type { TierName } from '@/types'
import { TIER_COLORS } from '@/types'

const props = defineProps<{ tier: TierName }>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
    :class="TIER_COLORS[props.tier]"
  >
    {{ props.tier }}
  </span>
</template>
