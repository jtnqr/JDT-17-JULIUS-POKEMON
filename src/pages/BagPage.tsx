import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { PokemonCard } from '@/components/ui/PokemonCard'
import { useBagDetails } from '@/hooks/usePokemon'
import { useCollectionStore } from '@/stores/collectionStore'

export default function BagPage() {
  const bag = useCollectionStore((s) => s.bag)
  const releasePokemon = useCollectionStore((s) => s.releasePokemon)
  const [filterType, setFilterType] = useState('all')

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
    return getPokemonTypes(p.speciesId).includes(filterType)
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
              Management collection, click to view stats, long press / click release
            </p>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-surface border border-accent/40 rounded-xl text-foreground text-sm font-bold focus:outline-none min-h-[44px]"
          >
            <option value="all">All Types</option>
            <option value="electric">Electric</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="grass">Grass</option>
          </select>
        </div>

        {isLoading ? (
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
              const sprite = p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${p.speciesId}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.speciesId}.png`
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
        )}
      </div>
    </div>
  )
}
