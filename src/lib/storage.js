// Persistent local storage for settings, stats, daily completion and history.

const STATS_KEY = 'geolearn:stats';
const SETTINGS_KEY = 'geolearn:settings';

// Default settings (iOS GeoLearn parity). Written to storage on first launch
// for any key that doesn't already exist.
export const SETTINGS_DEFAULTS = {
  appLanguage: 'en',
  appTheme: 'classicNavy',
  mapStyle: 'satellite',
  recommendedMap: 'world',
  recommendedMode: 'find',
  recommendedLength: 20,
  recommendedContinent: 'europe',
  recommendedExpert: false,
  recommendedHints: true,
  defaultExpertMode: false,
  defaultDisableHints: false,
  defaultMixMajorCities: false,
  defaultOneChanceMode: false,
  defaultTimeTrialMode: false,
  capitalLocatorHideCountryNameDefault: false,
  nextButtonOnCorrect: false,
  showZoomControls: false,
  animateWrongAnswers: false,
  showMissedCountryInfo: true,
};

function readSettingsBlob() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getSetting(key, fallback) {
  const s = readSettingsBlob();
  return s[key] !== undefined ? s[key] : fallback;
}

export function setSetting(key, value) {
  try {
    const s = readSettingsBlob();
    s[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

// Returns the full settings object with defaults applied for any missing key.
export function getAllSettings() {
  return { ...SETTINGS_DEFAULTS, ...readSettingsBlob() };
}

// Writes defaults for any setting key that doesn't already exist (first launch).
// Also migrates the legacy `lang` / `theme` keys to the new names.
export function initSettings() {
  const s = readSettingsBlob();
  let changed = false;
  if (s.appLanguage === undefined && s.lang !== undefined) { s.appLanguage = s.lang; changed = true; }
  if (s.appTheme === undefined && s.theme !== undefined) {
    s.appTheme = s.theme === 'navy' ? 'classicNavy' : s.theme;
    changed = true;
  }
  for (const [k, v] of Object.entries(SETTINGS_DEFAULTS)) {
    if (s[k] === undefined) { s[k] = v; changed = true; }
  }
  if (changed) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  }
}

export function defaultStats() {
  return {
    gamesPlayed: 0,
    totalCorrect: 0,
    totalMissed: 0,
    byMode: {},
    byScope: {},
    bestStreak: 0,
    bestScores: {},
    recentMisses: [],
    dailyDone: {},
    history: [],
  };
}

export function getStats() {
  try {
    return { ...defaultStats(), ...JSON.parse(localStorage.getItem(STATS_KEY) || '{}') };
  } catch {
    return defaultStats();
  }
}

function saveStats(s) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
  return s;
}

export function recordGame(result) {
  const s = getStats();
  s.gamesPlayed += 1;
  s.totalCorrect += result.correct;
  s.totalMissed += result.missed;
  if (result.bestStreak > s.bestStreak) s.bestStreak = result.bestStreak;

  const bump = (bucket, key, field) => {
    bucket[key] = bucket[key] || { correct: 0, missed: 0 };
    bucket[key][field] += field === 'correct' ? result.correct : result.missed;
  };
  bump(s.byMode, result.mode, 'correct');
  bump(s.byMode, result.mode, 'missed');
  bump(s.byScope, result.scope, 'correct');
  bump(s.byScope, result.scope, 'missed');

  s.bestScores[result.mode] = Math.max(s.bestScores[result.mode] || 0, result.score);

  const newMisses = (result.misses || []).map((m) => ({ ...m, mode: result.mode, scope: result.scope, ts: Date.now() }));
  s.recentMisses = [...newMisses, ...s.recentMisses].slice(0, 40);

  s.history = [{ ts: Date.now(), ...result }, ...s.history].slice(0, 50);

  if (result.isDaily && result.dailyKey) {
    s.dailyDone[result.dailyKey] = { score: result.score, accuracy: result.accuracy, mode: result.mode };
  }
  return saveStats(s);
}

export function isDailyDone(dateKey) {
  return !!getStats().dailyDone[dateKey];
}

export function resetStats() {
  saveStats(defaultStats());
  return defaultStats();
}

export function clearHistory() {
  const s = getStats();
  s.history = [];
  s.recentMisses = [];
  return saveStats(s);
}

// --- Favorite Game (recommended) ---

export const LENGTH_OPTIONS = {
  hungary: [5, 10, 15, 20],
  us: [10, 20, 30, 50],
  continent: [5, 10, 20, 50, 196],
  world: [10, 20, 50, 196],
};
export const LENGTH_MAX = { hungary: 20, us: 50, continent: 196, world: 196 };

const CONTINENT_SCOPES = ['africa', 'americas', 'asia', 'europe', 'oceania'];

function scopeToRecommendedMap(scope) {
  if (scope === 'world') return 'world';
  if (CONTINENT_SCOPES.includes(scope)) return 'continent';
  if (scope === 'hungary') return 'hungary';
  if (scope === 'us') return 'us';
  return null;
}

// Build the home quick-start config from the recommended* settings.
export function getRecommendation() {
  const s = getAllSettings();
  const map = s.recommendedMap;
  const mode = s.recommendedMode;
  let scope;
  if (map === 'world') scope = 'world';
  else if (map === 'continent') scope = s.recommendedContinent || 'europe';
  else scope = map;
  const gameMode = mode === 'flag' ? 'flagMatch' : mode;
  let count = s.recommendedLength;
  if (count === LENGTH_MAX[map]) count = 0; // "All"
  return {
    mode: gameMode,
    scope,
    count,
    expert: !!s.recommendedExpert,
    hints: s.recommendedHints !== false,
  };
}

// When a game is launched from a builder, mirror it into the recommended*
// settings so it becomes the home quick-start (for the 3 recommended modes).
export function saveRecommendation(config) {
  const map = scopeToRecommendedMap(config.scope);
  if (!map) return;
  const modeMap = { find: 'find', explore: 'explore', flagMatch: 'flag' };
  const recMode = modeMap[config.mode];
  if (!recMode) return;
  setSetting('recommendedMap', map);
  if (map === 'continent') setSetting('recommendedContinent', config.scope);
  setSetting('recommendedMode', recMode);
  const count = config.count === 0 ? LENGTH_MAX[map] : config.count;
  setSetting('recommendedLength', count);
  setSetting('recommendedExpert', !!config.expert);
  setSetting('recommendedHints', config.hints !== false);
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- Daily Challenge best-ratio store (iOS dailyChallengeScores_v2) ---
const DAILY_SCORES_KEY = 'geolearn:dailyScores_v2';

export function getDailyScores() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_SCORES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function recordDailyRatio(dateKey, ratio) {
  const scores = getDailyScores();
  const clamped = Math.max(0, Math.min(1, ratio));
  if (clamped > (scores[dateKey] ?? -1)) {
    scores[dateKey] = clamped;
    try { localStorage.setItem(DAILY_SCORES_KEY, JSON.stringify(scores)); } catch {}
  }
  return scores;
}

// Reset ALL statistics (game history, high scores, heatmap, daily ratios).
// Does not touch settings keys.
export function resetAllStats() {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(DAILY_SCORES_KEY);
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('highscore_') || k.startsWith('stats_') || k.startsWith('heatmap_') || k === 'gameHistory')) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
