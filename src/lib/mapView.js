// Default map center/zoom per scope so small-country flag markers spread out
// and are individually visible (instead of clustering into one blob at world zoom).
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