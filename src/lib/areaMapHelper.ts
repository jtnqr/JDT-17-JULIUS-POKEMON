export function getBiomeStyles(biome: string, timeOfDay: 'morning' | 'day' | 'night'): string {
  // Gradients matching biomes tinted by Time of Day
  let colorFrom = 'from-emerald-950'
  let colorTo = 'to-emerald-800'

  if (biome === 'desert') {
    colorFrom = 'from-amber-950'
    colorTo = 'to-yellow-800'
  } else if (biome === 'mountain') {
    colorFrom = 'from-stone-900'
    colorTo = 'to-stone-700'
  } else if (biome === 'cave') {
    colorFrom = 'from-zinc-950'
    colorTo = 'to-zinc-800'
  } else if (biome === 'water') {
    colorFrom = 'from-cyan-950'
    colorTo = 'to-cyan-800'
  } else if (biome === 'city') {
    colorFrom = 'from-slate-900'
    colorTo = 'to-slate-800'
  } else if (biome === 'tower') {
    colorFrom = 'from-indigo-950'
    colorTo = 'to-indigo-900'
  } else if (biome === 'ice') {
    colorFrom = 'from-sky-950'
    colorTo = 'to-sky-200'
  } else if (biome === 'volcanic') {
    colorFrom = 'from-red-950'
    colorTo = 'to-orange-950'
  } else if (biome === 'forest') {
    colorFrom = 'from-green-950'
    colorTo = 'to-emerald-900'
  }

  // Time of Day Tint Overlay
  let tint = 'after:bg-amber-500/10' // morning
  if (timeOfDay === 'day') tint = 'after:bg-sky-500/5'
  if (timeOfDay === 'night') tint = 'after:bg-indigo-950/40'

  return `bg-gradient-to-b ${colorFrom} ${colorTo} relative after:absolute after:inset-0 ${tint} after:pointer-events-none`
}
