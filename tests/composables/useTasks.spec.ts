import { describe, it, expect } from 'vitest'
import { useTasks, useFilteredTasks, useCharacterStats } from '@/composables/useTasks'

describe('useTasks', () => {
  it('returns all 1592 tasks', () => {
    const { allTasks } = useTasks()
    expect(allTasks).toHaveLength(1592)
  })

  it('tasks have required fields', () => {
    const { allTasks } = useTasks()
    const task = allTasks[0]
    expect(task.taskId).toBeTypeOf('number')
    expect(task.name).toBeTypeOf('string')
    expect(task.area).toBeTypeOf('string')
    expect(task.tier).toBeGreaterThanOrEqual(1)
    expect(task.tier).toBeLessThanOrEqual(5)
    expect(task.points).toBeGreaterThan(0)
  })

  it('total points sum to 146040', () => {
    const { allTasks } = useTasks()
    const total = allTasks.reduce((s, t) => s + t.points, 0)
    expect(total).toBe(146040)
  })
})

describe('useFilteredTasks', () => {
  it('returns all tasks when no filters set', () => {
    const { allTasks } = useTasks()
    const { filteredTasks } = useFilteredTasks(
      () => [],
      () => [],
      () => ({ area: '', tier: null, status: 'all', search: '' }),
    )
    expect(filteredTasks.value).toHaveLength(allTasks.length)
  })

  it('filters by area', () => {
    const { filteredTasks } = useFilteredTasks(
      () => [],
      () => [],
      () => ({ area: 'Desert', tier: null, status: 'all', search: '' }),
    )
    expect(filteredTasks.value.length).toBeGreaterThan(0)
    expect(filteredTasks.value.every((t) => t.area === 'Desert')).toBe(true)
  })

  it('filters by tier', () => {
    const { filteredTasks } = useFilteredTasks(
      () => [],
      () => [],
      () => ({ area: '', tier: 1, status: 'all', search: '' }),
    )
    expect(filteredTasks.value.every((t) => t.tier === 1)).toBe(true)
  })

  it('filters completed tasks', () => {
    const { allTasks } = useTasks()
    const completedId = allTasks[0].taskId
    const { filteredTasks } = useFilteredTasks(
      () => [completedId],
      () => [],
      () => ({ area: '', tier: null, status: 'completed', search: '' }),
    )
    expect(filteredTasks.value.every((t) => t.taskId === completedId)).toBe(true)
    expect(filteredTasks.value).toHaveLength(1)
  })

  it('filters incomplete tasks', () => {
    const { allTasks } = useTasks()
    const completedId = allTasks[0].taskId
    const { filteredTasks } = useFilteredTasks(
      () => [completedId],
      () => [],
      () => ({ area: '', tier: null, status: 'incomplete', search: '' }),
    )
    expect(filteredTasks.value.every((t) => t.taskId !== completedId)).toBe(true)
  })

  it('filters by search term', () => {
    const { filteredTasks } = useFilteredTasks(
      () => [],
      () => [],
      () => ({ area: '', tier: null, status: 'all', search: 'prayer' }),
    )
    expect(filteredTasks.value.length).toBeGreaterThan(0)
    expect(
      filteredTasks.value.every(
        (t) =>
          t.name.toLowerCase().includes('prayer') ||
          t.description.toLowerCase().includes('prayer'),
      ),
    ).toBe(true)
  })
})

describe('useCharacterStats', () => {
  it('earnedPoints sums completed task points', () => {
    const { allTasks } = useTasks()
    const task = allTasks.find((t) => t.points === 10)!
    const { earnedPoints } = useCharacterStats(
      () => [task.taskId],
      () => [],
    )
    expect(earnedPoints.value).toBe(10)
  })

  it('plannedPoints sums todo (non-completed) task points', () => {
    const { allTasks } = useTasks()
    const task = allTasks.find((t) => t.points === 10)!
    const { plannedPoints } = useCharacterStats(
      () => [],
      () => [task.taskId],
    )
    expect(plannedPoints.value).toBe(10)
  })

  it('plannedPoints excludes already-completed tasks', () => {
    const { allTasks } = useTasks()
    const task = allTasks.find((t) => t.points === 10)!
    const { plannedPoints } = useCharacterStats(
      () => [task.taskId],
      () => [task.taskId],
    )
    expect(plannedPoints.value).toBe(0)
  })

  it('completedByTier groups correctly', () => {
    const { allTasks } = useTasks()
    const easyTask = allTasks.find((t) => t.tierName === 'Easy')!
    const { completedByTier } = useCharacterStats(
      () => [easyTask.taskId],
      () => [],
    )
    expect(completedByTier.value['Easy'].completed).toBe(1)
    expect(completedByTier.value['Easy'].total).toBeGreaterThan(0)
  })
})
