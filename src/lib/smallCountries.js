// Small countries that are too tiny to tap comfortably on the map and therefore
// get a circular flag-marker bubble (matching the iOS GeoLearn app).
// flagCode is the lowercase ISO-3166 alpha-2 code used by flagcdn.

export const SMALL_COUNTRY_FLAGS = new Set([
  // European microstates
  'va', 'mc', 'sm', 'ad', 'li', 'mt', 'lu',
  // Small Asian / Middle East
  'sg', 'bh', 'mv', 'ps', 'cy', 'qa', 'kw', 'lb', 'il', 'jo', 'ae', 'om', 'tw',
  // Caribbean
  'ag', 'kn', 'lc', 'vc', 'dm', 'gd', 'bb', 'bs', 'tt', 'ht', 'do', 'jm',
  // Indian Ocean / Africa small
  'km', 'sc', 'mu', 'st', 'cv', 'dj', 'gq', 'bi', 'rw', 'sl', 'lr', 'tg',
  // Pacific / Oceania small
  'pw', 'mh', 'fm', 'ki', 'tv', 'nr', 'ws', 'to', 'vu', 'sb', 'fj', 'tl',
]);

export function isSmallCountry(item) {
  if (!item?.flagCode) return false;
  return SMALL_COUNTRY_FLAGS.has(String(item.flagCode).toLowerCase());
}

// Convert a two-letter flag code into the regional indicator flag emoji.
export function flagEmojiFromCode(flagCode) {
  if (!flagCode || String(flagCode).length !== 2) return '📍';
  const codePoints = String(flagCode)
    .toUpperCase()
    .split('')
    .map((ch) => 127397 + ch.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}