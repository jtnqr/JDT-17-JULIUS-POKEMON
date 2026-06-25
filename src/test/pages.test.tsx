import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AreaPage from '@/pages/AreaPage'
import MapPage from '@/pages/MapPage'
import { useGameStore } from '@/stores/gameStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

afterEach(() => {
  vi.restoreAllMocks()
  queryClient.clear()
})

const mockEncounterData = {
  id: 1,
  name: 'kanto-route-1-area',
  pokemon_encounters: [
    {
      pokemon: {
        name: 'pidgey',
        url: 'https://pokeapi.co/v2/pokemon/16/',
      },
      version_details: [
        {
          version: { name: 'red' },
          max_chance: 50,
          encounter_details: [
            {
              min_level: 2,
              max_level: 4,
              chance: 50,
              method: { name: 'walk' },
              condition_values: [],
            },
          ],
        },
      ],
    },
  ],
}

describe('MapPage Component', () => {
  it('renders the map page correctly', () => {
    render(
      <MemoryRouter>
        <MapPage />
      </MemoryRouter>
    )

    expect(screen.getByText('WORLD MAP')).toBeInTheDocument()
    expect(screen.getByText('Pallet Town')).toBeInTheDocument()
    expect(screen.getByText('Route 1')).toBeInTheDocument()
  })
})

describe('AreaPage Component', () => {
  it('renders loading state initially then wildlife and interactive elements', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEncounterData),
      } as Response)
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/area/kanto-route-1']}>
          <Routes>
            <Route path="/area/:id" element={<AreaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify it sets current area in store
    expect(useGameStore.getState().currentAreaId).toBe('kanto-route-1')

    // Wait for the mock encounter wildlife to load
    await waitFor(() => {
      expect(screen.getByText('pidgey')).toBeInTheDocument()
    })

    expect(screen.getByText('Route 1')).toBeInTheDocument()
    expect(screen.getByText(/explore/i)).toBeInTheDocument()
  })

  it('triggers encounter when EXPLORE ROUTE button is clicked', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEncounterData),
      } as Response)
    )

    // Clear active encounter
    useGameStore.getState().setActiveEncounter(null)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/area/kanto-route-1']}>
          <Routes>
            <Route path="/area/:id" element={<AreaPage />} />
            <Route path="/encounter" element={<div>Encounter Screen</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('pidgey')).toBeInTheDocument()
    })

    const exploreBtn = screen.getByRole('button', { name: /explore/i })
    fireEvent.click(exploreBtn)

    // Verify game store set the active encounter
    const activeEncounter = useGameStore.getState().activeEncounter
    expect(activeEncounter).toBeDefined()
    expect(activeEncounter?.name).toBe('pidgey')
    expect(activeEncounter?.speciesId).toBe(16)
    expect(activeEncounter?.level).toBeGreaterThanOrEqual(2)
    expect(activeEncounter?.level).toBeLessThanOrEqual(5) // route 1 range: 2-5

    // Verify navigation happened
    expect(screen.getByText('Encounter Screen')).toBeInTheDocument()
  })

  it('correctly filters wildlife by timeOfDay and handles non-time conditions like radar', async () => {
    const customEncounterData = {
      id: 1,
      name: 'kanto-route-1-area',
      pokemon_encounters: [
        {
          pokemon: { name: 'rattata', url: 'https://pokeapi.co/v2/pokemon/19/' },
          version_details: [
            {
              version: { name: 'red' },
              max_chance: 50,
              encounter_details: [
                {
                  min_level: 2,
                  max_level: 4,
                  chance: 50,
                  method: { name: 'walk' },
                  condition_values: [{ name: 'radar' }],
                },
              ],
            },
          ],
        },
        {
          pokemon: { name: 'hoothoot', url: 'https://pokeapi.co/v2/pokemon/163/' },
          version_details: [
            {
              version: { name: 'red' },
              max_chance: 50,
              encounter_details: [
                {
                  min_level: 2,
                  max_level: 4,
                  chance: 50,
                  method: { name: 'walk' },
                  condition_values: [{ name: 'time-night' }],
                },
              ],
            },
          ],
        },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(customEncounterData),
      } as Response)
    )

    // Force date to be day time (12:00)
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(12)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/area/kanto-route-1']}>
          <Routes>
            <Route path="/area/:id" element={<AreaPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for the mock encounter wildlife to load
    await waitFor(() => {
      expect(screen.getByText('rattata')).toBeInTheDocument()
    })

    // Hoothoot should NOT be in the document (it's daytime and it has time-night condition)
    expect(screen.queryByText('hoothoot')).not.toBeInTheDocument()
  })
})
