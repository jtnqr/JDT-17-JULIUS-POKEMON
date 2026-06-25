import { Moon, Sun, Sunrise } from 'lucide-react'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'

export function TimeOfDayBadge() {
  const timeOfDay = useTimeOfDay()

  let icon = <Sun size={14} />
  let label = 'Day'
  let colorStyles = 'bg-highlight/20 text-highlight border-highlight/40'

  if (timeOfDay === 'morning') {
    icon = <Sunrise size={14} />
    label = 'Morning'
    colorStyles = 'bg-accent/20 text-accent border-accent/40'
  } else if (timeOfDay === 'night') {
    icon = <Moon size={14} />
    label = 'Night'
    colorStyles = 'bg-surface/60 text-muted border-muted/40'
  }

  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${colorStyles}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  )
}
