import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background text-accent font-mono text-sm animate-pulse">
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
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <MapPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/area/:id"
              element={
                <ErrorBoundary>
                  <AreaPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/encounter"
              element={
                <ErrorBoundary>
                  <EncounterPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/bag"
              element={
                <ErrorBoundary>
                  <BagPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/party"
              element={
                <ErrorBoundary>
                  <PartyPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/pokemon/:id"
              element={
                <ErrorBoundary>
                  <PokemonDetailPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/pokedex"
              element={
                <ErrorBoundary>
                  <PokedexPage />
                </ErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
