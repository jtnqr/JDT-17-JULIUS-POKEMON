import { AlertCircle, ArrowLeft, Compass } from 'lucide-react'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { type PokemonEncounter, useLocationArea } from '@/hooks/useEncounter'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import { staticAreas } from '@/lib/areaMap'
import { getBiomeStyles } from '@/lib/areaMapHelper'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'

export default function AreaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const timeOfDay = useTimeOfDay()
  const setCurrentAreaId = useGameStore((s) => s.setCurrentAreaId)
  const visitArea = useGameStore((s) => s.visitArea)
  const setActiveEncounter = useGameStore((s) => s.setActiveEncounter)
  const seenSpecies = useCollectionStore((s) => s.seenSpecies)

  const area = staticAreas.find((a) => a.id === id)

  React.useEffect(() => {
    if (area) {
      setCurrentAreaId(area.id)
      visitArea(area.id)
    }
  }, [area, setCurrentAreaId, visitArea])

  const { data: encounters, isLoading, error } = useLocationArea(area?.locationAreaName || '')

  if (!area) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-6 scanlines">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Area Not Found</h2>
        <Link to="/" className="text-accent underline min-h-[44px] flex items-center px-4">
          Back to Map
        </Link>
      </div>
    )
  }

  // Filter encounter pool by time of day
  const timeSlotFilter = (
    detail: PokemonEncounter['version_details'][number]['encounter_details'][number]
  ) => {
    const conditions = detail.condition_values.map((c) => c.name)
    const timeConditions = conditions.filter((name) =>
      ['time-morning', 'morning', 'time-day', 'day', 'time-night', 'night'].includes(name)
    )
    if (timeConditions.length === 0) return true // Available anytime

    if (timeOfDay === 'morning') {
      return timeConditions.includes('time-morning') || timeConditions.includes('morning')
    }
    if (timeOfDay === 'day') {
      return timeConditions.includes('time-day') || timeConditions.includes('day')
    }
    return timeConditions.includes('time-night') || timeConditions.includes('night')
  }

  const encounterPool =
    encounters?.pokemon_encounters.filter((encounter) =>
      encounter.version_details.some((vDetail) => vDetail.encounter_details.some(timeSlotFilter))
    ) || []

  // Extract species name and id from url
  const getSpeciesId = (url: string) => {
    const parts = url.split('/')
    return parseInt(parts[parts.length - 2], 10)
  }

  const handleExplore = () => {
    if (encounterPool.length === 0) return

    // Pick a random species from the current pool
    const randomIndex = Math.floor(Math.random() * encounterPool.length)
    const encounter = encounterPool[randomIndex]
    const speciesId = getSpeciesId(encounter.pokemon.url)

    // Choose random level within area ranges
    const minLvl = area.minLevel
    const maxLvl = area.maxLevel
    const randomLevel = Math.floor(Math.random() * (maxLvl - minLvl + 1)) + minLvl

    // 1/4096 chance for Shiny
    const isShiny = Math.random() < 1 / 4096

    setActiveEncounter({
      speciesId,
      name: encounter.pokemon.name,
      level: randomLevel,
      isShiny,
    })

    navigate('/encounter')
  }

  const bgStyles = getBiomeStyles(area.biome, timeOfDay)

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col justify-between scanlines overflow-hidden ${bgStyles}`}
    >
      <Helmet>
        <title>{`${area.name} — Pokédex Bronze`}</title>
        <meta
          name="description"
          content={`Encounter and catch Pokémon in ${area.name}. See which species appear by time of day.`}
        />
      </Helmet>

      {/* Top Overlay Bar */}
      <div className="bg-background/80 border-b border-accent/20 p-4 flex items-center justify-between z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors min-h-[44px] px-2"
          aria-label="Back to Map"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold text-sm uppercase tracking-wider">Map</span>
        </Link>
        <div className="flex flex-col items-end">
          <h2 className="text-lg font-black tracking-wider text-highlight capitalize">
            {area.name}
          </h2>
          <span className="text-sm text-muted uppercase tracking-widest">
            {area.region} Region • {timeOfDay}
          </span>
        </div>
      </div>

      {/* Middle Silhouettes Drawer */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
        {isLoading ? (
          <div className="w-full max-w-md">
            <SkeletonLoader className="h-40" />
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-6 text-red-300 max-w-sm">
            <p>Failed loading wild Pokemon encounter tables.</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-surface/60 backdrop-blur-md border border-accent/40 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">
              Area Wildlife
            </h3>

            {encounterPool.length === 0 ? (
              <p className="text-muted text-sm">No wild Pokémon appear here at this time.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 justify-items-center">
                {encounterPool.map((e) => {
                  const sId = getSpeciesId(e.pokemon.url)
                  const isSeen = seenSpecies.includes(sId)

                  return (
                    <button
                      key={sId}
                      onClick={() => isSeen && navigate(`/pokemon/${sId}`)}
                      disabled={!isSeen}
                      className={`relative group flex flex-col items-center focus:outline-hidden ${
                        isSeen
                          ? 'cursor-pointer hover:scale-105 transition-transform'
                          : 'cursor-default opacity-40'
                      }`}
                      title={
                        isSeen
                          ? `Click to view ${e.pokemon.name} details`
                          : 'Click to view details (if seen)'
                      }
                      aria-label={isSeen ? `${e.pokemon.name}, seen` : 'Unknown Pokémon'}
                      type="button"
                    >
                      {/* Blacked out silhouette for retro mystery unless seen */}
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${sId}.png`}
                        alt={isSeen ? e.pokemon.name : 'wild silhouette'}
                        loading="lazy"
                        className={`w-16 h-16 object-contain transition-all duration-300 ${
                          isSeen ? 'brightness-100' : 'brightness-0'
                        }`}
                      />
                      <span className="text-sm text-muted capitalize truncate max-w-[70px]">
                        {e.pokemon.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Explore Panel */}
      <div className="bg-background/95 border-t border-accent/30 p-6 flex flex-col items-center z-10">
        <button
          onClick={handleExplore}
          disabled={isLoading || encounterPool.length === 0}
          className="w-full max-w-md flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-background font-bold py-4 rounded-xl border border-highlight/50 shadow-[0_0_15px_rgba(205,127,50,0.4)] hover:scale-102 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-300 disabled:opacity-40 disabled:scale-100 cursor-pointer"
          type="button"
        >
          <Compass className="animate-spin-slow" size={22} />
          <span>EXPLORE ROUTE</span>
        </button>
      </div>
    </div>
  )
}
