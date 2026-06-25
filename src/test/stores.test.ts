import { beforeEach, describe, expect, it } from 'vitest'
import { idbStorage } from '@/lib/idb-storage'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

describe('idbStorage', () => {
  beforeEach(async () => {
    await idbStorage.removeItem('test-key')
  })

  it('performs getItem, setItem, and removeItem round-trip successfully', async () => {
    let val = await idbStorage.getItem('test-key')
    expect(val).toBeNull()

    await idbStorage.setItem('test-key', 'test-value')
    val = await idbStorage.getItem('test-key')
    expect(val).toBe('test-value')

    await idbStorage.removeItem('test-key')
    val = await idbStorage.getItem('test-key')
    expect(val).toBeNull()
  })
})

describe('Settings Store', () => {
  beforeEach(() => {
    // Reset to default
    if (!useSettingsStore.getState().soundEnabled) {
      useSettingsStore.getState().toggleSound()
    }
  })

  it('defaults soundEnabled to true and toggles correctly', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true)

    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(false)

    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(true)
  })
})

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  it('has correct defaults and resets correctly', () => {
    const store = useGameStore.getState()
    expect(store.currentAreaId).toBeNull()
    expect(store.visitedAreaIds).toEqual([])
    expect(store.unlockedAreaIds).toEqual(['pallet-town'])
    expect(store.timeOfDay).toBe('day')
    expect(store.activeEncounter).toBeNull()
  })

  it('unlocks Route 1 after Pallet Town visit', () => {
    const store = useGameStore.getState()
    expect(store.unlockedAreaIds).toContain('pallet-town')
    expect(store.unlockedAreaIds).not.toContain('kanto-route-1')

    useGameStore.getState().visitArea('pallet-town')
    expect(useGameStore.getState().visitedAreaIds).toContain('pallet-town')
    expect(useGameStore.getState().unlockedAreaIds).toContain('kanto-route-1')
  })

  it('unlocks Viridian City after Route 1 is visited', () => {
    useGameStore.getState().visitArea('pallet-town')
    useGameStore.getState().visitArea('kanto-route-1')
    expect(useGameStore.getState().unlockedAreaIds).toContain('viridian-city')
  })

  it('manages current area id, active encounter, and time of day', () => {
    const store = useGameStore.getState()

    store.setCurrentAreaId('pallet-town')
    expect(useGameStore.getState().currentAreaId).toBe('pallet-town')

    store.setTimeOfDay('night')
    expect(useGameStore.getState().timeOfDay).toBe('night')

    const encounter = {
      speciesId: 25,
      name: 'Pikachu',
      level: 5,
      isShiny: true,
    }
    store.setActiveEncounter(encounter)
    expect(useGameStore.getState().activeEncounter).toEqual(encounter)
  })
})

describe('Collection Store', () => {
  beforeEach(() => {
    useCollectionStore.getState().resetCollection()
  })

  it('manages collection state: catch, release, and party', () => {
    const store = useCollectionStore.getState()
    const uid = store.catchPokemon({
      speciesId: 25,
      nickname: 'Pikachu',
      caughtArea: 'Route 1',
      ball: 'poke-ball',
      isShiny: false,
    })

    expect(useCollectionStore.getState().bag.length).toBe(1)
    expect(useCollectionStore.getState().seenSpecies).toContain(25)

    // Add to party slot 1
    useCollectionStore.getState().addToParty(uid, 1)
    expect(useCollectionStore.getState().bag[0].partySlot).toBe(1)

    // Remove from party
    useCollectionStore.getState().removeFromParty(uid)
    expect(useCollectionStore.getState().bag[0].partySlot).toBeNull()

    // Release
    useCollectionStore.getState().releasePokemon(uid)
    expect(useCollectionStore.getState().bag.length).toBe(0)
  })

  it('handles nicknaming and seen tracking', () => {
    const store = useCollectionStore.getState()
    const uid = store.catchPokemon({
      speciesId: 4,
      nickname: 'Charmander',
      caughtArea: 'Oak Lab',
      ball: 'poke-ball',
      isShiny: false,
    })

    useCollectionStore.getState().nicknamePokemon(uid, 'Charry')
    expect(useCollectionStore.getState().bag[0].nickname).toBe('Charry')

    // Mark seen
    useCollectionStore.getState().markSeen(6)
    expect(useCollectionStore.getState().seenSpecies).toContain(6)
  })

  it('handles slot conflict when adding to party', () => {
    const store = useCollectionStore.getState()
    const uid1 = store.catchPokemon({
      speciesId: 1,
      nickname: 'Bulbasaur',
      caughtArea: 'Oak Lab',
      ball: 'poke-ball',
      isShiny: false,
    })
    const uid2 = store.catchPokemon({
      speciesId: 4,
      nickname: 'Charmander',
      caughtArea: 'Oak Lab',
      ball: 'poke-ball',
      isShiny: false,
    })

    // Add Bulbasaur to slot 1
    useCollectionStore.getState().addToParty(uid1, 1)
    expect(useCollectionStore.getState().bag.find((p) => p.uid === uid1)?.partySlot).toBe(1)

    // Add Charmander to slot 1 (should clear Bulbasaur)
    useCollectionStore.getState().addToParty(uid2, 1)
    expect(useCollectionStore.getState().bag.find((p) => p.uid === uid2)?.partySlot).toBe(1)
    expect(useCollectionStore.getState().bag.find((p) => p.uid === uid1)?.partySlot).toBeNull()
  })
})
