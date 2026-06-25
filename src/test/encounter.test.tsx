import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BallPicker } from '@/components/encounter/BallPicker'
import { BattleHUD } from '@/components/encounter/BattleHUD'
import { NicknameModal } from '@/components/encounter/NicknameModal'
import EncounterPage from '@/pages/EncounterPage'
import { useCollectionStore } from '@/stores/collectionStore'
import { useGameStore } from '@/stores/gameStore'

// Mock Audio for jsdom environment
class MockAudio {
  volume = 1
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  constructor(public src: string) {}
}
vi.stubGlobal('Audio', MockAudio)

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
  useGameStore.getState().resetGame()
  useCollectionStore.getState().resetCollection()
})

describe('BattleHUD Component', () => {
  it('renders name, level, types and shiny indicator correctly', () => {
    const { rerender } = render(
      <BattleHUD name="bulbasaur" level={5} types={['grass', 'poison']} isShiny={false} />
    )
    expect(screen.getByText('bulbasaur')).toBeInTheDocument()
    expect(screen.getByText('Lvl 5')).toBeInTheDocument()
    expect(screen.getByText('grass')).toBeInTheDocument()
    expect(screen.getByText('poison')).toBeInTheDocument()
    expect(screen.queryByText('✨')).not.toBeInTheDocument()

    // Test shiny indicator
    rerender(<BattleHUD name="bulbasaur" level={5} types={['grass', 'poison']} isShiny={true} />)
    expect(screen.getByText('✨')).toBeInTheDocument()
  })
})

describe('BallPicker Component', () => {
  it('renders all ball options and handles selection', () => {
    const handleSelect = vi.fn()
    render(<BallPicker onSelect={handleSelect} disabled={false} />)

    expect(screen.getByText('Poke Ball')).toBeInTheDocument()
    expect(screen.getByText('Great Ball')).toBeInTheDocument()
    expect(screen.getByText('Ultra Ball')).toBeInTheDocument()
    expect(screen.getByText('Master Ball')).toBeInTheDocument()

    const pokeBallBtn = screen.getByRole('button', { name: /poke ball/i })
    fireEvent.click(pokeBallBtn)
    expect(handleSelect).toHaveBeenCalledWith('poke-ball')
  })

  it('disables buttons when disabled prop is true', () => {
    const handleSelect = vi.fn()
    render(<BallPicker onSelect={handleSelect} disabled={true} />)

    const buttons = screen.getAllByRole('button')
    for (const btn of buttons) {
      expect(btn).toBeDisabled()
    }
  })
})

describe('NicknameModal Component', () => {
  it('pre-fills nickname and submits custom nickname', () => {
    const handleConfirm = vi.fn()
    render(<NicknameModal speciesName="charmander" onConfirm={handleConfirm} />)

    const input = screen.getByPlaceholderText('Nickname') as HTMLInputElement
    expect(input.value).toBe('Charmander')

    fireEvent.change(input, { target: { value: 'Charry' } })
    expect(input.value).toBe('Charry')

    const submitBtn = screen.getByRole('button', { name: /confirm nickname/i })
    fireEvent.click(submitBtn)

    expect(handleConfirm).toHaveBeenCalledWith('Charry')
  })
})

