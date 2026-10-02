import { useMemo, useState } from 'react';
import MapView from '../MapView';
import { localizedName } from '@/lib/data';
import { haversineKm } from '@/lib/challenge';
import { capitalLocationScorePoints, capitalLocationParams, isBullseye } from '@/lib/scoring';
import { useBoundary } from '@/lib/boundaries';
import { t } from '@/lib/i18n';

export default function FindCapitalQuestion({ target, ds, lang, config, status, onResult, roundIndex }) {
  const [tap, setTap] = useState(null);
  const [distance, setDistance] = useState(null);
  const [score, setScore] = useState(null);
  const [bullseye, setBullseye] = useState(false);

  // Persisted across rounds (keeps the map mounted); reset per-round state
  // synchronously when the round changes.
  const [roundSeen, setRoundSeen] = useState(roundIndex);
  if (roundSeen !== roundIndex) {
    setRoundSeen(roundIndex);
    setTap(null);
    setDistance(null);
    setScore(null);
    setBullseye(false);
  }

  const targetGeom = useBoundary(target);

  const params = capitalLocationParams(config.scope);
  const radius = config.bullseyeRadiusKM ?? params.defaultBullseyeRadiusKM;
  const hideRegion = !!config.hideRegionName;

  const handleClick = (latlng) => {
    if (status !== 'playing') return;
    const d = haversineKm({ lat: latlng.lat, lng: latlng.lng }, { lat: target.capitalLat, lng: target.capitalLon });
    const sc = capitalLocationScorePoints({
      distanceKm: d, bullseyeRadiusKM: radius,
      maxPoints: params.maxPoints, fullDistancePenalty: params.fullDistancePenalty,
      maxScoringDistanceKM: params.maxScoringDistanceKM,
    });
    const bull = isBullseye(d, radius);
    setTap(latlng);
    setDistance(d);
    setScore(sc);
    setBullseye(bull);
    onResult(bull, { distance: d });
  };

  const correct = bullseye;
  const markers = [];
  const boundaries = [];
  const lines = [];
  if (status === 'feedback' && tap) {
    if (targetGeom) boundaries.push({ geometry: targetGeom, color: '#34C759', fillColor: '#34C759', fillOpacity: 0.18, weight: 2 });
    markers.push({ lat: target.capitalLat, lng: target.capitalLon, label: target.capital, permanent: true, radius: 6, pathOptions: { color: '#FFFFFF', fillColor: '#FAD11F', fillOpacity: 1, weight: 1.5, className: 'capital-dot' }, labelClassName: 'capital-label' });
    if (!correct) {
      markers.push({ lat: tap.lat, lng: tap.lng, color: '#FF3B30', radius: 6, permanent: false });
      lines.push({ from: { lat: tap.lat, lng: tap.lng }, to: { lat: target.capitalLat, lng: target.capitalLon }, color: '#F5A623' });
    }
  }

  const view = useMemo(() => {
    const center = config.scope === 'hungary' ? [47.2, 19.3] : config.scope === 'us' ? [39, -98] : [25, 10];
    const zoom = config.scope === 'hungary' ? 7 : config.scope === 'us' ? 4 : 2;
    return { center, zoom };
  }, [config.scope]);
  // Fly to the capital on a miss so the tap→answer line is readable.
  const panTarget = (status === 'feedback' && tap && !correct)
    ? { id: `${target.id}:cap`, lat: target.capitalLat, lng: target.capitalLon }
    : null;
  const baseScope = config.scope === 'us' ? 'us' : config.scope === 'hungary' ? null : 'world';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-card">
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          {hideRegion ? t(lang, 'game.findCapitalCityPrompt') : t(lang, 'game.findCapitalPrompt')}
        </div>
        <div className="text-xl font-heading font-bold text-foreground">
          {hideRegion ? target.capital : localizedName(target, lang)}
        </div>
        {status === 'playing' && <div className="text-xs text-muted-foreground mt-1">{t(lang, 'game.tapMap')}</div>}
        {status === 'feedback' && distance != null && (
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className={`font-bold ${bullseye ? 'text-correct' : distance <= 100 ? 'text-accent' : 'text-incorrect'}`}>
              {bullseye ? `🎯 ${t(lang, 'game.bullseye')} ` : ''}{Math.round(distance)} km
            </span>
            <span className="text-muted-foreground">· +{score} {t(lang, 'game.score')}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 relative">
        <MapView onMapClick={handleClick} markers={markers} boundaries={boundaries} lines={lines} center={view.center} zoom={view.zoom} viewResetNonce={roundIndex} panTarget={panTarget} clickEnabled={status === 'playing'} className="absolute inset-0" hungaryBorders={config.scope === 'hungary'} baseScope={baseScope} />
      </div>
    </div>
  );
}