<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ points: number }>()

interface CupTier {
  name: string
  threshold: number
  color: string
  barColor: string
  icon: string
}

const CUPS: CupTier[] = [
  { name: 'Bronze',   threshold: 2_000,   color: 'text-amber-700',   barColor: 'bg-amber-700',   icon: '🥉' },
  { name: 'Iron',     threshold: 4_000,   color: 'text-gray-400',    barColor: 'bg-gray-400',    icon: '🏆' },
  { name: 'Steel',    threshold: 10_000,  color: 'text-slate-300',   barColor: 'bg-slate-300',   icon: '🏆' },
  { name: 'Mithril',  threshold: 22_000,  color: 'text-blue-400',    barColor: 'bg-blue-400',    icon: '🏆' },
  { name: 'Adamant',  threshold: 32_000,  color: 'text-green-400',   barColor: 'bg-green-400',   icon: '🏆' },
  { name: 'Rune',     threshold: 47_500,  color: 'text-cyan-400',    barColor: 'bg-cyan-400',    icon: '🏆' },
  { name: 'Dragon',   threshold: 65_000,  color: 'text-red-400',     barColor: 'bg-red-400',     icon: '🏆' },
  { name: 'Maximum',  threshold: 146_040, color: 'text-yellow-400',  barColor: 'bg-yellow-400',  icon: '👑' },
]

const currentTierIndex = computed(() => {
  let idx = -1
  for (let i = 0; i < CUPS.length; i++) {
    if (props.points >= CUPS[i].threshold) idx = i
  }
  return idx
})

const currentTier = computed(() => (currentTierIndex.value >= 0 ? CUPS[currentTierIndex.value] : null))
const nextTier = computed(() => CUPS[currentTierIndex.value + 1] ?? null)

const progressToNext = computed(() => {
  if (!nextTier.value) return 100
  const from = currentTier.value?.threshold ?? 0
  const to = nextTier.value.threshold
  return Math.min(100, ((props.points - from) / (to - from)) * 100)
})

const pointsToNext = computed(() =>
  nextTier.value ? nextTier.value.threshold - props.points : 0,
)
</script>

<template>
  <div class="rounded-xl bg-gray-800 p-5">
    <!-- Current status headline -->
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Cup Tier</p>
        <p v-if="currentTier" class="mt-0.5 text-2xl font-bold" :class="currentTier.color">
          {{ currentTier.name }} Cup
        </p>
        <p v-else class="mt-0.5 text-2xl font-bold text-gray-600">No Cup Yet</p>
      </div>
      <div v-if="nextTier" class="text-right">
        <p class="text-xs text-gray-500">Next: {{ nextTier.name }}</p>
        <p class="text-sm font-semibold text-gray-300">
          {{ pointsToNext.toLocaleString() }} pts away
        </p>
      </div>
      <div v-else class="text-right">
        <p class="text-xs text-yellow-500 font-semibold">Maximum reached!</p>
      </div>
    </div>

    <!-- Progress bar to next cup -->
    <div class="mb-5">
      <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="nextTier ? nextTier.barColor : 'bg-yellow-400'"
          :style="{ width: `${progressToNext}%` }"
        />
      </div>
      <div class="mt-1 flex justify-between text-xs text-gray-500">
        <span>{{ (currentTier?.threshold ?? 0).toLocaleString() }}</span>
        <span>{{ (nextTier?.threshold ?? 146_040).toLocaleString() }}</span>
      </div>
    </div>

    <!-- Full tier ladder -->
    <div class="flex items-center justify-between gap-1">
      <template v-for="(cup, i) in CUPS" :key="cup.name">
        <!-- Connector line -->
        <div
          v-if="i > 0"
          class="h-0.5 flex-1 rounded-full transition-colors"
          :class="points >= cup.threshold ? cup.barColor : 'bg-gray-700'"
        />
        <!-- Cup node -->
        <div class="flex flex-col items-center gap-1">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all"
            :class="[
              points >= cup.threshold
                ? `border-current ${cup.color} bg-gray-900`
                : 'border-gray-700 text-gray-700 bg-gray-800',
              currentTierIndex === i ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-current scale-110' : '',
            ]"
            :title="`${cup.name}: ${cup.threshold.toLocaleString()} pts`"
          >
            <span v-if="points >= cup.threshold">✓</span>
            <span v-else class="text-[9px]">{{ cup.threshold >= 1000 ? `${cup.threshold / 1000}k` : cup.threshold }}</span>
          </div>
          <span
            class="hidden text-[10px] sm:block"
            :class="points >= cup.threshold ? cup.color : 'text-gray-700'"
          >{{ cup.name }}</span>
        </div>
      </template>
    </div>
  </div>
</template>
