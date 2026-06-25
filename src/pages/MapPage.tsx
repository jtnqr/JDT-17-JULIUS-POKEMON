import { Helmet } from 'react-helmet-async'
import { DesktopWorldMap } from '@/components/map/DesktopWorldMap'
import { MobileRouteList } from '@/components/map/MobileRouteList'

export default function MapPage() {
  return (
    <>
      <Helmet>
        <title>Pokédex Bronze — World Map</title>
        <meta
          name="description"
          content="Explore Pokémon routes across all regions and encounter wild Pokémon."
        />
      </Helmet>

      {/* Mobile: Journey Path list — shown below md breakpoint */}
      <div className="block md:hidden">
        <MobileRouteList />
      </div>

      {/* Desktop: spatial node map — shown at md and above */}
      <div className="hidden md:block">
        <DesktopWorldMap />
      </div>
    </>
  )
}
