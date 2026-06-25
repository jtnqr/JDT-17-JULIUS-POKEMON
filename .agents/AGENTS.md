# Agent Rules — Pokédex Web App (jdt-17-julius-pokemon)

## Project Identity

Pokémon Bronze–themed interactive Pokédex app.
**Stack**: React 19 + Vite + React Router v7 + Zustand v5 + Tailwind CSS v4 + TanStack Query v5 + @dnd-kit.
**Theme**: Dark bronze/copper, glassmorphism, `Outfit` + `Inter` fonts, micro-animations.
Full spec lives in [`PROMPT.md`](../PROMPT.md).

---

## 0 — Skills First (Non-Negotiable)

Before touching any code, check whether an installed skill applies to the task.

```
Skills root: .agents/skills/
```

| Task type | Required skill |
|---|---|
| Tailwind v4 theming / CSS tokens | `tailwind-design-system` or `tailwind-v4-shadcn` |
| React components / performance | `vercel-react-best-practices` |
| Zustand stores / selectors | `zustand` |
| Any other task | Check global skills (`~/.gemini/config/plugins/`) |

**If no skill exists for the task**, fetch docs via the **context7 MCP server** before writing code:

1. `resolve-library-id` — find the correct library ID (e.g. `/vercel/next.js`)
2. `query-docs` — fetch relevant docs using that ID and the user's question

Do **not** use `bunx ctx7@latest` CLI — the MCP server is faster and already available.

If a skill is still missing after searching, install or write one before proceeding.
Do NOT skip this step and jump straight to implementation.

---

## 1 — Toolchain: Always Use Bun

| Operation | Command |
|---|---|
| Install package | `bun add <pkg>` |
| Run script | `bun run <script>` |
| Execute binary | `bunx <binary>` |
| Dev server | `bun run dev` (start in background, leave running) |
| Lint + format check | `bun run lint` → runs `biome check .` |
| Format (write) | `bun run format` → runs `biome format --write .` |
| Test | `bunx vitest run` |
| Build | `bun run build` |

**Never use `npm`, `npx`, or `yarn`.**

> `package-lock.json` has been deleted. The lockfile is `bun.lock`. Never commit `package-lock.json`.

---

## 2 — Development Server

- Start with `bun run dev` and keep it running as a background process.
- Do not restart it between file edits unless a config file (`vite.config.ts`, `index.html`, `tailwind.*`) changes.
- Port default: `5173`.

---

## 2.5 — Project Bootstrap Facts (Read Before Any Code)

### Stack — Trust `package.json`, not `PROMPT.md`

The `PROMPT.md` spec predates the actual setup. **The real versions are:**

| Package | Actual version (package.json) |
|---|---|
| react / react-dom | **19.x** |
| react-router-dom | **7.x** (library/SPA mode) |
| zustand | **5.x** |
| @tanstack/react-query | **5.x** |
| tailwindcss | **4.x** |
| vite | **8.x** |
| typescript | **6.x** |

When in doubt, read `package.json` — never assume PROMPT.md version numbers.

### React Router v7 — SPA / Library Mode

Use **react-router-dom** in **library/browser mode only** — not framework mode.

```tsx
// src/main.tsx
import { BrowserRouter } from 'react-router-dom'

<BrowserRouter>
  <App />
</BrowserRouter>
```

Do **not** use file-based routing, `createBrowserRouter` with server loaders, or any Remix-style server APIs.

### `@` Path Alias

`vite.config.ts` already maps `@` → `src/`. **Always use `@/` imports**, never relative paths:

```ts
// ✅ correct
import { useGameStore } from '@/stores/gameStore'

// ❌ wrong
import { useGameStore } from '../../stores/gameStore'
```

Ensure `tsconfig.app.json` also has:
```json
"paths": { "@/*": ["./src/*"] }
```

### Current Scaffold State

Only these files exist — **everything else is greenfield**:

