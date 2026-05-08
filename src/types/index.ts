export interface TaskSkill {
  skill: string
  level: number
}

export interface Task {
  structId: number
  sortId: number
  name: string
  description: string
  area: string
  tier: number
  tierName: string
  points: number
  pactTask: boolean
  skills?: TaskSkill[]
  wikiNotes?: string
}

export interface Character {
  id: string
  name: string
  completedTaskIds: number[]
  todoTaskIds: number[]
  chosenRegions: string[]
  createdAt: string
}

export type TierName = 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Master'

export const TIER_COLORS: Record<TierName, string> = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-blue-100 text-blue-800',
  Hard: 'bg-yellow-100 text-yellow-800',
  Elite: 'bg-purple-100 text-purple-800',
  Master: 'bg-red-100 text-red-800',
}

export const AREAS = [
  'Global',
  'Asgarnia',
  'Desert',
  'Fremennik',
  'Kandarin',
  'Karamja',
  'Kourend',
  'Morytania',
  'Tirannwn',
  'Varlamore',
  'Wilderness',
] as const

export type Area = (typeof AREAS)[number]

export interface RuneLiteImport {
  displayName?: string
  taskType?: string
  tasks: Record<string, { completed: number; structId: number; tracked: number; ignored: number }>
}
