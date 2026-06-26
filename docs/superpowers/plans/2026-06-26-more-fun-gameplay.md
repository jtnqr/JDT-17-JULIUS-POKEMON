# More Fun Gameplay & Catch Logic Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the wild Pokémon catching experience by fixing the shake count logic bug, introducing critical catches, showing capture chance percentages, adding a Shiny Charm unlock progression, enhancing shiny card aesthetics, and implementing Trainer Achievements/Badges.

**Architecture:** 
- Fix UI logic in `EncounterPage.tsx` to align shake counts with pre-calculated success/failure.
- Adjust `isShiny` logic in `AreaPage.tsx` to read the unique species count from the collection store and apply dynamic rates (1/256 base, 1/64 with Shiny Charm).
- Add CSS-based holographic shiny card stylings and rendering in `PokemonCard.tsx`.
- Create a Badges dashboard tab in `BagPage.tsx` to render unlocked achievements based on Zustand store states.

**Tech Stack:** React 19, Zustand v5, Tailwind CSS v4, Vitest, `@testing-library/react`.

## Global Constraints
- Always use `bun` for commands.
- Biome check (`bun run lint`) must pass with exit 0 at the end of each task.
- `bun run build` must succeed without TypeScript errors.

---

### Task 1: Verify & Rewrite Catch Encounter Shake Logic

**Files:**
- Modify: `src/pages/EncounterPage.tsx:101-152`
- Modify: `src/test/encounter.test.tsx`

**Interfaces:**
- Consumes: `calculateCatchChance` from `src/lib/catchCalc.ts`
- Produces: Correct shake count mapping to success/failure state in `EncounterPage.tsx`.

- [ ] **Step 1: Write the failing test**
  Add tests inside `src/test/encounter.test.tsx` asserting:
  - When a catch is successful, it must shake 3 times (or 1 if critical).
  - When a catch fails, it shakes 0, 1, or 2 times (and NEVER 3).
  - That critical catches trigger a `GOTCHA!` nickname modal and only shake once.

- [ ] **Step 2: Run test to verify it fails**
  Run: `bunx vitest run src/test/encounter.test.tsx`
  Expected: FAIL (or existing tests may fail/mismatch due to the current double-random shake logic)

- [ ] **Step 3: Modify EncounterPage catch attempt logic**
  Replace `handleCatchAttempt` in `src/pages/EncounterPage.tsx` with:
  ```tsx
  const handleCatchAttempt = (ball: typeof selectedBall) => {
    if (!species) return
    setSelectedBall(ball)
    setCatchState('throwing')

    const multiplier =
      ball === 'poke-ball' ? 1.0 : ball === 'great-ball' ? 1.5 : ball === 'ultra-ball' ? 2.0 : 100
    const probability = calculateCatchChance(
      species.capture_rate,
      multiplier,
      activeEncounter.level
    )
    
    // Determine success once
    const success = Math.random() <= probability
    // Determine critical catch (5% chance if successful, master ball doesn't critical catch)
    const isCritical = success && ball !== 'master-ball' && Math.random() < 0.05

    // Clean up any existing animations first
    if (throwTimeoutRef.current) clearTimeout(throwTimeoutRef.current)
    if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current)
    if (resolveTimeoutRef.current) clearTimeout(resolveTimeoutRef.current)

    // Animate throwing -> shaking
    throwTimeoutRef.current = setTimeout(() => {
      setCatchState('shaking')

      // Set shake count based on success and isCritical
      let shakes = 3
      if (isCritical) {
        shakes = 1
      } else if (!success) {
        // Map failure shakes based on proximity of failure
        // Let's roll a random number between 0 and 2.
        // If probability is extremely low (<0.10): mostly 0 shakes.
        // If probability is high (>0.50): mostly 2 shakes.
        const roll = Math.random()
        if (probability < 0.10) {
          shakes = roll < 0.8 ? 0 : 1
        } else if (probability > 0.50) {
          shakes = roll < 0.3 ? 0 : roll < 0.7 ? 1 : 2
        } else {
          shakes = roll < 0.4 ? 0 : roll < 0.8 ? 1 : 2
        }
      }

      if (shakes === 0) {
        // Instantly escape
        setCatchState('escaped')
        return
      }

      let currentShake = 0
      shakeIntervalRef.current = setInterval(() => {
        currentShake++
        setShakeCount(currentShake)
        if (currentShake >= shakes) {
          if (shakeIntervalRef.current) {
            clearInterval(shakeIntervalRef.current)
            shakeIntervalRef.current = null
          }
          resolveTimeoutRef.current = setTimeout(() => {
            if (success) {
              setCatchState('caught')
              setShowNickname(true)
              // If it was a critical catch, record it in a temporary state to display a message
              setIsCriticalCatch(isCritical)
            } else {
              setCatchState('escaped')
            }
          }, 600)
        }
      }, 700)
    }, 1000)
  }
  ```
  Note: Add `const [isCriticalCatch, setIsCriticalCatch] = useState(false)` state at the top of `EncounterPage`. Make sure to clear it on new encounter.

- [ ] **Step 4: Add Critical Catch Indicator in EncounterPage UI**
  If `isCriticalCatch` is true, render a special "✨ CRITICAL CATCH! ✨" text in gold color near the "GOTCHA!" message in the nickname modal screen.
  
- [ ] **Step 5: Run tests and verify they pass**
  Run: `bunx vitest run`
  Expected: PASS

- [ ] **Step 6: Run linter**
  Run: `bun run lint`
  Expected: No violations.

- [ ] **Step 7: Commit**
  Run:
  ```bash
  git add src/pages/EncounterPage.tsx src/test/encounter.test.tsx
  git commit -m "feat(encounter): align catch shake logic and add critical catch"
  ```

---

