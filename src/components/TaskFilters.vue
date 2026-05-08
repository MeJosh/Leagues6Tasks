<script setup lang="ts">
import { AREAS } from '@/types'
import type { TaskFilters } from '@/composables/useTasks'

const model = defineModel<TaskFilters>({ required: true })

const tiers = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
  { value: 4, label: 'Elite' },
  { value: 5, label: 'Master' },
]

const statuses = [
  { value: 'all', label: 'All' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'completed', label: 'Completed' },
  { value: 'todo', label: 'In TODO' },
]
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <input
      v-model="model.search"
      type="text"
      placeholder="Search tasks…"
      class="min-w-48 flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <select
      v-model="model.area"
      class="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Areas</option>
      <option v-for="area in AREAS" :key="area" :value="area">{{ area }}</option>
    </select>

    <select
      v-model="model.tier"
      class="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option :value="null">All Tiers</option>
      <option v-for="t in tiers" :key="t.value" :value="t.value">{{ t.label }}</option>
    </select>

    <select
      v-model="model.status"
      class="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>
  </div>
</template>
