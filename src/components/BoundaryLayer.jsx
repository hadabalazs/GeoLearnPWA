import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Renders a GeoJSON polygon (country / state / county area) on the map.
export default function BoundaryLayer({ geometry, color = '#F5A623', fillColor, fillOpacity = 0.3, weight = 2, className }) {
  const map = useMap();
  useEffect(() => {
    if (!geometry) return;
    const layer = L.geoJSON(geometry, {
      interactive: false,
      style: { color, fillColor: fillColor || color, fillOpacity, weight, lineJoin: 'round', className: className || '' },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, geometry, color, fillColor, fillOpacity, weight, className]);
  return null;
}
