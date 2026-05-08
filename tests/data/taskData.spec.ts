import { describe, it, expect } from 'vitest'
import csvText from '../fixtures/area-stats.csv?raw'
import allTasks from '@/assets/tasks/LEAGUE_6.full.json'

interface AreaRow {
  area: string
  easy: number
  medium: number
  hard: number
  elite: number
  master: number
  total_tasks: number
  total_points: number
}

const TIER_POINTS: Record<number, number> = { 1: 10, 2: 30, 3: 80, 4: 200, 5: 400 }

function parseAreaCsv(): AreaRow[] {
  const [header, ...rows] = csvText.trim().split('\n')
  const keys = header.split(',')
  return rows.map((row) => {
    const vals = row.split(',')
    const obj: Record<string, string | number> = {}
    keys.forEach((k: string, i: number) => {
      obj[k] = isNaN(Number(vals[i])) ? vals[i] : Number(vals[i])
    })
    return obj as unknown as AreaRow
  })
}

describe('LEAGUE_6 task data vs area-stats fixture', () => {
  const areaRows = parseAreaCsv()

  it('fixture covers all 11 areas', () => {
    expect(areaRows).toHaveLength(11)
  })

  it('grand total tasks = 1592', () => {
    const total = areaRows.reduce((s, r) => s + r.total_tasks, 0)
    expect(total).toBe(1592)
    expect(allTasks).toHaveLength(1592)
  })

  it('grand total points = 146,040', () => {
    const total = areaRows.reduce((s, r) => s + r.total_points, 0)
    expect(total).toBe(146_040)
  })

  it('master tier tasks use 400 points each', () => {
    const masterTasks = allTasks.filter((t) => t.tier === 5)
    masterTasks.forEach((t) => expect(t.points).toBe(400))
  })

  for (const row of parseAreaCsv()) {
    describe(`area: ${row.area}`, () => {
      const tasks = allTasks.filter((t) => t.area === row.area)

      it(`has ${row.total_tasks} tasks`, () => {
        expect(tasks).toHaveLength(row.total_tasks)
      })

      it(`has correct tier breakdown`, () => {
        const counts = { easy: 0, medium: 0, hard: 0, elite: 0, master: 0 }
        for (const t of tasks) {
          if (t.tier === 1) counts.easy++
          else if (t.tier === 2) counts.medium++
          else if (t.tier === 3) counts.hard++
          else if (t.tier === 4) counts.elite++
          else if (t.tier === 5) counts.master++
        }
        expect(counts.easy).toBe(row.easy)
        expect(counts.medium).toBe(row.medium)
        expect(counts.hard).toBe(row.hard)
        expect(counts.elite).toBe(row.elite)
        expect(counts.master).toBe(row.master)
      })

      it(`total points = ${row.total_points}`, () => {
        const pts = tasks.reduce((s, t) => s + (TIER_POINTS[t.tier] ?? 0), 0)
        expect(pts).toBe(row.total_points)
      })
    })
  }
})
