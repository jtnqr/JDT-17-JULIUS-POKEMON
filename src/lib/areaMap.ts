export type Region =
  | 'Kanto'
  | 'Johto'
  | 'Hoenn'
  | 'Sinnoh'
  | 'Unova'
  | 'Kalos'
  | 'Alola'
  | 'Galar'
  | 'Paldea'

export interface AreaNode {
  id: string
  name: string
  region: Region
  biome:
    | 'forest'
    | 'grassland'
    | 'mountain'
    | 'cave'
    | 'water'
    | 'city'
    | 'tower'
    | 'desert'
    | 'ice'
    | 'volcanic'
  minLevel: number
  maxLevel: number
  prerequisites: string[]
  coords: { x: number; y: number }
  locationAreaName: string // PokéAPI location-area identifier
}

export const REGION_ORDER: Region[] = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea',
]

export const staticAreas: AreaNode[] = [
  {
    id: 'pallet-town',
    name: 'Pallet Town',
    region: 'Kanto',
    biome: 'city',
    minLevel: 2,
    maxLevel: 5,
    prerequisites: [],
    coords: { x: 20, y: 85 },
    locationAreaName: 'pallet-town-area',
  },
  {
    id: 'kanto-route-1',
    name: 'Route 1',
    region: 'Kanto',
    biome: 'grassland',
    minLevel: 2,
    maxLevel: 5,
    prerequisites: ['pallet-town'],
    coords: { x: 20, y: 70 },
    locationAreaName: 'kanto-route-1-area',
  },
  {
    id: 'viridian-city',
    name: 'Viridian City',
    region: 'Kanto',
    biome: 'city',
    minLevel: 3,
    maxLevel: 6,
    prerequisites: ['kanto-route-1'],
    coords: { x: 20, y: 55 },
    locationAreaName: 'viridian-city-area',
  },
  {
    id: 'kanto-route-2',
    name: 'Route 2',
    region: 'Kanto',
    biome: 'grassland',
    minLevel: 3,
    maxLevel: 7,
    prerequisites: ['viridian-city'],
    coords: { x: 20, y: 40 },
    locationAreaName: 'kanto-route-2-south-towards-viridian-city',
  },
  {
    id: 'viridian-forest',
    name: 'Viridian Forest',
    region: 'Kanto',
    biome: 'forest',
    minLevel: 3,
    maxLevel: 9,
    prerequisites: ['kanto-route-2'],
    coords: { x: 20, y: 25 },
    locationAreaName: 'viridian-forest-area',
  },
  {
    id: 'pewter-city',
    name: 'Pewter City',
    region: 'Kanto',
    biome: 'city',
    minLevel: 6,
    maxLevel: 10,
    prerequisites: ['viridian-forest'],
    coords: { x: 35, y: 15 },
    locationAreaName: 'pewter-city-area',
  },
  {
    id: 'kanto-route-3',
    name: 'Route 3',
    region: 'Kanto',
    biome: 'mountain',
    minLevel: 6,
    maxLevel: 12,
    prerequisites: ['pewter-city'],
    coords: { x: 50, y: 15 },
    locationAreaName: 'kanto-route-3-area',
  },
  {
    id: 'mt-moon',
    name: 'Mt. Moon',
    region: 'Kanto',
    biome: 'cave',
    minLevel: 8,
    maxLevel: 15,
    prerequisites: ['kanto-route-3'],
    coords: { x: 65, y: 15 },
    locationAreaName: 'mt-moon-1f',
  },
  {
    id: 'cerulean-city',
    name: 'Cerulean City',
    region: 'Kanto',
    biome: 'city',
    minLevel: 10,
    maxLevel: 18,
    prerequisites: ['mt-moon'],
    coords: { x: 80, y: 15 },
    locationAreaName: 'cerulean-city-area',
  },
  {
    id: 'kanto-route-9',
    name: 'Route 9',
    region: 'Kanto',
    biome: 'mountain',
    minLevel: 12,
    maxLevel: 20,
    prerequisites: ['cerulean-city'],
    coords: { x: 80, y: 30 },
    locationAreaName: 'kanto-route-9-area',
  },
  {
    id: 'rock-tunnel',
    name: 'Rock Tunnel',
    region: 'Kanto',
    biome: 'cave',
    minLevel: 15,
    maxLevel: 25,
    prerequisites: ['kanto-route-9'],
    coords: { x: 80, y: 45 },
    locationAreaName: 'rock-tunnel-1f',
  },
  {
    id: 'lavender-town',
    name: 'Lavender Town',
    region: 'Kanto',
    biome: 'city',
    minLevel: 18,
    maxLevel: 25,
    prerequisites: ['rock-tunnel'],
    coords: { x: 80, y: 60 },
    locationAreaName: 'lavender-town-area',
  },
  {
    id: 'pokemon-tower',
    name: 'Pokémon Tower',
    region: 'Kanto',
    biome: 'tower',
    minLevel: 20,
    maxLevel: 30,
    prerequisites: ['lavender-town'],
    coords: { x: 90, y: 60 },
    locationAreaName: 'pokemon-tower-1f',
  },
  {
    id: 'kanto-route-12',
    name: 'Route 12',
    region: 'Kanto',
    biome: 'water',
    minLevel: 22,
    maxLevel: 30,
    prerequisites: ['lavender-town'],
    coords: { x: 80, y: 75 },
    locationAreaName: 'kanto-route-12-area',
  },
  {
    id: 'fuchsia-city',
    name: 'Fuchsia City',
    region: 'Kanto',
    biome: 'city',
    minLevel: 25,
    maxLevel: 35,
    prerequisites: ['kanto-route-12'],
    coords: { x: 60, y: 75 },
    locationAreaName: 'fuchsia-city-area',
  },
  {
    id: 'kanto-safari-zone',
    name: 'Safari Zone',
    region: 'Kanto',
    biome: 'forest',
    minLevel: 25,
    maxLevel: 35,
    prerequisites: ['fuchsia-city'],
    coords: { x: 60, y: 60 },
    locationAreaName: 'kanto-safari-zone-middle',
  },
  {
    id: 'seafoam-islands',
    name: 'Seafoam Islands',
    region: 'Kanto',
    biome: 'ice',
    minLevel: 30,
    maxLevel: 40,
    prerequisites: ['fuchsia-city'],
    coords: { x: 45, y: 85 },
    locationAreaName: 'seafoam-islands-1f',
  },
  {
    id: 'cinnabar-island',
    name: 'Cinnabar Island',
    region: 'Kanto',
    biome: 'volcanic',
    minLevel: 35,
    maxLevel: 45,
    prerequisites: ['seafoam-islands'],
    coords: { x: 30, y: 85 },
    locationAreaName: 'cinnabar-island-area',
  },
  {
    id: 'johto-route-45',
    name: 'Route 45',
    region: 'Johto',
    biome: 'desert',
    minLevel: 40,
    maxLevel: 50,
    prerequisites: ['cinnabar-island'],
    coords: { x: 45, y: 50 },
    locationAreaName: 'johto-route-45-area',
  },
]

export function getAreasByRegion(region: Region): AreaNode[] {
  return staticAreas.filter((a) => a.region === region)
}
