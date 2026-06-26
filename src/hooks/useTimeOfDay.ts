import { useGameStore } from '@/stores/gameStore'

export function getTimeSlot(hour: number): 'morning' | 'day' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  return 'night'
}

export function useTimeOfDay() {
  const timeOfDay = useGameStore((s) => s.timeOfDay)
  return timeOfDay
}
