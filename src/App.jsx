import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AppProvider } from '@/lib/AppContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Game from '@/pages/Game';
// Home and Game stay in the main chunk (first paint + the thing people came
// for). Everything else is loaded on first navigation, which keeps Leaflet
// and the game code out of the way of the builders/settings and vice versa.
const Daily = lazy(() => import('@/pages/Daily'));
const Stats = lazy(() => import('@/pages/Stats'));
const Settings = lazy(() => import('@/pages/Settings'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));
const FindOnMapBuilder = lazy(() => import('@/pages/builders/FindOnMapBuilder'));
const ExploreBuilder = lazy(() => import('@/pages/builders/ExploreBuilder'));
const ChallengesBuilder = lazy(() => import('@/pages/builders/ChallengesBuilder'));
const FlagSearchBuilder = lazy(() => import('@/pages/builders/FlagSearchBuilder'));
const CapitalSearchBuilder = lazy(() => import('@/pages/builders/CapitalSearchBuilder'));
const CapitalLocationBuilder = lazy(() => import('@/pages/builders/CapitalLocationBuilder'));
const ChallengeFriendBuilder = lazy(() => import('@/pages/builders/ChallengeFriendBuilder'));
// Add page imports here

function RouteFallback() {
  return <div className="min-h-[40vh] flex items-center justify-center"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
}

// Wraps Game with a key derived from the config seed so that "Play again"
// (which navigates to the same /game route with a new seed) remounts the
// component with fresh state instead of reusing the finished game's state.
function GameWithKey() {
  const location = useLocation();
  const seed = location.state?.config?.seed;
  return <Game key={seed} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AppProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/builder/find-on-map" element={<FindOnMapBuilder />} />
              <Route path="/builder/explore" element={<ExploreBuilder />} />
              <Route path="/builder/challenges" element={<ChallengesBuilder />} />
              <Route path="/builder/flag-quiz" element={<FlagSearchBuilder />} />
              <Route path="/builder/capital-quiz" element={<CapitalSearchBuilder />} />
              <Route path="/builder/find-capital" element={<CapitalLocationBuilder />} />
              <Route path="/builder/challenge-friend" element={<ChallengeFriendBuilder />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/game" element={<GameWithKey />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  )
}

export default App
