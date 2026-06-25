import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { MobileRouteList } from '@/components/map/MobileRouteList'
import { REGION_ORDER } from '@/lib/areaMap'
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

  it('renders all region tabs', () => {
    render(
      <MemoryRouter>
        <MobileRouteList />
      </MemoryRouter>
    )
    for (const region of REGION_ORDER) {
      expect(screen.getByRole('button', { name: region })).toBeInTheDocument()
    }
  })

  it('defaults to the region of the current area', () => {
    render(
      <MemoryRouter>
        <MobileRouteList />
      </MemoryRouter>
    )
    const kantoTab = screen.getByRole('button', { name: 'Kanto' })
    expect(kantoTab).toHaveAttribute('aria-pressed', 'true')
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
