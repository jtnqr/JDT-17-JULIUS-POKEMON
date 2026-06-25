import { useQuery } from '@tanstack/react-query'

const API_BASE = 'https://pokeapi.co/v2'

export interface PokemonDetail {
  id: number
  name: string
  sprites: {
    front_default: string
    front_shiny: string
  }
  types: Array<{
    type: { name: string }
  }>
  stats: Array<{
    base_stat: number
    stat: { name: string }
  }>
  abilities: Array<{
    ability: { name: string }
    is_hidden: boolean
  }>
  cries: {
    latest: string
  }
}

export interface SpeciesDetail {
  id: number
  capture_rate: number
  flavor_text_entries: Array<{
    flavor_text: string
    language: { name: string }
  }>
  habitat: { name: string } | null
  evolution_chain: { url: string }
}

export function usePokemon(id: number | string) {
  return useQuery<PokemonDetail>({
    queryKey: ['pokemon', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pokemon/${id}`)
      if (!res.ok) throw new Error('Failed to fetch pokemon details')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}

export function usePokemonSpecies(id: number | string) {
  return useQuery<SpeciesDetail>({
    queryKey: ['pokemon-species', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pokemon-species/${id}`)
      if (!res.ok) throw new Error('Failed to fetch pokemon species details')
      return res.json()
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}
