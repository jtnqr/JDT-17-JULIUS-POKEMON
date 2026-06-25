import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Header } from '@/components/ui/Header'

// Lazy loaded page components for optimal bundle performance
const MapPage = React.lazy(() => import('./pages/MapPage'))
const AreaPage = React.lazy(() => import('./pages/AreaPage'))
const EncounterPage = React.lazy(() => import('./pages/EncounterPage'))
const BagPage = React.lazy(() => import('./pages/BagPage'))
const PartyPage = React.lazy(() => import('./pages/PartyPage'))
const PokemonDetailPage = React.lazy(() => import('./pages/PokemonDetailPage'))
const PokedexPage = React.lazy(() => import('./pages/PokedexPage'))

// Per-route fallback fallback spinner
function RouteSpinner() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background text-accent font-mono text-xs animate-pulse">
      TRANSMITTING DYNAMICS...
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none antialiased">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<RouteSpinner />}>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/area/:id" element={<AreaPage />} />
            <Route path="/encounter" element={<EncounterPage />} />
            <Route path="/bag" element={<BagPage />} />
            <Route path="/party" element={<PartyPage />} />
            <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
            <Route path="/pokedex" element={<PokedexPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
