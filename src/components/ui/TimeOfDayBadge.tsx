import { Moon, Sun, Sunrise } from 'lucide-react'
import type { ReactElement } from 'react'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'

type TimeSlot = 'morning' | 'day' | 'night'

const TOD_CONFIG: Record<TimeSlot, { icon: ReactElement; label: string; colorStyles: string }> = {
  morning: {
    icon: <Sunrise size={14} />,
    label: 'Morning',
    colorStyles: 'bg-accent/20 text-accent border-accent/40',
  },
  day: {
    icon: <Sun size={14} />,
    label: 'Day',
    colorStyles: 'bg-highlight/20 text-highlight border-highlight/40',
  },
  night: {
    icon: <Moon size={14} />,
    label: 'Night',
    colorStyles: 'bg-surface/60 text-muted border-muted/40',
  },
}

import { useGameStore } from '@/stores/gameStore'

export function TimeOfDayBadge() {
  const timeOfDay = useTimeOfDay()
  const cycleTimeOfDay = useGameStore((s) => s.cycleTimeOfDay)
  const { icon, label, colorStyles } = TOD_CONFIG[timeOfDay]

  return (
    <button
      type="button"
      onClick={cycleTimeOfDay}
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${colorStyles}`}
      title="Time of Day (Cycles every minute). Click to cycle manually!"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
