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
  const cardClassName = `block relative overflow-hidden backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-102 group scanlines h-[260px] ${
    isShiny
      ? 'bg-gradient-to-br from-amber-950/40 via-surface/80 to-yellow-900/40 border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:border-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.45)] holographic-card'
      : 'bg-surface/60 border border-accent/40 hover:border-accent hover:shadow-[0_0_15px_rgba(205,127,50,0.3)]'
  }`

  return (
    <Link to={`/pokemon/${id}`} className={cardClassName}>
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

      <div className="flex flex-col items-center h-full">
        {/* Sprite container - flex growable with shrink protection */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative">
          {isShiny && (
            <>
              <span
                className="absolute top-2 left-6 text-amber-300 text-sm sparkle-animation select-none"
                style={{ animationDelay: '0.2s' }}
              >
                ✨
              </span>
              <span
                className="absolute bottom-4 right-8 text-yellow-200 text-xs sparkle-animation select-none"
                style={{ animationDelay: '0.7s' }}
              >
                ✨
              </span>
              <span
                className="absolute top-8 right-4 text-amber-200 text-sm sparkle-animation select-none"
                style={{ animationDelay: '1.2s' }}
              >
                ✨
              </span>
            </>
          )}
          <img
            src={sprite}
            alt={nickname || name}
            loading="lazy"
            className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110 z-10"
            width={96}
            height={96}
          />
        </div>

        {/* Text information wrapper - stable size */}
        <div className="w-full flex flex-col items-center mt-2 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-foreground capitalize truncate max-w-full text-center leading-tight">
            {nickname || name}
          </h3>
          {nickname ? (
            <span className="text-sm text-muted font-mono capitalize truncate max-w-full text-center leading-tight">
              ({name})
            </span>
          ) : (
            <span
              className="text-sm text-transparent font-mono select-none leading-tight"
              aria-hidden="true"
            >
              &nbsp;
            </span>
          )}
          <span className="text-sm text-accent font-semibold mt-1">
            #{String(id).padStart(3, '0')}
          </span>

          <div className="flex gap-1 mt-2 flex-wrap justify-center max-h-[22px] overflow-hidden">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>

          {ballUsed ? (
            <div className="flex items-center gap-1 mt-3 text-sm text-muted shrink-0">
              <BallIcon type={ballUsed} className="w-4 h-4" />
              <span>Caught</span>
            </div>
          ) : (
            <div className="mt-3 text-sm text-transparent select-none shrink-0" aria-hidden="true">
              &nbsp;
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
