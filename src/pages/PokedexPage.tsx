import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useCollectionStore } from '@/stores/collectionStore'

interface DexPokemon {
  id: number
  name: string
}

export default function PokedexPage() {
  const { seenSpecies, bag } = useCollectionStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch National Pokedex Index (#1 - #151 for Kanto focus/simplicity)
  const { data: dexList, isLoading } = useQuery<DexPokemon[]>({
    queryKey: ['pokedex-national'],
    queryFn: async (): Promise<DexPokemon[]> => {
      const res = await fetch('https://pokeapi.co/v2/pokemon-species?limit=151')
      const data = await res.json()
      return data.results.map((r: { name: string }, idx: number) => ({
        id: idx + 1,
        name: r.name,
      }))
    },
    staleTime: 1000 * 60 * 60 * 24, // cache for 1 day
  })

  const filteredDex = (dexList || []).filter(
    (p) => p.name.includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery)
  )

  const isCaught = (id: number) => bag.some((b) => b.speciesId === id)
  const isSeen = (id: number) => seenSpecies.includes(id) || isCaught(id)

  const totalCaught = new Set(bag.map((b) => b.speciesId)).size
  const totalSeen = seenSpecies.length

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-wider text-highlight font-heading">
          NATIONAL INDEX
        </h2>
        <p className="text-muted text-sm mt-1">
          Official records of encountered and catalogued specimens.
        </p>

        {/* Simple Progress Indicators */}
        <div className="mt-4 flex items-center gap-6 text-xs text-muted">
          <span>
            Catalogued: <strong className="text-foreground">{totalCaught} / 151</strong>
          </span>
          <span className="w-1.5 h-1.5 bg-accent/40 rounded-full" />
          <span>
            Encountered: <strong className="text-foreground">{totalSeen} / 151</strong>
          </span>
        </div>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md px-4 py-2 bg-surface border border-accent/40 rounded-xl text-foreground text-sm focus:outline-none mb-6"
        placeholder="Search by name or number..."
      />

      {isLoading ? (
        <div className="text-center text-muted font-mono">Decoding database...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
          {filteredDex.map((p) => {
            const caught = isCaught(p.id)
            const seen = isSeen(p.id)

            return (
              <div
                key={p.id}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center transition-all ${
                  caught
                    ? 'bg-surface/50 border-highlight shadow-[0_0_8px_rgba(255,215,0,0.1)]'
                    : seen
                      ? 'bg-surface/20 border-accent/40'
                      : 'bg-zinc-950/40 border-accent/10 opacity-30'
                }`}
              >
                <span className="text-[10px] font-mono text-muted mb-1">
                  #{String(p.id).padStart(3, '0')}
                </span>

                {seen ? (
                  <>
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt={p.name}
                      className={`w-12 h-12 object-contain ${caught ? '' : 'brightness-0 opacity-40'}`}
                      loading="lazy"
                    />
                    <span className="text-[11px] font-bold text-foreground capitalize mt-1 truncate max-w-full">
                      {p.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 flex items-center justify-center text-muted text-lg font-black font-mono">
                      ?
                    </div>
                    <span className="text-[11px] font-bold text-muted mt-1">???</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
