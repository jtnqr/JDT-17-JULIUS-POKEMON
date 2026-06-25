# Pokédex Web App — Project Prompt

## Overview

Build a **Pokémon Bronze-themed interactive Pokédex web app** using React, Vite, React Router, Zustand, and Tailwind CSS. The app is a browser-based, mobile-first Pokémon exploration experience — players explore real Pokémon routes on a visual map, encounter Pokémon, throw Poké Balls to catch them, and manage their collection in a bag/party system.

Data is sourced entirely from the **[PokéAPI](https://pokeapi.co/)** (free, no auth required). State is persisted with **localStorage** (fallback to IndexedDB for large collections).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| State | Zustand (with `persist` middleware → localStorage / IndexedDB) |
| Styling | Tailwind CSS v4 |
| Data | PokéAPI REST (`https://pokeapi.co/v2/`) |
| Persistence | localStorage (primary), IndexedDB via `idb` package (fallback for large state) |
| Audio | Pokémon cry audio files served by PokéAPI (`/pokemon/{id}/cries`) |

---

## Visual Design

### Theme: Pokémon Bronze
- **Color palette**: Dark bronze/copper tones, earthy deep browns, muted gold accents
  - Background: `#1a1108` (near-black brown)
  - Surface: `#2c1d0e` (dark copper)
  - Accent: `#b8860b` (dark goldenrod) / `#cd7f32` (bronze)
  - Text primary: `#f5deb3` (wheat/cream)
  - Text muted: `#a08060`
  - Highlight: `#ffd700` (gold, sparingly)
- **Typography**: `Outfit` (headings) + `Inter` (body) from Google Fonts
- **Design language**:
  - Glassmorphism panels with bronze-tinted backdrop blur
  - Subtle scanline texture overlay on panels (CSS only)
  - Copper/bronze gradient borders on cards
  - Micro-animations on all interactive elements
  - Mobile-first, fully responsive

### Dark Mode
- Single theme only: Pokémon Bronze dark mode (no light/dark toggle)

---

## Routes & Pages

| Route | Page | Description |
|---|---|---|
| `/` | Map / World View | Interactive map of Pokémon routes |
| `/area/:areaId` | Area / Route View | Panoramic area view, encounter button |
| `/encounter` | Wild Encounter | Battle-like catch screen |
| `/bag` | Bag / Collection | All caught Pokémon |
| `/party` | Party | Active party of up to 6 Pokémon |
| `/pokemon/:id` | Pokémon Detail | Full Pokédex entry for a caught Pokémon |
| `/pokedex` | National Pokédex | Seen/caught tracker across all generations |

---

## Core Features

---

### 1. World Map (`/`)

- Visual **panoramic world map** displayed as a stylized node/path map overlaid on an illustrated background image
- Map displays **real Pokémon game routes** (Route 1, Viridian Forest, Mt. Moon, Cerulean City, etc.) across all regions (Kanto → Johto → Hoenn → Sinnoh → Unova → Kalos → Alola → Galar → Paldea)
- Each area/node on the map shows:
  - Area name
  - Whether it's been visited
  - Whether it's unlocked
  - A small badge showing the number of unique species found there
- Areas are **unlocked progressively**: an area unlocks after the player visits its prerequisite area at least once
- Player's **current location** is highlighted with a blinking indicator
- Clicking an area navigates to `/area/:areaId`

---

### 2. Area View (`/area/:areaId`)

- **Full panoramic background image** representing the area (use a generated/illustrated image per biome type)
  - Biome types: Forest, Route (grassland), Mountain, Cave, Water, City, Tower, Desert, Ice, Volcanic
  - Background image is determined by area biome tag
- Area info overlay:
  - Area name, region badge
  - Time of day indicator (Morning / Day / Night) based on actual system clock:
    - Morning: 05:00–11:59
    - Day: 12:00–17:59
    - Night: 18:00–04:59
  - Pokémon that appear at the current time of day (spoiler-free: just silhouettes until seen)
- **"Explore!"** button — triggers a random encounter:
  - Pull Pokémon encounter data from `GET /location-area/{areaId}/pokemon-encounters`
  - Filter by `version_details` and `condition_values` to respect time-of-day slots (time-of-day, morning, day, night)
  - Apply catch rates and spawn weights
  - Navigate to `/encounter` with encounter state injected into Zustand

---

### 3. Wild Encounter (`/encounter`)

- **Battle-like animated screen**:
  1. Grass/cave/water transition animation plays (CSS keyframe)
  2. Wild Pokémon sprite slides in from the right (official front sprite from PokéAPI)
  3. Pokémon cry audio plays (from PokéAPI cries endpoint) — respects global sound toggle
  4. HUD shows: Pokémon name, level (derived from area), HP bar (purely cosmetic), type badges
  5. Player's Poké Ball selection panel slides in from the bottom
- **Poké Ball Selection**:
  - 4 ball types displayed with icons and catch rate multiplier shown on hover:
    | Ball | Catch Multiplier | Visual |
    |---|---|---|
    | Poké Ball | 1× | Classic red/white |
    | Great Ball | 1.5× | Blue/red |
    | Ultra Ball | 2× | Black/yellow |
    | Master Ball | 100% guaranteed | Purple/M |
  - All balls freely available (infinite supply), no economy
- **Catch Mechanic**:
  - Base catch rate from PokéAPI: `GET /pokemon-species/{id}` → `capture_rate` (0–255)
  - Formula: `P = (capture_rate / 255) × ball_multiplier × area_modifier`
  - `area_modifier`: lower-level areas have a slight boost (max 1.2×), harder areas have a penalty (0.8×)
  - Capped at 95% max (Master Ball = 100%)
  - **Shake animation**: Ball thrown → 1–3 shakes → success or break-free
    - Shake count is determined by catch probability (higher = more shakes before result)
  - On success: celebration animation + confetti, sound cue, prompt to nickname the Pokémon
  - On failure: break-free animation, option to try again or run
- **Run option**: always available, returns to the area view

---

### 4. Nickname Modal

- Shown after a successful catch
- Input field pre-filled with the Pokémon's species name (capitalized)
- Player can edit or leave default
- Confirm → Pokémon added to bag with metadata:
  - `uid`: unique ID (UUID v4)
  - `speciesId`: PokéAPI species ID
  - `nickname`: player-given name
  - `caughtAt`: ISO timestamp
  - `caughtArea`: area name + route
  - `ball`: ball type used
  - `isShiny`: boolean (shiny encounter: 1/4096 chance, or ~1/512 with Shiny Charm unlock)
  - `partySlot`: null (not in party) or 1–6

---

### 5. Bag / Collection (`/bag`)

- Grid of all caught Pokémon cards
- Each card shows:
  - Sprite (shiny if `isShiny`)
  - Nickname + species name
  - Type badges
  - Ball used to catch it
  - Caught date + area
- Sorting options:
  - By Pokédex number (default)
  - By caught date
  - By party slot
- Filtering: by type, by region, by shiny
- Click a card → navigates to `/pokemon/:id`
- **Release**: long-press (mobile) or right-click (desktop) → confirmation modal → removes from bag

---

### 6. Party System (`/party`)

- Displays 6 party slots (visual like the in-game party screen)
- Drag-and-drop to reorder slots (use `@dnd-kit/core`)
- Add from bag: opens a searchable bag drawer
- Remove from party: returns Pokémon to bag (not released)
- Party Pokémon are highlighted in the bag view with their slot number badge

---

### 7. Pokémon Detail (`/pokemon/:id`)

- Full Pokédex entry for a **caught** Pokémon (or species seen in the wild)
- Sections:
  - **Header**: Large sprite (shiny toggle button), nickname, species name, Pokédex number
  - **Type Badges**: color-coded by type
  - **Pokédex Entry**: flavor text from PokéAPI (`/pokemon-species/{id}` → `flavor_text_entries`, English, latest game)
  - **Habitat**: from PokéAPI species data
  - **Stats**: animated bar chart for HP, Attack, Defense, Sp. Atk, Sp. Def, Speed
  - **Abilities**: listed with hidden ability marked
  - **Evolution Chain**: visual chain with arrows, each stage clickable
  - **Moves**: collapsible list, filtered by learn method
  - **Metadata**: caught date, caught area, ball icon, shiny indicator
- Cry button: plays Pokémon cry audio

---

### 8. National Pokédex (`/pokedex`)

- Grid of all Pokémon (#001–#1025)
- States per entry:
  - **Unknown**: never seen (solid silhouette, "???" name)
  - **Seen**: encountered in the wild but not caught (silhouette with name visible)
  - **Caught**: in bag (full sprite + name)
- Search by name or number
- Filter by type, generation
- Progress bar: caught / total count

---

### 9. Time of Day System

- Determined by `new Date().getHours()`:
  - `05–11` → **Morning** (golden/warm sky tones)
  - `12–17` → **Day** (bright sky tones)
  - `18–04` → **Night** (deep indigo/dark tones)
- Affects:
  - Pokémon encounter pool (API `condition_values` filtering)
  - Area background lighting overlay (CSS color-mix tint)
  - UI ambient color shift (subtle warm/cool shift)
- Time refreshes automatically on area load (no real-time ticking)

---

### 10. Audio System

- Global sound toggle stored in Zustand (persisted)
- Toggle button in header (speaker icon, on/off)
- Audio triggers:
  - Pokémon cry on encounter (from PokéAPI `/pokemon/{id}/cries/latest`)
  - Cry button on detail page
  - Catch success sound (optional: use a royalty-free SFX or omit)

---

## State Management (Zustand)

### Stores

```ts
// gameStore — core game state
{
  currentArea: string | null,
  visitedAreas: string[],
  unlockedAreas: string[],
  timeOfDay: 'morning' | 'day' | 'night',
  activeEncounter: PokemonEncounter | null,
}

// collectionStore — bag + party
{
  bag: CaughtPokemon[],           // all caught Pokémon
  party: (CaughtPokemon | null)[], // 6 slots, null = empty
  seenSpecies: number[],          // PokéAPI species IDs seen

  catchPokemon: (pokemon, nickname, ball) => void,
  releasePokemon: (uid) => void,
  addToParty: (uid, slot) => void,
  removeFromParty: (uid) => void,
  nicknamePokemon: (uid, name) => void,
}

// settingsStore — preferences
{
  soundEnabled: boolean,
  toggleSound: () => void,
}
```

### Persistence
- Use Zustand `persist` middleware with `localStorage` storage
- If `localStorage` quota is exceeded (caught many Pokémon with full metadata), fall back to IndexedDB via the `idb` package
- Implement a custom `idb-storage` adapter for Zustand's persist middleware

---

## API Integration

### Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /location-area/{id}` | Encounter data per area |
| `GET /location/{id}` | Area metadata |
| `GET /pokemon/{id}` | Sprites, stats, abilities, cries |
| `GET /pokemon-species/{id}` | Capture rate, flavor text, habitat, shiny |
| `GET /evolution-chain/{id}` | Evolution data |
| `GET /location-area` | List all areas for map |

### API Strategy
- Use React Query (`@tanstack/react-query`) for all API calls with caching
- Cache timeout: 10 minutes (API data rarely changes)
- Show skeleton loaders while fetching
- Graceful error states with retry buttons

---

## UI Components

### Shared Components
- `PokemonCard` — sprite, name, types, shiny badge
- `TypeBadge` — colored pill for each Pokémon type (all 18 types)
- `StatBar` — animated progress bar for base stats
- `BallIcon` — SVG icon per ball type
- `TimeOfDayBadge` — morning/day/night indicator
- `EvolutionChain` — horizontal chain with arrow connectors
- `SkeletonLoader` — bronze-themed shimmer placeholder
- `SoundToggle` — global audio toggle button

### Encounter Screen Components
- `BattleHUD` — Pokémon info overlay
- `BallPicker` — bottom-sheet ball selector
- `ThrowAnimation` — CSS keyframe ball throw + shake sequence
- `CatchResultOverlay` — success/fail state with animation

---

## Gamification & Extras (Suggested Additions)

1. **Shiny Pokémon** — 1/4096 encounter rate; shiny sprite shown, sparkle animation, special cry
2. **Pokédex Completion Badges** — milestone badges for 1st catch, 10, 50, 100, 386, 802, 1025 caught
3. **Area Completion** — if all unique species in an area are caught, display a "Complete!" badge on the map node
4. **Seen vs. Caught Counter** in the header (e.g., `👁 42 | ✔ 17`)
5. **Run Streak** — track consecutive failed catches for flavor text variation
6. **First Encounter Journal** — log of the first time the player encountered each species (area, time, date)

---

## File Structure

```
src/
├── components/
│   ├── ui/               # Shared primitive components
│   ├── encounter/        # Battle screen components
│   ├── map/              # World map components
│   ├── bag/              # Bag/party components
│   └── pokemon/          # Pokémon card, detail components
├── pages/
│   ├── MapPage.tsx
│   ├── AreaPage.tsx
│   ├── EncounterPage.tsx
│   ├── BagPage.tsx
│   ├── PartyPage.tsx
│   ├── PokemonDetailPage.tsx
│   └── PokedexPage.tsx
├── stores/
│   ├── gameStore.ts
│   ├── collectionStore.ts
│   └── settingsStore.ts
├── hooks/
│   ├── usePokemon.ts     # React Query hooks for PokéAPI
│   ├── useEncounter.ts   # Catch mechanic logic
│   └── useTimeOfDay.ts   # Current time slot
├── lib/
│   ├── catchCalc.ts      # Catch rate formula
│   ├── idb-storage.ts    # IndexedDB Zustand adapter
│   └── areaMap.ts        # Static area → biome → route mapping
├── assets/
│   └── images/           # Biome panoramic backgrounds (10 biomes)
├── styles/
│   └── index.css         # Tailwind directives + bronze theme tokens
└── main.tsx
```

---

## Non-Functional Requirements

- **Mobile-first**: all layouts designed for 375px width up; desktop is enhanced
- **Performance**: lazy-load route pages; sprites loaded on demand; React Query cache prevents redundant fetches
- **Accessibility**: all interactive elements keyboard navigable; ARIA labels on icon buttons; sufficient contrast in bronze palette
- **SEO**: proper `<title>` and `<meta description>` per route via React Helmet or equivalent
- **No backend**: fully static/client-side; all data from PokéAPI

---

## Out of Scope (v1)

- Battles / combat system
- Multiplayer / trading
- User accounts / cloud sync
- Pokémon moves / damage calculation
- Berry or item system beyond Poké Balls

---

## Summary Card

> **Stack**: React 18 + Vite + React Router v6 + Zustand + Tailwind v4 + React Query + @dnd-kit
> **Theme**: Pokémon Bronze — dark copper, earthy, glassmorphism
> **Data**: PokéAPI (fully client-side, no backend)
> **Persistence**: localStorage → IndexedDB fallback
> **Key screens**: World Map → Area View → Wild Encounter → Catch Animation → Bag → Party → Pokédex
> **Mobile-first, all generations, real routes, time-of-day encounters**