```
src/
├── main.tsx            ← bare Vite entry, needs full rewrite
├── App.tsx             ← default Vite placeholder, needs full rewrite
├── App.css             ← delete; move all styles to styles/index.css
├── index.css           ← bronze @theme tokens + scanlines already defined ✅
├── assets/             ← Vite default SVGs (react.svg, vite.svg) — can delete
└── lib/
    └── idb-storage.ts  ← IndexedDB Zustand adapter already written ✅
```

**Do not re-implement `idb-storage.ts`** — it exists at `src/lib/idb-storage.ts`.
**Do not keep `App.css`** — delete it, consolidate into `src/styles/index.css`.

### Linter: Biome (not ESLint, not oxlint)

The project uses **Biome** (`@biomejs/biome@2.5.1`) for both linting and formatting.
Config is in `biome.json` at the project root. **Do not install or configure ESLint or oxlint.**

---

## 3 — Feature Build Order

Build features **one route at a time** in this sequence:

```
1. Design system + global styles (index.css, Tailwind tokens, bronze theme)
2. Shared components (TypeBadge, PokemonCard, StatBar, BallIcon, SkeletonLoader…)
3. Zustand stores (gameStore, collectionStore, settingsStore) + idb-storage adapter
4. TanStack Query hooks (usePokemon, useEncounter, useTimeOfDay)
5. Pages in order:
   /            → MapPage
   /area/:id    → AreaPage
   /encounter   → EncounterPage
   /bag         → BagPage
   /party       → PartyPage
   /pokemon/:id → PokemonDetailPage
   /pokedex     → PokedexPage
```

Do not start a new route until the current one passes all three verification gates (§7).

---

## 4 — State Management Rules

### Zustand — game / collection / settings

Use Zustand for all **client-owned game state**:

```
stores/gameStore.ts       → currentArea, visitedAreas, unlockedAreas, timeOfDay, activeEncounter
stores/collectionStore.ts → bag, party, seenSpecies + actions
stores/settingsStore.ts   → soundEnabled
```

Always follow the `zustand` skill rules:
- **One slice per concern** — never merge unrelated state into one store.
- **Select atomically** — `const x = useStore(s => s.x)`, never destructure the whole store.
- **All actions inside the store** — no action creators outside the store file.
- Use `persist` middleware with `localStorage`; fall back to the `idb-storage` adapter in
  `src/lib/idb-storage.ts` when quota is exceeded.

### TanStack Query — PokéAPI data

Use `@tanstack/react-query` for **all** PokéAPI fetches:

```
hooks/usePokemon.ts    → pokemon detail, species, evolution chain
hooks/useEncounter.ts  → location-area encounter data
```

- `staleTime`: `1000 * 60 * 10` (10 minutes)
- `gcTime`: `1000 * 60 * 30` (30 minutes)
- `queryKey` format: `[resource, id]` tuples — e.g. `['pokemon', 25]`
- Always provide skeleton loaders while `isLoading` and error states with retry on `isError`.

### No Redux / RTK

Do **not** introduce `@reduxjs/toolkit`, `react-redux`, or any Redux-related package.

---

## 5 — Styling Rules

Read the `tailwind-design-system` and `tailwind-v4-shadcn` skills before writing any CSS.

### Bronze Theme Tokens (define in `src/styles/index.css`)

```css
@theme {
  --color-bg:        #1a1108;
  --color-surface:   #2c1d0e;
  --color-accent:    #cd7f32;
  --color-gold:      #b8860b;
  --color-highlight: #ffd700;
  --color-text:      #f5deb3;
  --color-muted:     #a08060;
  --font-heading:    'Outfit', sans-serif;
  --font-body:       'Inter', sans-serif;
}
```

### Design Checklist (every component)

- [ ] Bronze/copper palette only — no plain reds, blues, greens.
- [ ] Glassmorphism panels: `backdrop-blur` + `bg-surface/60`.
- [ ] Bronze gradient borders on cards: `border border-accent/40`.
- [ ] Scanline texture overlay via CSS only (no image assets).
- [ ] Micro-animations on all interactive elements (hover scale, glow pulse).
- [ ] Mobile-first: designed at 375 px width, enhanced for desktop.
- [ ] Google Fonts loaded: `Outfit` (headings) + `Inter` (body).

