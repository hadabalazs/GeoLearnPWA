// Boundary GeoJSON loader + matcher for area highlights.
// Fetches label-free admin boundaries per scope, caches in localStorage,
// and finds the polygon geometry for a given game item.

import { useState, useEffect } from 'react';
import { fetchCachedJson } from './cachedJson';

const URLS = {
  world: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
  us: 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
  hungary: 'https://raw.githubusercontent.com/wuerdo/geoHungary/master/counties.geojson',
};

const cache = {};
const pending = {};
// Resolved geometry per `${scope}:${item.id}` (null is cached too) so the
// name-normalising feature scan below runs once per item, not once per tap.
const geomIndex = {};
// Bounding box per geometry object for a cheap reject before point-in-polygon.
const bboxCache = new WeakMap();

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[\s\-_'.]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function boundaryScopeForItem(item) {
  if (!item) return null;
  if (item.type === 'country') return 'world';
  if (item.type === 'state') return 'us';
  if (item.type === 'county') return 'hungary';
  return null;
}

export async function loadBoundaries(scope) {
  if (cache[scope]) return cache[scope];
  if (pending[scope]) return pending[scope];
  pending[scope] = (async () => {
    const storeKey = `geolearn:boundaries:${scope}`;
    const data = await fetchCachedJson(URLS[scope], storeKey, (value) => Array.isArray(value?.features));
    cache[scope] = data;
    return data;
  })().finally(() => { delete pending[scope]; });
  return pending[scope];
}

export function findBoundary(scope, item) {
  const data = cache[scope];
  if (!data || !data.features || !item) return null;
  const ik = `${scope}:${item.id}`;
  if (ik in geomIndex) return geomIndex[ik];
  const geom = findBoundaryUncached(scope, item, data.features);
  geomIndex[ik] = geom;
  return geom;
}

function findBoundaryUncached(scope, item, feats) {
  if (scope === 'world') {
    let f = feats.find((f) => f.properties?.ISO_A3 === item.id);
    if (!f) f = feats.find((f) => norm(f.properties?.NAME) === norm(item.name) || norm(f.properties?.ADMIN) === norm(item.name));
    return f ? f.geometry : null;
  }
  if (scope === 'us') {
    const f = feats.find((f) => norm(f.properties?.name) === norm(item.name));
    return f ? f.geometry : null;
  }
  if (scope === 'hungary') {
    let f = feats.find((f) => norm(f.properties?.megye) === norm(item.name));
    if (!f) {
      const tn = norm(item.name);
      f = feats.find((f) => {
        const m = norm(f.properties?.megye);
        return m.length >= 4 && (tn.startsWith(m) || m.startsWith(tn));
      });
    }
    return f ? f.geometry : null;
  }
  return null;
}

// Maps a game scope to the corresponding boundary dataset scope.
export function boundaryScopeForGameScope(scope) {
  if (scope === 'us') return 'us';
  if (scope === 'hungary') return 'hungary';
  return 'world';
}

// Ray-casting point-in-ring test.
function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Tests whether a lat/lng point falls inside a GeoJSON geometry (Polygon or
// MultiPolygon), correctly handling holes. This lets us determine which region
// a user tapped — critical for nested areas like Budapest (inside Pest county).
function geometryBBox(geometry) {
  let b = bboxCache.get(geometry);
  if (b) return b;
  b = [Infinity, Infinity, -Infinity, -Infinity];
  const walk = (coords) => {
    if (typeof coords[0] === 'number') {
      if (coords[0] < b[0]) b[0] = coords[0];
      if (coords[1] < b[1]) b[1] = coords[1];
      if (coords[0] > b[2]) b[2] = coords[0];
      if (coords[1] > b[3]) b[3] = coords[1];
    } else {
      for (const c of coords) walk(c);
    }
  };
  walk(geometry.coordinates);
  bboxCache.set(geometry, b);
  return b;
}

function pointInGeometry(lat, lng, geometry) {
  if (!geometry) return false;
  const x = lng, y = lat;
  const bb = geometryBBox(geometry);
  if (x < bb[0] || x > bb[2] || y < bb[1] || y > bb[3]) return false;
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates;
    if (!pointInRing(x, y, rings[0])) return false;
    for (let i = 1; i < rings.length; i++) {
      if (pointInRing(x, y, rings[i])) return false; // inside a hole
    }
    return true;
  }
  if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      if (!pointInRing(x, y, polygon[0])) continue;
      let inHole = false;
      for (let i = 1; i < polygon.length; i++) {
        if (pointInRing(x, y, polygon[i])) { inHole = true; break; }
      }
      if (!inHole) return true;
    }
  }
  return false;
}

// Finds the game item whose boundary polygon contains the given lat/lng point.
// Returns null if boundaries aren't loaded yet or no polygon contains the point
// (caller should fall back to nearest-center matching).
export function findItemByPoint(scope, items, lat, lng) {
  if (!cache[scope]) return null;
  for (const item of items) {
    const geom = findBoundary(scope, item);
    if (geom && pointInGeometry(lat, lng, geom)) return item;
  }
  return null;
}

// React hook: returns the boundary geometry for an item (null while loading).
export function useBoundary(item) {
  const scope = boundaryScopeForItem(item);
  const [geom, setGeom] = useState(null);
  useEffect(() => {
    let active = true;
    if (!scope) { setGeom(null); return; }
    loadBoundaries(scope).then(() => {
      if (active) setGeom(findBoundary(scope, item));
    }).catch(() => { if (active) setGeom(null); });
    return () => { active = false; };
  }, [scope, item?.id]);
  return geom;
}
