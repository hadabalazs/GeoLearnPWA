import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { prefersReducedMotion } from '@/lib/animation';
import { revealMissedAnswer } from '@/lib/revealMotion';
import { mapBoundsForScope } from '@/lib/mapView';
import { useApp } from '@/lib/AppContext';
import BoundaryLayer from './BoundaryLayer';
import CountryFlagMarker from './CountryFlagMarker';
import HungaryBordersLayer from './HungaryBordersLayer';
import BaseBoundariesLayer from './BaseBoundariesLayer';

// Base map tile providers. Both are label-free — only the GeoLearn overlay
// layer draws text/markers on top. Satellite = ESRI World Imagery (pure
// aerial photography, matches native MKImageryMapConfiguration).
const TILE = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
    background: '#1a2a3a',
  },
  minimalist: {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    urlLabels: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    background: '#cfe8ff',
  },
};

function Resizer() {
  const map = useMap();
  useEffect(() => {
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const el = map.getContainer();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && el) {
      ro = new ResizeObserver(() => map.invalidateSize({ animate: false }));
      ro.observe(el);
    }
    return () => { cancelAnimationFrame(raf); if (ro) ro.disconnect(); };
  }, [map]);
  return null;
}

// Frame the scope on mount, a new round, or a resize while answering.
// Feedback must preserve the player's view, even when its panel resizes the map.
function ViewResetController({ nonce, center, zoom, scope, playing }) {
  const map = useMap();
  const [latitude, longitude] = center;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  useEffect(() => {
    const frame = () => {
      map.stop();
      const bounds = mapBoundsForScope(scope);
      if (bounds) map.fitBounds(bounds, { animate: false, paddingTopLeft: [24, 48], paddingBottomRight: [24, 24] });
      else map.setView([latitude, longitude], zoom, { animate: false });
    };
    const onResize = () => { if (playingRef.current) frame(); };
    frame();
    map.on('resize', onResize);
    return () => { map.off('resize', onResize); };
  }, [nonce, latitude, longitude, zoom, scope, map]);
  return null;
}

function Clicker({ onClick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled && onClick) onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Optional answer reveal pans at the current zoom on every map and mode.
function PanController({ target, enabled }) {
  const map = useMap();
  const lastRef = useRef(null);
  useEffect(() => {
    if (!target || !enabled) {
      lastRef.current = null;
      return;
    }
    const key = `${target.id}:${target.lat}:${target.lng}`;
    if (lastRef.current === key) return;
    lastRef.current = key;
    revealMissedAnswer(map, target, enabled, prefersReducedMotion());
  }, [target, enabled, map]);
  return null;
}

// Hint pan — flies the map to a lat/lng-centred bounding box when the nonce
// changes. Triggered by the hint button; ignored on initial mount (nonce 0).
function HintController({ hintTarget }) {
  const map = useMap();
  const lastNonce = useRef(null);
  useEffect(() => {
    if (!hintTarget || !hintTarget.nonce) return;
    if (lastNonce.current === hintTarget.nonce) return;
    lastNonce.current = hintTarget.nonce;
    const { lat, lng, latDelta, lonDelta } = hintTarget;
    map.flyToBounds(
      [[lat - latDelta / 2, lng - lonDelta / 2], [lat + latDelta / 2, lng + lonDelta / 2]],
      { animate: !prefersReducedMotion(), duration: 0.6, padding: [20, 20] }
    );
  }, [hintTarget, map]);
  return null;
}

export default function MapView({ onMapClick, markers = [], boundaries = [], lines = [], labels = false, center = [25, 10], zoom = 2, clickEnabled = true, className = '', flagMarkers = [], showAnnotations = true, isExpert = false, onMarkerSelect = null, hungaryBorders = false, panTarget = null, hintTarget = null, baseScope = null, scope = 'world', viewResetNonce = 0 }) {
  const { settings } = useApp();
  const mapStyle = settings?.mapStyle === 'minimalist' ? 'minimalist' : 'satellite';
  const tileCfg = TILE[mapStyle];
  const tileUrl = mapStyle === 'satellite' ? tileCfg.url : (labels ? tileCfg.urlLabels : tileCfg.url);
  const containerClass = [
    className,
    isExpert ? 'map-expert' : '',
    !showAnnotations ? 'map-flags-hidden' : '',
  ].filter(Boolean).join(' ');

  return (
    <MapContainer
      center={/** @type {import('leaflet').LatLngExpression} */ (center)}
      zoom={zoom}
      scrollWheelZoom
      zoomControl={settings?.showZoomControls === true}
      worldCopyJump
      className={containerClass}
      style={{ height: '100%', width: '100%', background: tileCfg.background, borderRadius: 'inherit' }}
    >
      <TileLayer
        key={mapStyle}
        url={tileUrl}
        attribution={tileCfg.attribution}
        subdomains={tileCfg.subdomains || 'abc'}
        maxZoom={tileCfg.maxZoom}
      />
      <Resizer />
      <Clicker onClick={onMapClick} enabled={clickEnabled} />
      <ViewResetController nonce={viewResetNonce} center={center} zoom={zoom} scope={scope} playing={clickEnabled} />
      <PanController target={panTarget} enabled={settings?.animateWrongAnswers === true} />
      <HintController hintTarget={hintTarget} />
      {baseScope && <BaseBoundariesLayer scope={baseScope} />}
      {hungaryBorders && <HungaryBordersLayer />}
      {boundaries.map((b, i) => (
        <BoundaryLayer key={i} geometry={b.geometry} color={b.color} fillColor={b.fillColor} fillOpacity={b.fillOpacity} weight={b.weight} className={b.className} />
      ))}
      {lines.map((l, i) => (
        <Polyline key={`l${i}`} positions={[[l.from.lat, l.from.lng], [l.to.lat, l.to.lng]]} pathOptions={{ color: l.color || '#F5A623', weight: 2, dashArray: '6 6' }} />
      ))}
      {showAnnotations && flagMarkers.map((m) => (
        <CountryFlagMarker
          key={m.id}
          id={m.id}
          lat={m.lat}
          lng={scope === 'oceania' && m.lng < 0 ? m.lng + 360 : m.lng}
          flagCode={m.flagCode}
          name={m.name}
          state={m.state || 'none'}
          isExpert={isExpert}
          enabled={clickEnabled}
          onSelect={onMarkerSelect}
        />
      ))}
      {markers.map((m, i) => (
        <CircleMarker
          key={i}
          center={[m.lat, m.lng]}
          radius={m.radius || 9}
          pathOptions={m.pathOptions || { color: m.color, fillColor: m.color, fillOpacity: 0.85, weight: 2 }}
        >
          {m.label && (
            <Tooltip direction="top" permanent={m.permanent} opacity={1} className={m.labelClassName}>
              {m.label}
            </Tooltip>
          )}
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
