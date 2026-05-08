<script setup lang="ts">
import { computed, ref } from 'vue'
import { CHOOSABLE_REGIONS, REGION_COLORS } from '@/composables/useRegions'

const props = defineProps<{
  completedIds: number[]
  chosenRegions: string[]
}>()

const emit = defineEmits<{
  'update:chosenRegions': [regions: string[]]
}>()

const editing = ref(false)

const completedCount = computed(() => props.completedIds.length)

interface RegionNode {
  label: string        // display name (region name or "Choice X")
  region: string | null
  threshold: number
  unlocked: boolean
  isFixed: boolean
}

const nodes = computed<RegionNode[]>(() => [
  { label: 'Varlamore', region: 'Varlamore', threshold: 0,   unlocked: true,                           isFixed: true },
  { label: 'Karamja',   region: 'Karamja',   threshold: 80,  unlocked: completedCount.value >= 80,     isFixed: true },
  { label: props.chosenRegions[0] ?? 'Choice 1', region: props.chosenRegions[0] ?? null, threshold: 200, unlocked: completedCount.value >= 200, isFixed: false },
  { label: props.chosenRegions[1] ?? 'Choice 2', region: props.chosenRegions[1] ?? null, threshold: 300, unlocked: completedCount.value >= 300, isFixed: false },
  { label: props.chosenRegions[2] ?? 'Choice 3', region: props.chosenRegions[2] ?? null, threshold: 450, unlocked: completedCount.value >= 450, isFixed: false },
])

const unlockedCount = computed(() => nodes.value.filter((n) => n.unlocked).length)

// Index of the last unlocked node (for progress bar segment)
const lastUnlockedIdx = computed(() => {
  let idx = 0
  for (let i = 0; i < nodes.value.length; i++) {
    if (nodes.value[i].unlocked) idx = i
  }
  return idx
})

const nextNode = computed(() =>
  lastUnlockedIdx.value < nodes.value.length - 1 ? nodes.value[lastUnlockedIdx.value + 1] : null,
)

const prevThreshold = computed(() => nodes.value[lastUnlockedIdx.value].threshold)

const tasksToNext = computed(() =>
  nextNode.value ? nextNode.value.threshold - completedCount.value : 0,
)

const segmentProgress = computed(() => {
  if (!nextNode.value) return 100
  const from = prevThreshold.value
  const to = nextNode.value.threshold
  return Math.min(100, ((completedCount.value - from) / (to - from)) * 100)
})

function nodeColor(node: RegionNode): string {
  if (!node.unlocked) return 'border-gray-700 text-gray-600 bg-gray-800'
  const colorClass = REGION_COLORS[node.region ?? ''] ?? 'bg-gray-600 text-gray-200'
  // Extract the bg color for the border; use text-white for the icon
  return `${colorClass} border-transparent`
}

function connectorColor(nodeIdx: number): string {
  // Color the connector before node[i] if node[i] is unlocked
  const node = nodes.value[nodeIdx]
  if (!node.unlocked) return 'bg-gray-700'
  const colorClass = REGION_COLORS[node.region ?? ''] ?? 'bg-gray-500'
  // Extract just the bg-* part
  const bg = colorClass.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-gray-500'
  return bg
}

// Whether any unlocked choice slot has no region set (prompt to edit)
const hasEmptyUnlockedSlot = computed(() =>
  nodes.value.some((n) => !n.isFixed && n.unlocked && !n.region),
)

function toggleRegion(region: string) {
  const current = [...props.chosenRegions]
  const idx = current.indexOf(region)
  if (idx !== -1) {
    current.splice(idx, 1)
  } else if (current.length < 3) {
    current.push(region)
  }
  emit('update:chosenRegions', current)
}
</script>

<template>
  <div class="rounded-xl bg-gray-800 p-5">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Regions</p>
        <p class="mt-0.5 text-2xl font-bold text-white">
          {{ unlockedCount }}<span class="text-gray-600">/5</span>
        </p>
      </div>
      <div class="flex items-end flex-col gap-1">
        <button
          class="text-xs transition-colors"
          :class="
            hasEmptyUnlockedSlot && !editing
              ? 'text-yellow-400 hover:text-yellow-300 font-semibold'
              : 'text-gray-500 hover:text-gray-300'
          "
          @click="editing = !editing"
        >
          {{ editing ? 'Done' : hasEmptyUnlockedSlot ? 'Choose regions ›' : 'Edit' }}
        </button>
        <p v-if="nextNode" class="text-sm font-semibold text-gray-300">
          {{ tasksToNext }} tasks to {{ nextNode.region ?? `Choice ${lastUnlockedIdx}` }}
        </p>
        <p v-else class="text-xs font-semibold text-green-400">All regions unlocked!</p>
      </div>
    </div>

    <!-- Segment progress bar -->
    <div class="mb-5">
      <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="
            nextNode
              ? (REGION_COLORS[nextNode.region ?? ''] ?? 'bg-gray-500').split(' ').find((c) => c.startsWith('bg-'))
              : 'bg-green-500'
          "
          :style="{ width: `${segmentProgress}%` }"
        />
      </div>
      <div class="mt-1 flex justify-between text-xs text-gray-500">
        <span>{{ prevThreshold }} tasks</span>
        <span>{{ nextNode?.threshold ?? 450 }} tasks</span>
      </div>
    </div>

    <!-- Node track -->
    <div class="flex items-start justify-between gap-1">
      <template v-for="(node, i) in nodes" :key="node.threshold">
        <!-- Connector line -->
        <div
          v-if="i > 0"
          class="mt-[13px] h-0.5 flex-1 rounded-full transition-colors"
          :class="connectorColor(i)"
        />

        <!-- Node -->
        <div class="flex flex-col items-center gap-1.5">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all"
            :class="[
              nodeColor(node),
              lastUnlockedIdx === i && nextNode ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-gray-400 scale-110' : '',
            ]"
          >
            <span v-if="node.unlocked">✓</span>
            <span v-else class="text-[9px]">{{ node.threshold }}</span>
          </div>
          <span class="text-center text-[10px] leading-tight w-16" :class="node.unlocked ? 'text-gray-300' : 'text-gray-600'">
            {{ node.label }}
          </span>
        </div>
      </template>
    </div>

    <!-- Region picker (edit mode) -->
    <div v-if="editing" class="mt-5 border-t border-gray-700 pt-4">
      <p class="mb-2 text-xs text-gray-500">
        Select up to 3 regions · {{ chosenRegions.length }}/3 chosen
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="region in CHOOSABLE_REGIONS"
          :key="region"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
          :class="
            chosenRegions.includes(region)
              ? REGION_COLORS[region]
              : chosenRegions.length >= 3
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          "
          :disabled="!chosenRegions.includes(region) && chosenRegions.length >= 3"
          @click="toggleRegion(region)"
        >
          {{ region }}
        </button>
      </div>
    </div>
  </div>
</template>
