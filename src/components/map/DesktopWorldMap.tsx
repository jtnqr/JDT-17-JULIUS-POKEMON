import { useNavigate } from 'react-router-dom'
import { staticAreas } from '@/lib/areaMap'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'

export function DesktopWorldMap() {
  const navigate = useNavigate()
  const visitedAreaIds = useGameStore((s) => s.visitedAreaIds)
  const unlockedAreaIds = useGameStore((s) => s.unlockedAreaIds)
  const currentAreaId = useGameStore((s) => s.currentAreaId)
  const bag = useCollectionStore((s) => s.bag)

  // Calculate unique species caught in each area
  const getSpeciesCountForArea = (areaName: string) => {
    const areaPokemon = bag.filter((p) => p.caughtArea === areaName)
    const uniqueIds = new Set(areaPokemon.map((p) => p.speciesId))
    return uniqueIds.size
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 flex flex-col items-center scanlines">
      <div className="max-w-4xl w-full text-center mb-6">
        <h2 className="text-3xl font-extrabold tracking-wider text-highlight mb-2">WORLD MAP</h2>
        <p className="text-muted text-sm">
          Select an unlocked route to explore and encounter wild Pokémon.
        </p>
      </div>

      {/* Styled Interactive Node Map Canvas */}
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-card border-2 border-accent/40 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(205,127,50,0.15)] bg-[radial-gradient(#2c1d0e_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Draw prerequisites connectors/paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
          {staticAreas.map((area) => {
            return area.prerequisites.map((prereqId) => {
              const fromArea = staticAreas.find((a) => a.id === prereqId)
              if (!fromArea) return null

              const isUnlocked = unlockedAreaIds.includes(area.id)

              return (
                <line
                  key={`${area.id}-${prereqId}`}
                  x1={`${fromArea.coords.x}%`}
                  y1={`${fromArea.coords.y}%`}
                  x2={`${area.coords.x}%`}
                  y2={`${area.coords.y}%`}
                  stroke={isUnlocked ? '#cd7f32' : '#2c1d0e'}
                  strokeWidth={isUnlocked ? '3' : '2'}
                  strokeDasharray={isUnlocked ? undefined : '5,5'}
                  className="transition-colors duration-500"
                />
              )
            })
          })}
        </svg>

        {/* Nodes */}
        {staticAreas.map((area) => {
          const isUnlocked = unlockedAreaIds.includes(area.id)
          const isVisited = visitedAreaIds.includes(area.id)
          const isCurrent = currentAreaId === area.id
          const uniqueCount = getSpeciesCountForArea(area.name)

          return (
            <button
              key={area.id}
              onClick={() => isUnlocked && navigate(`/area/${area.id}`)}
              disabled={!isUnlocked}
              style={{ left: `${area.coords.x}%`, top: `${area.coords.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group transition-all duration-300 p-2 min-w-[44px] min-h-[44px] justify-center ${
                isUnlocked ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-40'
              }`}
              type="button"
              aria-label={`${area.name}, ${isCurrent ? 'Current position' : isVisited ? 'Visited' : isUnlocked ? 'Unlocked' : 'Locked'}`}
            >
              {/* Node Circle */}
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                  isCurrent
                    ? 'bg-highlight border-foreground animate-pulse shadow-[0_0_15px_#ffd700]'
                    : isVisited
                      ? 'bg-accent border-highlight'
                      : isUnlocked
                        ? 'bg-surface border-accent'
                        : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -inset-2 rounded-full border border-highlight animate-ping pointer-events-none" />
                )}
                {uniqueCount > 0 && (
                  <div className="absolute -top-4 -right-4 bg-highlight text-background font-black text-sm w-7 h-7 rounded-full border border-background flex items-center justify-center">
                    {uniqueCount}
                  </div>
                )}
              </div>

              {/* Tooltip Label */}
              <div className="mt-1 bg-background/90 text-[10px] sm:text-sm font-bold text-foreground px-2 py-0.5 rounded border border-accent/30 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity duration-300 shadow-md max-w-[64px] sm:max-w-none truncate">
                {area.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
