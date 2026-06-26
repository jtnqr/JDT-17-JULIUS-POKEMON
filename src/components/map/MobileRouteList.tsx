import { Lock, MapPin } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TimeOfDayBadge } from '@/components/ui/TimeOfDayBadge'
import type { AreaNode } from '@/lib/areaMap'
import { staticAreas } from '@/lib/areaMap'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'

type NodeState = 'current' | 'visited' | 'unlocked' | 'locked'

function getNodeState(
  areaId: string,
  currentAreaId: string | null,
  visitedAreaIds: string[],
  unlockedAreaIds: string[]
): NodeState {
  if (areaId === currentAreaId) return 'current'
  if (visitedAreaIds.includes(areaId)) return 'visited'
  if (unlockedAreaIds.includes(areaId)) return 'unlocked'
  return 'locked'
}

function NodeDot({ state }: { state: NodeState }) {
  if (state === 'current') {
    return (
      <span className="relative flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-60" />
        <span className="relative inline-flex rounded-full h-4 w-4 bg-highlight border-2 border-highlight" />
      </span>
    )
  }
  if (state === 'visited') {
    return <span className="h-3 w-3 rounded-full bg-accent border-2 border-accent" />
  }
  if (state === 'unlocked') {
    return <span className="h-3 w-3 rounded-full bg-bg border-2 border-accent" />
  }
  return <span className="h-3 w-3 rounded-full bg-bg border-2 border-muted/30" />
}

function AreaCardContent({
  area,
  state,
  caughtCount,
}: {
  area: AreaNode
  state: NodeState
  caughtCount: number
}) {
  const isCurrent = state === 'current'
  const isLocked = state === 'locked'

  return (
    <div className="flex items-start justify-between gap-2 min-w-0 w-full">
      <div className="min-w-0 flex-1">
        <p
          className={[
            'font-heading font-semibold text-sm leading-snug truncate flex items-center gap-1',
            isCurrent ? 'text-highlight' : isLocked ? 'text-muted' : 'text-text',
          ].join(' ')}
        >
          {isLocked && <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />}
          <span>{area.name}</span>
          {isCurrent && <MapPin className="w-3.5 h-3.5 shrink-0 text-highlight" aria-hidden />}
        </p>

        {!isLocked && (
          <p className="text-xs text-muted capitalize mt-0.5">
            {area.biome} • Lv. {area.minLevel}-{area.maxLevel}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {caughtCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
            {caughtCount} caught
          </span>
        )}

        {isCurrent && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-highlight/20 text-highlight border border-highlight/40">
            Here
          </span>
        )}
      </div>
    </div>
  )
}

export function MobileRouteList() {
  const navigate = useNavigate()
  const currentAreaId = useGameStore((s) => s.currentAreaId)
  const visitedAreaIds = useGameStore((s) => s.visitedAreaIds)
  const unlockedAreaIds = useGameStore((s) => s.unlockedAreaIds)
  const bag = useCollectionStore((s) => s.bag)

  const caughtCountByArea = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const area of staticAreas) {
      const areaPokemon = bag.filter((p) => p.caughtArea === area.name)
      const uniqueIds = new Set(areaPokemon.map((p) => p.speciesId))
      counts[area.name] = uniqueIds.size
    }
    return counts
  }, [bag])

  const currentNodeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    // Scroll current area into view when currentAreaId changes
    if (
      currentAreaId &&
      currentNodeRef.current &&
      typeof currentNodeRef.current.scrollIntoView === 'function'
    ) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentAreaId])

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-accent/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-extrabold text-text text-lg leading-none uppercase tracking-wider">
              World Map
            </h1>
            <p className="text-xs text-muted mt-1">{visitedAreaIds.length} areas visited</p>
          </div>
          <TimeOfDayBadge />
        </div>
      </div>

      {/* Path List */}
      <div className="flex-1 pt-4">
        {staticAreas.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <p className="text-sm">No routes defined yet.</p>
          </div>
        ) : (
          <ol
            aria-label="World Map routes"
            className="relative px-4"
            style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
          >
            {/* Connecting path line */}
            <div
              aria-hidden="true"
              className="absolute left-[30px] top-6 bottom-6 w-[2px] bg-accent/15"
            />

            {staticAreas.map((area) => {
              const state = getNodeState(area.id, currentAreaId, visitedAreaIds, unlockedAreaIds)
              const isLocked = state === 'locked'
              const isCurrent = state === 'current'
              const caughtHere = caughtCountByArea[area.name] ?? 0

              return (
                <li
                  key={area.id}
                  ref={isCurrent ? currentNodeRef : null}
                  className="relative flex items-start gap-3 py-2.5"
                >
                  {/* Dot column */}
                  <div className="w-[34px] flex items-center justify-center shrink-0 pt-2.5">
                    <NodeDot state={state} />
                  </div>

                  {/* Card Button */}
                  <button
                    onClick={() => !isLocked && navigate(`/area/${area.id}`)}
                    disabled={isLocked}
                    className={[
                      'flex-1 min-w-0 text-left rounded-xl p-3.5 border transition-all duration-200 cursor-pointer',
                      isCurrent
                        ? 'bg-highlight/10 border-highlight/50 hover:bg-highlight/15 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                        : state === 'visited'
                          ? 'bg-surface/80 border-accent/40 hover:border-accent/60 hover:bg-surface/100'
                          : state === 'unlocked'
                            ? 'bg-surface/40 border-accent/20 hover:border-accent/40 hover:bg-surface/60'
                            : 'bg-surface/10 border-muted/10 opacity-30 cursor-not-allowed',
                      !isLocked && 'active:scale-[0.98]',
                    ].join(' ')}
                    aria-label={isLocked ? `${area.name} — locked` : `Explore ${area.name}`}
                    type="button"
                  >
                    <AreaCardContent area={area} state={state} caughtCount={caughtHere} />
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
