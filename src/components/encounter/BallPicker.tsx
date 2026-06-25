import { BallIcon } from '@/components/ui/BallIcon'

interface BallPickerProps {
  onSelect: (ball: 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball') => void
  disabled: boolean
}

export function BallPicker({ onSelect, disabled }: BallPickerProps) {
  const BALLS = [
    { type: 'poke-ball', name: 'Poke Ball', rate: '1x', desc: 'Standard catching device.' },
    { type: 'great-ball', name: 'Great Ball', rate: '1.5x', desc: 'Improved success rate.' },
    { type: 'ultra-ball', name: 'Ultra Ball', rate: '2x', desc: 'High performance device.' },
    { type: 'master-ball', name: 'Master Ball', rate: '100%', desc: 'Guarantees catching.' },
  ] as const

  return (
    <div className="w-full max-w-md bg-surface/90 border border-accent/40 rounded-2xl p-6 shadow-xl scanlines">
      <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 text-center">
        Select Poké Ball
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {BALLS.map((ball) => (
          <button
            key={ball.type}
            onClick={() => onSelect(ball.type)}
            disabled={disabled}
            className="flex flex-col items-center p-3 rounded-xl bg-background/50 border border-accent/20 hover:border-accent hover:bg-background/80 transition-all duration-300 group cursor-pointer disabled:opacity-40 disabled:scale-100"
            title={`${ball.desc} Catch rate: ${ball.rate}`}
            type="button"
          >
            <BallIcon
              type={ball.type}
              className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
            />
            <span className="text-sm font-bold text-foreground mt-2">{ball.name}</span>
            <span className="text-sm text-highlight font-mono mt-0.5">{ball.rate}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
