import { describe, expect, it } from 'vitest';
import { shouldAutoAdvanceMapMiss, shouldEndExploreAfterResult } from './gameRules';
import { getFact } from './data';

describe('one-chance Explore rules', () => {
  it('ends an Explore game after any incomplete round', () => {
    expect(shouldEndExploreAfterResult({ oneChance: true, allCorrect: false })).toBe(true);
  });

  it('continues normal Explore games and perfect one-chance rounds', () => {
    expect(shouldEndExploreAfterResult({ oneChance: false, allCorrect: false })).toBe(false);
    expect(shouldEndExploreAfterResult({ oneChance: true, allCorrect: true })).toBe(false);
  });
});

describe('missed-answer facts', () => {
  const datasets = {
    countryFacts: { france: 'English fact' },
    countryFactsHu: { france: 'Magyar tény' },
  };

  it('uses the declared language-before-datasets argument order', () => {
    expect(getFact('france', 'country', 'en', datasets)).toBe('English fact');
    expect(getFact('france', 'country', 'hu', datasets)).toBe('Magyar tény');
    expect(getFact('missing', 'country', 'en', datasets)).toBeNull();
  });
});

describe('missed map information setting', () => {
  it('only auto-advances map misses when the information strip is disabled', () => {
    expect(shouldAutoAdvanceMapMiss({ family: 'findWorld', showMissedCountryInfo: false })).toBe(true);
    expect(shouldAutoAdvanceMapMiss({ family: 'findRegion', showMissedCountryInfo: false })).toBe(true);
    expect(shouldAutoAdvanceMapMiss({ family: 'exploreWorld', wasMapMiss: true, showMissedCountryInfo: false })).toBe(true);
    expect(shouldAutoAdvanceMapMiss({ family: 'findWorld', showMissedCountryInfo: true })).toBe(false);
    expect(shouldAutoAdvanceMapMiss({ family: 'flag', showMissedCountryInfo: false })).toBe(false);
  });
});
