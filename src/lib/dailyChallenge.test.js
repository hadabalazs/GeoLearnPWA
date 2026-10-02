import { describe, expect, it } from 'vitest';
import { DAILY_CHALLENGES, getDailyChallenge } from './challenge';
import { buildDailyLaunchConfig } from './dailyChallenge';

describe('iOS daily catalogue', () => {
  it('contains the complete 31-entry iOS schedule before monthly shuffling', () => {
    expect(DAILY_CHALLENGES).toHaveLength(31);
    expect(DAILY_CHALLENGES[3]).toMatchObject({ mode: 'find', scope: 'hungary', count: 19, oneChance: true });
    expect(DAILY_CHALLENGES[20]).toMatchObject({ mode: 'findCapital', scope: 'us', count: 20 });
  });

  it('uses the shared Swift shuffle and preserves no-hint daily settings', () => {
    const date = new Date(2026, 9, 2);
    expect(getDailyChallenge(date)).toEqual(getDailyChallenge(date));
    const noHintDate = Array.from({ length: 31 }, (_, day) => new Date(2026, 0, day + 1))
      .find((candidate) => getDailyChallenge(candidate).hints === false);
    expect(noHintDate).toBeTruthy();
    expect(buildDailyLaunchConfig(noHintDate).hints).toBe(false);
  });
});
