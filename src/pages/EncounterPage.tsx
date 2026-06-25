import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { BallPicker } from '@/components/encounter/BallPicker'
import { BattleHUD } from '@/components/encounter/BattleHUD'
import { NicknameModal } from '@/components/encounter/NicknameModal'
import { BallIcon } from '@/components/ui/BallIcon'
import { usePokemon, usePokemonSpecies } from '@/hooks/usePokemon'
import { staticAreas } from '@/lib/areaMap'
import { calculateCatchChance } from '@/lib/catchCalc'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

type CatchState = 'idle' | 'throwing' | 'shaking' | 'caught' | 'escaped'

export default function EncounterPage() {
  const navigate = useNavigate()

  // Atomic selectors for Zustand stores (always call at the top level)
  const activeEncounter = useGameStore((s) => s.activeEncounter)
  const setActiveEncounter = useGameStore((s) => s.setActiveEncounter)
  const currentAreaId = useGameStore((s) => s.currentAreaId)
  const catchPokemon = useCollectionStore((s) => s.catchPokemon)
  const markSeen = useCollectionStore((s) => s.markSeen)
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)

  // Call API hooks at the top level with a fallback species ID if activeEncounter is null
  const speciesId = activeEncounter?.speciesId ?? 1
  const { data: pokemon } = usePokemon(speciesId)
  const { data: species } = usePokemonSpecies(speciesId)

  const [catchState, setCatchState] = useState<CatchState>('idle')
  const [selectedBall, setSelectedBall] = useState<
    'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball'
  >('poke-ball')
  const [shakeCount, setShakeCount] = useState(0)
  const [showNickname, setShowNickname] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const throwTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resolveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mark species as seen when active encounter loads
  useEffect(() => {
    if (activeEncounter?.speciesId) {
      markSeen(activeEncounter.speciesId)
    }
  }, [activeEncounter?.speciesId, markSeen])

  // Play Pokémon cry with proper cleanup
  useEffect(() => {
    if (pokemon?.cries?.latest && soundEnabled && activeEncounter) {
      const audio = new Audio(pokemon.cries.latest)
      audio.volume = 0.3
      audioRef.current = audio
      audio.play().catch(() => {})
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [pokemon, soundEnabled, activeEncounter])

  // Clean up animation timers on unmount
  useEffect(() => {
    return () => {
      if (throwTimeoutRef.current) clearTimeout(throwTimeoutRef.current)
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current)
      if (resolveTimeoutRef.current) clearTimeout(resolveTimeoutRef.current)
    }
  }, [])

  // Perform early return if there is no active wild encounter
  if (!activeEncounter) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 scanlines">
        <Helmet>
          <title>Wild Encounter — Pokédex Bronze</title>
          <meta
            name="description"
            content="A wild Pokémon appeared! Throw a Poké Ball to catch it."
          />
        </Helmet>
        <p className="text-muted text-sm mb-4">No active wild encounter.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2.5 bg-accent text-background font-bold rounded-lg cursor-pointer hover:bg-highlight hover:scale-102 transition-all duration-300 min-h-[44px]"
          type="button"
        >
          Return to Map
        </button>
      </div>
    )
  }

  const handleCatchAttempt = (ball: typeof selectedBall) => {
    if (!species) return
    setSelectedBall(ball)
    setCatchState('throwing')

    const multiplier =
      ball === 'poke-ball' ? 1.0 : ball === 'great-ball' ? 1.5 : ball === 'ultra-ball' ? 2.0 : 100
    const probability = calculateCatchChance(
      species.capture_rate,
      multiplier,
      activeEncounter.level
    )
    const success = Math.random() <= probability

    // Clean up any existing animations first
    if (throwTimeoutRef.current) clearTimeout(throwTimeoutRef.current)
    if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current)
    if (resolveTimeoutRef.current) clearTimeout(resolveTimeoutRef.current)

    // Animate throwing -> shaking
    throwTimeoutRef.current = setTimeout(() => {
      setCatchState('shaking')

      // Determine shakes based on proximity (Master ball = 3, high probability = 3, low = 1-2)
      const shakes =
        ball === 'master-ball'
          ? 3
          : Math.random() < probability
            ? 3
            : Math.floor(Math.random() * 2) + 1

      let currentShake = 0
      shakeIntervalRef.current = setInterval(() => {
        currentShake++
        setShakeCount(currentShake)
        if (currentShake >= shakes) {
          if (shakeIntervalRef.current) {
            clearInterval(shakeIntervalRef.current)
            shakeIntervalRef.current = null
          }
          resolveTimeoutRef.current = setTimeout(() => {
            if (success) {
              setCatchState('caught')
              setShowNickname(true)
            } else {
              setCatchState('escaped')
            }
          }, 600)
        }
      }, 700)
    }, 1000)
  }

  const handleNicknameConfirm = (nicknameInput: string) => {
    const currentArea = staticAreas.find((a) => a.id === currentAreaId)
    const caughtAreaName = currentArea ? currentArea.name : 'Route'

    catchPokemon({
      speciesId: activeEncounter.speciesId,
      nickname: nicknameInput,
      caughtArea: caughtAreaName,
      ball: selectedBall,
      isShiny: activeEncounter.isShiny,
    })

    // Clear encounter state and return to map
    setActiveEncounter(null)
    navigate('/')
  }

  const handleRun = () => {
    setActiveEncounter(null)
    navigate('/')
  }

  const pokemonSprite = activeEncounter.isShiny
    ? pokemon?.sprites?.front_shiny
    : pokemon?.sprites?.front_default

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-6 bg-radial-gradient(from-stone-900_to-background) scanlines relative">
      <Helmet>
        <title>Wild Encounter — Pokédex Bronze</title>
        <meta
          name="description"
          content="A wild Pokémon appeared! Throw a Poké Ball to catch it."
        />
      </Helmet>

      {/* Top action bar */}
      <div className="flex justify-between items-center w-full z-10">
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface/60 border border-accent/20 rounded-lg text-muted hover:text-foreground hover:border-accent/65 hover:bg-surface/80 transition-all cursor-pointer min-h-[44px]"
          type="button"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-semibold uppercase tracking-wider">Run</span>
        </button>
      </div>

      {/* Main battlefield layout */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 gap-6 relative">
        {pokemon && (
          <BattleHUD
            name={activeEncounter.name}
            level={activeEncounter.level}
            types={pokemon.types.map((t) => t.type.name)}
            isShiny={activeEncounter.isShiny}
          />
        )}

        {/* Visual Sprite + Throw states */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {catchState === 'idle' && pokemonSprite && (
            <img
              src={pokemonSprite}
              alt="wild-pokemon"
              className="w-40 h-40 object-contain animate-[pulse_3s_infinite]"
              loading="lazy"
              width={160}
              height={160}
            />
          )}

          {catchState === 'throwing' && (
            <div className="animate-[bounce_0.8s_infinite] scale-150">
              <BallIcon type={selectedBall} className="w-12 h-12" />
            </div>
          )}

          {catchState === 'shaking' && (
            <div className="animate-[bounce_0.4s_infinite] scale-150 relative">
              <BallIcon type={selectedBall} className="w-12 h-12 animate-pulse" />
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-mono text-muted">
                {'.'.repeat(shakeCount)}
              </span>
            </div>
          )}

          {catchState === 'caught' && (
            <div className="scale-120 animate-[pulse_1s_infinite] shadow-[0_0_20px_#ffd700] rounded-full p-2 bg-highlight/10 border border-highlight">
              <BallIcon type={selectedBall} className="w-12 h-12" />
            </div>
          )}

          {catchState === 'escaped' && (
            <div className="text-center">
              <span className="text-sm font-bold text-red-400 block mb-2">Broke free!</span>
              <button
                onClick={() => setCatchState('idle')}
                className="px-4 py-2.5 bg-accent text-background font-bold rounded-lg border border-highlight/50 cursor-pointer hover:bg-highlight hover:scale-102 transition-all duration-300 min-h-[44px]"
                type="button"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ball Picker Panel */}
      <div className="flex justify-center z-10">
        {catchState === 'idle' && (
          <BallPicker onSelect={handleCatchAttempt} disabled={catchState !== 'idle'} />
        )}
      </div>

      {/* Gotcha Nickname Overlay */}
      {showNickname && (
        <NicknameModal speciesName={activeEncounter.name} onConfirm={handleNicknameConfirm} />
      )}
    </div>
  )
}
