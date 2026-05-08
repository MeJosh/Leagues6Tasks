<script setup lang="ts">
defineProps<{
  earned: number
  planned: number
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div class="rounded-lg bg-gray-800 p-4 text-center">
      <p class="text-2xl font-bold text-yellow-400">{{ earned.toLocaleString() }}</p>
      <p class="mt-1 text-sm text-gray-400">Earned</p>
    </div>
    <div class="rounded-lg bg-gray-800 p-4 text-center">
      <p class="text-2xl font-bold text-blue-400">{{ planned.toLocaleString() }}</p>
      <p class="mt-1 text-sm text-gray-400">Planned</p>
    </div>
    <div class="rounded-lg bg-gray-800 p-4 text-center">
      <p class="text-2xl font-bold text-green-400">{{ (earned + planned).toLocaleString() }}</p>
      <p class="mt-1 text-sm text-gray-400">Total</p>
    </div>
  </div>
</template>
