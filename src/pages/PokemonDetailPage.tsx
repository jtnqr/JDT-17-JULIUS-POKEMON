import { ArrowLeft, Volume2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { StatBar } from '@/components/ui/StatBar'
import { TypeBadge } from '@/components/ui/TypeBadge'
import { useEvolutionChain, usePokemon, usePokemonSpecies } from '@/hooks/usePokemon'
import { getSpriteUrl } from '@/lib/sprites'
import { useCollectionStore } from '@/stores/collectionStore'
import { useSettingsStore } from '@/stores/settingsStore'

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const bag = useCollectionStore((s) => s.bag)

  const {
    data: pokemon,
    isLoading: isPkLoading,
    isError: isPkError,
    refetch: refetchPk,
  } = usePokemon(id || '')
  const {
    data: species,
    isLoading: isSpLoading,
    isError: isSpError,
    refetch: refetchSp,
  } = usePokemonSpecies(id || '')

  const evoUrl = species?.evolution_chain?.url
  const {
    data: evoChain,
    isLoading: isEvoLoading,
    isError: isEvoError,
    refetch: refetchEvo,
  } = useEvolutionChain(evoUrl)

  const isError = isPkError || isSpError || isEvoError

  const handleRetry = () => {
    if (isPkError) refetchPk()
    if (isSpError) refetchSp()
    if (isEvoError) refetchEvo()
  }

  if (isPkLoading || isSpLoading || (evoUrl && isEvoLoading)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 flex flex-col items-center justify-center">
        <SkeletonLoader className="h-64 max-w-md w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 flex items-center justify-center scanlines text-text font-mono">
        <Helmet>
          <title>Data Stream Broken — Pokédex Bronze</title>
          <meta
            name="description"
            content="Failed to retrieve Pokémon parameters or evolution details."
          />
        </Helmet>
        <div className="max-w-md w-full border border-accent bg-surface/85 backdrop-blur-md rounded-xl p-6 shadow-2xl text-center">
          <h1 className="text-xl font-heading font-bold text-highlight mb-4 uppercase">
            Data Stream Broken
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Failed to retrieve Pokémon parameters or evolution details.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-3 px-4 bg-accent hover:bg-gold text-bg font-bold font-heading rounded-lg text-sm transition-all cursor-pointer min-h-[44px]"
          >
            RE-INITIATE LINK
          </button>
        </div>
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 text-center text-muted font-mono text-sm">
        Pokémon entry not found.
      </div>
    )
  }

  const handlePlayCry = () => {
    if (soundEnabled && pokemon.cries?.latest) {
      const audio = new Audio(pokemon.cries.latest)
      audio.volume = 0.3
      audio.play().catch(() => {})
    }
  }

  // Find English flavor text entry
  const flavorText =
    species?.flavor_text_entries
      ?.find((e) => e.language.name === 'en')
      ?.flavor_text.replace(/[\n\f]/g, ' ') || 'No entry details available.'

  // Dynamic SEO metadata
  const caughtPokemon = bag.find((p) => String(p.speciesId) === id)
  const speciesName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
  const titleText =
    caughtPokemon && caughtPokemon.nickname !== pokemon.name
      ? `${caughtPokemon.nickname} (${speciesName}) — Pokédex Bronze`
      : `${speciesName} — Pokédex Bronze`
  const descriptionText = `Pokédex entry for ${speciesName}: stats, moves, evolution chain, and more.`

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines max-w-4xl mx-auto">
      <Helmet>
        <title>{titleText}</title>
        <meta name="description" content={descriptionText} />
      </Helmet>

      <Link
        to="/bag"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6 cursor-pointer min-h-[44px] px-2"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-bold uppercase tracking-wider">Back to Bag</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Sprite Display & Cry Button */}
        <div className="bg-surface/60 border border-accent/40 rounded-2xl p-6 flex flex-col items-center justify-center relative">
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-48 h-48 object-contain scale-105"
            width={192}
            height={192}
          />
          <h1 className="text-2xl font-black text-foreground capitalize mt-4 font-heading">
            {pokemon.name}
          </h1>
          <span className="text-sm text-accent font-bold mt-1">
            NO. {String(pokemon.id).padStart(3, '0')}
          </span>

          <div className="flex gap-1.5 mt-4">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>

          {pokemon.cries?.latest && (
            <button
              onClick={handlePlayCry}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-accent/20 border border-accent/50 hover:bg-accent hover:text-background text-foreground text-sm font-black rounded-xl transition-all cursor-pointer min-h-[44px]"
              type="button"
            >
              <Volume2 size={16} />
              <span>PLAY CRY</span>
            </button>
          )}
        </div>

        {/* Right Side: Stats & Entry Text */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface/40 border border-accent/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-3 font-heading">
              Database Entry
            </h2>
            <p className="text-sm leading-relaxed text-foreground/80 font-mono italic">
              {flavorText}
            </p>
          </div>

          <div className="bg-surface/40 border border-accent/20 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 font-heading">
              Base Statistics
            </h2>
            {pokemon.stats.map((s) => (
              <StatBar
                key={s.stat.name}
                label={s.stat.name.replace('-', ' ')}
                value={s.base_stat}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Evolution Chain Section */}
      {evoChain && evoChain.length > 1 && (
        <div className="mt-8 bg-surface/40 border border-accent/20 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-4 font-heading text-center md:text-left">
            Evolution Chain
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-2">
            {evoChain.map((stage, idx) => {
              const isCurrent =
                String(stage.id) === id || stage.name.toLowerCase() === pokemon.name.toLowerCase()
              return (
                <div key={stage.id} className="flex items-center gap-4 md:gap-8">
                  {idx > 0 && (
                    <span className="text-accent font-mono text-lg select-none animate-pulse">
                      ➔
                    </span>
                  )}
                  <Link
                    to={`/pokemon/${stage.id}`}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-accent/20 border-highlight text-highlight font-black scale-105 shadow-md shadow-accent/10'
                        : 'border-accent/10 hover:border-accent/40 bg-surface/30 hover:bg-surface/50 text-foreground/80 hover:text-foreground cursor-pointer'
                    }`}
                  >
                    <img
                      src={getSpriteUrl(stage.id)}
                      alt={stage.name}
                      className="w-16 h-16 object-contain"
                      loading="lazy"
                      width={64}
                      height={64}
                    />
                    <span className="text-sm capitalize font-heading mt-1">{stage.name}</span>
                    <span className="text-sm font-mono text-muted-foreground mt-0.5">
                      #{String(stage.id).padStart(3, '0')}
                    </span>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
