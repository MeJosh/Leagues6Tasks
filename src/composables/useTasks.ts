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

export function useFilteredTasks(
  completedIds: () => number[],
  todoIds: () => number[],
  filters: () => TaskFilters,
) {
  const filteredTasks = computed(() => {
    const completedSet = new Set(completedIds())
    const todoSet = new Set(todoIds())
    const { area, tier, status, search } = filters()
    const q = search.trim().toLowerCase()

    return allTasks.filter((task) => {
      if (area && task.area !== area) return false
      if (tier !== null && task.tier !== tier) return false
      if (status === 'completed' && !completedSet.has(task.taskId)) return false
      if (status === 'incomplete' && completedSet.has(task.taskId)) return false
      if (status === 'todo' && !todoSet.has(task.taskId)) return false
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
      .filter((t) => completedSet.has(t.taskId))
      .reduce((sum, t) => sum + t.points, 0)
  })

  const plannedPoints = computed(() => {
    const todoSet = new Set(todoIds())
    const completedSet = new Set(completedIds())
    return allTasks
      .filter((t) => todoSet.has(t.taskId) && !completedSet.has(t.taskId))
      .reduce((sum, t) => sum + t.points, 0)
  })

  const completedCount = computed(() => completedIds().length)

  const completedByTier = computed(() => {
    const completedSet = new Set(completedIds())
    const result: Record<string, { completed: number; total: number }> = {}
    for (const task of allTasks) {
      if (!result[task.tierName]) result[task.tierName] = { completed: 0, total: 0 }
      result[task.tierName].total++
      if (completedSet.has(task.taskId)) result[task.tierName].completed++
    }
    return result
  })

  const completedByArea = computed(() => {
    const completedSet = new Set(completedIds())
    const result: Record<string, { completed: number; total: number }> = {}
    for (const task of allTasks) {
      if (!result[task.area]) result[task.area] = { completed: 0, total: 0 }
      result[task.area].total++
      if (completedSet.has(task.taskId)) result[task.area].completed++
    }
    return result
  })

  const pactPoints = computed(() => {
    const completedSet = new Set(completedIds())
    const count = allTasks.filter((t) => t.pactTask && completedSet.has(t.taskId)).length
    return Math.min(40, count)
  })

  return { earnedPoints, plannedPoints, completedCount, completedByTier, completedByArea, pactPoints }
}
