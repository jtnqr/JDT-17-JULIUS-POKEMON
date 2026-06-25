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

        {/* 6 Party Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          {partySlots.map((pokemon, idx) => {
            const isSelected = selectedSlotIndex === idx
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: slot index is stable (always 6 slots)
                key={idx}
                className={`p-4 bg-surface/50 border rounded-2xl relative flex flex-col items-center justify-center min-h-[140px] transition-all ${
                  isSelected
                    ? 'border-highlight ring-1 ring-highlight bg-surface/90 shadow-lg'
                    : 'border-accent/30'
                }`}
              >
                <div className="absolute top-2 left-2 text-sm font-black text-muted uppercase">
                  Slot #{idx + 1}
                </div>

                {pokemon ? (
                  <div className="flex flex-col items-center w-full mt-4">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesId}.png`}
                      alt={pokemon.nickname}
                      className="w-16 h-16 object-contain"
                    />
                    <span className="font-bold text-sm text-foreground truncate max-w-full">
                      {pokemon.nickname}
                    </span>
                    <div className="flex gap-2 mt-3 z-10">
                      <button
                        onClick={() => handleSelectSlot(idx)}
                        className="text-sm font-extrabold text-highlight hover:text-white bg-accent/20 px-3 py-1.5 rounded-md border border-accent/30 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                        type="button"
                      >
                        REPLACE
                      </button>
                      <button
                        onClick={() => removeFromParty(pokemon.uid)}
                        className="text-sm font-extrabold text-red-400 hover:text-red-300 bg-red-950/40 px-3 py-1.5 rounded-md border border-red-500/20 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                        type="button"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectSlot(idx)}
                    className="w-full h-full min-h-[100px] flex items-center justify-center text-sm text-muted font-bold font-mono hover:text-highlight cursor-pointer focus:outline-none"
                  >
                    EMPTY SLOT
                  </button>
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
