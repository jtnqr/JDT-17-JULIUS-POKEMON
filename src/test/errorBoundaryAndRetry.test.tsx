import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import BagPage from '@/pages/BagPage'
import PokedexPage from '@/pages/PokedexPage'
import PokemonDetailPage from '@/pages/PokemonDetailPage'
import { useCollectionStore } from '@/stores/collectionStore'

// Helper component to throw an error
function BuggyComponent(): null {
  throw new Error('Test Error')
}

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

describe('ErrorBoundary Component', () => {
  it('renders retro system failure message on crash and handles retry', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rerender } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('⚠ System Failure')).toBeInTheDocument()
    expect(screen.getByText(/Test Error/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /RE-BOOT \/ RETRY/i })).toBeInTheDocument()

    // Rerender with working component and click retry
    rerender(
      <ErrorBoundary>
        <div>Working Content</div>
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /RE-BOOT \/ RETRY/i })
    fireEvent.click(retryButton)

    expect(screen.getByText('Working Content')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})

describe('BagPage Query Error and Retry', () => {
  it('displays styled retry card when BagPage fetch fails', async () => {
    act(() => {
      useCollectionStore.getState().catchPokemon({
        speciesId: 25,
        nickname: 'Pikachu',
        ball: 'poke-ball',
        isShiny: false,
        caughtArea: 'pallet-town',
      })
    })

    // Mock fetch failure
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BagPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Connection Interrupted')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /RETRY TRANSMISSION/i })).toBeInTheDocument()
  })
})

describe('PokedexPage Query Error and Retry', () => {
  it('displays styled retry card when PokedexPage fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PokedexPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Database Offline')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /RETRY CONNECTION/i })).toBeInTheDocument()
  })
})

describe('PokemonDetailPage Evolution Chain and Error Handling', () => {
  it('renders evolution chain stages with link connections', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('pokemon-species')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              flavor_text_entries: [
                {
                  flavor_text: 'Bulbasaur seed pokemon.',
                  language: { name: 'en' },
                },
              ],
              evolution_chain: {
                url: 'https://pokeapi.co/v2/evolution-chain/1/',
              },
            }),
        } as Response)
      }
      if (url.toString().includes('evolution-chain')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              chain: {
                species: { name: 'bulbasaur', url: 'https://pokeapi.co/v2/pokemon-species/1/' },
                evolves_to: [
                  {
                    species: { name: 'ivysaur', url: 'https://pokeapi.co/v2/pokemon-species/2/' },
                    evolves_to: [
                      {
                        species: {
                          name: 'venusaur',
                          url: 'https://pokeapi.co/v2/pokemon-species/3/',
                        },
                        evolves_to: [],
                      },
                    ],
                  },
                ],
              },
            }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            name: 'bulbasaur',
            sprites: {
              front_default: 'bulbasaur-url',
            },
            types: [{ type: { name: 'grass' } }],
            stats: [{ base_stat: 45, stat: { name: 'hp' } }],
            cries: {
              latest: 'cry-url',
            },
          }),
      } as Response)
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/pokemon/1']}>
          <Routes>
            <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /bulbasaur/i })).toBeInTheDocument()
    })

    // Should show evolution chain title and links
    expect(screen.getByText('Evolution Chain')).toBeInTheDocument()
    expect(screen.getByText('ivysaur')).toBeInTheDocument()
    expect(screen.getByText('venusaur')).toBeInTheDocument()
  })
})
