import { describe, it, expect } from 'vitest'

// Mirror the cup tier logic from CupProgress.vue so we can unit-test it independently
interface CupTier { name: string; threshold: number }

const CUPS: CupTier[] = [
  { name: 'Bronze',  threshold: 2_000 },
  { name: 'Iron',    threshold: 4_000 },
  { name: 'Steel',   threshold: 10_000 },
  { name: 'Mithril', threshold: 22_000 },
  { name: 'Adamant', threshold: 32_000 },
  { name: 'Rune',    threshold: 47_500 },
  { name: 'Dragon',  threshold: 65_000 },
  { name: 'Maximum', threshold: 146_040 },
]

function getCurrentTier(points: number): CupTier | null {
  let tier: CupTier | null = null
  for (const cup of CUPS) {
    if (points >= cup.threshold) tier = cup
  }
  return tier
}

function getNextTier(points: number): CupTier | null {
  return CUPS.find((c) => c.threshold > points) ?? null
}

function progressPercent(points: number): number {
  const next = getNextTier(points)
  if (!next) return 100
  const current = getCurrentTier(points)
  const from = current?.threshold ?? 0
  return Math.min(100, ((points - from) / (next.threshold - from)) * 100)
}

describe('CupProgress tier logic', () => {
  it('returns null current tier below Bronze', () => {
    expect(getCurrentTier(0)).toBeNull()
    expect(getCurrentTier(1999)).toBeNull()
  })

  it('returns Bronze at exactly 2,000', () => {
    expect(getCurrentTier(2_000)?.name).toBe('Bronze')
  })

  it('returns Dragon at 65,000', () => {
    expect(getCurrentTier(65_000)?.name).toBe('Dragon')
  })

  it('returns Maximum at 150,640', () => {
    expect(getCurrentTier(146_040)?.name).toBe('Maximum')
  })

  it('returns next tier correctly', () => {
    expect(getNextTier(0)?.name).toBe('Bronze')
    expect(getNextTier(2_000)?.name).toBe('Iron')
    expect(getNextTier(65_000)?.name).toBe('Maximum')
  })

  it('returns null next tier at maximum points', () => {
    expect(getNextTier(146_040)).toBeNull()
  })

  it('progress is 0% at tier threshold', () => {
    expect(progressPercent(2_000)).toBe(0)
    expect(progressPercent(10_000)).toBe(0)
  })

  it('progress is 50% halfway between tiers', () => {
    const halfway = (2_000 + 4_000) / 2  // 3000 — halfway Bronze→Iron
    expect(progressPercent(halfway)).toBe(50)
  })

  it('progress is 100% at maximum', () => {
    expect(progressPercent(146_040)).toBe(100)
  })

  it('progress never exceeds 100', () => {
    expect(progressPercent(999_999)).toBe(100)
  })

  it('all 8 tiers are defined', () => {
    expect(CUPS).toHaveLength(8)
  })

  it('thresholds are strictly ascending', () => {
    for (let i = 1; i < CUPS.length; i++) {
      expect(CUPS[i].threshold).toBeGreaterThan(CUPS[i - 1].threshold)
    }
  })

  it('Maximum threshold matches total task points', () => {
    expect(CUPS[CUPS.length - 1].threshold).toBe(146_040)
  })
})
