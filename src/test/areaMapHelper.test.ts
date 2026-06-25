import { describe, expect, it } from 'vitest'
import { getBiomeStyles } from '../lib/areaMapHelper'

describe('getBiomeStyles', () => {
  it('returns default forest/grassland styles', () => {
    const styles = getBiomeStyles('grassland', 'day')
    expect(styles).toContain('from-emerald-950')
    expect(styles).toContain('to-emerald-800')
    expect(styles).toContain('after:bg-sky-500/5')
  })

  it('handles desert biome with custom gradient', () => {
    const styles = getBiomeStyles('desert', 'morning')
    expect(styles).toContain('from-amber-950')
    expect(styles).toContain('to-yellow-800')
    expect(styles).toContain('after:bg-amber-500/10')
  })

  it('handles cave biome with night tint', () => {
    const styles = getBiomeStyles('cave', 'night')
    expect(styles).toContain('from-zinc-950')
    expect(styles).toContain('to-zinc-800')
    expect(styles).toContain('after:bg-indigo-950/40')
  })

  it('handles mountain biome', () => {
    const styles = getBiomeStyles('mountain', 'day')
    expect(styles).toContain('from-stone-900')
    expect(styles).toContain('to-stone-700')
  })

  it('handles water biome', () => {
    const styles = getBiomeStyles('water', 'day')
    expect(styles).toContain('from-cyan-950')
    expect(styles).toContain('to-cyan-800')
  })

  it('handles city biome', () => {
    const styles = getBiomeStyles('city', 'day')
    expect(styles).toContain('from-slate-900')
    expect(styles).toContain('to-slate-800')
  })

  it('handles tower biome', () => {
    const styles = getBiomeStyles('tower', 'day')
    expect(styles).toContain('from-indigo-950')
    expect(styles).toContain('to-indigo-900')
  })

  it('handles ice biome', () => {
    const styles = getBiomeStyles('ice', 'day')
    expect(styles).toContain('from-sky-950')
    expect(styles).toContain('to-sky-200')
  })

  it('handles volcanic biome', () => {
    const styles = getBiomeStyles('volcanic', 'day')
    expect(styles).toContain('from-red-950')
    expect(styles).toContain('to-orange-950')
  })

  it('handles forest biome', () => {
    const styles = getBiomeStyles('forest', 'day')
    expect(styles).toContain('from-green-950')
    expect(styles).toContain('to-emerald-900')
  })
})
