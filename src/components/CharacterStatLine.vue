<script setup lang="ts">
import { computed } from 'vue'
import { useCharacters } from '@/composables/useCharacters'
import { useCharacterStats } from '@/composables/useTasks'

const props = defineProps<{ characterId: string }>()
const { getCharacter } = useCharacters()
const char = computed(() => getCharacter(props.characterId))
const { earnedPoints, plannedPoints, pactPoints } = useCharacterStats(
  () => char.value?.completedTaskIds ?? [],
  () => char.value?.todoTaskIds ?? [],
)
</script>

<template>
  <p class="mt-0.5 text-sm text-gray-400">
    <span class="text-yellow-400">{{ earnedPoints.toLocaleString() }} pts earned</span>
    <span class="mx-1.5 text-gray-600">·</span>
    <span class="text-blue-400">{{ plannedPoints.toLocaleString() }} planned</span>
    <span class="mx-1.5 text-gray-600">·</span>
    <span>{{ char?.completedTaskIds?.length ?? 0 }} tasks done</span>
    <span class="mx-1.5 text-gray-600">·</span>
    <span class="text-violet-400">{{ pactPoints }}/40 pacts</span>
  </p>
</template>
