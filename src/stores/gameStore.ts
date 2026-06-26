import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { staticAreas } from '@/lib/areaMap'
import { idbStorage } from '@/lib/idb-storage'

const getInitialTimeOfDay = (): 'morning' | 'day' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  return 'night'
}

interface GameState {
  currentAreaId: string | null
  visitedAreaIds: string[]
  unlockedAreaIds: string[]
  timeOfDay: 'morning' | 'day' | 'night'
  activeEncounter: {
    speciesId: number
    name: string
    level: number
    isShiny: boolean
  } | null

  setCurrentAreaId: (id: string | null) => void
  visitArea: (id: string) => void
  setTimeOfDay: (time: 'morning' | 'day' | 'night') => void
  cycleTimeOfDay: () => void
  setActiveEncounter: (encounter: GameState['activeEncounter']) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentAreaId: null,
      visitedAreaIds: [],
      unlockedAreaIds: ['pallet-town'],
      timeOfDay: getInitialTimeOfDay(),
      activeEncounter: null,

      setCurrentAreaId: (id) => set({ currentAreaId: id }),
      visitArea: (id) => {
        const visited = get().visitedAreaIds
        const nextVisited = visited.includes(id) ? visited : [...visited, id]

        // Calculate newly unlocked areas
        const nextUnlocked = staticAreas
          .filter(
            (area) =>
              area.prerequisites.length === 0 ||
              area.prerequisites.some((p) => nextVisited.includes(p))
          )
          .map((area) => area.id)

        set({
          visitedAreaIds: nextVisited,
          unlockedAreaIds: nextUnlocked,
        })
      },
      setTimeOfDay: (time) => set({ timeOfDay: time }),
      cycleTimeOfDay: () => {
        const current = get().timeOfDay
        const nextMap: Record<'morning' | 'day' | 'night', 'morning' | 'day' | 'night'> = {
          morning: 'day',
          day: 'night',
          night: 'morning',
        }
        set({ timeOfDay: nextMap[current] })
      },
      setActiveEncounter: (encounter) => set({ activeEncounter: encounter }),
      resetGame: () =>
        set({
          currentAreaId: null,
          visitedAreaIds: [],
          unlockedAreaIds: ['pallet-town'],
          timeOfDay: 'day',
          activeEncounter: null,
        }),
    }),
    {
      name: 'pokemon-game-state',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
