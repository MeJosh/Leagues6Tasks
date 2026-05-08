<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacters } from '@/composables/useCharacters'
import { useTasks } from '@/composables/useTasks'
import TierBadge from '@/components/TierBadge.vue'
import type { TierName } from '@/types'

const route = useRoute()
const router = useRouter()
const characterId = route.params.id as string
const { getCharacter, removeFromTodo, removeCompletedFromTodo, reorderTodo, markCompleted } = useCharacters()
const { allTasks } = useTasks()

const character = computed(() => getCharacter(characterId))

const taskMap = new Map(allTasks.map((t) => [t.structId, t]))

const todoTasks = computed(() => {
  return (character.value?.todoTaskIds ?? [])
    .map((id) => taskMap.get(id))
    .filter(Boolean) as (typeof allTasks)[0][]
})

const plannedPoints = computed(() => {
  const completedSet = new Set(character.value?.completedTaskIds ?? [])
  return todoTasks.value
    .filter((t) => !completedSet.has(t.structId))
    .reduce((sum, t) => sum + t.points, 0)
})

function moveUp(index: number) {
  if (index === 0 || !character.value) return
  const order = [...character.value.todoTaskIds]
  ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
  reorderTodo(characterId, order)
}

function moveDown(index: number) {
  if (!character.value) return
  const order = [...character.value.todoTaskIds]
  if (index >= order.length - 1) return
  ;[order[index], order[index + 1]] = [order[index + 1], order[index]]
  reorderTodo(characterId, order)
}
</script>

<template>
  <div v-if="!character" class="py-20 text-center text-gray-500">
    Character not found.
    <RouterLink to="/" class="ml-2 text-blue-400 underline">Go back</RouterLink>
  </div>

  <div v-else class="mx-auto max-w-3xl px-4 py-8">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <button class="text-gray-500 hover:text-gray-300" @click="router.push(`/character/${characterId}`)">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
        </svg>
      </button>
      <div class="flex-1">
        <h1 class="text-xl font-bold text-white">TODO List — {{ character.name }}</h1>
        <p class="text-sm text-gray-400">
          {{ todoTasks.length }} task{{ todoTasks.length !== 1 ? 's' : '' }} planned ·
          <span class="text-blue-400">{{ plannedPoints.toLocaleString() }} pts remaining</span>
        </p>
      </div>
      <button
        v-if="todoTasks.some(t => character?.completedTaskIds.includes(t.structId))"
        class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300"
        @click="removeCompletedFromTodo(characterId)"
      >
        Remove completed
      </button>
      <RouterLink
        :to="`/character/${characterId}/tasks`"
        class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        + Add Tasks
      </RouterLink>
    </div>

    <!-- Empty state -->
    <div v-if="todoTasks.length === 0" class="rounded-xl border border-dashed border-gray-700 py-16 text-center">
      <p class="text-gray-500">No tasks in your TODO list yet.</p>
      <RouterLink
        :to="`/character/${characterId}/tasks`"
        class="mt-3 inline-block text-sm text-blue-400 hover:underline"
      >
        Browse all tasks to add some →
      </RouterLink>
    </div>

    <!-- Task list -->
    <div v-else class="space-y-2">
      <div
        v-for="(task, index) in todoTasks"
        :key="task.structId"
        class="flex items-center gap-3 rounded-xl bg-gray-800 px-4 py-3 transition"
        :class="{ 'opacity-60': character.completedTaskIds.includes(task.structId) }"
      >
        <!-- Reorder buttons -->
        <div class="flex flex-col gap-0.5">
          <button
            class="rounded p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20"
            :disabled="index === 0"
            @click="moveUp(index)"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 01-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            class="rounded p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20"
            :disabled="index === todoTasks.length - 1"
            @click="moveDown(index)"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Completion checkbox -->
        <input
          type="checkbox"
          class="h-4 w-4 flex-shrink-0 rounded border-gray-600 bg-gray-700 text-blue-500 cursor-pointer"
          :checked="character.completedTaskIds.includes(task.structId)"
          @change="markCompleted(characterId, task.structId, ($event.target as HTMLInputElement).checked)"
        />

        <!-- Task info -->
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-200 truncate">{{ task.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ task.description }}</p>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="hidden sm:block text-xs text-gray-500">{{ task.area }}</span>
          <TierBadge :tier="task.tierName as TierName" />
          <span class="text-sm font-medium text-gray-400">{{ task.points }}</span>
          <button
            class="rounded p-1 text-gray-600 hover:text-red-400"
            title="Remove from TODO"
            @click="removeFromTodo(characterId, task.structId)"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
