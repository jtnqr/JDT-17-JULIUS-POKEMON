import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { MobileRouteList } from '@/components/map/MobileRouteList'
import { useGameStore } from '@/stores/gameStore'

describe('MobileRouteList', () => {
  beforeEach(() => {
    act(() => {
      useGameStore.setState({
        currentAreaId: 'pallet-town',
        visitedAreaIds: [],
        unlockedAreaIds: ['pallet-town'],
      })
    })
  })

  it('renders the world map header and all areas in a single continuous path', () => {
    render(
      <MemoryRouter>
        <MobileRouteList />
      </MemoryRouter>
    )
    expect(screen.getByText(/world map/i)).toBeInTheDocument()
    expect(screen.getByText('Pallet Town')).toBeInTheDocument()
    expect(screen.getByText('Route 1')).toBeInTheDocument()
    expect(screen.getByText('Route 45')).toBeInTheDocument()
  })

  it('locked areas have aria-label containing "locked"', () => {
    render(
      <MemoryRouter>
        <MobileRouteList />
      </MemoryRouter>
    )
    const lockedButtons = screen.getAllByLabelText(/— locked/)
    expect(lockedButtons.length).toBeGreaterThan(0)
  })
})
