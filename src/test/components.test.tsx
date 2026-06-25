import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BallIcon } from '@/components/ui/BallIcon'
import { Header } from '@/components/ui/Header'
import { PokemonCard } from '@/components/ui/PokemonCard'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { StatBar } from '@/components/ui/StatBar'
import { TypeBadge } from '@/components/ui/TypeBadge'

describe('TypeBadge Component', () => {
  it('renders badge with correct text', () => {
    render(<TypeBadge type="fire" />)
    expect(screen.getByText('fire')).toBeInTheDocument()
  })
})

describe('BallIcon Component', () => {
  it('renders BallIcon without crashing', () => {
    const { container } = render(<BallIcon type="poke-ball" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders master-ball with M text', () => {
    render(<BallIcon type="master-ball" />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })
})

describe('PokemonCard Component', () => {
  it('renders card attributes and links to detail', () => {
    render(
      <BrowserRouter>
        <PokemonCard
          id={25}
          name="pikachu"
          sprite="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          types={['electric']}
          isShiny={true}
          partySlot={2}
          ballUsed="poke-ball"
        />
      </BrowserRouter>
    )
    expect(screen.getByText('pikachu')).toBeInTheDocument()
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByText('✨ SHINY')).toBeInTheDocument()
    expect(screen.getByText('Party #2')).toBeInTheDocument()
    expect(screen.getByText('Caught')).toBeInTheDocument()
  })
})

describe('StatBar Component', () => {
  it('renders StatBar with label and value', () => {
    render(<StatBar label="HP" value={45} max={255} />)
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })
})

describe('SkeletonLoader Component', () => {
  it('renders SkeletonLoader with class name', () => {
    const { container } = render(<SkeletonLoader className="h-40" />)
    expect(container.firstChild).toHaveClass('h-40')
  })
})

describe('SoundToggle Component', () => {
  it('toggles sound on click', () => {
    render(<SoundToggle />)
    const button = screen.getByRole('button', { name: /toggle cry audio/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
  })
})

describe('Header Component', () => {
  it('renders header elements and links', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
    expect(screen.getByText('BRONZE POKÉDEX')).toBeInTheDocument()
    expect(screen.getByText(/Seen:/i)).toBeInTheDocument()
    expect(screen.getByText(/Caught:/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bag' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Party' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dex' })).toBeInTheDocument()
  })
})