### Task 2: Display Catch Probability in the Ball Picker

**Files:**
- Modify: `src/pages/EncounterPage.tsx`
- Modify: `src/components/encounter/BallPicker.tsx` (or inside EncounterPage.tsx where BallPicker is defined/imported)

**Interfaces:**
- Consumes: `calculateCatchChance` in `src/pages/EncounterPage.tsx`

- [ ] **Step 1: Locate Ball Picker component**
  Check how `BallPicker` is rendered. Is it inline in `EncounterPage.tsx` or a separate component? Let's check `src/components/encounter/` directory.

- [ ] **Step 2: Modify Ball Picker to accept catch chances**
  Pass down calculated catch percentages for each ball type to the Ball Picker, and render them as a badge next to each ball (e.g. `Poké Ball - 38% chance`).
  For Master Ball, render `100%`.

- [ ] **Step 3: Run linter and tests**
  Run: `bun run lint` and `bunx vitest run`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/pages/EncounterPage.tsx src/components/encounter/
  git commit -m "feat(encounter): display catch probability percentages on Poké Balls"
  ```

---

### Task 3: Implement Shiny Charm Unlock & Dynamic Shiny Rates

**Files:**
- Modify: `src/pages/AreaPage.tsx`
- Modify: `src/components/ui/Header.tsx`

**Interfaces:**
- Consumes: `bag` from `useCollectionStore` to calculate unique species count.

- [ ] **Step 1: Modify AreaPage shiny generation logic**
  Compute the count of unique species in the `bag` store.
  If the unique count >= 15, unlock the Shiny Charm.
  Apply a `1/64` shiny rate if Shiny Charm is active, otherwise `1/256`.
  Modify lines 88-89 in `src/pages/AreaPage.tsx`:
  ```tsx
  const bag = useCollectionStore((s) => s.bag)
  const uniqueCaughtCount = new Set(bag.map((p) => p.speciesId)).size
  const hasShinyCharm = uniqueCaughtCount >= 15
  const shinyRate = hasShinyCharm ? 1 / 64 : 1 / 256
  const isShiny = Math.random() < shinyRate
  ```

- [ ] **Step 2: Modify Header to show Shiny Charm state**
  In `src/components/ui/Header.tsx`, check if unique caught species count >= 15.
  If true, render a glowing bronze/gold badge: `✨ Shiny Charm Active` next to Seen/Caught counters.

- [ ] **Step 3: Run linter and tests**
  Run: `bun run lint` and `bunx vitest run`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/pages/AreaPage.tsx src/components/ui/Header.tsx
  git commit -m "feat(gameplay): implement shiny charm unlock and boosted shiny rates"
  ```

---

### Task 4: Add Holographic Sparkling Aesthetics for Shiny Cards

**Files:**
- Modify: `src/components/ui/PokemonCard.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Add holographic and sparkle animations to index.css**
  Append custom styles for shiny holographic cards to `src/styles/index.css`:
  ```css
  @keyframes holographic-shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .holographic-card {
    background-size: 200% 200%;
    animation: holographic-shimmer 6s ease infinite;
  }

  @keyframes float-sparkle {
    0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.5; }
    50% { transform: translateY(-4px) scale(1.1); opacity: 1; }
  }

  .sparkle-animation {
    animation: float-sparkle 2s ease-in-out infinite;
  }
  ```

- [ ] **Step 2: Modify PokemonCard.tsx to apply holographic visuals**
  If `isShiny` is true:
  - Add a gold glowing border: `border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]`.
  - Apply the `holographic-card` CSS class with a radial gradient background: `bg-gradient-to-br from-amber-950/40 via-surface/80 to-yellow-900/40`.
  - Add 2-3 small floating sparkle elements (`✨`) around the sprite with `sparkle-animation`.

- [ ] **Step 3: Run linter and check layout**
  Run: `bun run lint`
  Expected: PASS

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/styles/index.css src/components/ui/PokemonCard.tsx
  git commit -m "feat(ui): add holographic gradient and sparkle effects for shiny cards"
  ```

---

### Task 5: Implement Trainer Badges Achievement System

**Files:**
- Create: `src/lib/badges.ts`
- Modify: `src/pages/BagPage.tsx`
- Create: `src/test/gamification.test.tsx`

- [ ] **Step 1: Create badges.ts definition file**
  Create `src/lib/badges.ts`:
  ```typescript
  export interface TrainerBadge {
    id: string
    name: string
    description: string
    checkUnlocked: (state: {
      bag: any[]
      visitedAreaIds: string[]
    }) => boolean
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
  ```

- [ ] **Step 2: Add Badges tab to BagPage.tsx**
  Modify `src/pages/BagPage.tsx` to add a Tab switcher at the top: "My Bag" vs "Trainer Badges".
  When "Trainer Badges" is selected, render a grid showing the 6 achievements.
  For each badge:
  - If unlocked: Render with a bronze border, gold text, glowing shadow, and full opacity.
  - If locked: Render grayed out (`opacity-45`), with a padlock icon, showing the description.
  - Show a progress bar: `Badges Unlocked: X / 6`.

- [ ] **Step 3: Write tests for badges and Shiny Charm**
  Create `src/test/gamification.test.tsx` and write unit tests for:
  - Badges `checkUnlocked` conditions.
  - Shiny Charm state unlocking when `uniqueCaughtCount` is >= 15.
  - Seen and caught counter rendering correctly.

- [ ] **Step 4: Run all verification gates**
  Run: `bun run lint`
  Run: `bunx vitest run`
  Run: `bun run build`
  Expected: All pass.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/lib/badges.ts src/pages/BagPage.tsx src/test/gamification.test.tsx
  git commit -m "feat(bag): add trainer badges achievement tab and write unit tests"
  ```
