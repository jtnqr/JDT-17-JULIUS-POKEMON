import type { CaughtPokemon } from '@/stores/collectionStore'

export interface TrainerBadge {
  id: string
  name: string
  description: string
  checkUnlocked: (state: { bag: CaughtPokemon[]; visitedAreaIds: string[] }) => boolean
}

export const TRAINER_BADGES: TrainerBadge[] = [
  {
    id: 'bronze-recruit',
    name: 'Bronze Recruit',
    description: 'Catch your first Pokémon.',
    checkUnlocked: ({ bag }) => bag.length >= 1,
  },
  {
    id: 'route-pioneer',
    name: 'Route Pioneer',
    description: 'Visit at least 5 different areas.',
    checkUnlocked: ({ visitedAreaIds }) => visitedAreaIds.length >= 5,
  },
  {
    id: 'collection-expert',
    name: 'Collection Expert',
    description: 'Catch 15 unique species (Unlocks Shiny Charm!).',
    checkUnlocked: ({ bag }) => new Set(bag.map((p) => p.speciesId)).size >= 15,
  },
  {
    id: 'shiny-hunter',
    name: 'Shiny Hunter',
    description: 'Catch a Shiny Pokémon.',
    checkUnlocked: ({ bag }) => bag.some((p) => p.isShiny),
  },
  {
    id: 'master-catcher',
    name: 'Master Catcher',
    description: 'Catch a Pokémon with a Master Ball.',
    checkUnlocked: ({ bag }) => bag.some((p) => p.ball === 'master-ball'),
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Catch 30 unique species.',
    checkUnlocked: ({ bag }) => new Set(bag.map((p) => p.speciesId)).size >= 30,
  },
]
