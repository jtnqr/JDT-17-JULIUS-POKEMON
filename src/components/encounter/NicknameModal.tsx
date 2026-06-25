import type React from 'react'
import { useState } from 'react'

interface NicknameModalProps {
  speciesName: string
  onConfirm: (nickname: string) => void
}

export function NicknameModal({ speciesName, onConfirm }: NicknameModalProps) {
  const [nickname, setNickname] = useState(
    speciesName.charAt(0).toUpperCase() + speciesName.slice(1)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(nickname.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm scanlines">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border-2 border-accent rounded-2xl p-6 shadow-[0_0_30px_rgba(205,127,50,0.3)]"
      >
        <h3 className="text-lg font-black tracking-wider text-highlight text-center mb-4">
          GOTCHA!
        </h3>
        <p className="text-xs text-muted mb-4 text-center">
          Give your newly caught Pokémon a nickname:
        </p>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={15}
          className="w-full px-4 py-2 bg-background border border-accent/40 rounded-xl text-foreground text-center font-bold tracking-wide focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight mb-6"
          placeholder="Nickname"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-accent text-background font-extrabold rounded-xl border border-highlight/50 hover:bg-highlight hover:scale-102 transition-all duration-300 cursor-pointer"
        >
          CONFIRM NICKNAME
        </button>
      </form>
    </div>
  )
}
