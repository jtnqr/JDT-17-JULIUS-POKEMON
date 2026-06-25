import { useQuery } from '@tanstack/react-query'

const API_BASE = 'https://pokeapi.co/v2'

export interface EncounterMethodRate {
  encounter_method: { name: string }
  version_details: Array<{
    rate: number
    version: { name: string }
  }>
}

export interface PokemonEncounter {
  pokemon: {
    name: string
    url: string
  }
  version_details: Array<{
    version: { name: string }
    max_chance: number
    encounter_details: Array<{
      min_level: number
      max_level: number
      chance: number
      method: { name: string }
      condition_values: Array<{ name: string }>
    }>
  }>
}

export interface LocationAreaDetail {
  id: number
  name: string
  pokemon_encounters: PokemonEncounter[]
}

export function useLocationArea(areaName: string) {
  return useQuery<LocationAreaDetail>({
    queryKey: ['location-area', areaName],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/location-area/${areaName}`)
      if (!res.ok) throw new Error(`Failed to fetch encounters for area: ${areaName}`)
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}
