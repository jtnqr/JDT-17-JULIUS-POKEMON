import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useCollectionStore } from '@/stores/collectionStore'

export default function PartyPage() {
  const bag = useCollectionStore((s) => s.bag)
  const addToParty = useCollectionStore((s) => s.addToParty)
  const removeFromParty = useCollectionStore((s) => s.removeFromParty)

  // Derived party array of length 6
  const partySlots = Array.from({ length: 6 }, (_, i) => {
    return bag.find((p) => p.partySlot === i + 1) || null
  })

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)

  const handleSelectSlot = (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex)
  }

  const handleAssignToSlot = (uid: string) => {
    if (selectedSlotIndex !== null) {
      addToParty(uid, selectedSlotIndex + 1)
      setSelectedSlotIndex(null)
    }
  }

  const availableBag = bag.filter((p) => p.partySlot === null)

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 scanlines">
      <Helmet>
        <title>My Party — Pokédex Bronze</title>
        <meta name="description" content="Manage your active party of up to 6 Pokémon." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-wider text-highlight mb-2 font-heading">
          ACTIVE PARTY
        </h1>
        <p className="text-muted text-sm mb-8">
          Maintain up to 6 active Pokémon. Select a slot to choose from bag.
        </p>

        {/* 6 Party Slots Grid - 2 cols on mobile, 3 cols on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          {partySlots.map((pokemon, idx) => {
            const isSelected = selectedSlotIndex === idx
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: slot index is stable (always 6 slots)
                key={idx}
                className={`bg-surface/50 border rounded-2xl relative flex flex-col justify-between overflow-hidden aspect-square min-h-[160px] transition-all ${
                  isSelected
                    ? 'border-highlight ring-1 ring-highlight bg-surface/90 shadow-lg'
                    : 'border-accent/30'
                }`}
              >
                {/* Top Content Body */}
                <div className="p-4 pb-2 flex-1 flex flex-col items-center justify-center relative w-full">
                  <div className="absolute top-2 left-2 text-[10px] sm:text-xs font-black text-muted uppercase">
                    Slot #{idx + 1}
                  </div>

                  {pokemon ? (
                    <div className="flex flex-col items-center mt-2 w-full">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesId}.png`}
                        alt={pokemon.nickname}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                        width={64}
                        height={64}
                      />
                      <span className="font-bold text-sm text-foreground truncate max-w-full text-center mt-1">
                        {pokemon.nickname}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectSlot(idx)}
                      className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-1.5 text-muted hover:text-highlight cursor-pointer focus:outline-none"
                      aria-label={`Empty Slot #${idx + 1}`}
                    >
                      <div className="w-8 h-8 rounded-full border border-dashed border-muted flex items-center justify-center text-lg leading-none">
                        +
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        EMPTY SLOT
                      </span>
                    </button>
                  )}
                </div>

                {/* Bottom Action buttons for filled slots */}
                {pokemon && (
                  <div className="flex border-t border-accent/20 shrink-0 w-full bg-background/40">
                    <button
                      onClick={() => handleSelectSlot(idx)}
                      className="flex-1 py-2 text-xs font-bold text-highlight hover:text-foreground hover:bg-accent/20 transition-all border-r border-accent/20 cursor-pointer min-h-[36px] flex items-center justify-center"
                      type="button"
                    >
                      REPLACE
                    </button>
                    <button
                      onClick={() => removeFromParty(pokemon.uid)}
                      className="flex-1 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all cursor-pointer min-h-[36px] flex items-center justify-center"
                      type="button"
                    >
                      REMOVE
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Drawer selecting bag pokemon if slot chosen */}
        {selectedSlotIndex !== null && (
          <div className="bg-surface border-2 border-highlight rounded-2xl p-6 shadow-xl animate-[pulse_3s_infinite]">
            <h2 className="text-sm font-bold text-highlight uppercase mb-4">
              Choose Pokémon for Slot #{selectedSlotIndex + 1}
            </h2>
            {availableBag.length === 0 ? (
              <p className="text-muted text-sm">
                No available Pokémon in your Bag. Catch more or clear other slots.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {availableBag.map((p) => (
                  <button
                    key={p.uid}
                    onClick={() => handleAssignToSlot(p.uid)}
                    className="p-3 bg-background border border-accent/20 hover:border-accent hover:bg-surface/50 rounded-xl flex flex-col items-center transition-all cursor-pointer min-h-[80px]"
                    type="button"
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.speciesId}.png`}
                      alt={p.nickname}
                      className="w-12 h-12 object-contain"
                      width={48}
                      height={48}
                    />
                    <span className="text-sm font-bold text-foreground truncate max-w-full">
                      {p.nickname}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedSlotIndex(null)}
              className="mt-4 text-sm font-bold text-muted underline cursor-pointer min-h-[44px]"
              type="button"
            >
              Cancel Selection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
