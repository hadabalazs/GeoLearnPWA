// Seeded RNG, deterministic daily challenges, distance scoring and the
// Swift-compatible shareable challenge-code format.

import { encodeSwiftChallengeCode, parseSwiftChallengeCode, selectSwiftTargets } from './swiftCode';

export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(items, seed) {
  const arr = [...items];
  const rand = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomSeed() {
  // Keep the seed in [100000, 999999] so the 6-digit field always has six
  // significant digits — no leading zeros — matching iOS-generated codes.
  return Math.floor(Math.random() * 900000) + 100000;
}

export function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function capitalLocatorScore(distanceKm) {
  if (distanceKm <= 5) return 1000;
  if (distanceKm <= 25) return 800;
  if (distanceKm <= 100) return 500;
  if (distanceKm <= 250) return 250;
  return Math.max(25, Math.round(200 - distanceKm / 20));
}

// --- Swift-compatible challenge-code bridge ---
// PWA internal mode keys: find, explore, flagMatch, flagReverse, capital, findCapital
// PWA scopes: world, africa, americas, asia, europe, oceania, hungary, us

const CONTINENT_SCOPES = ['africa', 'americas', 'asia', 'europe', 'oceania'];

// Map a PWA (mode, scope) pair to a Swift mode name.
function pwaToSwiftMode(mode, scope) {
  if (mode === 'find') {
    if (scope === 'hungary') return 'hungaryFind';
    if (scope === 'us') return 'usFind';
    return 'findCountry';
  }
  if (mode === 'explore') {
    if (scope === 'hungary') return 'hungaryExplore';
    if (scope === 'us') return 'usExplore';
    return 'explore';
  }
  if (mode === 'flagMatch') return 'flagMatch';
  if (mode === 'flagReverse') return 'flagReverse';
  if (mode === 'capital') {
    if (scope === 'hungary') return 'hungaryCapital';
    if (scope === 'us') return 'usCapital';
    return 'capitalMatch';
  }
  if (mode === 'findCapital') {
    if (scope === 'hungary') return 'hungaryCapitalLocation';
    if (scope === 'us') return 'usCapitalLocation';
    return 'capitalLocation';
  }
  return null;
}

// Continent scopes are encoded as a scope char; world/hungary/us omit it.
function pwaScopeToSwiftScope(scope) {
  return CONTINENT_SCOPES.includes(scope) ? scope : null;
}

// Map a parsed Swift mode (+ optional continent scope) back to a PWA (mode, scope).
function swiftToPwaMode(swiftMode, swiftScope) {
  switch (swiftMode) {
    case 'findCountry': return { mode: 'find', scope: swiftScope || 'world' };
    case 'explore': return { mode: 'explore', scope: swiftScope || 'world' };
    case 'flagMatch': return { mode: 'flagMatch', scope: swiftScope || 'world' };
    case 'flagReverse': return { mode: 'flagReverse', scope: swiftScope || 'world' };
    case 'capitalMatch': return { mode: 'capital', scope: swiftScope || 'world' };
    case 'capitalLocation': return { mode: 'findCapital', scope: swiftScope || 'world' };
    case 'hungaryFind': return { mode: 'find', scope: 'hungary' };
    case 'hungaryExplore': return { mode: 'explore', scope: 'hungary' };
    case 'hungaryCapital': return { mode: 'capital', scope: 'hungary' };
    case 'hungaryCapitalLocation': return { mode: 'findCapital', scope: 'hungary' };
    case 'usFind': return { mode: 'find', scope: 'us' };
    case 'usExplore': return { mode: 'explore', scope: 'us' };
    case 'usCapital': return { mode: 'capital', scope: 'us' };
    case 'usCapitalLocation': return { mode: 'findCapital', scope: 'us' };
    default: return null;
  }
}

function isCapitalLocationSwiftMode(swiftMode) {
  return swiftMode === 'capitalLocation' || swiftMode === 'hungaryCapitalLocation' || swiftMode === 'usCapitalLocation';
}

export function canShareCode(mode, scope) {
  return pwaToSwiftMode(mode, scope) !== null;
}

// Encode a PWA game config into a Swift-compatible compact challenge code.
export function makeChallengeCode(cfg) {
  const swiftMode = pwaToSwiftMode(cfg.mode, cfg.scope);
  if (!swiftMode) return null;
  const swiftScope = pwaScopeToSwiftScope(cfg.scope);

  // PWA keeps oneChance (death run) and timeTrial as separate toggles; the Swift
  // compact format encodes a single variant. Death run takes priority.
  let variant = 'normal';
  if (cfg.oneChance) variant = 'deathRun';
  else if (cfg.timeTrial) variant = 'timeTrial';

  const capLoc = isCapitalLocationSwiftMode(swiftMode);

  try {
    return encodeSwiftChallengeCode({
      mode: swiftMode,
      scope: swiftScope,
      count: cfg.count,
      isExpert: !!cfg.expert,
      hintsEnabled: cfg.hints !== undefined ? !!cfg.hints : true,
      mixedMajorCitiesInCapitalOptions: !!cfg.mixCities,
      variant,
      showsRegionName: !cfg.hideRegionName,
      bullseyeRadiusKM: capLoc ? (cfg.bullseyeRadiusKM != null ? cfg.bullseyeRadiusKM : null) : null,
      seed: cfg.seed,
    });
  } catch {
    return null;
  }
}

// Parse a Swift-compatible compact challenge code into a PWA game config.
export function parseChallengeCode(raw) {
  const parsed = parseSwiftChallengeCode(raw);
  if (!parsed) throw new Error('Invalid challenge code format.');
  if (parsed.format === 'GL2') throw new Error('GL2 challenge codes are not supported yet.');

  const pwa = swiftToPwaMode(parsed.mode, parsed.scope);
  if (!pwa) throw new Error('Unsupported mode in challenge code.');

  return {
    mode: pwa.mode,
    scope: pwa.scope,
    count: parsed.count,
    expert: parsed.isExpert,
    hints: parsed.hintsEnabled,
    oneChance: parsed.variant === 'deathRun',
    timeTrial: parsed.variant === 'timeTrial',
    mixCities: parsed.mixedMajorCitiesInCapitalOptions,
    hideRegionName: parsed.showsRegionName === false,
    bullseyeRadiusKM: parsed.bullseyeRadiusKM,
    seed: parsed.seed,
  };
}

export { selectSwiftTargets };

// 31 daily challenge configurations.
export const DAILY_CHALLENGES = [
  { id: 'eu-sprint', title: 'European Sprint', titleHU: 'Európai rohanás', mode: 'find', scope: 'europe', count: 15, oneChance: true, desc: 'Find 15 European countries, one chance.', descHU: 'Keress meg 15 európai országot, egy eséllyel.' },
  { id: 'flag-blitz', title: 'Flag Blitz', titleHU: 'Zászlóroham', mode: 'flagMatch', scope: 'world', count: 15, desc: 'Match 15 global flags.', descHU: 'Párosíts 15 világzászlót.' },
  { id: 'capital-rush', title: 'Capital Rush', titleHU: 'Fővárosroham', mode: 'capital', scope: 'world', count: 15, desc: 'Name 15 world capitals.', descHU: 'Nevezz meg 15 fővárost.' },
  { id: 'hungary-hunt', title: 'Hungary Hunt', titleHU: 'Magyarország hajsza', mode: 'find', scope: 'hungary', count: 20, oneChance: true, desc: 'Locate all Hungarian counties, one chance.', descHU: 'Keresd meg az összes magyar vármegyét, egy eséllyel.' },
  { id: 'americas-explore', title: 'Americas Explorer', titleHU: 'Amerikák felfedező', mode: 'explore', scope: 'americas', count: 10, desc: 'Explore 10 countries in the Americas.', descHU: 'Fedezz fel 10 amerikai országot.' },
  { id: 'asia-pinpoint', title: 'Asia Pinpoint', titleHU: 'Ázsia célzás', mode: 'findCapital', scope: 'asia', count: 10, desc: 'Tap where 10 Asian capitals are.', descHU: 'Koppints 10 ázsiai főváros helyére.' },
  { id: 'usa-capitals', title: 'USA Capitals', titleHU: 'USA fővárosok', mode: 'capital', scope: 'us', count: 20, desc: 'Name 20 U.S. state capitals.', descHU: 'Nevezz meg 20 USA állam fővárost.' },
  { id: 'county-seats', title: 'County Seats', titleHU: 'Vármegye székhelyek', mode: 'capital', scope: 'hungary', count: 20, desc: 'Name Hungarian county seats.', descHU: 'Nevezz meg magyar vármegye székhelyeket.' },
  { id: 'oceania-flags', title: 'Oceania Flags', titleHU: 'Óceánia zászlók', mode: 'flagMatch', scope: 'oceania', count: 10, desc: 'Flag quiz for Oceania.', descHU: 'Zászlókvíz Óceániáról.' },
  { id: 'europe-capitals', title: 'Europe Capitals', titleHU: 'Európa fővárosok', mode: 'capital', scope: 'europe', count: 15, desc: 'Capital quiz for Europe.', descHU: 'Főváros kvíz Európáról.' },
  { id: 'africa-sprint', title: 'Africa Sprint', titleHU: 'Afrika rohanás', mode: 'find', scope: 'africa', count: 15, desc: 'Find 15 African countries.', descHU: 'Keress meg 15 afrikai országot.' },
  { id: 'world-flag-rev', title: 'World Flag Reverse', titleHU: 'Fordított világzászló', mode: 'flagReverse', scope: 'world', count: 15, desc: 'Pick the flag for 15 countries.', descHU: 'Válaszd ki 15 ország zászlaját.' },
  { id: 'global-pinpoint', title: 'Global Pinpoint', titleHU: 'Globális célzás', mode: 'findCapital', scope: 'world', count: 12, desc: 'Tap 12 world capitals.', descHU: 'Koppints 12 világ fővárosra.' },
  { id: 'asia-sprint', title: 'Asia Sprint', titleHU: 'Ázsia rohanás', mode: 'find', scope: 'asia', count: 15, desc: 'Find 15 Asian countries.', descHU: 'Keress meg 15 ázsiai országot.' },
  { id: 'oceania-capitals', title: 'Oceania Capitals', titleHU: 'Óceánia fővárosok', mode: 'capital', scope: 'oceania', count: 10, desc: 'Name Oceania capitals.', descHU: 'Nevezz meg óceániai fővárosokat.' },
  { id: 'us-find', title: 'US State Find', titleHU: 'USA állam keresés', mode: 'find', scope: 'us', count: 20, desc: 'Find 20 U.S. states.', descHU: 'Keress meg 20 USA államot.' },
  { id: 'europe-flag-blitz', title: 'Europe Flag Blitz', titleHU: 'Európa zászlóroham', mode: 'flagMatch', scope: 'europe', count: 15, desc: 'Match 15 European flags.', descHU: 'Párosíts 15 európai zászlót.' },
  { id: 'americas-capitals', title: 'Americas Capitals', titleHU: 'Amerikák fővárosok', mode: 'capital', scope: 'americas', count: 15, desc: 'Name Americas capitals.', descHU: 'Nevezz meg amerikai fővárosokat.' },
  { id: 'hungary-pinpoint', title: 'Hungary Capital Pinpoint', titleHU: 'Magyar főváros célzás', mode: 'findCapital', scope: 'hungary', count: 19, desc: 'Tap Hungarian county seats.', descHU: 'Koppints magyar vármegye székhelyekre.' },
  { id: 'world-explore', title: 'World Explorer', titleHU: 'Világ felfedező', mode: 'explore', scope: 'world', count: 12, desc: 'Explore 12 world countries.', descHU: 'Fedezz fel 12 világ országot.' },
  { id: 'africa-flags', title: 'Africa Flags', titleHU: 'Afrika zászlók', mode: 'flagMatch', scope: 'africa', count: 12, desc: 'Match 12 African flags.', descHU: 'Párosíts 12 afrikai zászlót.' },
  { id: 'us-pinpoint', title: 'US Pinpoint', titleHU: 'USA célzás', mode: 'findCapital', scope: 'us', count: 15, desc: 'Tap 15 U.S. state capitals.', descHU: 'Koppints 15 USA állam fővárosra.' },
  { id: 'asia-capitals', title: 'Asia Capitals', titleHU: 'Ázsia fővárosok', mode: 'capital', scope: 'asia', count: 15, desc: 'Name Asian capitals.', descHU: 'Nevezz meg ázsiai fővárosokat.' },
  { id: 'europe-explore', title: 'Europe Explorer', titleHU: 'Európa felfedező', mode: 'explore', scope: 'europe', count: 10, desc: 'Explore 10 European countries.', descHU: 'Fedezz fel 10 európai országot.' },
  { id: 'americas-flag-blitz', title: 'Americas Flag Blitz', titleHU: 'Amerikák zászlóroham', mode: 'flagMatch', scope: 'americas', count: 12, desc: 'Match 12 Americas flags.', descHU: 'Párosíts 12 amerikai zászlót.' },
  { id: 'global-find', title: 'Global Find', titleHU: 'Globális keresés', mode: 'find', scope: 'world', count: 20, desc: 'Find 20 world countries.', descHU: 'Keress meg 20 világ országot.' },
  { id: 'hungary-expert', title: 'Hungary Expert Hunt', titleHU: 'Magyarország expert hajsza', mode: 'find', scope: 'hungary', count: 20, expert: true, desc: 'Find all counties, no labels.', descHU: 'Keresd meg az összes vármegyét, címkék nélkül.' },
  { id: 'africa-explore', title: 'Africa Explorer', titleHU: 'Afrika felfedező', mode: 'explore', scope: 'africa', count: 10, desc: 'Explore 10 African countries.', descHU: 'Fedezz fel 10 afrikai országot.' },
  { id: 'oceania-explore', title: 'Oceania Explorer', titleHU: 'Óceánia felfedező', mode: 'explore', scope: 'oceania', count: 8, desc: 'Explore 8 Oceanian countries.', descHU: 'Fedezz fel 8 óceániai országot.' },
  { id: 'world-capital-rush', title: 'World Capital Rush TT', titleHU: 'Világ fővárosroham időre', mode: 'capital', scope: 'world', count: 20, timeTrial: true, desc: 'Name 20 capitals against the clock.', descHU: 'Nevezz meg 20 fővárost időre.' },
  { id: 'asia-flag-rev', title: 'Asia Flag Reverse', titleHU: 'Ázsia fordított zászló', mode: 'flagReverse', scope: 'asia', count: 15, desc: 'Pick flags for 15 Asian countries.', descHU: 'Válaszd ki 15 ázsiai ország zászlaját.' },
];

export function getDailyChallenge(date, challenges = DAILY_CHALLENGES) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const seed = Math.abs(year) * 100 + month;
  const shuffled = seededShuffle(challenges, seed);
  return shuffled[(Math.max(1, Math.min(31, day)) - 1) % shuffled.length];
}