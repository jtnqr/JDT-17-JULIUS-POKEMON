import { describe, expect, it } from 'vitest'
import { calculateCatchChance } from '../lib/catchCalc'

describe('calculateCatchChance', () => {
  it('handles Master Ball 100% guarantee', () => {
    expect(calculateCatchChance(50, 100, 50)).toBe(1.0)
  })

  it('caps max rate at 95%', () => {
    expect(calculateCatchChance(255, 2.0, 5)).toBe(0.95)
  })

  it('floors min rate at 5%', () => {
    expect(calculateCatchChance(3, 0.5, 75)).toBe(0.05)
  })

  it('boosts catch rate for lower level (level <= 10)', () => {
    // For level 5, areaModifier should be 1.2
    // p = (100 / 255) * 1.5 * 1.2 = 0.3921568 * 1.5 * 1.2 = 0.70588
    expect(calculateCatchChance(100, 1.5, 5)).toBeCloseTo(0.70588, 4)
  })

  it('penalizes catch rate for higher level (level >= 70)', () => {
    // For level 80, areaModifier should be 0.8
    // p = (100 / 255) * 1.5 * 0.8 = 0.3921568 * 1.5 * 0.8 = 0.470588
    expect(calculateCatchChance(100, 1.5, 80)).toBeCloseTo(0.470588, 4)
  })

  it('calculates dynamic level modifier between 10 and 70', () => {
    // For level 40, areaModifier = 1.2 - ((40 - 10) / 60) * 0.4 = 1.2 - 0.5 * 0.4 = 1.0
    // p = (100 / 255) * 1.5 * 1.0 = 0.588235
    expect(calculateCatchChance(100, 1.5, 40)).toBeCloseTo(0.588235, 4)
  })

  it('handles capture rate of 0', () => {
    // Even with rate 0, should floor at 0.05
    expect(calculateCatchChance(0, 1.5, 30)).toBe(0.05)
  })
})
