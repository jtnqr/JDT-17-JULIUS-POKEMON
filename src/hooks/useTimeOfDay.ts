import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'

export function getTimeSlot(hour: number): 'morning' | 'day' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  return 'night'
}

export function useTimeOfDay() {
  const setTimeOfDay = useGameStore((s) => s.setTimeOfDay)
  const timeOfDay = useGameStore((s) => s.timeOfDay)

  useEffect(() => {
    const hour = new Date().getHours()
    setTimeOfDay(getTimeSlot(hour))
  }, [setTimeOfDay])

  return timeOfDay
}
