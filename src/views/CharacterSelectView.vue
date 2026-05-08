<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacters } from '@/composables/useCharacters'
import CharacterStatLine from '@/components/CharacterStatLine.vue'
import RegionChips from '@/components/RegionChips.vue'

const router = useRouter()
const { characters, createCharacter, deleteCharacter } = useCharacters()

const showCreate = ref(false)
const newName = ref('')
const createError = ref('')

function startCreate() {
  newName.value = ''
  createError.value = ''
  showCreate.value = true
}

function submitCreate() {
  const name = newName.value.trim()
  if (!name) {
    createError.value = 'Name cannot be empty.'
    return
  }
  const char = createCharacter(name)
  showCreate.value = false
  router.push(`/character/${char.id}`)
}

function confirmDelete(id: string, name: string) {
  if (confirm(`Delete "${name}"? This cannot be undone.`)) {
    deleteCharacter(id)
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold text-white">Leagues VI: Demonic Pacts</h1>
      <p class="mt-2 text-gray-400">Select a character to manage your task TODO list</p>
    </div>

    <div v-if="characters.length > 0" class="mb-6 space-y-3">
      <div
        v-for="char in characters"
        :key="char.id"
        class="group flex items-center justify-between rounded-xl bg-gray-800 px-5 py-4 transition hover:bg-gray-700 cursor-pointer"
        @click="router.push(`/character/${char.id}`)"
      >
        <div>
          <p class="font-semibold text-white">{{ char.name }}</p>
          <CharacterStatLine :character-id="char.id" />
          <RegionChips :chosen-regions="char.chosenRegions" />
        </div>
        <div class="flex items-center gap-3">
          <svg class="h-5 w-5 text-gray-400 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
          <button
            class="rounded p-1 text-gray-500 hover:bg-red-900/40 hover:text-red-400"
            title="Delete character"
            @click.stop="confirmDelete(char.id, char.name)"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="mb-6 rounded-xl border border-gray-700 py-10 text-center text-gray-500">
      No characters yet. Create one to get started.
    </div>

    <div v-if="!showCreate">
      <button
        class="w-full rounded-xl border-2 border-dashed border-gray-600 py-4 text-gray-400 transition hover:border-blue-500 hover:text-blue-400"
        @click="startCreate"
      >
        + New Character
      </button>
    </div>

    <div v-else class="rounded-xl bg-gray-800 p-5">
      <h2 class="mb-3 text-lg font-semibold text-white">New Character</h2>
      <input
        v-model="newName"
        type="text"
        placeholder="Character name"
        class="w-full rounded-lg bg-gray-700 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autofocus
        @keydown.enter="submitCreate"
        @keydown.escape="showCreate = false"
      />
      <p v-if="createError" class="mt-1 text-sm text-red-400">{{ createError }}</p>
      <div class="mt-3 flex gap-3">
        <button
          class="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500"
          @click="submitCreate"
        >
          Create
        </button>
        <button
          class="rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
          @click="showCreate = false"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
