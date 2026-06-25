import { Link, NavLink } from 'react-router-dom'
import { SoundToggle } from '@/components/ui/SoundToggle'
import { useCollectionStore } from '@/stores/collectionStore'

export function Header() {
  const bag = useCollectionStore((s) => s.bag)
  const seenSpecies = useCollectionStore((s) => s.seenSpecies)

  const caughtCount = bag.length
  const seenCount = seenSpecies.length

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-2 sm:px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-accent text-background border-highlight font-bold shadow-[0_0_10px_rgba(205,127,50,0.4)]'
        : 'bg-surface/60 text-muted border-accent/20 hover:border-accent/60 hover:text-foreground'
    }`

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-accent/30 py-4 px-3 sm:px-6 flex justify-between items-center scanlines">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/" className="group">
          <h1 className="text-lg sm:text-xl font-bold tracking-wider text-highlight group-hover:text-foreground transition-colors duration-300">
            BRONZE POKÉDEX
          </h1>
        </Link>
        <div className="hidden sm:flex items-center gap-3 text-sm bg-surface/50 px-3 py-1.5 rounded-full border border-accent/20 text-muted">
          <span>
            👁 Seen: <strong className="text-foreground">{seenCount}</strong>
          </span>
          <span className="w-1 h-1 rounded-full bg-accent/40" />
          <span>
            ✔ Caught: <strong className="text-foreground">{caughtCount}</strong>
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 sm:gap-3">
        <NavLink to="/" className={navLinkClass}>
          Map
        </NavLink>
        <NavLink to="/bag" className={navLinkClass}>
          Bag
        </NavLink>
        <NavLink to="/party" className={navLinkClass}>
          Party
        </NavLink>
        <NavLink to="/pokedex" className={navLinkClass}>
          Dex
        </NavLink>
        <SoundToggle />
      </nav>
    </header>
  )
}
