// Flag image preloader — warms the browser cache so flag images appear
// instantly when a game round renders instead of flashing blank.

import { flagUrl } from './data';

// Preload a single image URL. Resolves on load, error, or timeout — never
// rejects, so one broken flag doesn't block the game from starting.
function preloadOne(url, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(); }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(); };
    img.onerror = () => { clearTimeout(timer); resolve(); };
    img.src = url;
  });
}

// Preload flag images for the given flag codes at each of the given widths.
// Deduplicates codes and filters out falsy values. Returns a promise that
// resolves when all images are loaded, errored, or timed out.
export async function preloadFlags(flagCodes, widths = [80]) {
  const codes = [...new Set(flagCodes.filter(Boolean))];
  const sizes = Array.isArray(widths) ? widths : [widths];
  await Promise.all(codes.flatMap((code) => sizes.map((w) => preloadOne(flagUrl(code, w)))));
}

// Flag widths each game mode actually renders (see QuizQuestion/ExploreQuestion).
// Preloading a size the UI never requests is a guaranteed cache miss.
export function flagWidthsForMode(mode, config = {}) {
  if (mode === 'flagMatch') return [320];
  if (mode === 'flagReverse') return [160];
  if (mode === 'capital') return config.hints ? [] : [320];
  if (mode === 'explore') return [160];
  return []; // find / findCapital use emoji markers, no images
}

// Two-tier preload: block on the flags the first few rounds will show, then
// warm the rest in the background so game start isn't gated on ~200 requests.
export function preloadFlagsTiered(priorityCodes, restCodes, widths) {
  const prio = new Set(priorityCodes.filter(Boolean));
  const rest = restCodes.filter((c) => c && !prio.has(c));
  return preloadFlags([...prio], widths).then(() => { preloadFlags(rest, widths); });
}
