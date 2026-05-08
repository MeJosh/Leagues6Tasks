import { describe, it, expect } from 'vitest'
import { parseRuneLiteImport } from '@/utils/importParser'

function makeImport(tasks: Record<string, { completed: number; structId: number; tracked: number; ignored: number }>) {
  return JSON.stringify({ displayName: 'TestChar', taskType: 'LEAGUE_6', tasks })
}

const KNOWN_STRUCT_ID = 13805
const UNKNOWN_STRUCT_ID = 99999999

describe('parseRuneLiteImport', () => {
  it('returns completed task IDs for entries with completed timestamp', () => {
    const json = makeImport({
      [KNOWN_STRUCT_ID]: { completed: 1777642415017, structId: KNOWN_STRUCT_ID, tracked: 0, ignored: 0 },
    })
    const result = parseRuneLiteImport(json)
    expect(result.completedTaskIds).toHaveLength(1)
    expect(result.completedTaskIds[0]).toBe(KNOWN_STRUCT_ID)
    expect(result.totalInImport).toBe(1)
    expect(result.skippedCount).toBe(0)
  })

  it('ignores entries with completed = 0', () => {
    const json = makeImport({
      [KNOWN_STRUCT_ID]: { completed: 0, structId: KNOWN_STRUCT_ID, tracked: 0, ignored: 0 },
    })
    const result = parseRuneLiteImport(json)
    expect(result.completedTaskIds).toHaveLength(0)
    expect(result.totalInImport).toBe(0)
  })

  it('increments skippedCount for unknown structIds', () => {
    const json = makeImport({
      [UNKNOWN_STRUCT_ID]: { completed: 123456789, structId: UNKNOWN_STRUCT_ID, tracked: 0, ignored: 0 },
    })
    const result = parseRuneLiteImport(json)
    expect(result.completedTaskIds).toHaveLength(0)
    expect(result.skippedCount).toBe(1)
    expect(result.totalInImport).toBe(1)
  })

  it('handles multiple tasks correctly', () => {
    const json = makeImport({
      [KNOWN_STRUCT_ID]: { completed: 1777642415017, structId: KNOWN_STRUCT_ID, tracked: 0, ignored: 0 },
      [UNKNOWN_STRUCT_ID]: { completed: 123456789, structId: UNKNOWN_STRUCT_ID, tracked: 0, ignored: 0 },
      99998: { completed: 0, structId: 99998, tracked: 0, ignored: 0 },
    })
    const result = parseRuneLiteImport(json)
    expect(result.completedTaskIds).toHaveLength(1)
    expect(result.totalInImport).toBe(2)
    expect(result.skippedCount).toBe(1)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseRuneLiteImport('not json')).toThrow('Invalid JSON')
  })

  it('throws when tasks field is missing', () => {
    expect(() => parseRuneLiteImport(JSON.stringify({ displayName: 'x' }))).toThrow(
      'Unrecognised format',
    )
  })

  it('deduplicates completed task IDs', () => {
    const STRUCT_ID_2 = 13929
    const json = makeImport({
      [KNOWN_STRUCT_ID]: { completed: 111, structId: KNOWN_STRUCT_ID, tracked: 0, ignored: 0 },
      [STRUCT_ID_2]: { completed: 222, structId: STRUCT_ID_2, tracked: 0, ignored: 0 },
    })
    const result = parseRuneLiteImport(json)
    const unique = new Set(result.completedTaskIds)
    expect(unique.size).toBe(result.completedTaskIds.length)
  })
})
