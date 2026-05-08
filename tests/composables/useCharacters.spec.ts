import { describe, it, expect, beforeEach } from 'vitest'
import { createCharacterStore } from '@/composables/useCharacters'

function makeStore() {
  const mem: Record<string, string> = {}
  const storage = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  return createCharacterStore(storage)
}

let store: ReturnType<typeof makeStore>

beforeEach(() => {
  store = makeStore()
})

describe('useCharacters', () => {
  it('creates a character with a unique id and timestamps', () => {
    const { createCharacter, characters } = store
    const char = createCharacter('TestChar')
    expect(char.name).toBe('TestChar')
    expect(char.id).toBeTruthy()
    expect(char.completedTaskIds).toEqual([])
    expect(char.todoTaskIds).toEqual([])
    expect(characters.value).toHaveLength(1)
  })

  it('trims whitespace from character name', () => {
    const { createCharacter } = store
    const char = createCharacter('  MyChar  ')
    expect(char.name).toBe('MyChar')
  })

  it('getCharacter returns the correct character', () => {
    const { createCharacter, getCharacter } = store
    const char = createCharacter('LookupTest')
    const found = getCharacter(char.id)
    expect(found).toBeDefined()
    expect(found!.id).toBe(char.id)
  })

  it('getCharacter returns undefined for unknown id', () => {
    const { getCharacter } = store
    expect(getCharacter('nonexistent')).toBeUndefined()
  })

  it('deleteCharacter removes the character', () => {
    const { createCharacter, deleteCharacter, getCharacter } = store
    const char = createCharacter('ToDelete')
    deleteCharacter(char.id)
    expect(getCharacter(char.id)).toBeUndefined()
  })

  it('addToTodo appends a task id', () => {
    const { createCharacter, addToTodo, getCharacter } = store
    const char = createCharacter('TodoTest')
    addToTodo(char.id, 42)
    expect(getCharacter(char.id)!.todoTaskIds).toContain(42)
  })

  it('addToTodo does not add duplicates', () => {
    const { createCharacter, addToTodo, getCharacter } = store
    const char = createCharacter('DupTest')
    addToTodo(char.id, 99)
    addToTodo(char.id, 99)
    expect(getCharacter(char.id)!.todoTaskIds.filter((id) => id === 99)).toHaveLength(1)
  })

  it('removeFromTodo removes a task id', () => {
    const { createCharacter, addToTodo, removeFromTodo, getCharacter } = store
    const char = createCharacter('RemoveTest')
    addToTodo(char.id, 7)
    removeFromTodo(char.id, 7)
    expect(getCharacter(char.id)!.todoTaskIds).not.toContain(7)
  })

  it('reorderTodo sets exact order', () => {
    const { createCharacter, addToTodo, reorderTodo, getCharacter } = store
    const char = createCharacter('ReorderTest')
    addToTodo(char.id, 1)
    addToTodo(char.id, 2)
    addToTodo(char.id, 3)
    reorderTodo(char.id, [3, 1, 2])
    expect(getCharacter(char.id)!.todoTaskIds).toEqual([3, 1, 2])
  })

  it('markCompleted adds taskId to completedTaskIds', () => {
    const { createCharacter, markCompleted, getCharacter } = store
    const char = createCharacter('MarkTest')
    markCompleted(char.id, 55, true)
    expect(getCharacter(char.id)!.completedTaskIds).toContain(55)
  })

  it('markCompleted(false) removes taskId from completedTaskIds', () => {
    const { createCharacter, markCompleted, getCharacter } = store
    const char = createCharacter('UnmarkTest')
    markCompleted(char.id, 55, true)
    markCompleted(char.id, 55, false)
    expect(getCharacter(char.id)!.completedTaskIds).not.toContain(55)
  })

  it('setCompletedTasks replaces the full list', () => {
    const { createCharacter, setCompletedTasks, getCharacter } = store
    const char = createCharacter('SetTest')
    setCompletedTasks(char.id, [1, 2, 3])
    expect(getCharacter(char.id)!.completedTaskIds).toEqual([1, 2, 3])
    setCompletedTasks(char.id, [4, 5])
    expect(getCharacter(char.id)!.completedTaskIds).toEqual([4, 5])
  })

  it('persists characters to storage', () => {
    const mem: Record<string, string> = {}
    const storage = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => { mem[k] = v },
    }
    const s1 = createCharacterStore(storage)
    s1.createCharacter('Persistent')

    // Create a new store from the same storage — should restore the character
    const s2 = createCharacterStore(storage)
    expect(s2.characters.value.find((c) => c.name === 'Persistent')).toBeDefined()
  })
})
