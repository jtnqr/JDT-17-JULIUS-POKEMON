import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from '@/lib/idb-storage'

export interface CaughtPokemon {
  uid: string
  speciesId: number
  nickname: string
  caughtAt: string
  caughtArea: string
  ball: 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball'
  isShiny: boolean
  partySlot: number | null // 1 to 6, or null if in bag
}

interface CollectionState {
  bag: CaughtPokemon[]
  seenSpecies: number[]

  catchPokemon: (pokemon: Omit<CaughtPokemon, 'uid' | 'caughtAt' | 'partySlot'>) => string
  releasePokemon: (uid: string) => void
  addToParty: (uid: string, slot: number) => void // slot 1-6
  removeFromParty: (uid: string) => void
  nicknamePokemon: (uid: string, name: string) => void
  markSeen: (speciesId: number) => void
  resetCollection: () => void
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      bag: [],
      seenSpecies: [],

      catchPokemon: (pokemon) => {
        const uid = crypto.randomUUID()
        const newPokemon: CaughtPokemon = {
          ...pokemon,
          uid,
          caughtAt: new Date().toISOString(),
          partySlot: null,
        }

        const bag = get().bag
        const nextSeen = get().seenSpecies.includes(pokemon.speciesId)
          ? get().seenSpecies
          : [...get().seenSpecies, pokemon.speciesId]

        set({
          bag: [...bag, newPokemon],
          seenSpecies: nextSeen,
        })
        return uid
      },
      releasePokemon: (uid) =>
        set((state) => ({
          bag: state.bag.filter((p) => p.uid !== uid),
        })),
      addToParty: (uid, slot) =>
        set((state) => {
          // Clear anyone currently in this slot
          const clearedBag = state.bag.map((p) =>
            p.partySlot === slot ? { ...p, partySlot: null } : p
          )
          // Set new pokemon to this slot
          const updatedBag = clearedBag.map((p) => (p.uid === uid ? { ...p, partySlot: slot } : p))
          return { bag: updatedBag }
        }),
      removeFromParty: (uid) =>
        set((state) => ({
          bag: state.bag.map((p) => (p.uid === uid ? { ...p, partySlot: null } : p)),
        })),
      nicknamePokemon: (uid, name) =>
        set((state) => ({
          bag: state.bag.map((p) => (p.uid === uid ? { ...p, nickname: name } : p)),
        })),
      markSeen: (speciesId) => {
        const seen = get().seenSpecies
        if (!seen.includes(speciesId)) {
          set({ seenSpecies: [...seen, speciesId] })
        }
      },
      resetCollection: () =>
        set({
          bag: [],
          seenSpecies: [],
        }),
    }),
    {
      name: 'pokemon-collection',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
