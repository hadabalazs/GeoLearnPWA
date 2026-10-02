import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TIMING, ANTIMERIDIAN_COUNTRIES, prefersReducedMotion } from '@/lib/animation';
import { preservesZoomDuringReveal } from '@/lib/revealMotion';
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

// Flies the map back to the scope's default view whenever `nonce` changes
// (a new round) — needed now that the map persists across rounds instead of
// being remounted. Skipped on first mount; instant under reduced motion.
function ViewResetController({ nonce, center, zoom }) {
  const map = useMap();
  const lastRef = useRef(nonce);
  useEffect(() => {
    if (lastRef.current === nonce) return;
    lastRef.current = nonce;
    map.stop();
    if (prefersReducedMotion()) map.setView(center, zoom, { animate: false });
    else map.flyTo(center, zoom, { animate: true, duration: TIMING.viewResetDuration });
  }, [nonce, center, zoom, map]);
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

// Regional answers pan at the current zoom. World answers use a two-phase
// pan: zoom out to reveal both the current view and the target,
// then (315ms later) zoom in on the target. Antimeridian countries get an
// instant setView instead. Guarded by a ref so it only fires once per target.
function PanController({ target, scope }) {
  const map = useMap();
  const lastRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!target) {
      // Round moved on (or target cleared): never let a pending phase-2 zoom
      // fire on top of the view reset.
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      return;
    }
    const key = `${target.id}:${target.lat}:${target.lng}`;
    if (lastRef.current === key) return;
    lastRef.current = key;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    const to = L.latLng(target.lat, target.lng);
    if (preservesZoomDuringReveal(scope)) {
      // flyTo can zoom out during its flight even with the same final zoom.
      // Stop any hint/reset flight before revealing the regional answer.
      map.stop();
      map.panTo(to, { animate: !prefersReducedMotion(), duration: 0.6 });
      return;
    }
    if (ANTIMERIDIAN_COUNTRIES.has(target.id) || prefersReducedMotion()) {
      map.setView(to, 4, { animate: false });
      return;
    }
    const from = map.getCenter();
    let lonDelta = to.lng - from.lng;
    if (lonDelta > 180) lonDelta -= 360;
    if (lonDelta < -180) lonDelta += 360;
    let midLon = from.lng + lonDelta / 2;
    if (midLon > 180) midLon -= 360;
    if (midLon < -180) midLon += 360;
    const midLat = (from.lat + to.lat) / 2;
    const latSpread = Math.max(Math.abs(from.lat - to.lat) * 2.15, 40);
    const lonSpread = Math.max(Math.abs(lonDelta) * 2.15, 55);
    const wideBounds = L.latLngBounds(
      [midLat - Math.min(latSpread, 120) / 2, midLon - Math.min(lonSpread, 300) / 2],
      [midLat + Math.min(latSpread, 120) / 2, midLon + Math.min(lonSpread, 300) / 2]
    );
    const wideZoom = map.getBoundsZoom(wideBounds);
    const closeBounds = L.latLngBounds([to.lat - 15, to.lng - 20], [to.lat + 15, to.lng + 20]);
    const closeZoom = map.getBoundsZoom(closeBounds);
    map.flyTo([midLat, midLon], wideZoom, { animate: true, duration: 0.8 });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      map.flyTo([to.lat, to.lng], closeZoom, { animate: true, duration: 0.9 });
    }, TIMING.panPhase2Delay);
  }, [target, scope, map]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
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
      <ViewResetController nonce={viewResetNonce} center={center} zoom={zoom} />
      <PanController target={panTarget} scope={scope} />
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
          lng={m.lng}
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
