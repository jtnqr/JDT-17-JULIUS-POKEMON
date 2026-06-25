const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-stone-500 text-stone-100',
  fire: 'bg-orange-500 text-orange-100',
  water: 'bg-blue-500 text-blue-100',
  electric: 'bg-yellow-500 text-yellow-950',
  grass: 'bg-green-500 text-green-100',
  ice: 'bg-cyan-400 text-cyan-950',
  fighting: 'bg-red-600 text-red-100',
  poison: 'bg-purple-500 text-purple-100',
  ground: 'bg-amber-600 text-amber-100',
  flying: 'bg-indigo-400 text-indigo-100',
  psychic: 'bg-pink-500 text-pink-100',
  bug: 'bg-lime-600 text-lime-100',
  rock: 'bg-yellow-700 text-yellow-100',
  ghost: 'bg-violet-700 text-violet-100',
  dragon: 'bg-indigo-700 text-indigo-100',
  dark: 'bg-stone-800 text-stone-100',
  steel: 'bg-zinc-500 text-zinc-100',
  fairy: 'bg-rose-400 text-rose-950',
}

export function TypeBadge({ type }: { type: string }) {
  const lowerType = type.toLowerCase()
  const colorClass = TYPE_COLORS[lowerType] || 'bg-stone-600 text-stone-100'
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-md border border-white/10 uppercase tracking-wider ${colorClass}`}
    >
      {type}
    </span>
  )
}
