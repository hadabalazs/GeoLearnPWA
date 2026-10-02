import { describe, expect, it } from 'vitest';
import { mapBoundsForScope } from './mapView';
import { SETTINGS_DEFAULTS } from './storage';

describe('map preferences and geographic frames', () => {
  it('leaves wrong-answer map movement off for new and existing settings', () => {
    expect(SETTINGS_DEFAULTS.animateWrongAnswers).toBe(false);
  });

  it.each(['hungary', 'us', 'europe', 'americas', 'asia', 'africa', 'oceania'])('provides a valid frame for %s', (scope) => {
    const [[south, west], [north, east]] = mapBoundsForScope(scope);
    expect(south).toBeLessThan(north);
    expect(west).toBeLessThan(east);
  });

  it('includes the Hungarian borders and Alaska and Hawaii in their frames', () => {
    expect(mapBoundsForScope('hungary')).toEqual([[45.7, 16.1], [48.7, 23]]);
    const [[south, west], [north, east]] = mapBoundsForScope('us');
    expect(south).toBeLessThan(19);
    expect(west).toBeLessThanOrEqual(-179);
    expect(north).toBeGreaterThan(71);
    expect(east).toBeGreaterThan(-67);
  });
});
