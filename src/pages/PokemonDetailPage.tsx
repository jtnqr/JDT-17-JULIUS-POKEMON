import { ArrowLeft, Volume2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { StatBar } from '@/components/ui/StatBar'
import { TypeBadge } from '@/components/ui/TypeBadge'
import { usePokemon, usePokemonSpecies } from '@/hooks/usePokemon'
import { useSettingsStore } from '@/stores/settingsStore'

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { soundEnabled } = useSettingsStore()

  const { data: pokemon, isLoading: isPkLoading } = usePokemon(id || '')
  const { data: species, isLoading: isSpLoading } = usePokemonSpecies(id || '')

  if (isPkLoading || isSpLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 flex flex-col items-center justify-center">
        <SkeletonLoader className="h-64 max-w-md w-full" />
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 text-center text-muted">
        Pokemon entry not found.
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

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines max-w-4xl mx-auto">
      <Link
        to="/bag"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Back to Bag</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Sprite Display & Cry Button */}
        <div className="bg-surface/60 border border-accent/40 rounded-2xl p-6 flex flex-col items-center justify-center relative">
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-48 h-48 object-contain scale-105"
          />
          <h2 className="text-2xl font-black text-foreground capitalize mt-4 font-heading">
            {pokemon.name}
          </h2>
          <span className="text-xs text-accent font-bold mt-1">
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
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/50 hover:bg-accent hover:text-background text-foreground text-xs font-black rounded-xl transition-all cursor-pointer"
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
            <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-3 font-heading">
              Database Entry
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80 font-mono italic">
              {flavorText}
            </p>
          </div>

          <div className="bg-surface/40 border border-accent/20 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4 font-heading">
              Base Statistics
            </h3>
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
    </div>
  )
}
