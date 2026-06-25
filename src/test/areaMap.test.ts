import { describe, expect, it } from 'vitest'
import { type AreaNode, staticAreas } from '../lib/areaMap'

describe('areaMap static configuration', () => {
  it('contains Pallet Town as root area', () => {
    const pallet = staticAreas.find((a) => a.id === 'pallet-town')
    expect(pallet).toBeDefined()
    expect(pallet?.prerequisites.length).toBe(0)
  })

  it('maps all 10 biomes across Kanto/Johto routes', () => {
    const biomes = new Set(staticAreas.map((a) => a.biome))
    expect(biomes.size).toBe(10)

    // Explicitly verify the expected 10 biomes exist in the staticAreas
    const expectedBiomes: AreaNode['biome'][] = [
      'forest',
      'grassland',
      'mountain',
      'cave',
      'water',
      'city',
      'tower',
      'desert',
      'ice',
      'volcanic',
    ]
    for (const biome of expectedBiomes) {
      expect(biomes.has(biome)).toBe(true)
    }
  })

  it('has valid coordinates (0-100) and minLevel <= maxLevel for all areas', () => {
    for (const area of staticAreas) {
      expect(area.coords.x).toBeGreaterThanOrEqual(0)
      expect(area.coords.x).toBeLessThanOrEqual(100)
      expect(area.coords.y).toBeGreaterThanOrEqual(0)
      expect(area.coords.y).toBeLessThanOrEqual(100)
      expect(area.minLevel).toBeLessThanOrEqual(area.maxLevel)
    }
  })

  it('has valid prerequisites that exist in the map', () => {
    const areaIds = new Set(staticAreas.map((a) => a.id))
    for (const area of staticAreas) {
      for (const prereq of area.prerequisites) {
        expect(areaIds.has(prereq)).toBe(true)
      }
    }
  })
})
