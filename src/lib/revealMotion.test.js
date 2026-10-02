import { describe, expect, it } from 'vitest';
import { preservesZoomDuringReveal } from './revealMotion';

describe('wrong-answer map reveal motion', () => {
  it.each(['hungary', 'us'])('%s keeps the current zoom', (scope) => {
    expect(preservesZoomDuringReveal(scope)).toBe(true);
  });

  it.each(['world', 'africa', 'americas', 'asia', 'europe', 'oceania'])(
    '%s retains the world reveal animation',
    (scope) => {
      expect(preservesZoomDuringReveal(scope)).toBe(false);
    }
  );
});
