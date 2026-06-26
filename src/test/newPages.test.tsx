import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BagPage from '@/pages/BagPage'
import PartyPage from '@/pages/PartyPage'
import PokedexPage from '@/pages/PokedexPage'
import PokemonDetailPage from '@/pages/PokemonDetailPage'
import { useCollectionStore } from '@/stores/collectionStore'
import { useSettingsStore } from '@/stores/settingsStore'

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
  act(() => {
    useCollectionStore.getState().resetCollection()
  })
})

describe('BagPage', () => {
  it('renders empty bag state correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BagPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('YOUR BAG')).toBeInTheDocument()
    expect(
      screen.getByText('No Pokémon found in your collection matching criteria.')
    ).toBeInTheDocument()
  })

  it('renders caught pokemon and handles release', async () => {
    // Catch a mock pokemon
    act(() => {
      useCollectionStore.getState().catchPokemon({
        speciesId: 25,
        nickname: 'Pikachu',
        ball: 'poke-ball',
        isShiny: false,
        caughtArea: 'pallet-town',
      })
    })

    // Mock fetch for Pikachu details
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 25,
            name: 'pikachu',
            types: [{ type: { name: 'electric' } }],
          }),
      } as Response)
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BagPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for the queries to load the pokemon card
    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument()
    })

    expect(screen.getByText('RELEASE POKÉMON')).toBeInTheDocument()

    // Mock window.confirm to return true for release
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Click release
    const releaseBtn = screen.getByRole('button', { name: /release/i })
    fireEvent.click(releaseBtn)

    expect(confirmSpy).toHaveBeenCalled()
    expect(useCollectionStore.getState().bag).toHaveLength(0)
  })
})

describe('PartyPage', () => {
  it('renders party slots and displays empty slots', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PartyPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('ACTIVE PARTY')).toBeInTheDocument()
    const emptySlots = screen.getAllByRole('button', { name: /empty slot/i })
    expect(emptySlots).toHaveLength(6)
  })

  it('allows choosing a pokemon from the bag into a slot', async () => {
    // Catch a pokemon that is currently in bag (partySlot is null)
    act(() => {
      useCollectionStore.getState().catchPokemon({
        speciesId: 4,
        nickname: 'Charmander',
        ball: 'poke-ball',
        isShiny: false,
        caughtArea: 'pallet-town',
      })
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PartyPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Click on Slot #1
    const slotButtons = screen.getAllByRole('button', { name: /empty slot/i })
    fireEvent.click(slotButtons[0])

    // Drawer should open and Charmander should be visible
    expect(screen.getByText('Choose Pokémon for Slot #1')).toBeInTheDocument()

    // Assign Charmander to slot
    const charmanderBtn = screen.getByRole('button', { name: /charmander/i })
    fireEvent.click(charmanderBtn)

    // Charmander should now be in the party slot
    expect(screen.getByText('Charmander')).toBeInTheDocument()
    expect(useCollectionStore.getState().bag[0].partySlot).toBe(1)
  })
})

describe('PokemonDetailPage', () => {
  it('renders loading state and displays detail details correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('pokemon-species')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 25,
              flavor_text_entries: [
                {
                  flavor_text: 'Pikachu mouse pokemon.',
                  language: { name: 'en' },
                },
              ],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 25,
            name: 'pikachu',
            sprites: {
              front_default: 'pika-url',
            },
            types: [{ type: { name: 'electric' } }],
            stats: [{ base_stat: 35, stat: { name: 'hp' } }],
            cries: {
              latest: 'cry-url',
            },
          }),
      } as Response)
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/pokemon/25']}>
          <Routes>
            <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for content to render
    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument()
    })

    expect(screen.getByText('NO. 025')).toBeInTheDocument()
    expect(screen.getByText('Pikachu mouse pokemon.')).toBeInTheDocument()
    expect(screen.getByText('PLAY CRY')).toBeInTheDocument()
  })

  it('shows alert when play cry is clicked and sound is muted, and can unmute', async () => {
    // Set soundEnabled to false (muted)
    act(() => {
      useSettingsStore.setState({ soundEnabled: false })
    })

    // Mock fetch for Sandshrew
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('pokemon-species')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 27,
              flavor_text_entries: [
                {
                  flavor_text: 'Sandshrew mouse pokemon.',
                  language: { name: 'en' },
                },
              ],
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 27,
            name: 'sandshrew',
            sprites: {
              front_default: 'sand-url',
            },
            types: [{ type: { name: 'ground' } }],
            stats: [{ base_stat: 50, stat: { name: 'hp' } }],
            cries: {
              latest: 'cry-url',
            },
          }),
      } as Response)
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/pokemon/27']}>
          <Routes>
            <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for content to render
    await waitFor(() => {
      expect(screen.getByText('sandshrew')).toBeInTheDocument()
    })

    // Try playing cry when muted
    const playCryBtn = screen.getByText('PLAY CRY')
    fireEvent.click(playCryBtn)

    // Alert modal should pop up
    expect(screen.getByText('Audio is Muted')).toBeInTheDocument()
    expect(screen.getByText(/Would you like to unmute and play it now/i)).toBeInTheDocument()

    // Click unmute and play
    const unmuteBtn = screen.getByText('UNMUTE & PLAY')

    // Mock Audio
    const playMock = vi.fn().mockResolvedValue(undefined)
    class MockAudio {
      volume = 0.3
      play = playMock
    }
    vi.stubGlobal('Audio', MockAudio)

    fireEvent.click(unmuteBtn)

    // Modal should be closed, soundEnabled should be true
    expect(screen.queryByText('Audio is Muted')).not.toBeInTheDocument()
    expect(useSettingsStore.getState().soundEnabled).toBe(true)
    expect(playMock).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })
})

describe('PokedexPage', () => {
  it('renders stats and search results', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [{ name: 'bulbasaur' }, { name: 'ivysaur' }, { name: 'venusaur' }],
          }),
      } as Response)
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PokedexPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('NATIONAL INDEX')).toBeInTheDocument()

    // Wait for species to load
    await waitFor(() => {
      expect(screen.queryByText('Decoding database...')).not.toBeInTheDocument()
    })

    // Bulbasaur is not seen initially, so it should render as ???
    const questionMarks = screen.getAllByText('???')
    expect(questionMarks.length).toBeGreaterThan(0)

    // Mark Bulbasaur as seen
    act(() => {
      useCollectionStore.getState().markSeen(1)
    })

    // Now bulbasaur should be visible
    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument()
    })
  })
})
