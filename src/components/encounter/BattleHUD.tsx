import { TypeBadge } from '@/components/ui/TypeBadge'

export function BattleHUD({
  name,
  level,
  types,
  isShiny,
}: {
  name: string
  level: number
  types: string[]
  isShiny: boolean
}) {
  return (
    <div className="w-full max-w-md bg-surface/80 backdrop-blur-sm border border-accent/40 rounded-xl p-4 shadow-lg text-foreground scanlines">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-black tracking-wider capitalize text-highlight">{name}</h3>
          {isShiny && <span className="text-sm text-highlight font-bold animate-bounce">✨</span>}
        </div>
        <span className="font-mono text-sm text-muted">Lvl {level}</span>
      </div>

      <div className="flex gap-1">
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </div>
  )
}
