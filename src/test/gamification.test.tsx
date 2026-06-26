import { describe, expect, it } from 'vitest'
import { TRAINER_BADGES } from '../lib/badges'

describe('Trainer Badges Logic', () => {
  it('unlocks Bronze Recruit badge when player has caught at least 1 Pokemon', () => {
    const badge = TRAINER_BADGES.find((b) => b.id === 'bronze-recruit')
    expect(badge).toBeDefined()

    // Locked state
    expect(badge?.checkUnlocked({ bag: [], visitedAreaIds: [] })).toBe(false)

    // Unlocked state
    expect(
      badge?.checkUnlocked({
        bag: [
          {
            uid: '1',
            speciesId: 25,
            nickname: 'Pikachu',
            caughtAt: '',
            caughtArea: '',
            ball: 'poke-ball',
            isShiny: false,
            partySlot: null,
          },
        ],
        visitedAreaIds: [],
      })
    ).toBe(true)
  })

  it('unlocks Route Pioneer badge when player has visited 5 or more areas', () => {
    const badge = TRAINER_BADGES.find((b) => b.id === 'route-pioneer')
    expect(badge).toBeDefined()

    // Locked state
    expect(badge?.checkUnlocked({ bag: [], visitedAreaIds: ['1', '2', '3', '4'] })).toBe(false)

    // Unlocked state
    expect(badge?.checkUnlocked({ bag: [], visitedAreaIds: ['1', '2', '3', '4', '5'] })).toBe(true)
  })

  it('unlocks Collection Expert badge when player has caught 15 or more unique species', () => {
    const badge = TRAINER_BADGES.find((b) => b.id === 'collection-expert')
    expect(badge).toBeDefined()

    // 14 unique species
    const bag14 = Array.from({ length: 14 }, (_, i) => ({
      uid: String(i),
      speciesId: i + 1,
      nickname: '',
      caughtAt: '',
      caughtArea: '',
      ball: 'poke-ball' as const,
      isShiny: false,
      partySlot: null,
    }))

    // 15 total but duplicates (only 14 unique)
    const bagDuplicate = [
      ...bag14,
      {
        uid: '15',
        speciesId: 1,
        nickname: '',
        caughtAt: '',
        caughtArea: '',
        ball: 'poke-ball' as const,
        isShiny: false,
        partySlot: null,
      },
    ]
    expect(badge?.checkUnlocked({ bag: bagDuplicate, visitedAreaIds: [] })).toBe(false)

    // 15 unique species
    const bag15 = Array.from({ length: 15 }, (_, i) => ({
      uid: String(i),
      speciesId: i + 1,
      nickname: '',
      caughtAt: '',
      caughtArea: '',
      ball: 'poke-ball' as const,
      isShiny: false,
      partySlot: null,
    }))
    expect(badge?.checkUnlocked({ bag: bag15, visitedAreaIds: [] })).toBe(true)
  })

  it('unlocks Shiny Hunter badge when player has caught at least one shiny', () => {
    const badge = TRAINER_BADGES.find((b) => b.id === 'shiny-hunter')
    expect(badge).toBeDefined()

    // Locked state
    expect(
      badge?.checkUnlocked({
        bag: [
          {
            uid: '1',
            speciesId: 25,
            nickname: '',
            caughtAt: '',
            caughtArea: '',
            ball: 'poke-ball',
            isShiny: false,
            partySlot: null,
          },
        ],
        visitedAreaIds: [],
      })
    ).toBe(false)

    // Unlocked state
    expect(
      badge?.checkUnlocked({
        bag: [
          {
            uid: '1',
            speciesId: 25,
            nickname: '',
            caughtAt: '',
            caughtArea: '',
            ball: 'poke-ball',
            isShiny: true,
            partySlot: null,
          },
        ],
        visitedAreaIds: [],
      })
    ).toBe(true)
  })

  it('unlocks Master Catcher badge when a Master Ball is used', () => {
    const badge = TRAINER_BADGES.find((b) => b.id === 'master-catcher')
    expect(badge).toBeDefined()

    // Locked state
    expect(
      badge?.checkUnlocked({
        bag: [
          {
            uid: '1',
            speciesId: 25,
            nickname: '',
            caughtAt: '',
            caughtArea: '',
            ball: 'ultra-ball',
            isShiny: false,
            partySlot: null,
          },
        ],
        visitedAreaIds: [],
      })
    ).toBe(false)

    // Unlocked state
    expect(
      badge?.checkUnlocked({
        bag: [
          {
            uid: '1',
            speciesId: 25,
            nickname: '',
            caughtAt: '',
            caughtArea: '',
            ball: 'master-ball',
            isShiny: false,
            partySlot: null,
          },
        ],
        visitedAreaIds: [],
      })
    ).toBe(true)
  })
})
