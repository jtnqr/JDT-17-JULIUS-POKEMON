import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { PokemonCard } from '@/components/ui/PokemonCard'
import { useBagDetails } from '@/hooks/usePokemon'
import { TRAINER_BADGES } from '@/lib/badges'
import { getSpriteUrl } from '@/lib/sprites'
import { PHYSICAL_TYPES, SPECIAL_TYPES } from '@/lib/typeData'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'

export default function BagPage() {
  const bag = useCollectionStore((s) => s.bag)
  const releasePokemon = useCollectionStore((s) => s.releasePokemon)
  const visitedAreaIds = useGameStore((s) => s.visitedAreaIds)
  const [filterType, setFilterType] = useState('all')
  const [activeTab, setActiveTab] = useState<'bag' | 'badges'>('bag')

  const uniqueSpeciesIds = Array.from(new Set(bag.map((p) => p.speciesId)))
  const queries = useBagDetails(uniqueSpeciesIds)

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)

  const handleRelease = (uid: string) => {
    if (window.confirm('Are you sure you want to release this Pokémon back into the wild?')) {
      releasePokemon(uid)
    }
  }

  const handleRetry = () => {
    for (const q of queries) {
      if (q.isError) {
        q.refetch()
      }
    }
  }

  const getPokemonTypes = (speciesId: number): string[] => {
    const query = queries.find((q) => q.data && q.data.id === speciesId)
    return query?.data?.types.map((t) => t.type.name) || []
  }

  const getPokemonOriginalName = (speciesId: number): string => {
    const query = queries.find((q) => q.data && q.data.id === speciesId)
    return query?.data?.name || ''
  }

  const filteredBag = bag.filter((p) => {
    if (filterType === 'all') return true
    const types = getPokemonTypes(p.speciesId)
    if (filterType === 'physical') {
      return types.some((t) => PHYSICAL_TYPES.has(t.toLowerCase()))
    }
    if (filterType === 'special') {
      return types.some((t) => SPECIAL_TYPES.has(t.toLowerCase()))
    }
    return types.includes(filterType)
  })

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 flex items-center justify-center scanlines text-text font-mono">
        <Helmet>
          <title>My Bag — Pokédex Bronze</title>
          <meta name="description" content="All caught Pokémon in your collection." />
        </Helmet>
        <div className="max-w-md w-full border border-accent bg-surface/80 backdrop-blur-md rounded-xl p-6 shadow-2xl text-center">
          <h1 className="text-xl font-heading font-bold text-highlight mb-4 uppercase">
            Connection Interrupted
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Failed to retrieve bag contents from the database. Please try again.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-3 px-4 bg-accent hover:bg-gold text-bg font-bold font-heading rounded-lg text-sm transition-all cursor-pointer min-h-[44px]"
          >
            RETRY TRANSMISSION
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines">
      <Helmet>
        <title>My Bag — Pokédex Bronze</title>
        <meta name="description" content="All caught Pokémon in your collection." />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider text-highlight font-heading">
              YOUR BAG
            </h1>
            <p className="text-muted text-sm mt-1">
              {activeTab === 'bag'
                ? 'Manage collection, click to view stats, click release'
                : 'Complete challenges to unlock trainer achievements.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            {/* Tab Switcher */}
            <div className="flex bg-surface/50 border border-accent/20 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('bag')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'bag'
                    ? 'bg-accent text-background shadow-md'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Collection
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'badges'
                    ? 'bg-accent text-background shadow-md'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Badges
              </button>
            </div>

            {activeTab === 'bag' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-surface border border-accent/40 rounded-xl text-foreground text-sm font-bold focus:outline-none min-h-[44px]"
              >
                <option value="all">All Types / Categories</option>
                <optgroup label="Attack Type (Category)" className="text-accent bg-background">
                  <option value="physical">Physical Category</option>
                  <option value="special">Special Category</option>
                </optgroup>
                <optgroup label="Element (Type)" className="text-accent bg-background">
                  <option value="normal">Normal</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="electric">Electric</option>
                  <option value="grass">Grass</option>
                  <option value="ice">Ice</option>
                  <option value="fighting">Fighting</option>
                  <option value="poison">Poison</option>
                  <option value="ground">Ground</option>
                  <option value="flying">Flying</option>
                  <option value="psychic">Psychic</option>
                  <option value="bug">Bug</option>
                  <option value="rock">Rock</option>
                  <option value="ghost">Ghost</option>
                  <option value="dragon">Dragon</option>
                  <option value="dark">Dark</option>
                  <option value="steel">Steel</option>
                  <option value="fairy">Fairy</option>
                </optgroup>
              </select>
            )}
          </div>
        </div>

        {activeTab === 'bag' ? (
          isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="h-48 bg-surface/30 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredBag.length === 0 ? (
            <div className="text-center text-muted py-12 text-sm">
              No Pokémon found in your collection matching criteria.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredBag.map((p) => {
                const types = getPokemonTypes(p.speciesId)
                const originalName = getPokemonOriginalName(p.speciesId)
                const sprite = getSpriteUrl(p.speciesId, p.isShiny)
                return (
                  <div key={p.uid} className="flex flex-col gap-2 relative group">
                    <PokemonCard
                      id={p.speciesId}
                      name={originalName}
                      nickname={p.nickname !== originalName ? p.nickname : undefined}
                      sprite={sprite}
                      types={types}
                      ballUsed={p.ball}
                      isShiny={p.isShiny}
                      partySlot={p.partySlot}
                    />
                    <button
                      onClick={() => handleRelease(p.uid)}
                      className="w-full py-2 px-3 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-900 transition-colors z-20 text-sm font-bold cursor-pointer min-h-[44px] flex items-center justify-center"
                      type="button"
                    >
                      RELEASE POKÉMON
                    </button>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* Trainer Badges Tab View */
          <div>
            <div className="mb-6 p-4 bg-surface/40 border border-accent/20 rounded-xl flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-muted">
                Achievements Unlocked
              </span>
              <strong className="text-xl text-highlight font-mono">
                {TRAINER_BADGES.filter((b) => b.checkUnlocked({ bag, visitedAreaIds })).length} /{' '}
                {TRAINER_BADGES.length}
              </strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {TRAINER_BADGES.map((badge) => {
                const isUnlocked = badge.checkUnlocked({ bag, visitedAreaIds })
                return (
                  <div
                    key={badge.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 scanlines flex flex-col items-center text-center justify-between min-h-[200px] ${
                      isUnlocked
                        ? 'border-amber-500/60 bg-gradient-to-br from-amber-950/20 via-surface/80 to-yellow-950/25 shadow-[0_0_15px_rgba(205,127,50,0.2)]'
                        : 'border-zinc-800 bg-zinc-950/50 opacity-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      {/* Badge Icon / Symbol */}
                      <div
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black mb-4 relative ${
                          isUnlocked
                            ? 'bg-amber-500/20 border-amber-400 text-highlight shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                        }`}
                      >
                        {isUnlocked ? '🏅' : '🔒'}
                        {isUnlocked && (
                          <span className="absolute -inset-1 rounded-full border border-amber-400 animate-ping pointer-events-none opacity-20" />
                        )}
                      </div>

                      <h3
                        className={`text-lg font-black tracking-wide mb-2 ${
                          isUnlocked ? 'text-highlight' : 'text-zinc-400'
                        }`}
                      >
                        {badge.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px]">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      {isUnlocked ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
