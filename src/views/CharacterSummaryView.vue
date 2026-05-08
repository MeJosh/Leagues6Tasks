<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCharacters } from '@/composables/useCharacters'
import { useCharacterStats } from '@/composables/useTasks'
import PointsSummary from '@/components/PointsSummary.vue'
import ImportModal from '@/components/ImportModal.vue'
import CupProgress from '@/components/CupProgress.vue'
import RegionMap from '@/components/RegionMap.vue'
import PactProgress from '@/components/PactProgress.vue'
import TodoQuickAccess from '@/components/TodoQuickAccess.vue'

const route = useRoute()
const { getCharacter, setCompletedTasks, setChosenRegions } = useCharacters()

const characterId = route.params.id as string
const character = computed(() => getCharacter(characterId))

const { earnedPoints, plannedPoints, completedByTier, completedByArea, pactPoints } = useCharacterStats(
  () => character.value?.completedTaskIds ?? [],
  () => character.value?.todoTaskIds ?? [],
)

const showImport = ref(false)

function onImport(taskIds: number[]) {
  setCompletedTasks(characterId, taskIds)
  showImport.value = false
}

const tierOrder = ['Easy', 'Medium', 'Hard', 'Elite', 'Master']
</script>

<template>
  <div v-if="!character" class="py-20 text-center text-gray-500">
    Character not found.
    <RouterLink to="/" class="ml-2 text-blue-400 underline">Go back</RouterLink>
  </div>

  <div v-else class="mx-auto max-w-3xl px-4 py-10">
    <!-- Header -->
    <div class="mb-2 flex items-center gap-3">
      <RouterLink to="/" class="text-gray-500 hover:text-gray-300">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
        </svg>
      </RouterLink>
      <h1 class="text-2xl font-bold text-white">{{ character.name }}</h1>
    </div>
    <p class="mb-6 text-sm text-gray-500">
      {{ character.completedTaskIds.length }} tasks completed ·
      {{ character.todoTaskIds.length }} in TODO
    </p>

    <!-- Points -->
    <PointsSummary :earned="earnedPoints" :planned="plannedPoints" class="mb-4" />

    <!-- Actions -->
    <div class="mb-6 flex flex-wrap gap-3">
      <RouterLink
        :to="`/character/${characterId}/tasks`"
        class="flex-1 rounded-lg bg-blue-600 py-3 text-center text-sm font-medium text-white hover:bg-blue-500"
      >
        View All Tasks
      </RouterLink>
      <RouterLink
        :to="`/character/${characterId}/todo`"
        class="flex-1 rounded-lg bg-gray-700 py-3 text-center text-sm font-medium text-gray-200 hover:bg-gray-600"
      >
        View TODO List ({{ character.todoTaskIds.length }})
      </RouterLink>
      <button
        class="rounded-lg bg-gray-700 px-5 py-3 text-sm font-medium text-gray-200 hover:bg-gray-600"
        @click="showImport = true"
      >
        Import Progress
      </button>
    </div>

    <!-- Cup tier progress -->
    <CupProgress :points="earnedPoints" class="mb-6" />

    <!-- Region map -->
    <RegionMap
      :completed-ids="character.completedTaskIds"
      :chosen-regions="character.chosenRegions"
      class="mb-6"
      @update:chosen-regions="setChosenRegions(characterId, $event)"
    />

    <!-- Pact tasks -->
    <PactProgress
      :pact-points="pactPoints"
      :completed-ids="character.completedTaskIds"
      :chosen-regions="character.chosenRegions"
      :character-id="characterId"
      class="mb-6"
    />

    <!-- TODO quick access -->
    <TodoQuickAccess :character-id="characterId" class="mb-8" />

    <!-- Progress by tier -->
    <div class="mb-8">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">By Tier</h2>
      <div class="space-y-2">
        <div v-for="tier in tierOrder" :key="tier">
          <div v-if="completedByTier[tier]" class="flex items-center gap-3">
            <span class="w-14 text-sm text-gray-400">{{ tier }}</span>
            <div class="flex-1">
              <div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  class="h-full rounded-full bg-blue-500 transition-all"
                  :style="{ width: `${(completedByTier[tier].completed / completedByTier[tier].total) * 100}%` }"
                />
              </div>
            </div>
            <span class="w-16 text-right text-sm text-gray-400">
              {{ completedByTier[tier].completed }}/{{ completedByTier[tier].total }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress by area -->
    <div class="mb-8">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">By Area</h2>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div
          v-for="(stats, area) in completedByArea"
          :key="area"
          class="rounded-lg bg-gray-800 px-4 py-2"
        >
          <div class="flex justify-between text-sm">
            <span class="text-gray-300">{{ area }}</span>
            <span class="text-gray-500">{{ stats.completed }}/{{ stats.total }}</span>
          </div>
          <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              class="h-full rounded-full bg-green-500"
              :style="{ width: `${(stats.completed / stats.total) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>

  </div>

  <ImportModal v-if="showImport" @confirm="onImport" @close="showImport = false" />
</template>
