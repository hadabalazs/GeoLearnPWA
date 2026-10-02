// Default map center/zoom per scope so small-country flag markers spread out
// and are individually visible (instead of clustering into one blob at world zoom).
// Geographic frames fitted to the actual map viewport, including Alaska and
// Hawaii for the US and the Pacific island groups for Oceania.
const SCOPE_BOUNDS = {
  hungary: [[45.7, 16.1], [48.7, 23.0]],
  us: [[18, -180], [72, -66]],
  europe: [[34, -25], [72, 45]],
  americas: [[-56, -180], [84, -30]],
  asia: [[-11, 25], [80, 180]],
  africa: [[-35, -26], [38, 64]],
  oceania: [[-48, 110], [30, 220]],
};

export function mapBoundsForScope(scope) {
  return SCOPE_BOUNDS[scope] || null;
}

export function mapViewForScope(scope) {
  switch (scope) {
    case 'hungary':
      return { center: [47.2, 19.3], zoom: 7 };
    case 'us':
      return { center: [39, -98], zoom: 4 };
    case 'europe':
      return { center: [52, 12], zoom: 4 };
    case 'americas':
      return { center: [10, -70], zoom: 3 };
    case 'asia':
      return { center: [30, 95], zoom: 3 };
    case 'africa':
      return { center: [5, 20], zoom: 3 };
    case 'oceania':
      return { center: [-15, 145], zoom: 4 };
    default:
      return { center: [25, 10], zoom: 2 };
  }
}
