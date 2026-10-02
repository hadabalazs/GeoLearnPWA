// Map feedback motion rules shared by every map game mode.
// Regional maps are already framed tightly, so a wrong-answer reveal should
// move to the answer without changing the player's zoom level.

export function preservesZoomDuringReveal(scope) {
  return scope === 'hungary' || scope === 'us';
}
