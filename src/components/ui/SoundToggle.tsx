import { Volume2, VolumeX } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

export function SoundToggle() {
  const { soundEnabled, toggleSound } = useSettingsStore()

  return (
    <button
      onClick={toggleSound}
      className="p-2 rounded-lg bg-surface border border-accent/30 text-foreground hover:border-accent hover:text-highlight transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Toggle Cry Audio"
      type="button"
    >
      {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  )
}
