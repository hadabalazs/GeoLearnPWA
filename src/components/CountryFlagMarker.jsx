import { memo, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { flagEmojiFromCode } from '@/lib/smallCountries';

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function CountryFlagMarker({ id, lat, lng, flagCode, name, state = 'none', isExpert = false, enabled = true, onSelect }) {
  const icon = useMemo(() => {
    const flag = flagEmojiFromCode(flagCode);
    const flagVis = isExpert ? 'hidden' : 'visible';
    const label = isExpert ? 'Select map marker' : `Select ${name || ''}`;
    const html =
      `<button class="country-flag-marker-hitbox" aria-label="${escapeAttr(label)}" data-country-id="${escapeAttr(id)}">` +
        `<span class="country-flag-marker" data-state="${state}">` +
          `<span class="country-flag-marker__bubble">` +
            `<span class="country-flag-marker__flag" style="visibility:${flagVis}" aria-hidden="true">${flag}</span>` +
          `</span>` +
          `<span class="country-flag-marker__pointer" aria-hidden="true"></span>` +
        `</span>` +
      `</button>`;
    return L.divIcon({
      className: 'country-flag-marker-icon',
      html,
      iconSize: [54, 60],
      iconAnchor: [27, 60],
    });
  }, [flagCode, name, id, state, isExpert]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      interactive={enabled}
      keyboard={enabled}
      eventHandlers={{
        click: (e) => {
          if (e) L.DomEvent.stopPropagation(e);
          if (enabled && onSelect) onSelect(id);
        },
      }}
    />
  );
}

// ~200 of these sit on the map at once; memo keeps a header/timer re-render
// from reconciling every marker when nothing about them changed.
export default memo(CountryFlagMarker);
