import type { RuneLiteImport } from '@/types'
import tasksData from '@/assets/tasks/LEAGUE_6.full.json'

const knownStructIds = new Set(tasksData.map((t) => t.structId))

export interface ImportResult {
  completedTaskIds: number[]
  skippedCount: number
  totalInImport: number
}

export function parseRuneLiteImport(json: string): ImportResult {
  let parsed: RuneLiteImport
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON — could not parse the pasted text.')
  }

  if (!parsed.tasks || typeof parsed.tasks !== 'object') {
    throw new Error('Unrecognised format — expected a "tasks" object.')
  }

  const completedTaskIds: number[] = []
  let skippedCount = 0

  for (const [, entry] of Object.entries(parsed.tasks)) {
    if (!entry.completed || entry.completed <= 0) continue
    if (!knownStructIds.has(entry.structId)) {
      skippedCount++
      continue
    }
    completedTaskIds.push(entry.structId)
  }

  return {
    completedTaskIds,
    skippedCount,
    totalInImport: Object.values(parsed.tasks).filter((e) => e.completed > 0).length,
  }
}