---

## 6 — Linting Gate

Run after **every batch of file edits**. Biome checks lint + formatting in one command:

```bash
bun run lint          # biome check . — lint + format violations
bun run format        # biome format --write . — auto-fix formatting only
```

Fix **all** lint errors before continuing. Format issues can be auto-fixed with `bun run format`.
Do not proceed to the next task with unresolved lint errors.

---

## 7 — Verification Gates (Required Before Feature is Done)

Every feature must pass all **three gates** in order:

### Gate 1 — Lint + Format
```bash
bun run lint      # biome check . — must exit 0
```
Auto-fix formatting first if needed: `bun run format`

### Gate 2 — Unit Tests

Testing library: **Vitest**.

> **Vitest is not yet installed.** Before writing the first test, run:
> ```bash
> bun add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
> ```

Add to `vite.config.ts`:
```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
},
```

Create `src/test/setup.ts`:
```ts
import '@testing-library/jest-dom';
```

Write tests for:

| Target | What to test |
|---|---|
| `src/lib/catchCalc.ts` | Formula edge cases (capture_rate 0, 255, Master Ball = 100%) |
| `src/lib/idb-storage.ts` | Storage adapter get/set/remove round-trip |
| `src/lib/areaMap.ts` | Area → biome mapping correctness |
| `src/stores/collectionStore.ts` | `catchPokemon`, `releasePokemon`, `addToParty`, `removeFromParty` |
| `src/stores/gameStore.ts` | Area transitions, `unlockedAreas` progression logic |
| `src/hooks/useTimeOfDay.ts` | Returns correct slot for hours 5, 12, 18, 0 |
| Shared UI components | Renders without crash; key props reflected in DOM |

Run:
```bash
bunx vitest run   # must exit 0 with no failing tests
```

### Gate 3 — Build
```bash
bun run build     # must exit 0 with no TypeScript errors
```

All three gates must pass before declaring a feature complete or committing.

---

## 8 — File Structure (Canonical)

```
src/
├── components/
│   ├── ui/               # Shared primitives
│   ├── encounter/        # Battle screen components
│   ├── map/              # World map components
│   ├── bag/              # Bag/party components
│   └── pokemon/          # Card, detail components
├── pages/                # One file per route
├── stores/               # Zustand stores only
├── hooks/                # TanStack Query hooks + custom hooks
├── lib/                  # Pure logic: catchCalc, idb-storage, areaMap
├── test/                 # setup.ts + global test utilities
├── assets/images/        # Biome backgrounds (10 biomes)
├── styles/index.css      # Tailwind directives + bronze theme tokens
└── main.tsx
```

Do not create files outside this structure without a documented reason.

---

## 9 — API Integration Rules

- Base URL: `https://pokeapi.co/v2/`
- All fetches go through TanStack Query hooks in `src/hooks/`. No raw `fetch` in components.
- Always handle `isLoading` → skeleton loader, `isError` → error card with retry button.

| Hook | Endpoint |
|---|---|
| `usePokemon(id)` | `GET /pokemon/{id}` |
| `usePokemonSpecies(id)` | `GET /pokemon-species/{id}` |
| `useEvolutionChain(id)` | `GET /evolution-chain/{id}` |
| `useLocationArea(id)` | `GET /location-area/{id}` |
| `useAllAreas()` | `GET /location-area?limit=1000` |

---

## 10 — Accessibility & SEO

- Every interactive element must have an ARIA label or visible text.
- All pages must have `<title>` and `<meta name="description">`.
- One `<h1>` per page; logical heading hierarchy below it.
- Full keyboard navigation: logical Tab order, `Enter`/`Space` on all buttons.
- Minimum contrast 4.5:1 in the bronze palette.

---

## 11 — Audio System

