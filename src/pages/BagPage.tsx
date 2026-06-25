import { useQueries } from '@tanstack/react-query'
import { useState } from 'react'
import { PokemonCard } from '@/components/ui/PokemonCard'
import { useCollectionStore } from '@/stores/collectionStore'

interface PokemonData {
  id: number
  name: string
  types: Array<{
    type: { name: string }
  }>
}

export default function BagPage() {
  const { bag, releasePokemon } = useCollectionStore()
  const [filterType, setFilterType] = useState('all')

  // Fetch full details of bag pokemon to display types
  const queries = useQueries({
    queries: bag.map((p) => ({
      queryKey: ['pokemon', p.speciesId],
      queryFn: async (): Promise<PokemonData> => {
        const res = await fetch(`https://pokeapi.co/v2/pokemon/${p.speciesId}`)
        if (!res.ok) throw new Error('Failed to fetch pokemon details')
        return res.json()
      },
      staleTime: 1000 * 60 * 10,
    })),
  })

  const isLoading = queries.some((q) => q.isLoading)

  const handleRelease = (uid: string) => {
    if (window.confirm('Are you sure you want to release this Pokémon back into the wild?')) {
      releasePokemon(uid)
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

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-wider text-highlight font-heading">
              YOUR BAG
            </h2>
            <p className="text-muted text-sm mt-1">
              Management collection, click to view stats, long press / click release
            </p>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-surface border border-accent/40 rounded-xl text-foreground text-sm font-bold focus:outline-none"
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
          <div className="text-center text-muted py-12">
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
                <div key={p.uid} className="relative group">
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
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-900 transition-colors z-20 text-[10px] font-bold cursor-pointer"
                    type="button"
                  >
                    RELEASE
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
