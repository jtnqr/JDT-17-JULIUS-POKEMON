# Design Specification: More Fun Gameplay & Catch Logic Verification

This document specifies the improvements to the catching mechanics and gamification elements for the Pokémon Bronze-themed interactive Pokédex application.

---

## 1. Objectives

- **Verify and Fix Catch Probability Logic**: Correct the UI representation of ball shakes so success corresponds to 3 shakes (or 1 for a critical catch) and failure corresponds to 0-2 shakes. Make the shake count feel responsive to how close the attempt was to succeeding.
- **Introduce "Critical Catch" Mechanic**: Add a rare (5% chance on success) instant catch animation where the ball shakes once and immediately clicks, accompanied by special visual text.
- **Display Catch Probability**: Display the calculated catch probability (e.g. `Catch Chance: 45%`) dynamically in the battle HUD or Poké Ball selector, giving players direct feedback on their choices.
- **Optimize Shiny Encounter Loop**: Increase the default shiny rate to `1/256` (from `1/4096`) to make it viable for typical play sessions.
- **Introduce the "Shiny Charm"**: Award the player the Shiny Charm when they capture at least 15 unique species, boosting the shiny rate to `1/64`.
- **Shiny Visual Polish**: Add a beautiful glowing gold/bronze border, holographic gradient, and animated sparkles on Shiny Pokémon cards in the Bag and Pokédex.
- **Trainer Badges / Achievements**: Implement a dedicated badges panel in the Bag Page to showcase unlocking key milestones.

---

## 2. Proposed Approaches

### Approach A: Basic Encounter Polish
- Fix the shake logic bug.
- Add catch chance percentages to the Poké Ball selector.
- Increase the base shiny rate to `1/256`.

### Approach B: Comprehensive Gamification (Recommended)
- Fix the shake logic bug & add Critical Catches.
- Add catch chance percentages to the Poké Ball selector.
- Increase the base shiny rate to `1/256`.
- Add the **Shiny Charm** item unlock at 15 unique species caught (rate becomes `1/64`).
- Add **Holographic / Sparkling cards** for Shiny Pokémon in Bag and Pokédex.
- Add a **Trainer Badges** achievement board under a new tab/section in the Bag Page.

*Why Approach B?* It directly addresses the user's desire to "make the game more fun" by providing clear targets (badges, Shiny Charm) and making the visual feedback of rare events (shinies, critical catches) feel premium and rewarding, fitting the "Bronze" theme perfectly.

---

## 3. Detailed Architecture & Design

### 3.1. Catch Logic Verification & Shake Count Realignment

#### Problem:
Currently, the UI does a second random check `Math.random() < probability` to determine if the ball shakes 3 times. This causes successful catches to sometimes shake only 1-2 times before succeeding, and failed catches to shake 3 times before breaking free.

#### Solution:
Tie shake count directly to the pre-calculated `success` flag.
- Calculate `success` once:
  ```typescript
  const success = Math.random() <= probability;
  ```
- Roll for critical catch (if `success` is true, 5% chance):
  ```typescript
  const isCritical = success && Math.random() < 0.05;
  ```
- Set shake count:
  - If `isCritical` is true: `shakes = 1`.
  - If `success` is true: `shakes = 3`.
  - If `success` is false: Calculate how close the attempt was using the roll value:
    - We want a failure roll to be `roll > probability`.
    - Let the roll difference be `diff = roll - probability`. Since `roll` is between `probability` and `1.0`:
      - `diff < 0.15` (narrow miss) -> `shakes = 2`.
      - `diff > 0.40` (poor throw) -> `shakes = 0`.
      - otherwise -> `shakes = 1`.

#### Verification Plan:
- Add a new set of tests in `src/test/encounter.test.tsx` (or a dedicated test file) verifying:
  - Master Ball shakes 3 times and catches.
  - Successful non-Master Ball catches shake 3 times (or 1 if critical).
  - Failed catches shake 0, 1, or 2 times.
  - Check that no 3-shake failures occur.

---

### 3.2. Visual Catch Assistant

- In `src/pages/EncounterPage.tsx`, next to or within each Poké Ball button in the selection overlay, render the calculated catch probability for that specific Poké Ball.
- Formula for the display probability:
  ```typescript
  const percentChance = Math.round(calculateCatchChance(species.capture_rate, multiplier, level) * 100);
  ```
- Display as a small badge (e.g. `45%`) below or beside the ball name/icon.

---

### 3.3. Shiny Charm & Shiny Rate Upgrades

- In `src/stores/collectionStore.ts` (or `gameStore.ts`), determine if the player has unlocked the Shiny Charm:
  ```typescript
  // Check if unique species caught >= 15
  const getUniqueCaughtCount = (bag: CaughtPokemon[]) => {
    return new Set(bag.map(p => p.speciesId)).size;
  };
  const hasShinyCharm = getUniqueCaughtCount(bag) >= 15;
  ```
- In `src/pages/AreaPage.tsx`, update shiny determination:
  ```typescript
  const uniqueCaught = new Set(bag.map(p => p.speciesId)).size;
  const isCharmActive = uniqueCaught >= 15;
  const shinyRate = isCharmActive ? 1 / 64 : 1 / 256;
  const isShiny = Math.random() < shinyRate;
  ```
- Add a visual banner or state indicator:
  - In `src/components/ui/Header.tsx`, display the Shiny Charm icon `✨` (glowing yellow) with a tooltip "Shiny Charm Active" when unlocked.

---

### 3.4. Holographic Shiny Cards

- In `src/components/ui/PokemonCard.tsx` (and the detail view if appropriate), when `isShiny` is true:
  - Wrap the card in a gold/bronze border: `border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]`.
  - Add a subtle background radial gradient that shifts: `bg-gradient-to-br from-amber-900/40 via-surface/60 to-yellow-900/40`.
  - Add an animated CSS shimmer/sparkle overlay:
    ```css
    /* Keyframe animation for holographic shimmer */
    @keyframes holographic {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    ```
  - Display small emoji sparkles (`✨`) or SVG sparkles that pulse around the sprite.

---

### 3.5. Trainer Badges / Achievements

- Define the badge schema in `src/lib/badges.ts` or directly in components.
- Badges:
  1. **Bronze Recruit**: Catch your first Pokémon (Any catch).
  2. **Route Pioneer**: Visit at least 5 unique areas.
  3. **Collection Expert**: Catch 15 unique species (also unlocks Shiny Charm).
  4. **Shiny Hunter**: Catch your first Shiny Pokémon.
  5. **Master Catcher**: Catch a Pokémon using a Master Ball.
  6. **Completionist**: Catch 30 unique species.
- UI Layout:
  - Add a "Badges" tab on the Bag Page (`/bag`).
  - Render as a grid of circular medals. Lock state = grayed out. Unlock state = bronze/gold glowing medal with a tooltipped name/description.

---

## 4. Testing & Verification

1. **Linting**: Run `bun run lint` to ensure zero Biome check issues.
2. **Unit Tests**: Run `bunx vitest run` to ensure all tests pass, and write new unit tests for:
   - Catch percentage rendering.
   - Shiny rate adjustment.
   - Shake count logic.
3. **Build**: Run `bun run build` to verify no compilation errors.
