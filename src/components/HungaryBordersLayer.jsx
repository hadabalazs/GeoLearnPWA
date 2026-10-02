import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { loadBoundaries } from '@/lib/boundaries';
import { useApp } from '@/lib/AppContext';

// For Hungary game modes: draws every county border with a thin line and the
// outer Hungary country outline with a 50% bolder line on top of it.
const COUNTY_WEIGHT = 2;

export default function HungaryBordersLayer() {
  const map = useMap();
  const { settings } = useApp();
  const isSat = settings?.mapStyle === 'satellite';
  const borderColor = isSat ? 'rgba(255,255,255,0.85)' : '#1f3b5e';

  useEffect(() => {
    let active = true;
    const drawn = [];
    (async () => {
      const countiesData = await loadBoundaries('hungary');
      if (!active || !map) return;

      const countyLayer = L.geoJSON(countiesData, {
        style: { color: borderColor, weight: COUNTY_WEIGHT, opacity: 0.7, fillOpacity: 0, lineJoin: 'round' },
      });
      countyLayer.addTo(map);
      drawn.push(countyLayer);
    })().catch(() => { /* A later mount retries failed downloads. */ });
    return () => {
      active = false;
      drawn.forEach((l) => map.removeLayer(l));
    };
  }, [map, borderColor]);

  return null;
}
