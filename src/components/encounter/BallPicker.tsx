import { BallIcon } from '@/components/ui/BallIcon'
import { calculateCatchChance } from '@/lib/catchCalc'

interface BallPickerProps {
  onSelect: (ball: 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball') => void
  disabled: boolean
  captureRate?: number
  level?: number
}

export function BallPicker({ onSelect, disabled, captureRate, level }: BallPickerProps) {
  const getDisplayRate = (
    type: 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball',
    baseRate: string
  ) => {
    if (type === 'master-ball') return '100%'
    if (captureRate === undefined || level === undefined) return baseRate

    const multiplier = type === 'poke-ball' ? 1.0 : type === 'great-ball' ? 1.5 : 2.0
    const chance = calculateCatchChance(captureRate, multiplier, level)
    return `${baseRate} (${Math.round(chance * 100)}%)`
  }

  const BALLS = [
    { type: 'poke-ball', name: 'Poke Ball', baseRate: '1x', desc: 'Standard catching device.' },
    { type: 'great-ball', name: 'Great Ball', baseRate: '1.5x', desc: 'Improved success rate.' },
    { type: 'ultra-ball', name: 'Ultra Ball', baseRate: '2x', desc: 'High performance device.' },
    { type: 'master-ball', name: 'Master Ball', baseRate: '100%', desc: 'Guarantees catching.' },
  ] as const

  return (
    <div className="w-full max-w-md bg-surface/90 border border-accent/40 rounded-2xl p-6 shadow-xl scanlines">
      <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 text-center">
        Select Poké Ball
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {BALLS.map((ball) => {
          const displayRate = getDisplayRate(ball.type, ball.baseRate)
          return (
            <button
              key={ball.type}
              onClick={() => onSelect(ball.type)}
              disabled={disabled}
              className="flex flex-col items-center p-3 rounded-xl bg-background/50 border border-accent/20 hover:border-accent hover:bg-background/80 transition-all duration-300 group cursor-pointer disabled:opacity-40 disabled:scale-100"
              title={`${ball.desc} Catch rate: ${displayRate}`}
              type="button"
            >
              <BallIcon
                type={ball.type}
                className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              />
              <span className="text-sm font-bold text-foreground mt-2">{ball.name}</span>
              <span className="text-sm text-highlight font-mono mt-0.5">{displayRate}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
