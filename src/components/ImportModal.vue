<script setup lang="ts">
import { ref } from 'vue'
import { parseRuneLiteImport } from '@/utils/importParser'

const emit = defineEmits<{
  confirm: [taskIds: number[]]
  close: []
}>()

const json = ref('')
const error = ref('')
const preview = ref<{ count: number; skipped: number } | null>(null)

function validate() {
  error.value = ''
  preview.value = null
  if (!json.value.trim()) return
  try {
    const result = parseRuneLiteImport(json.value)
    preview.value = { count: result.completedTaskIds.length, skipped: result.skippedCount }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

function confirm() {
  if (!json.value.trim()) return
  try {
    const result = parseRuneLiteImport(json.value)
    emit('confirm', result.completedTaskIds)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-lg rounded-xl bg-gray-900 p-6 shadow-2xl">
      <h2 class="mb-4 text-xl font-bold text-white">Import Progress from RuneLite</h2>
      <p class="mb-3 text-sm text-gray-400">
        Open RuneLite → Leagues plugin → export your task data → paste the JSON below.
      </p>
      <textarea
        v-model="json"
        class="w-full rounded-lg bg-gray-800 p-3 font-mono text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="10"
        placeholder='{ "tasks": { ... } }'
        @input="validate"
      />
      <p v-if="error" class="mt-2 text-sm text-red-400">{{ error }}</p>
      <div v-if="preview" class="mt-2 text-sm text-green-400">
        Found {{ preview.count }} completed tasks
        <span v-if="preview.skipped > 0" class="text-gray-500">
          ({{ preview.skipped }} unrecognised skipped)
        </span>
      </div>
      <div class="mt-4 flex justify-end gap-3">
        <button
          class="rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          :disabled="!preview || !!error"
          @click="confirm"
        >
          Import
        </button>
      </div>
    </div>
  </div>
</template>
