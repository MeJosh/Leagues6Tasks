import type { RuneLiteImport, StructIdEntry } from '@/types'
import structIdMap from '@/assets/tasks/LEAGUE_6.structid-map.json'

const structToTaskId: Map<number, number> = new Map(
  (structIdMap as StructIdEntry[]).map((e) => [e.structId, e.taskId]),
)

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
    const taskId = structToTaskId.get(entry.structId)
    if (taskId === undefined) {
      skippedCount++
      continue
    }
    completedTaskIds.push(taskId)
  }

  return {
    completedTaskIds,
    skippedCount,
    totalInImport: Object.values(parsed.tasks).filter((e) => e.completed > 0).length,
  }
}
