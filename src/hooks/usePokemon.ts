import { useQueries, useQuery } from '@tanstack/react-query'

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

export interface DexPokemon {
  id: number
  name: string
}

export interface EvolutionStage {
  id: number
  name: string
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

export function usePokedexList() {
  return useQuery<DexPokemon[]>({
    queryKey: ['pokedex-national'],
    queryFn: async (): Promise<DexPokemon[]> => {
      const res = await fetch(`${API_BASE}/pokemon-species?limit=151`)
      if (!res.ok) throw new Error('Failed to fetch pokedex list')
      const data = await res.json()
      return data.results.map((r: { name: string }, idx: number) => ({
        id: idx + 1,
        name: r.name,
      }))
    },
    staleTime: 1000 * 60 * 60 * 24, // cache for 1 day
  })
}

export function useBagDetails(speciesIds: number[]) {
  return useQueries({
    queries: speciesIds.map((id) => ({
      queryKey: ['pokemon', id],
      queryFn: async (): Promise<PokemonDetail> => {
        const res = await fetch(`${API_BASE}/pokemon/${id}`)
        if (!res.ok) throw new Error(`Failed to fetch pokemon details for ID ${id}`)
        return res.json()
      },
      staleTime: 1000 * 60 * 10,
    })),
  })
}

interface EvolutionChainNode {
  species: {
    name: string
    url: string
  }
  evolves_to: EvolutionChainNode[]
}

function flattenEvolutionChain(chainLink: EvolutionChainNode): EvolutionStage[] {
  const result: EvolutionStage[] = []

  function traverse(node: EvolutionChainNode | undefined) {
    if (!node) return
    const parts = node.species.url.split('/').filter(Boolean)
    const id = parseInt(parts[parts.length - 1], 10)
    result.push({
      id,
      name: node.species.name,
    })

    if (node.evolves_to && node.evolves_to.length > 0) {
      traverse(node.evolves_to[0])
    }
  }

  traverse(chainLink)
  return result
}

export function useEvolutionChain(url: string | undefined) {
  return useQuery<EvolutionStage[]>({
    queryKey: ['evolution-chain', url],
    queryFn: async (): Promise<EvolutionStage[]> => {
      if (!url) return []
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch evolution chain')
      const data = await res.json()
      return flattenEvolutionChain(data.chain)
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}
