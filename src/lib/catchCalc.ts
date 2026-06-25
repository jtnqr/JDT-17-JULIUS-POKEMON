/**
 * Calculates the catch probability for a given Pokémon based on its capture rate,
 * the Poké Ball's effectiveness multiplier, and the Pokémon's level.
 *
 * @param captureRate - The base capture rate of the Pokémon species (0-255).
 * @param ballMultiplier - The catch rate multiplier of the ball used (e.g. 1.0 for Poké Ball, 1.5 for Great Ball, 100 for Master Ball).
 * @param level - The current level of the encounter.
 * @returns The final catch probability (capped between 5% and 95%, unless a Master Ball is used).
 */
export function calculateCatchChance(
  captureRate: number,
  ballMultiplier: number,
  level: number
): number {
  if (ballMultiplier === 100) return 1.0 // Master Ball

  // level-based modifier: lower level = boost (max 1.2), higher = penalty (min 0.8)
  let areaModifier = 1.0
  if (level <= 10) {
    areaModifier = 1.2
  } else if (level >= 70) {
    areaModifier = 0.8
  } else {
    areaModifier = 1.2 - ((level - 10) / 60) * 0.4
  }

  const p = (captureRate / 255) * ballMultiplier * areaModifier
  return Math.min(0.95, Math.max(0.05, p))
}
