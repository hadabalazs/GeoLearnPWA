// Shared by every map game. Never change zoom when revealing a missed answer.
// Movement remains opt-in; wrap longitude to the nearest visible world copy.
export function revealMissedAnswer(map, target, enabled, reducedMotion = false) {
  if (!enabled || !target) return;
  const from = map.getCenter();
  const lng = target.lng + 360 * Math.round((from.lng - target.lng) / 360);
  map.stop();
  map.panTo([target.lat, lng], { animate: !reducedMotion, duration: 0.6 });
}
