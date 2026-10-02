import { useMemo, useState } from 'react';
import MapView from '../MapView';
import { scopeItems, localizedName, CONTINENTS } from '@/lib/data';
import { ANTIMERIDIAN_COUNTRIES } from '@/lib/animation';
import { haversineKm } from '@/lib/challenge';
import { useBoundary, findItemByPoint, boundaryScopeForGameScope } from '@/lib/boundaries';
import { t } from '@/lib/i18n';
import { mapViewForScope } from '@/lib/mapView';
import HintButton from './HintButton';

export default function FindQuestion({ target, ds, lang, config, status, onResult, roundIndex }) {
  const [selected, setSelected] = useState(null);
  const [tap, setTap] = useState(null);
  const [hintNonce, setHintNonce] = useState(0);

  // The component persists across rounds (so the Leaflet map does too); reset
  // per-round state synchronously when the round index changes.
  const [roundSeen, setRoundSeen] = useState(roundIndex);
  if (roundSeen !== roundIndex) {
    setRoundSeen(roundIndex);
    setSelected(null);
    setTap(null);
    setHintNonce(0);
  }

  const items = useMemo(() => scopeItems(config.scope, ds), [config.scope, ds]);
  const targetGeom = useBoundary(target);
  const selectedGeom = useBoundary(selected);

  const handleClick = (latlng) => {
    if (status !== 'playing') return;
    // Use point-in-polygon first (correct for nested areas like Budapest/Pest),
    // then fall back to nearest-center matching if boundaries aren't loaded or
    // the click lands outside all polygons (e.g. ocean).
    let best = findItemByPoint(boundaryScopeForGameScope(config.scope), items, latlng.lat, latlng.lng);
    if (!best) {
      let bestD = Infinity;
      for (const it of items) {
        const d = haversineKm({ lat: latlng.lat, lng: latlng.lng }, { lat: it.lat, lng: it.lon });
        if (d < bestD) { bestD = d; best = it; }
      }
    }
    setTap(latlng);
    setSelected(best);
    onResult(best.id === target.id, { selectedId: best.id });
  };

  const correct = selected?.id === target.id;
  const isWorldScope = config.scope === 'world' || CONTINENTS.includes(config.scope);
  const popClass = ANTIMERIDIAN_COUNTRIES.has(target.id) ? '' : (config.timeTrial ? 'boundary-pop boundary-pop--fast' : 'boundary-pop');
  // Fly to the answer on a miss so the highlight is legible at world zoom.
  // On a correct tap the player is already looking at it.
  const panTarget = (status === 'feedback' && selected && !correct)
    ? { id: target.id, lat: target.lat, lng: target.lon }
    : null;
  const isUS = config.scope === 'us';
  const hintLatDelta = isUS ? 18 : 55;
  const hintLonDelta = isUS ? 24 : 70;
  const showHint = config.hints && !config.expert && status === 'playing' && config.scope !== 'hungary';
  const hintTarget = (showHint && target) ? { lat: target.lat, lng: target.lon, latDelta: hintLatDelta, lonDelta: hintLonDelta, nonce: hintNonce } : null;
  const handleHint = () => setHintNonce((n) => n + 1);
  const markers = [];
  const boundaries = [];
  if (status === 'feedback' && selected) {
    if (selectedGeom && !correct) boundaries.push({ geometry: selectedGeom, color: '#FF3B30', fillColor: '#FF3B30', fillOpacity: 0.80, weight: 2.5 });
    if (targetGeom) boundaries.push({ geometry: targetGeom, color: '#33C759', fillColor: '#33C759', fillOpacity: 0.80, weight: 2.5, className: popClass });
    if (!correct && tap) markers.push({ lat: tap.lat, lng: tap.lng, color: '#FF3B30', radius: 5, permanent: false });
  }

  const inFeedback = status === 'feedback' && selected;
  const selectedId = selected?.id;
  const flagMarkers = useMemo(() => items
    .filter((it) => it.flagCode && it.flagCode.length === 2)
    .map((it) => {
      let mState = 'none';
      if (inFeedback) {
        if (it.id === target.id) mState = 'correct';
        else if (it.id === selectedId) mState = correct ? 'correct' : 'incorrect';
      }
      return { id: it.id, lat: it.lat, lng: it.lon, flagCode: it.flagCode, name: localizedName(it, lang), state: mState };
    }), [items, lang, inFeedback, target.id, selectedId, correct]);

  const handleMarkerSelect = (id) => {
    if (status !== 'playing') return;
    const it = items.find((i) => i.id === id);
    if (!it) return;
    setTap({ lat: it.lat, lng: it.lon });
    setSelected(it);
    onResult(it.id === target.id, { selectedId: it.id });
  };

  const view = useMemo(() => mapViewForScope(config.scope), [config.scope]);
  const baseScope = config.scope === 'us' ? 'us' : config.scope === 'hungary' ? null : 'world';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-card">
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t(lang, 'game.findPrompt')}</div>
        <div className="text-xl font-heading font-bold text-foreground">{localizedName(target, lang)}</div>
        {config.hints && !config.expert && isWorldScope && target.continent && (
          <div className="text-xs text-accent mt-1">{target.continent}</div>
        )}
      </div>
      <div className="flex-1 min-h-0 relative">
        <MapView scope={config.scope} onMapClick={handleClick} markers={markers} boundaries={boundaries} panTarget={panTarget} hintTarget={hintTarget} labels={false} center={view.center} zoom={view.zoom} viewResetNonce={roundIndex} clickEnabled={status === 'playing'} className="absolute inset-0" flagMarkers={flagMarkers} showAnnotations isExpert={!!config.expert} onMarkerSelect={handleMarkerSelect} hungaryBorders={config.scope === 'hungary'} baseScope={baseScope} />
        {showHint && <HintButton onClick={handleHint} />}
      </div>
    </div>
  );
}
