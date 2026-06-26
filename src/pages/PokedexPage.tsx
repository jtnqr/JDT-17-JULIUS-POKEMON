import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePokedexList } from '@/hooks/usePokemon'
import { getSpriteUrl } from '@/lib/sprites'
import { useCollectionStore } from '@/stores/collectionStore'

export default function PokedexPage() {
  const seenSpecies = useCollectionStore((s) => s.seenSpecies)
  const bag = useCollectionStore((s) => s.bag)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch National Pokedex Index (#1 - #151 for Kanto focus/simplicity)
  const { data: dexList, isLoading, isError, refetch } = usePokedexList()

  const filteredDex = (dexList || []).filter(
    (p) => p.name.includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery)
  )

  const isCaught = (id: number) => bag.some((b) => b.speciesId === id)
  const isSeen = (id: number) => seenSpecies.includes(id) || isCaught(id)

  const totalCaught = new Set(bag.map((b) => b.speciesId)).size
  const totalSeen = seenSpecies.length

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 flex items-center justify-center scanlines text-text font-mono">
        <Helmet>
          <title>National Pokédex — Pokédex Bronze</title>
          <meta
            name="description"
            content="Track seen and caught Pokémon across all 151 species."
          />
        </Helmet>
        <div className="max-w-md w-full border border-accent bg-surface/85 backdrop-blur-md rounded-xl p-6 shadow-2xl text-center">
          <h1 className="text-xl font-heading font-bold text-highlight mb-4 uppercase">
            Database Offline
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Failed to establish link with the National Pokédex index database.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="w-full py-3 px-4 bg-accent hover:bg-gold text-bg font-bold font-heading rounded-lg text-sm transition-all cursor-pointer min-h-[44px]"
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines max-w-5xl mx-auto">
      <Helmet>
        <title>National Pokédex — Pokédex Bronze</title>
        <meta name="description" content="Track seen and caught Pokémon across all 151 species." />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-wider text-highlight font-heading">
          NATIONAL INDEX
        </h1>
        <p className="text-muted text-sm mt-1">Official records of catalogued specimens.</p>

        {/* Simple Progress Indicators */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted">
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
        className="w-full max-w-md px-4 py-3 bg-surface border border-accent/40 rounded-xl text-foreground text-sm focus:outline-none mb-6 font-mono min-h-[44px]"
        placeholder="Search by name or number..."
      />

      {isLoading ? (
        <div className="text-center text-muted font-mono animate-pulse text-sm">
          Decoding database...
        </div>
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
                <span className="text-sm font-mono text-muted mb-1">
                  #{String(p.id).padStart(3, '0')}
                </span>

                {seen ? (
                  <>
                    <img
                      src={getSpriteUrl(p.id)}
                      alt={p.name}
                      className={`w-12 h-12 object-contain ${caught ? '' : 'brightness-0 opacity-40'}`}
                      loading="lazy"
                      width={48}
                      height={48}
                    />
                    <span className="text-sm font-bold text-foreground capitalize mt-1 truncate max-w-full font-heading">
                      {p.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 flex items-center justify-center text-muted text-lg font-black font-mono">
                      ?
                    </div>
                    <span className="text-sm font-bold text-muted mt-1">???</span>
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
