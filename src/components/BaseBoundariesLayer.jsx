import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { loadBoundaries } from '@/lib/boundaries';
import { useApp } from '@/lib/AppContext';

// Draws every boundary for the given scope as a subtle outline so country
// shapes are clearly visible during gameplay on both satellite and minimalist
// base maps. Per-question highlight boundaries (correct/incorrect) are drawn
// separately on top by the parent via the `boundaries` prop.
//
// The L.geoJSON layer is built once per scope+style and kept in a module
// cache: parsing ~180 country polygons into LatLngs is the expensive part, and
// a Leaflet layer can be detached from one map and re-attached to another.
const layerCache = {};

function styleFor(isSat) {
  return {
    color: isSat ? 'rgba(255,255,255,0.45)' : 'rgba(30,58,94,0.40)',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0,
    lineJoin: /** @type {import('leaflet').LineJoinShape} */ ('round'),
  };
}

async function getLayer(scope, isSat) {
  const key = `${scope}:${isSat ? 'sat' : 'min'}`;
  if (layerCache[key]) return layerCache[key];
  const data = await loadBoundaries(scope);
  if (!data) return null;
  if (!layerCache[key]) layerCache[key] = L.geoJSON(data, { style: styleFor(isSat), interactive: false });
  return layerCache[key];
}

export default function BaseBoundariesLayer({ scope }) {
  const map = useMap();
  const { settings } = useApp();
  const isSat = settings?.mapStyle !== 'minimalist';

  useEffect(() => {
    if (!scope) return;
    let active = true;
    let attached = null;
    getLayer(scope, isSat).then((layer) => {
      if (!active || !map || !layer) return;
      layer.addTo(map);
      attached = layer;
    }).catch(() => { /* A later mount retries failed downloads. */ });
    return () => {
      active = false;
      if (attached && map.hasLayer(attached)) map.removeLayer(attached);
    };
  }, [map, scope, isSat]);

  return null;
}
