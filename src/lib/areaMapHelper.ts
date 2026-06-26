type BiomeColors = { from: string; to: string }

const BIOME_COLORS: Record<string, BiomeColors> = {
  grassland: { from: 'from-emerald-950', to: 'to-emerald-800' },
  forest: { from: 'from-green-950', to: 'to-emerald-900' },
  desert: { from: 'from-amber-950', to: 'to-yellow-800' },
  mountain: { from: 'from-stone-900', to: 'to-stone-700' },
  cave: { from: 'from-zinc-950', to: 'to-zinc-800' },
  water: { from: 'from-cyan-950', to: 'to-cyan-800' },
  city: { from: 'from-slate-900', to: 'to-slate-800' },
  tower: { from: 'from-indigo-950', to: 'to-indigo-900' },
  ice: { from: 'from-sky-950', to: 'to-sky-200' },
  volcanic: { from: 'from-red-950', to: 'to-orange-950' },
}

const TOD_TINT: Record<'morning' | 'day' | 'night', string> = {
  morning: 'after:bg-amber-500/10',
  day: 'after:bg-sky-500/5',
  night: 'after:bg-indigo-950/40',
}

export function getBiomeStyles(biome: string, timeOfDay: 'morning' | 'day' | 'night'): string {
  const { from, to } = BIOME_COLORS[biome] ?? BIOME_COLORS.grassland
  const tint = TOD_TINT[timeOfDay]
  return `bg-gradient-to-b ${from} ${to} relative after:absolute after:inset-0 ${tint} after:pointer-events-none`
}
