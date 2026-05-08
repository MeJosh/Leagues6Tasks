<script setup lang="ts">
const PACT_CAP = 40

const props = defineProps<{ pactPoints: number }>()
</script>

<template>
  <div class="rounded-xl bg-gray-800 p-5">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Pact Tasks</p>
        <p class="mt-0.5 text-2xl font-bold text-white">
          {{ pactPoints }}<span class="text-gray-600">/{{ PACT_CAP }}</span>
        </p>
      </div>
      <div class="text-right">
        <p v-if="pactPoints >= PACT_CAP" class="text-xs font-semibold text-yellow-400">Cap reached!</p>
        <template v-else>
          <p class="text-xs text-gray-500">Remaining</p>
          <p class="text-sm font-semibold text-gray-300">{{ PACT_CAP - pactPoints }} pact tasks</p>
        </template>
      </div>
    </div>

    <div>
      <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          class="h-full rounded-full bg-violet-500 transition-all duration-500"
          :style="{ width: `${(pactPoints / PACT_CAP) * 100}%` }"
        />
      </div>
      <div class="mt-1 flex justify-between text-xs text-gray-500">
        <span>{{ pactPoints }} earned</span>
        <span>{{ PACT_CAP }} cap</span>
      </div>
    </div>
  </div>
</template>
