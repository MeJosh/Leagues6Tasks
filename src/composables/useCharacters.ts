import { ref } from 'vue'
import type { Character } from '@/types'

export const STORAGE_KEY = 'leagues6-characters'

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function generateId(): string {
  return crypto.randomUUID()
}

export function createCharacterStore(storage: Storage = localStorage) {
  const initial = (() => {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return []
      // Normalize: backfill chosenRegions for characters saved before this field existed
      const parsed = JSON.parse(raw) as Character[]
      return parsed.map((c) => ({ ...c, chosenRegions: c.chosenRegions ?? [] }))
    } catch {
      return []
    }
  })()

  const characters = ref<Character[]>(initial)

  function persist() {
    storage.setItem(STORAGE_KEY, JSON.stringify(characters.value))
  }

  function createCharacter(name: string): Character {
    const character: Character = {
      id: generateId(),
      name: name.trim(),
      completedTaskIds: [],
      todoTaskIds: [],
      chosenRegions: [],
      createdAt: new Date().toISOString(),
    }
    characters.value = [...characters.value, character]
    persist()
    return character
  }

  function getCharacter(id: string): Character | undefined {
    return characters.value.find((c) => c.id === id)
  }

  function updateCharacter(id: string, updates: Partial<Omit<Character, 'id' | 'createdAt'>>) {
    characters.value = characters.value.map((c) =>
      c.id === id ? { ...c, ...updates } : c,
    )
    persist()
  }

  function deleteCharacter(id: string) {
    characters.value = characters.value.filter((c) => c.id !== id)
    persist()
  }

  function setCompletedTasks(characterId: string, taskIds: number[]) {
    updateCharacter(characterId, { completedTaskIds: taskIds })
  }

  function setChosenRegions(characterId: string, regions: string[]) {
    updateCharacter(characterId, { chosenRegions: regions })
  }

  function addToTodo(characterId: string, taskId: number) {
    const character = getCharacter(characterId)
    if (!character) return
    if (character.todoTaskIds.includes(taskId)) return
    updateCharacter(characterId, { todoTaskIds: [...character.todoTaskIds, taskId] })
  }

  function removeFromTodo(characterId: string, taskId: number) {
    const character = getCharacter(characterId)
    if (!character) return
    updateCharacter(characterId, {
      todoTaskIds: character.todoTaskIds.filter((id) => id !== taskId),
    })
  }

  function reorderTodo(characterId: string, newOrder: number[]) {
    updateCharacter(characterId, { todoTaskIds: newOrder })
  }

  function markCompleted(characterId: string, taskId: number, completed: boolean) {
    const character = getCharacter(characterId)
    if (!character) return
    const ids = new Set(character.completedTaskIds)
    if (completed) {
      ids.add(taskId)
    } else {
      ids.delete(taskId)
    }
    updateCharacter(characterId, { completedTaskIds: [...ids] })
  }

  return {
    characters,
    createCharacter,
    getCharacter,
    updateCharacter,
    deleteCharacter,
    setCompletedTasks,
    setChosenRegions,
    addToTodo,
    removeFromTodo,
    reorderTodo,
    markCompleted,
  }
}

// Singleton for use in the app — initialized lazily on first call
let _store: ReturnType<typeof createCharacterStore> | null = null

export function useCharacters() {
  if (!_store) {
    _store = createCharacterStore(localStorage)
  }
  return _store
}
