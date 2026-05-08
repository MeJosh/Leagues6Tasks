<script setup lang="ts">
import { computed } from 'vue'
import { useCharacters } from '@/composables/useCharacters'
import { useTasks } from '@/composables/useTasks'
import TierBadge from '@/components/TierBadge.vue'
import type { TierName } from '@/types'

const props = defineProps<{ characterId: string }>()

const { getCharacter, markCompleted, removeCompletedFromTodo } = useCharacters()
const { allTasks } = useTasks()

const character = computed(() => getCharacter(props.characterId))

const taskMap = new Map(allTasks.map((t) => [t.taskId, t]))

const completedSet = computed(() => new Set(character.value?.completedTaskIds ?? []))

const nextTasks = computed(() =>
  (character.value?.todoTaskIds ?? [])
    .slice(0, 5)
    .map((id) => taskMap.get(id))
    .filter(Boolean) as typeof allTasks,
)

const hasCompleted = computed(() =>
  nextTasks.value.some((t) => completedSet.value.has(t.taskId)),
)
</script>

<template>
  <div class="rounded-xl bg-gray-800 p-5">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">TODO</p>
        <p class="mt-0.5 text-2xl font-bold text-white">
          {{ character?.todoTaskIds.length ?? 0 }}
          <span class="text-gray-600 text-lg font-normal">tasks</span>
        </p>
      </div>
      <RouterLink
        :to="`/character/${characterId}/todo`"
        class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        View full list →
      </RouterLink>
    </div>

    <div v-if="nextTasks.length === 0" class="py-6 text-center text-sm text-gray-600">
      No tasks in TODO yet.
    </div>

    <div v-else class="divide-y divide-gray-700/50">
      <div
        v-for="task in nextTasks"
        :key="task.taskId"
        class="flex items-center gap-3 py-2.5 transition-colors"
        :class="completedSet.has(task.taskId) ? 'opacity-50' : ''"
      >
        <input
          type="checkbox"
          class="h-4 w-4 flex-shrink-0 rounded border-gray-600 bg-gray-700 text-blue-500 cursor-pointer"
          :checked="completedSet.has(task.taskId)"
          @change="markCompleted(characterId, task.taskId, ($event.target as HTMLInputElement).checked)"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm" :class="completedSet.has(task.taskId) ? 'line-through text-gray-500' : 'text-gray-200'">
            {{ task.name }}
          </p>
          <p class="truncate text-xs text-gray-500">{{ task.area }}</p>
        </div>
        <TierBadge :tier="task.tierName as TierName" />
        <span class="flex-shrink-0 text-sm text-gray-500">{{ task.points }}</span>
      </div>
    </div>

    <button
      v-if="hasCompleted"
      class="mt-4 w-full rounded-lg bg-gray-700 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
      @click="removeCompletedFromTodo(characterId)"
    >
      Remove completed
    </button>
  </div>
</template>
