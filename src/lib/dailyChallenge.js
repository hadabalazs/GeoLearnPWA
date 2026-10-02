// Daily Challenge logic: deterministic selection, trophy/streak tracking,
// and config shaping matching the iOS GeoLearn model.

import { getDailyChallenge, DAILY_CHALLENGES } from './challenge';

export const TROPHY_THRESHOLD = 0.70;

export function isoDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function hasTrophy(scores, date) {
  return (scores[isoDateKey(date)] ?? 0) >= TROPHY_THRESHOLD;
}

export function didPlay(scores, date) {
  return scores[isoDateKey(date)] !== undefined;
}

export function ratioOn(scores, date) {
  return scores[isoDateKey(date)] ?? null;
}

// Pure: returns a NEW scores object with the best ratio kept.
export function recordDailyPlay(scores, date, ratio) {
  const key = isoDateKey(date);
  const clamped = Math.max(0, Math.min(1, ratio));
  const previous = scores[key] ?? -1;
  if (clamped > previous) return { ...scores, [key]: clamped };
  return scores;
}

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Consecutive trophy days ending today (or yesterday if today not a trophy).
export function currentStreak(scores, today = new Date()) {
  let streak = 0;
  let cursor = startOfDay(today);
  if (!hasTrophy(scores, cursor)) cursor = addDays(cursor, -1);
  while (hasTrophy(scores, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function mondayOfWeek(date) {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d;
}

export const WEEKDAYS_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const WEEKDAYS_HU = ['H', 'K', 'SZ', 'CS', 'P', 'SZO', 'V'];

export function weekDaysHeader(lang) {
  return lang === 'hu' ? WEEKDAYS_HU : WEEKDAYS_EN;
}

export function weekdayShort(date, lang) {
  const idx = (date.getDay() + 6) % 7;
  return lang === 'hu' ? WEEKDAYS_HU[idx] : WEEKDAYS_EN[idx];
}

// Mode tag color by iOS gameType.type.
export const MODE_TAG_COLOR = {
  findCountry: 'bg-accent', findCounty: 'bg-accent', findState: 'bg-accent',
  exploreWorld: 'bg-correct', exploreHungary: 'bg-correct', exploreUS: 'bg-correct',
  flagMatch: 'bg-incorrect', flagReverse: 'bg-incorrect',
  capitalMatch: 'bg-chart-2', capitalLocation: 'bg-gold',
};

const EMOJI_BY_TYPE = {
  findCountry: '🗺️', findCounty: '🗺️', findState: '🗺️',
  exploreWorld: '🧭', exploreHungary: '🧭', exploreUS: '🧭',
  flagMatch: '🚩', flagReverse: '🏁',
  capitalMatch: '🏛️', capitalLocation: '📍',
};

// Map an existing PWA daily config to the iOS gameType shape.
function gameTypeFor(cfg) {
  const { mode, scope } = cfg;
  if (mode === 'find') {
    if (scope === 'hungary') return { type: 'findCounty', scope, count: cfg.count, isOneChance: !!cfg.oneChance };
    if (scope === 'us') return { type: 'findState', scope, count: cfg.count, hintsEnabled: true };
    return { type: 'findCountry', scope, count: cfg.count, isExpert: !!cfg.expert, isOneChance: !!cfg.oneChance, hintsEnabled: true };
  }
  if (mode === 'explore') {
    if (scope === 'hungary') return { type: 'exploreHungary', scope, count: cfg.count };
    if (scope === 'us') return { type: 'exploreUS', scope, count: cfg.count, hintsEnabled: true };
    return { type: 'exploreWorld', scope, count: cfg.count, hintsEnabled: true };
  }
  if (mode === 'flagMatch') return { type: 'flagMatch', scope, count: cfg.count };
  if (mode === 'flagReverse') return { type: 'flagReverse', scope, count: cfg.count };
  if (mode === 'capital') {
    const source = scope === 'hungary' ? 'hungaryCounties' : scope === 'us' ? 'usStates' : 'countries';
    return { type: 'capitalMatch', source, scope, count: cfg.count };
  }
  if (mode === 'findCapital') {
    const source = scope === 'hungary' ? 'hungaryCounties' : scope === 'us' ? 'usStates' : 'countries';
    return { type: 'capitalLocation', source, scope, count: cfg.count };
  }
  return { type: 'findCountry', scope, count: cfg.count };
}

// Full daily config for a date, with iOS-style gameType + display fields.
export function dailyConfigForDate(date, challenges = DAILY_CHALLENGES) {
  const base = getDailyChallenge(date, challenges);
  const gt = gameTypeFor(base);
  return {
    day: date.getDate(),
    name: base.title,
    nameHU: base.titleHU,
    emoji: EMOJI_BY_TYPE[gt.type] || '🗺️',
    desc: base.desc,
    descHU: base.descHU,
    gameType: gt,
    mode: base.mode,
    scope: base.scope,
    count: base.count,
    expert: !!base.expert,
    oneChance: !!base.oneChance,
    timeTrial: !!base.timeTrial,
  };
}

// Build the PWA game launch config for a date's daily challenge.
export function buildDailyLaunchConfig(date) {
  const cfg = dailyConfigForDate(date);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const seed = y * 10000 + m * 100 + d;
  return {
    mode: cfg.mode,
    scope: cfg.scope,
    count: cfg.count,
    expert: cfg.expert,
    hints: true,
    oneChance: cfg.oneChance,
    timeTrial: cfg.timeTrial,
    seed,
    isDaily: true,
    dailyKey: isoDateKey(date),
  };
}