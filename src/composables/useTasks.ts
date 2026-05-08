import { computed } from 'vue'
import type { Task } from '@/types'
import tasksData from '@/assets/tasks/LEAGUE_6.full.json'

const allTasks: Task[] = tasksData as Task[]

export function useTasks() {
  return { allTasks }
}

export interface TaskFilters {
  area: string
  tier: number | null
  status: 'all' | 'completed' | 'incomplete' | 'todo'
  search: string
}

function activeRegions(completedCount: number, chosenRegions: string[]): Set<string> {
  const regions = new Set(['Global', 'Varlamore'])
  if (completedCount >= 80) regions.add('Karamja')
  chosenRegions.forEach((r) => { if (r) regions.add(r) })
  return regions
}

export function useFilteredTasks(
  completedIds: () => number[],
  todoIds: () => number[],
  filters: () => TaskFilters,
  chosenRegions: () => string[] = () => [],
) {
  const filteredTasks = computed(() => {
    const completedSet = new Set(completedIds())
    const todoSet = new Set(todoIds())
    const { area, tier, status, search } = filters()
    const q = search.trim().toLowerCase()

    const unlockedRegions =
      area === 'unlocked'
        ? activeRegions(completedIds().length, chosenRegions())
        : null

    return allTasks.filter((task) => {
      if (unlockedRegions) {
        if (!unlockedRegions.has(task.area)) return false
      } else if (area && task.area !== area) return false
      if (tier !== null && task.tier !== tier) return false
      if (status === 'completed' && !completedSet.has(task.structId)) return false
      if (status === 'incomplete' && completedSet.has(task.structId)) return false
      if (status === 'todo' && !todoSet.has(task.structId)) return false
      if (q && !task.name.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q))
        return false
      return true
    })
  })

  return { filteredTasks }
}

export function useCharacterStats(completedIds: () => number[], todoIds: () => number[]) {
  const earnedPoints = computed(() => {
    const completedSet = new Set(completedIds())
    return allTasks
      .filter((t) => completedSet.has(t.structId))
      .reduce((sum, t) => sum + t.points, 0)
  })

  const plannedPoints = computed(() => {
    const todoSet = new Set(todoIds())
    const completedSet = new Set(completedIds())
    return allTasks
      .filter((t) => todoSet.has(t.structId) && !completedSet.has(t.structId))
      .reduce((sum, t) => sum + t.points, 0)
  })

  const completedCount = computed(() => completedIds().length)

  const completedByTier = computed(() => {
    const completedSet = new Set(completedIds())
    const result: Record<string, { completed: number; total: number }> = {}
    for (const task of allTasks) {
      if (!result[task.tierName]) result[task.tierName] = { completed: 0, total: 0 }
      result[task.tierName].total++
      if (completedSet.has(task.structId)) result[task.tierName].completed++
    }
    return result
  })

  const completedByArea = computed(() => {
    const completedSet = new Set(completedIds())
    const result: Record<string, { completed: number; total: number }> = {}
    for (const task of allTasks) {
      if (!result[task.area]) result[task.area] = { completed: 0, total: 0 }
      result[task.area].total++
      if (completedSet.has(task.structId)) result[task.area].completed++
    }
    return result
  })

  const pactPoints = computed(() => {
    const completedSet = new Set(completedIds())
    const count = allTasks.filter((t) => t.pactTask && completedSet.has(t.structId)).length
    return Math.min(40, count)
  })

  return { earnedPoints, plannedPoints, completedCount, completedByTier, completedByArea, pactPoints }
}
