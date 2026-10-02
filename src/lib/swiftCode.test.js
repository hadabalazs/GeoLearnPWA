import { describe, expect, it } from 'vitest';
import { parseChallengeCode } from './challenge';

function gl2(payload) {
  return `GL2-${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`;
}

describe('GL2 replay compatibility', () => {
  it('decodes the iOS URL-safe JSON payload and keeps its target order', () => {
    const config = parseChallengeCode(gl2({
      version: 2, mode: 'G', scope: 'Europe', count: 2, isExpert: false,
      hintsEnabled: true, mixedMajorCitiesInCapitalOptions: true, seed: 123456,
      variant: 'timeTrial', timeLimit: 75, bullseyeRadiusKM: 25,
      bullseyeBonusSeconds: 15, showsRegionName: false, orderedTargetIDs: ['FRA', 'DEU'],
    }));
    expect(config).toMatchObject({
      mode: 'findCapital', scope: 'europe', count: 2, timeTrial: true,
      mixCities: true, hideRegionName: true, bullseyeRadiusKM: 25,
      seed: 123456, timeLimit: 75, targets: ['FRA', 'DEU'],
    });
  });

  it('rejects malformed GL2 payloads', () => {
    expect(() => parseChallengeCode('GL2-not-valid')).toThrow('Invalid challenge code format.');
  });
});
