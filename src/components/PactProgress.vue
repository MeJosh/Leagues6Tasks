<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTasks } from '@/composables/useTasks'
import { useRegions } from '@/composables/useRegions'
import { useCharacters } from '@/composables/useCharacters'
import TierBadge from '@/components/TierBadge.vue'
import type { TierName } from '@/types'

const PACT_CAP = 40

const props = defineProps<{
  pactPoints: number
  completedIds: number[]
  chosenRegions: string[]
  characterId: string
}>()

const { getCharacter, addToTodo, removeFromTodo } = useCharacters()
const character = computed(() => getCharacter(props.characterId))
const todoSet = computed(() => new Set(character.value?.todoTaskIds ?? []))

const { allTasks } = useTasks()
const { activeRegions } = useRegions(
  () => props.completedIds,
  () => props.chosenRegions,
)

const completedSet = computed(() => new Set(props.completedIds))

const regionPactTasks = computed(() => {
  const regions = activeRegions.value
  return allTasks
    .filter((t) => t.pactTask && regions.includes(t.area))
    .sort((a, b) => {
      // Incomplete first, then by area, then by tier
      const aDone = completedSet.value.has(a.structId) ? 1 : 0
      const bDone = completedSet.value.has(b.structId) ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      if (a.area !== b.area) return a.area.localeCompare(b.area)
      return a.tier - b.tier
    })
})

const expanded = ref(false)
</script>

<template>
  <div class="rounded-xl bg-gray-800 p-5">
    <!-- Header -->
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

    <!-- Progress bar -->
    <div class="mb-4">
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

    <!-- Expand toggle -->
    <button
      class="flex w-full items-center justify-between text-xs text-gray-500 hover:text-gray-300 transition-colors"
      @click="expanded = !expanded"
    >
      <span>{{ regionPactTasks.length }} pact tasks in your regions</span>
      <svg
        class="h-4 w-4 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Task table -->
    <div v-if="expanded" class="mt-3 overflow-hidden rounded-lg border border-gray-700">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-700 bg-gray-900 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th class="px-3 py-2 w-6"></th>
            <th class="px-3 py-2">Task</th>
            <th class="px-3 py-2 hidden sm:table-cell">Area</th>
            <th class="px-3 py-2">Tier</th>
            <th class="px-3 py-2 w-16 text-center">TODO</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700/50">
          <tr
            v-for="task in regionPactTasks"
            :key="task.structId"
            class="transition-colors"
            :class="completedSet.has(task.structId) ? 'bg-gray-900/40 text-gray-600' : 'bg-gray-900'"
          >
            <td class="px-3 py-2.5 text-center">
              <span v-if="completedSet.has(task.structId)" class="text-violet-400">✓</span>
              <span v-else class="text-gray-700">·</span>
            </td>
            <td class="px-3 py-2.5">
              <span :class="completedSet.has(task.structId) ? 'line-through text-gray-600' : 'text-gray-200'">
                {{ task.name }}
              </span>
            </td>
            <td class="px-3 py-2.5 hidden sm:table-cell text-gray-500">{{ task.area }}</td>
            <td class="px-3 py-2.5">
              <TierBadge :tier="task.tierName as TierName" />
            </td>
            <td class="px-3 py-2.5 text-center">
              <button
                v-if="!todoSet.has(task.structId)"
                class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-400 hover:bg-blue-600 hover:text-white"
                @click="addToTodo(characterId, task.structId)"
              >
                + Add
              </button>
              <button
                v-else
                class="rounded bg-blue-900/50 px-2 py-1 text-xs text-blue-300 hover:bg-red-900/40 hover:text-red-400"
                @click="removeFromTodo(characterId, task.structId)"
              >
                ✓ Added
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
