import { useMemo, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import MapView from '../MapView';
import FlagImage from '../FlagImage';
import { scopeItems, localizedName, CONTINENTS } from '@/lib/data';
import { ANTIMERIDIAN_COUNTRIES } from '@/lib/animation';
import { haversineKm } from '@/lib/challenge';
import { buildOptions } from '@/lib/options';
import { useBoundary, findItemByPoint, boundaryScopeForGameScope } from '@/lib/boundaries';
import { t } from '@/lib/i18n';
import { mapViewForScope } from '@/lib/mapView';
import HintButton from './HintButton';

const PHASE_ADVANCE_MS = 900;

export default function ExploreQuestion({ target, ds, lang, config, status, onResult, roundIndex }) {
  const isCountry = config.scope === 'world' || CONTINENTS.includes(config.scope);
  const [phase, setPhase] = useState('find'); // find | flag | capital
  const [findCorrect, setFindCorrect] = useState(null);
  const [flagCorrect, setFlagCorrect] = useState(null);
  const [selected, setSelected] = useState(null);
  const [flagSel, setFlagSel] = useState(null);
  const [capSel, setCapSel] = useState(null);
  const [hintNonce, setHintNonce] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // The component (and therefore the Leaflet map) persists across rounds;
  // reset all per-round state synchronously when the round changes.
  const [roundSeen, setRoundSeen] = useState(roundIndex);
  if (roundSeen !== roundIndex) {
    setRoundSeen(roundIndex);
    setPhase('find');
    setFindCorrect(null);
    setFlagCorrect(null);
    setSelected(null);
    setFlagSel(null);
    setCapSel(null);
    setHintNonce(0);
    setHintsUsed(0);
  }

  const popClass = ANTIMERIDIAN_COUNTRIES.has(target.id) ? '' : (config.timeTrial ? 'boundary-pop boundary-pop--fast' : 'boundary-pop');
  const showHint = config.hints && !config.expert && isCountry && phase === 'find' && !selected;
  const hintTarget = (showHint && target) ? { lat: target.lat, lng: target.lon, latDelta: 55, lonDelta: 70, nonce: hintNonce } : null;
  const handleHint = () => { setHintNonce((n) => n + 1); setHintsUsed((h) => h + 1); };

  const items = useMemo(() => scopeItems(config.scope, ds), [config.scope, ds]);
  const targetGeom = useBoundary(target);
  const selectedGeom = useBoundary(selected);
  const seed = config.seed + roundIndex * 13;
  const flagOptions = useMemo(() => buildOptions(target, items, seed, 4, 'id'), [target, items, seed]);
  const capOptions = useMemo(() => buildOptions(target, items, seed + 31, 4, 'id'), [target, items, seed]);

  const afterFind = (ok) => {
    setFindCorrect(ok);
    if (ok) setTimeout(() => setPhase(isCountry ? 'flag' : 'capital'), PHASE_ADVANCE_MS);
  };

  const handleMap = (latlng) => {
    if (phase !== 'find' || status !== 'playing' || selected) return;
    // Use point-in-polygon first (correct for nested areas like Budapest/Pest),
    // then fall back to nearest-center matching.
    let best = findItemByPoint(boundaryScopeForGameScope(config.scope), items, latlng.lat, latlng.lng);
    if (!best) {
      let bestD = Infinity;
      for (const it of items) {
        const d = haversineKm({ lat: latlng.lat, lng: latlng.lng }, { lat: it.lat, lng: it.lon });
        if (d < bestD) { bestD = d; best = it; }
      }
    }
    setSelected(best);
    afterFind(best.id === target.id);
  };

  const handleMarkerSelect = (id) => {
    if (phase !== 'find' || status !== 'playing' || selected) return;
    const it = items.find((i) => i.id === id);
    if (!it) return;
    setSelected(it);
    afterFind(it.id === target.id);
  };

  const handleFlag = (opt) => {
    if (flagSel != null) return;
    setFlagSel(opt.id);
    const ok = opt.id === target.id;
    setFlagCorrect(ok);
    setTimeout(() => setPhase('capital'), PHASE_ADVANCE_MS);
  };

  const handleCapital = (opt) => {
    if (capSel != null) return;
    setCapSel(opt.id);
    const capOk = opt.capital === target.capital;
    const allCorrect = isCountry ? (findCorrect && flagCorrect && capOk) : (findCorrect && capOk);
    onResult(allCorrect, { findCorrect, flagCorrect: isCountry ? flagCorrect : false, capCorrect: capOk, selectedId: selected?.id, hintsUsed });
  };

  const flagMarkers = useMemo(() => items
    .filter((it) => it.flagCode && it.flagCode.length === 2)
    .map((it) => ({ id: it.id, lat: it.lat, lng: it.lon, flagCode: it.flagCode, name: localizedName(it, lang), state: 'none' })),
  [items, lang]);

  const view = useMemo(() => mapViewForScope(config.scope), [config.scope]);
  const baseScope = config.scope === 'us' ? 'us' : config.scope === 'hungary' ? null : 'world';

  const ok = selected?.id === target.id;
  const markers = [];
  const boundaries = [];
  if (phase === 'find' && selected) {
    if (selectedGeom && !ok) boundaries.push({ geometry: selectedGeom, color: '#FF3B30', fillColor: '#FF3B30', fillOpacity: 0.80, weight: 2.5 });
    if (targetGeom) boundaries.push({ geometry: targetGeom, color: '#33C759', fillColor: '#33C759', fillOpacity: 0.80, weight: 2.5, className: popClass });
  }
  // Fly to the answer on a miss so the highlight is legible at world zoom.
  const panTarget = (phase === 'find' && selected && !ok)
    ? { id: target.id, lat: target.lat, lng: target.lon }
    : null;

  const headerKey = phase === 'capital' ? 'game.exploreCapital' : phase === 'flag' ? 'game.exploreFlag' : 'game.exploreFind';

  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-3 bg-card ${phase !== 'find' ? 'text-center' : ''}`}>
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t(lang, headerKey)}</div>
        <div className="text-xl font-heading font-bold text-foreground">{localizedName(target, lang)}</div>
      </div>
      <div className="flex-1 min-h-0 relative">
        <MapView onMapClick={handleMap} markers={markers} boundaries={boundaries} panTarget={panTarget} hintTarget={hintTarget} center={view.center} zoom={view.zoom} viewResetNonce={roundIndex} clickEnabled={phase === 'find' && status === 'playing' && !selected} className="absolute inset-0" flagMarkers={flagMarkers} showAnnotations isExpert={!!config.expert} onMarkerSelect={handleMarkerSelect} hungaryBorders={config.scope === 'hungary'} baseScope={baseScope} />
        {showHint && <HintButton onClick={handleHint} />}

        {phase === 'find' && findCorrect === false && selected && (
          <div className="feedback-bar absolute bottom-3 left-3 right-3 rounded-2xl border border-border bg-card shadow-lg px-4 py-3 flex items-center gap-3 z-[1000]">
            <div className="flex items-center gap-1.5 font-bold text-incorrect text-sm">
              <X className="w-5 h-5 shrink-0" />
              {t(lang, 'game.youClicked')} {localizedName(selected, lang)} · {t(lang, 'game.answer')} {localizedName(target, lang)}
            </div>
            <button onClick={() => setPhase(isCountry ? 'flag' : 'capital')} className="ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold touch-target">
              {t(lang, 'game.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Flag / capital phases render as a panel over the map so the map
            stays mounted for the next round's "find" phase. */}
        {phase === 'flag' && (
          <div className="explore-panel absolute inset-0 z-[1100] bg-background overflow-y-auto flex flex-col">
            <div className="w-full max-w-xl mx-auto my-auto p-4 grid grid-cols-2 gap-3 sm:gap-4">
              {flagOptions.map((opt) => {
                const locked = flagSel != null;
                const picked = flagSel === opt.id;
                let cls = 'bg-card border-border';
                if (locked) {
                  if (opt.id === target.id) cls = 'bg-correct/15 border-correct';
                  else if (picked) cls = 'bg-incorrect/15 border-incorrect';
                  else cls = 'bg-card border-border opacity-60';
                }
                return (
                  <button key={opt.id} onClick={() => handleFlag(opt)} disabled={locked}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all touch-target no-tap-highlight ${cls}`}>
                    <FlagImage flagCode={opt.flagCode} priority className="rounded shadow-sm border border-border w-20 h-14 sm:w-28 sm:h-20" size={160} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === 'capital' && (
          <div className="explore-panel absolute inset-0 z-[1100] bg-background overflow-y-auto flex flex-col">
            <div className="w-full max-w-xl mx-auto my-auto p-4 grid gap-3">
              {capOptions.map((opt, i) => {
                const locked = capSel != null;
                const picked = capSel === opt.id;
                let cls = 'bg-card border-border';
                if (locked) {
                  if (opt.capital === target.capital) cls = 'bg-correct/15 border-correct text-correct';
                  else if (picked) cls = 'bg-incorrect/15 border-incorrect text-incorrect';
                  else cls = 'bg-card border-border opacity-60';
                }
                return (
                  <button key={opt.id + opt.capital} onClick={() => handleCapital(opt)} disabled={locked}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all touch-target no-tap-highlight ${cls}`}>
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-semibold text-foreground">{opt.capital}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
