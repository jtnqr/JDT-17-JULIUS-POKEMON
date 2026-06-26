export const PHYSICAL_TYPES = new Set([
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
])

export const SPECIAL_TYPES = new Set([
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
])

export function getAttackCategory(type: string): 'Physical' | 'Special' {
  const t = type.toLowerCase()
  if (PHYSICAL_TYPES.has(t)) return 'Physical'
  return 'Special'
}