- `soundEnabled` lives in `settingsStore` (Zustand, persisted).
- Never autoplay audio unless `soundEnabled === true`.
- Cry URL: PokéAPI `/pokemon/{id}` → `cries.latest` field.
- `SoundToggle` component (speaker icon) must be in the global header.

---

## 12 — Performance & Error Handling

Follow the `vercel-react-best-practices` skill.

- Lazy-load every page route via `React.lazy` + `Suspense`.
- No prop drilling beyond 2 levels.
- `useMemo` for expensive derivations; `useCallback` only when passed to memoized children.
- Sprites: `<img loading="lazy">`.
- No `useEffect` for state derivations — compute in store selectors.

### Error Boundaries

- Place one **global** `<ErrorBoundary>` wrapping the router in `main.tsx` as a last-resort catch.
- Place a **per-route** `<ErrorBoundary>` inside each `React.lazy` `<Suspense>` wrapper so one page crash doesn't kill the whole app.
- Error boundary fallback UI must use the bronze theme and offer a "Retry" / "Go to Map" CTA.

```tsx
// Example structure in main.tsx
<ErrorBoundary fallback={<GlobalErrorFallback />}>
  <BrowserRouter>
    <Suspense fallback={<BronzeSpinner />}>
      <App />
    </Suspense>
  </BrowserRouter>
</ErrorBoundary>
```

---

## 13 — Git Workflow

- One commit per completed feature (route or major component group).
- Commit only after all three verification gates pass.
- Message format: `feat(<scope>): <short description>`
  - `feat(map): world map with progressive area unlock`
  - `feat(encounter): catch mechanic with shake animation`
  - `feat(bag): grid view with sort and filter`

---

## 14 — Vercel Deployment

This app deploys to **Vercel** as a fully static Vite SPA.
Follow the `vercel-react-best-practices` skill for all component/bundle decisions.

### `vercel.json` (create at repo root if absent)

```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    }
  ]
}
```

> **Why**: The SPA rewrite sends all paths to `index.html` so React Router handles routing.
> Hashed asset files get `immutable` cache (Vite content-hashes them by default).
> `index.html` itself must never be cached so deploys are instantly visible.

### Vite Build Optimisations (add to `vite.config.ts`)

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react:   ['react', 'react-dom', 'react-router-dom'],
        query:   ['@tanstack/react-query'],
        dndkit:  ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        zustand: ['zustand'],
      },
    },
  },
  chunkSizeWarningLimit: 500,
},
```

> **Why**: Splitting vendor chunks lets Vercel's CDN cache them independently.
> Users re-downloading after a code change only pull the changed app chunk,
> not the entire bundle.

### Vercel Deployment Checklist (run before every deploy)

- [ ] `bun run build` exits 0 with no TypeScript errors.
- [ ] `dist/index.html` exists and references hashed asset files.
- [ ] `vercel.json` is present at repo root with SPA rewrite.
- [ ] No secrets or API keys committed (PokéAPI is public, no key needed).
- [ ] All three verification gates (§7) pass on the branch being deployed.
- [ ] Chunk sizes: no single chunk exceeds 500 kB (check build output).
- [ ] Lazy-loading confirmed: each page route is a separate chunk in `dist/assets/`.

### Vercel Environment Variables

This project requires **no environment variables** (PokéAPI is public, no auth).
If any are added in future, define them in the Vercel dashboard and prefix with `VITE_`
so Vite exposes them to the client bundle.

### Performance Targets (Vercel Analytics / Lighthouse)

| Metric | Target |
|---|---|
| LCP | < 2.5 s |
| FID / INP | < 200 ms |
| CLS | < 0.1 |
| Initial JS bundle (gzip) | < 150 kB |
| Total page weight (cold load) | < 500 kB |

Follow `bundle-barrel-imports`, `bundle-dynamic-imports`, and `async-parallel`
rules from the `vercel-react-best-practices` skill to hit these targets.

---

## Out of Scope (Do Not Implement)

- Battle / combat system
- Multiplayer / trading
- User accounts / cloud sync
- Move damage calculation
- Berry / item economy beyond Poké Balls
- Redux / RTK / any Redux-related package
