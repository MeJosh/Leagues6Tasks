import { computed } from 'vue'

export const CHOOSABLE_REGIONS = [
  'Asgarnia',
  'Desert',
  'Fremennik',
  'Kandarin',
  'Kourend',
  'Morytania',
  'Tirannwn',
  'Wilderness',
] as const

export type ChoosableRegion = (typeof CHOOSABLE_REGIONS)[number]

export const CHOICE_THRESHOLDS = [200, 300, 450] as const

export const REGION_COLORS: Record<string, string> = {
  General: 'bg-gray-600 text-gray-200',
  Varlamore: 'bg-yellow-700 text-yellow-100',
  Karamja: 'bg-green-700 text-green-100',
  Asgarnia: 'bg-blue-700 text-blue-100',
  Desert: 'bg-amber-700 text-amber-100',
  Fremennik: 'bg-cyan-700 text-cyan-100',
  Kandarin: 'bg-indigo-700 text-indigo-100',
  Kourend: 'bg-purple-700 text-purple-100',
  Morytania: 'bg-red-900 text-red-100',
  Tirannwn: 'bg-emerald-700 text-emerald-100',
  Wilderness: 'bg-rose-800 text-rose-100',
}

export interface ChoiceSlot {
  unlockAt: number
  unlocked: boolean
  region: string | null
}

export function useRegions(completedIds: () => number[], chosenRegions: () => string[]) {
  const completedCount = computed(() => completedIds().length)

  const karamjaUnlocked = computed(() => completedCount.value >= 80)

  const choiceSlots = computed<ChoiceSlot[]>(() => {
    const chosen = chosenRegions()
    return CHOICE_THRESHOLDS.map((threshold, i) => ({
      unlockAt: threshold,
      unlocked: completedCount.value >= threshold,
      region: chosen[i] ?? null,
    }))
  })

  const activeRegions = computed(() => {
    const regions = ['General', 'Varlamore']
    if (karamjaUnlocked.value) regions.push('Karamja')
    chosenRegions().forEach((r) => {
      if (r) regions.push(r)
    })
    return regions
  })

  return { completedCount, karamjaUnlocked, choiceSlots, activeRegions }
}