describe('EncounterPage Component', () => {
  it('renders fallback state when no active encounter is present', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EncounterPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('No active wild encounter.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /return to map/i })).toBeInTheDocument()
  })

  it('loads wild pokemon data and handles catch attempt', async () => {
    // Setup active encounter
    useGameStore.getState().setActiveEncounter({
      speciesId: 25,
      name: 'pikachu',
      level: 10,
      isShiny: false,
    })
    useGameStore.getState().setCurrentAreaId('kanto-route-1')

    // Mock API responses
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString()
      if (urlStr.includes('/pokemon-species/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 25,
              capture_rate: 190,
              flavor_text_entries: [],
              habitat: null,
              evolution_chain: { url: '' },
            }),
        } as Response)
      }
      if (urlStr.includes('/pokemon/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 25,
              name: 'pikachu',
              sprites: {
                front_default: 'pikachu.png',
                front_shiny: 'pikachu_shiny.png',
              },
              types: [{ type: { name: 'electric' } }],
              stats: [],
              abilities: [],
              cries: {
                latest: 'cry.ogg',
              },
            }),
        } as Response)
      }
      return Promise.reject(new Error(`Unknown URL: ${urlStr}`))
    })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/encounter']}>
          <Routes>
            <Route path="/encounter" element={<EncounterPage />} />
            <Route path="/" element={<div>Map Screen</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for HUD and Poke Ball picker to be in document
    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument()
      expect(screen.getByText('Select Poké Ball')).toBeInTheDocument()
    })

    // Now enable fake timers for the animations
    vi.useFakeTimers()

    try {
      // Click Poke Ball to trigger attempt
      const pokeBallBtn = screen.getByRole('button', { name: /poke ball/i })
      fireEvent.click(pokeBallBtn)

      // Verify state is throwing
      expect(screen.queryByText('Select Poké Ball')).not.toBeInTheDocument()

      // Advance timer for throwing -> shaking (1000ms)
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Each shake is 700ms, let's advance enough time for the shakes (max 3 shakes = 2100ms)
      act(() => {
        vi.advanceTimersByTime(2100)
      })

      // Advance by another 1000ms to cover the 600ms final resolution delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Unmount the component while fake timers are still active to prevent warnings
      unmount()
    } finally {
      vi.useRealTimers()
    }
  })

  it('guarantees catch success when using Master Ball', async () => {
    useGameStore.getState().setActiveEncounter({
      speciesId: 25,
      name: 'pikachu',
      level: 10,
      isShiny: true,
    })
    useGameStore.getState().setCurrentAreaId('kanto-route-1')

    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString()
      if (urlStr.includes('/pokemon-species/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 25,
              capture_rate: 190,
            }),
        } as Response)
      }
      if (urlStr.includes('/pokemon/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 25,
              name: 'pikachu',
              sprites: {
                front_default: 'pikachu.png',
                front_shiny: 'pikachu_shiny.png',
              },
              types: [{ type: { name: 'electric' } }],
              cries: {
                latest: 'cry.ogg',
              },
            }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/encounter']}>
          <Routes>
            <Route path="/encounter" element={<EncounterPage />} />
            <Route path="/" element={<div>Map Screen</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument()
    })

    vi.useFakeTimers()

    try {
      const masterBallBtn = screen.getByRole('button', { name: /master ball/i })
      fireEvent.click(masterBallBtn)

      // Advance past throwing (1000ms)
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Advance past shakes (3 shakes * 700ms = 2100ms)
      act(() => {
        vi.advanceTimersByTime(2100)
      })

      // Advance past the 600ms catch delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Nickname modal should be visible
      expect(screen.getByText('GOTCHA!')).toBeInTheDocument()

      // Confirm nickname
      const confirmBtn = screen.getByRole('button', { name: /confirm nickname/i })
      fireEvent.click(confirmBtn)

      // Active encounter should be cleared
      expect(useGameStore.getState().activeEncounter).toBeNull()

      // Collection store should contain the caught pikachu
      const bag = useCollectionStore.getState().bag
      expect(bag).toHaveLength(1)
      expect(bag[0].speciesId).toBe(25)
      expect(bag[0].nickname).toBe('Pikachu')
      expect(bag[0].isShiny).toBe(true)
      expect(bag[0].ball).toBe('master-ball')
      expect(bag[0].caughtArea).toBe('Route 1')

      // Navigation back to map happened
      expect(screen.getByText('Map Screen')).toBeInTheDocument()

      unmount()
    } finally {
      vi.useRealTimers()
    }
  })

  it('allows fleeing from the encounter', async () => {
    useGameStore.getState().setActiveEncounter({
      speciesId: 25,
      name: 'pikachu',
      level: 10,
      isShiny: false,
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = url.toString()
      if (urlStr.includes('/pokemon-species/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 25, capture_rate: 190 }),
        } as Response)
      }
      if (urlStr.includes('/pokemon/')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 25,
              name: 'pikachu',
              sprites: { front_default: 'pikachu.png', front_shiny: 'pikachu_shiny.png' },
              types: [{ type: { name: 'electric' } }],
              cries: { latest: 'cry.ogg' },
            }),
        } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/encounter']}>
          <Routes>
            <Route path="/encounter" element={<EncounterPage />} />
            <Route path="/" element={<div>Map Screen</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument()
    })

    const runBtn = screen.getByRole('button', { name: /run/i })
    fireEvent.click(runBtn)

    // Active encounter cleared and navigation happened
    expect(useGameStore.getState().activeEncounter).toBeNull()
    expect(screen.getByText('Map Screen')).toBeInTheDocument()

    unmount()
  })
})
