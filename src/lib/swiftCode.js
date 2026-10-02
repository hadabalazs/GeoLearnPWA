// Swift-compatible challenge-code encoder/parser and the exact 64-bit LCG
// SeededRNG used for target ordering interop with the native Swift GeoLearn app.

const MASK_64 = (1n << 64n) - 1n;
const RNG_A = 6364136223846793005n;
const RNG_C = 1442695040888963407n;

export class SwiftSeededRNG {
  constructor(seed) {
    this.state = (BigInt(seed) * RNG_A + RNG_C) & MASK_64;
    this.next();
    this.next();
  }

  next() {
    this.state = (this.state * RNG_A + RNG_C) & MASK_64;
    return this.state;
  }
}

export function swiftShuffle(items, seed) {
  const copy = [...items];
  const rng = new SwiftSeededRNG(seed);

  for (let i = copy.length - 1; i >= 1; i--) {
    const j = Number(rng.next() % BigInt(i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function selectSwiftTargets(allTargets, count, seed) {
  const stable = [...allTargets].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const shuffled = swiftShuffle(stable, seed);
  return count === 0 ? shuffled : shuffled.slice(0, count);
}

// --- Compact challenge-code codec (Swift interop) ---
// Ordinary non-capital-location:  M CC E H X - SSSSSS        (13, no scope)
//                                 M SC CC E H X - SSSSSS     (14, scoped)
// Capital-location:               M CC E H X B - SSSSSS      (14, no scope)
//                                 M SC CC E H X B - SSSSSS   (15, scoped)

const VALID_COUNTS = new Set([
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45,
  50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
]);

const MODE = {
  findCountry: 'F',
  explore: 'E',
  flagMatch: 'L',
  flagReverse: 'R',
  capitalMatch: 'C',
  hungaryCapital: 'J',
  usCapital: 'T',
  capitalLocation: 'G',
  hungaryCapitalLocation: 'Y',
  usCapitalLocation: 'Z',
  hungaryFind: 'H',
  hungaryExplore: 'K',
  usFind: 'U',
  usExplore: 'S',
};

const MODE_BY_CODE = Object.fromEntries(
  Object.entries(MODE).map(([name, code]) => [code, name]),
);

const SCOPED_MODES = new Set(['F', 'E', 'L', 'R', 'C', 'G']);
const CAPITAL_LOCATION_MODES = new Set(['G', 'Y', 'Z']);

const SCOPE_CODE = {
  africa: 'A',
  americas: 'M',
  asia: 'S',
  europe: 'E',
  oceania: 'O',
};

const SCOPE_BY_CODE = {
  A: 'africa',
  M: 'americas',
  S: 'asia',
  E: 'europe',
  O: 'oceania',
};

const GL2_SCOPE = {
  Global: null,
  Africa: 'africa',
  Americas: 'americas',
  Asia: 'asia',
  Europe: 'europe',
  Oceania: 'oceania',
  Hungary: 'hungary',
  'United States': 'us',
};

function parseGL2Replay(encoded, raw) {
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (payload.version !== 2 || !MODE_BY_CODE[payload.mode] || !Number.isInteger(payload.count)
      || !Number.isInteger(payload.seed) || !Array.isArray(payload.orderedTargetIDs)) return null;
    return {
      format: 'GL2', raw, mode: MODE_BY_CODE[payload.mode], modeCode: payload.mode,
      scope: GL2_SCOPE[payload.scope] ?? null, count: payload.count,
      isExpert: Boolean(payload.isExpert), hintsEnabled: Boolean(payload.hintsEnabled),
      mixedMajorCitiesInCapitalOptions: Boolean(payload.mixedMajorCitiesInCapitalOptions),
      variant: payload.variant || 'normal', showsRegionName: payload.showsRegionName ?? null,
      bullseyeRadiusKM: payload.bullseyeRadiusKM ?? null, seed: payload.seed,
      timeLimit: Number.isFinite(payload.timeLimit) ? payload.timeLimit : 60,
      bullseyeBonusSeconds: payload.bullseyeBonusSeconds ?? null,
      orderedTargetIDs: payload.orderedTargetIDs,
    };
  } catch {
    return null;
  }
}

function assertValidCount(count) {
  if (!VALID_COUNTS.has(count)) {
    throw new Error(`Invalid challenge count: ${count}`);
  }
}

function formatCount(count) {
  assertValidCount(count);
  return String(count).padStart(2, '0');
}

function formatSeed(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 999999) {
    throw new Error(`Invalid challenge seed: ${seed}`);
  }
  return String(seed).padStart(6, '0');
}

function variantCode(variant) {
  if (variant === 'timeTrial') return 'T';
  if (variant === 'deathRun' || variant === 'oneChance') return 'D';
  return 'N';
}

function decodeVariantCode(code) {
  if (code === 'T') return 'timeTrial';
  if (code === 'D') return 'deathRun';
  return 'normal';
}

function capitalLocationSpecialCode({
  variant = 'normal',
  showsRegionName = true,
  mixedMajorCitiesInCapitalOptions = false,
}) {
  const v =
    variant === 'oneChance' ? 'deathRun' :
    variant === 'timeTrial' ? 'timeTrial' :
    variant === 'deathRun' ? 'deathRun' :
    'normal';

  const key = `${v}|${showsRegionName}|${mixedMajorCitiesInCapitalOptions}`;

  const table = {
    'normal|true|false': 'N',
    'normal|false|false': 'H',
    'normal|true|true': 'M',
    'normal|false|true': 'B',

    'timeTrial|true|false': 'T',
    'timeTrial|false|false': 'P',
    'timeTrial|true|true': 'Q',
    'timeTrial|false|true': 'R',

    'deathRun|true|false': 'D',
    'deathRun|false|false': 'E',
    'deathRun|true|true': 'F',
    'deathRun|false|true': 'K',
  };

  return table[key] || 'N';
}

function decodeCapitalLocationSpecialCode(code) {
  const table = {
    N: { variant: 'normal', showsRegionName: true, mixedMajorCitiesInCapitalOptions: false },
    H: { variant: 'normal', showsRegionName: false, mixedMajorCitiesInCapitalOptions: false },
    M: { variant: 'normal', showsRegionName: true, mixedMajorCitiesInCapitalOptions: true },
    B: { variant: 'normal', showsRegionName: false, mixedMajorCitiesInCapitalOptions: true },

    T: { variant: 'timeTrial', showsRegionName: true, mixedMajorCitiesInCapitalOptions: false },
    P: { variant: 'timeTrial', showsRegionName: false, mixedMajorCitiesInCapitalOptions: false },
    Q: { variant: 'timeTrial', showsRegionName: true, mixedMajorCitiesInCapitalOptions: true },
    R: { variant: 'timeTrial', showsRegionName: false, mixedMajorCitiesInCapitalOptions: true },

    D: { variant: 'deathRun', showsRegionName: true, mixedMajorCitiesInCapitalOptions: false },
    E: { variant: 'deathRun', showsRegionName: false, mixedMajorCitiesInCapitalOptions: false },
    F: { variant: 'deathRun', showsRegionName: true, mixedMajorCitiesInCapitalOptions: true },
    K: { variant: 'deathRun', showsRegionName: false, mixedMajorCitiesInCapitalOptions: true },
  };

  return table[code] || {
    variant: 'normal',
    showsRegionName: true,
    mixedMajorCitiesInCapitalOptions: false,
  };
}

function bullseyeCode(km) {
  if (km === 10) return 'A';
  if (km === 25) return 'B';
  if (km === 50) return 'C';
  if (km === 75) return 'D';
  if (km === 100) return 'E';
  return 'C';
}

function decodeBullseyeCode(code) {
  if (code === 'A') return 10;
  if (code === 'B') return 25;
  if (code === 'C') return 50;
  if (code === 'D') return 75;
  if (code === 'E') return 100;
  return 50;
}

export function encodeSwiftChallengeCode({
  mode,
  scope = null,
  count,
  isExpert = false,
  hintsEnabled = true,
  mixedMajorCitiesInCapitalOptions = false,
  variant = 'normal',
  showsRegionName = true,
  bullseyeRadiusKM = null,
  seed,
}) {
  const modeCode = mode.length === 1 ? mode.toUpperCase() : MODE[mode];

  if (!modeCode || !MODE_BY_CODE[modeCode]) {
    throw new Error(`Invalid challenge mode: ${mode}`);
  }

  const countStr = formatCount(count);
  const seedStr = formatSeed(seed);
  const expertChar = isExpert ? 'X' : 'N';
  const hintsChar = hintsEnabled ? 'H' : 'N';

  const canHaveScope = SCOPED_MODES.has(modeCode);
  const scopeChar = scope && canHaveScope ? SCOPE_CODE[scope] : null;

  if (scope && scope !== 'global' && canHaveScope && !scopeChar) {
    throw new Error(`Invalid challenge scope: ${scope}`);
  }

  const prefix = scopeChar
    ? `${modeCode}${scopeChar}${countStr}${expertChar}${hintsChar}`
    : `${modeCode}${countStr}${expertChar}${hintsChar}`;

  if (CAPITAL_LOCATION_MODES.has(modeCode)) {
    const specialChar = capitalLocationSpecialCode({
      variant,
      showsRegionName,
      mixedMajorCitiesInCapitalOptions,
    });

    const defaultBullseye = modeCode === 'Y' ? 10 : 50;
    const bullseyeChar = bullseyeCode(bullseyeRadiusKM ?? defaultBullseye);

    return `${prefix}${specialChar}${bullseyeChar}-${seedStr}`;
  }

  let specialChar;

  if (modeCode === 'C' && mixedMajorCitiesInCapitalOptions) {
    specialChar = 'M';
  } else {
    specialChar = variantCode(variant);
  }

  return `${prefix}${specialChar}-${seedStr}`;
}

export function parseSwiftChallengeCode(raw) {
  const cleaned = String(raw ?? '').replace(/\s|\n/g, '');

  if (cleaned.toUpperCase().startsWith('GL2-')) {
    return parseGL2Replay(cleaned.slice(4), cleaned);
  }

  const s = cleaned.toUpperCase();

  // Valid compact lengths: 13 (ordinary no scope), 14 (ordinary scoped OR
  // capital-location no scope), 15 (capital-location scoped).
  if (![13, 14, 15].includes(s.length)) {
    return null;
  }

  const chars = [...s];
  const modeCode = chars[0];

  if (!MODE_BY_CODE[modeCode]) {
    return null;
  }

  const supportsScopedMode = SCOPED_MODES.has(modeCode);
  const isCapitalLocationMode = CAPITAL_LOCATION_MODES.has(modeCode);

  let scope = null;
  let countStart;
  let expertIndex;
  let hintsIndex;
  let specialIndex;
  let bullseyeIndex = null;
  let separatorIndex;
  let seedStart;

  if (s.length === 13) {
    // M CC E H X - SSSSSS  (ordinary, no scope)
    if (isCapitalLocationMode) return null;
    countStart = 1;
    expertIndex = 3;
    hintsIndex = 4;
    specialIndex = 5;
    separatorIndex = 6;
    seedStart = 7;
  } else if (s.length === 14) {
    if (isCapitalLocationMode) {
      // M CC E H X B - SSSSSS  (capital-location, no scope)
      countStart = 1;
      expertIndex = 3;
      hintsIndex = 4;
      specialIndex = 5;
      bullseyeIndex = 6;
      separatorIndex = 7;
      seedStart = 8;
    } else {
      // M SC CC E H X - SSSSSS  (ordinary, scoped)
      const parsedScope = SCOPE_BY_CODE[chars[1]];
      if (!parsedScope || !supportsScopedMode) return null;
      scope = parsedScope;
      countStart = 2;
      expertIndex = 4;
      hintsIndex = 5;
      specialIndex = 6;
      separatorIndex = 7;
      seedStart = 8;
    }
  } else {
    // length 15: M SC CC E H X B - SSSSSS  (capital-location, scoped)
    const parsedScope = SCOPE_BY_CODE[chars[1]];
    if (!parsedScope || !supportsScopedMode || !isCapitalLocationMode) return null;
    scope = parsedScope;
    countStart = 2;
    expertIndex = 4;
    hintsIndex = 5;
    specialIndex = 6;
    bullseyeIndex = 7;
    separatorIndex = 8;
    seedStart = 9;
  }

  if (chars[separatorIndex] !== '-') return null;

  const countRaw = s.slice(countStart, countStart + 2);
  if (!/^\d{2}$/.test(countRaw)) return null;

  const count = Number(countRaw);
  if (!VALID_COUNTS.has(count)) return null;

  const seedRaw = s.slice(seedStart, seedStart + 6);
  if (!/^\d{6}$/.test(seedRaw)) return null;

  const seed = Number(seedRaw);
  const isExpert = chars[expertIndex] === 'X';
  const hintsEnabled = chars[hintsIndex] === 'H';
  const specialChar = chars[specialIndex];

  let variant = 'normal';
  let mixedMajorCitiesInCapitalOptions = false;
  let showsRegionName = null;
  let bullseyeRadiusKM = null;

  if (isCapitalLocationMode) {
    const decoded = decodeCapitalLocationSpecialCode(specialChar);
    variant = decoded.variant;
    mixedMajorCitiesInCapitalOptions = decoded.mixedMajorCitiesInCapitalOptions;
    showsRegionName = decoded.showsRegionName;

    if (bullseyeIndex !== null) {
      bullseyeRadiusKM = decodeBullseyeCode(chars[bullseyeIndex]);
    }
  } else if (modeCode === 'C') {
    mixedMajorCitiesInCapitalOptions = specialChar === 'M';
    variant = mixedMajorCitiesInCapitalOptions ? 'normal' : decodeVariantCode(specialChar);
  } else {
    variant = decodeVariantCode(specialChar);
  }

  return {
    format: 'compact',
    raw: s,
    mode: MODE_BY_CODE[modeCode],
    modeCode,
    scope,
    count,
    isExpert,
    hintsEnabled,
    mixedMajorCitiesInCapitalOptions,
    variant,
    showsRegionName,
    bullseyeRadiusKM,
    seed,
  };
}
