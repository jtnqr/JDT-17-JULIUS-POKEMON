import { Link } from 'react-router-dom'
import { BallIcon } from '@/components/ui/BallIcon'
import { TypeBadge } from '@/components/ui/TypeBadge'

interface PokemonCardProps {
  id: number
  name: string
  sprite: string
  types: string[]
  ballUsed?: 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball'
  nickname?: string
  isShiny?: boolean
  partySlot?: number | null
}

export function PokemonCard({
  id,
  name,
  sprite,
  types,
  ballUsed,
  nickname,
  isShiny,
  partySlot,
}: PokemonCardProps) {
  return (
    <Link
      to={`/pokemon/${id}`}
      className="block relative overflow-hidden bg-surface/60 backdrop-blur-sm border border-accent/40 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:border-accent hover:shadow-[0_0_15px_rgba(205,127,50,0.3)] group scanlines"
    >
      {partySlot != null && (
        <div className="absolute top-2 left-2 bg-highlight text-background font-bold text-sm px-2 py-0.5 rounded-full z-10 border border-background">
          Party #{partySlot}
        </div>
      )}
      {isShiny && (
        <div className="absolute top-2 right-2 text-highlight text-sm font-bold animate-pulse z-10">
          ✨ SHINY
        </div>
      )}

      <div className="flex flex-col items-center">
        <img
          src={sprite}
          alt={nickname || name}
          loading="lazy"
          className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110"
          width={96}
          height={96}
        />
        <h3 className="text-lg font-bold text-foreground capitalize mt-2 truncate max-w-full">
          {nickname || name}
        </h3>
        {nickname && (
          <span className="text-sm text-muted font-mono capitalize truncate max-w-full">
            ({name})
          </span>
        )}
        <span className="text-sm text-accent font-semibold mt-1">
          #{String(id).padStart(3, '0')}
        </span>

        <div className="flex gap-1 mt-2 flex-wrap justify-center">
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>

        {ballUsed && (
          <div className="flex items-center gap-1 mt-3 text-sm text-muted">
            <BallIcon type={ballUsed} className="w-4 h-4" />
            <span>Caught</span>
          </div>
        )}
      </div>
    </Link>
  )
}
