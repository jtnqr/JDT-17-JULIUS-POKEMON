import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from '@/lib/idb-storage'

interface SettingsState {
  soundEnabled: boolean
  toggleSound: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'pokemon-settings',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
