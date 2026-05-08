<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacters } from '@/composables/useCharacters'
import { useFilteredTasks, useCharacterStats } from '@/composables/useTasks'
import type { TaskFilters } from '@/composables/useTasks'
import TaskFiltersBar from '@/components/TaskFilters.vue'
import TierBadge from '@/components/TierBadge.vue'
import type { TierName } from '@/types'

const route = useRoute()
const router = useRouter()
const characterId = route.params.id as string
const { getCharacter, markCompleted, addToTodo, removeFromTodo } = useCharacters()
const character = computed(() => getCharacter(characterId))

function filtersFromQuery(): TaskFilters {
  const q = route.query
  const tierRaw = q.tier ? Number(q.tier) : null
  return {
    area: typeof q.area === 'string' ? q.area : 'unlocked',
    tier: tierRaw !== null && !isNaN(tierRaw) ? tierRaw : null,
    status: (['all', 'completed', 'incomplete', 'todo'] as const).find((s) => s === q.status) ?? 'incomplete',
    search: typeof q.search === 'string' ? q.search : '',
  }
}

const filters = reactive<TaskFilters>(filtersFromQuery())

watch(
  () => ({ ...filters }),
  (f) => {
    const query: Record<string, string> = {}
    if (f.area && f.area !== 'unlocked') query.area = f.area
    if (f.tier !== null) query.tier = String(f.tier)
    if (f.status !== 'incomplete') query.status = f.status
    if (f.search) query.search = f.search
    router.replace({ query })
  },
)

const { filteredTasks } = useFilteredTasks(
  () => character.value?.completedTaskIds ?? [],
  () => character.value?.todoTaskIds ?? [],
  () => filters,
  () => character.value?.chosenRegions ?? [],
)

const { earnedPoints, plannedPoints } = useCharacterStats(
  () => character.value?.completedTaskIds ?? [],
  () => character.value?.todoTaskIds ?? [],
)

// Sorting
type SortKey = 'name' | 'area' | 'tier'
const sortKey = ref<SortKey>('tier')
const sortAsc = ref(true)

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = key === 'name' || key === 'area'
  }
  page.value = 1
}

const sortedTasks = computed(() => {
  const dir = sortAsc.value ? 1 : -1
  return [...filteredTasks.value].sort((a, b) => {
    switch (sortKey.value) {
      case 'name':    return dir * a.name.localeCompare(b.name)
      case 'area':    return dir * a.area.localeCompare(b.area) || a.tier - b.tier
      case 'tier':    return dir * (a.tier - b.tier) || a.name.localeCompare(b.name)
    }
  })
})

// Pagination
const PAGE_SIZE = 50
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(sortedTasks.value.length / PAGE_SIZE)))
const pagedTasks = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return sortedTasks.value.slice(start, start + PAGE_SIZE)
})

// Reset to page 1 when filters change
function resetPage() { page.value = 1 }
</script>

<template>
  <div v-if="!character" class="py-20 text-center text-gray-500">
    Character not found.
    <RouterLink to="/" class="ml-2 text-blue-400 underline">Go back</RouterLink>
  </div>

  <div v-else class="mx-auto max-w-5xl px-4 py-8">
    <!-- Header -->
    <div class="mb-4 flex items-center gap-3">
      <button class="text-gray-500 hover:text-gray-300" @click="router.push(`/character/${characterId}`)">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
        </svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-white">All Tasks — {{ character.name }}</h1>
        <p class="text-sm text-gray-400">
          <span class="text-yellow-400">{{ earnedPoints.toLocaleString() }} pts earned</span>
          <span class="mx-2 text-gray-600">·</span>
          <span class="text-blue-400">{{ plannedPoints.toLocaleString() }} planned</span>
        </p>
      </div>
    </div>

    <!-- Filters -->
    <TaskFiltersBar v-model="filters" class="mb-4" @update:model-value="resetPage" />

    <!-- Result count -->
    <p class="mb-3 text-sm text-gray-500">
      {{ filteredTasks.length }} task{{ filteredTasks.length !== 1 ? 's' : '' }}
      <span v-if="filteredTasks.length !== 1592"> (filtered from 1592)</span>
    </p>

    <!-- Task table -->
    <div class="overflow-hidden rounded-xl border border-gray-700">
      <table class="w-full text-sm">
        <thead class="bg-gray-800 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
          <tr>
            <th class="px-4 py-3 w-8">Done</th>
            <th class="px-4 py-3 cursor-pointer select-none hover:text-gray-200" @click="toggleSort('name')">
              <span class="flex items-center gap-1">
                Task
                <span class="text-gray-600" :class="{ 'text-blue-400': sortKey === 'name' }">
                  {{ sortKey === 'name' ? (sortAsc ? '↑' : '↓') : '↕' }}
                </span>
              </span>
            </th>
            <th class="px-4 py-3 hidden sm:table-cell cursor-pointer select-none hover:text-gray-200" @click="toggleSort('area')">
              <span class="flex items-center gap-1">
                Area
                <span class="text-gray-600" :class="{ 'text-blue-400': sortKey === 'area' }">
                  {{ sortKey === 'area' ? (sortAsc ? '↑' : '↓') : '↕' }}
                </span>
              </span>
            </th>
            <th class="px-4 py-3 cursor-pointer select-none hover:text-gray-200" @click="toggleSort('tier')">
              <span class="flex items-center gap-1">
                Tier
                <span class="text-gray-600" :class="{ 'text-blue-400': sortKey === 'tier' }">
                  {{ sortKey === 'tier' ? (sortAsc ? '↑' : '↓') : '↓' }}
                </span>
              </span>
            </th>
            <th class="px-4 py-3 w-16 text-center">TODO</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700/50">
          <tr
            v-for="task in pagedTasks"
            :key="task.structId"
            class="bg-gray-900 hover:bg-gray-800/60 transition-colors"
            :class="{ 'opacity-50': character.completedTaskIds.includes(task.structId) }"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 cursor-pointer"
                :checked="character.completedTaskIds.includes(task.structId)"
                @change="markCompleted(characterId, task.structId, ($event.target as HTMLInputElement).checked)"
              />
            </td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-200">{{ task.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ task.description }}</p>
              <p v-if="task.wikiNotes" class="text-xs text-gray-600 mt-0.5 italic">{{ task.wikiNotes }}</p>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-gray-400">{{ task.area }}</td>
            <td class="px-4 py-3">
              <TierBadge :tier="task.tierName as TierName" />
            </td>
            <td class="px-4 py-3 text-center">
              <button
                v-if="!character.todoTaskIds.includes(task.structId)"
                class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-400 hover:bg-blue-600 hover:text-white"
                title="Add to TODO"
                @click="addToTodo(characterId, task.structId)"
              >
                + Add
              </button>
              <button
                v-else
                class="rounded bg-blue-900/50 px-2 py-1 text-xs text-blue-300 hover:bg-red-900/40 hover:text-red-400"
                title="Remove from TODO"
                @click="removeFromTodo(characterId, task.structId)"
              >
                ✓ Added
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-3">
      <button
        class="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700 disabled:opacity-40"
        :disabled="page === 1"
        @click="page--"
      >
        ← Prev
      </button>
      <span class="text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
      <button
        class="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-700 disabled:opacity-40"
        :disabled="page === totalPages"
        @click="page++"
      >
        Next →
      </button>
    </div>
  </div>
</template>
