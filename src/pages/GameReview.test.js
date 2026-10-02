import React from 'react';
import { act, create } from 'react-test-renderer';
import { expect, it, vi } from 'vitest';
import Game from './Game';

const context = vi.hoisted(() => ({
  datasets: { countries: [{ id: 'FRA', name: 'France', capital: 'Paris', lat: 46, lon: 2 }], countryFacts: { FRA: 'A French fact.' } },
  dataReady: true, lang: 'en', settings: { nextButtonOnCorrect: true },
  recordResult: vi.fn(), recordDailyRatio: vi.fn(),
}));
const config = vi.hoisted(() => ({ mode: 'explore', scope: 'world', count: 1, seed: 123456 }));
vi.mock('react-router-dom', () => ({ useLocation: () => ({ state: { config } }), useNavigate: () => () => {} }));
vi.mock('@/lib/AppContext', () => ({ useApp: () => context }));
vi.mock('@/lib/boundaries', () => ({ loadBoundaries: async () => {}, boundaryScopeForGameScope: () => 'world' }));
vi.mock('@/lib/preload', () => ({ preloadFlagsTiered: async () => {}, flagWidthsForMode: () => [] }));
vi.mock('@/components/MapView', () => ({ default: () => null }));
vi.mock('@/components/GameHeader', () => ({ default: () => null }));
vi.mock('@/components/MapLoader', () => ({ default: () => null }));
vi.mock('@/components/ResultsScreen', () => ({ default: (props) => React.createElement('test-results', props) }));
vi.mock('@/components/game/ExploreQuestion', () => ({ default: (props) => React.createElement('test-explore', props) }));

it.each([[false, true], [true, false]])('records a follow-up miss when flag=%s and capital=%s', async (flagCorrect, capCorrect) => {
  context.recordResult.mockClear();
  const view = create(React.createElement(Game));
  await act(async () => {});
  act(() => { view.root.findByType('test-explore').props.onResult(false, { findCorrect: true, flagCorrect, capCorrect }); });
  act(() => { view.root.findByType('button').props.onClick(); });
  expect(context.recordResult).toHaveBeenCalledTimes(1);
  expect(view.root.findByType('test-results').props.result.misses).toEqual([
    { id: 'FRA', name: 'France', answer: 'Paris', fact: 'A French fact.' },
  ]);
  act(() => { view.unmount(); });
});
