// Tiny haptic cues for the installed PWA (Android Chrome supports vibrate;
// iOS Safari ignores it). Guarded so it is a no-op everywhere else.
function vibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch {}
}
export const hapticCorrect = () => vibrate(12);
export const hapticIncorrect = () => vibrate([28, 40, 28]);
export const hapticTap = () => vibrate(6);
