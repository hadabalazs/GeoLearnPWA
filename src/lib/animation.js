// Animation timing constants & helpers — iOS AnimationConstants.swift parity.

export const TIMING = {
  panPhase2Delay: 315,
  panPopIDDelay: 135,
  popDuration: 1731,
  popDebounce: 50,
  popTeardown: 1817,
  mapLoaderMinimum: 450,
  mapRevealFade: 280,
  incorrectFeedbackDuration: 2835,
  correctSheetDelay: 1080,
  correctHighlightClear: 540,
  deadResultDelay: 1350,
  timeUpResultDelay: 270,
  freePlaySheetDelay: 450,
  // Auto-advance after a correct answer. Map modes wait for the polygon pop
  // to finish; quiz modes have no pop and advance sooner. Time trial uses a
  // shortened pop (.boundary-pop--fast) so rounds stay quick.
  autoAdvanceMap: 1731,
  autoAdvanceQuiz: 900,
  autoAdvanceReveal: 1200, // explore / capital-location feedback (dot + label reveal)
  autoAdvanceTimeTrial: 1000,
  popDurationFast: 950,
  viewResetDuration: 0.45,
  scoreCountUp: 420,
};

// Countries whose polygons cross ±180° longitude — skip two-phase pan & pop.
export const ANTIMERIDIAN_COUNTRIES = new Set(['RUS', 'FJI', 'KIR', 'NZL', 'WSM', 'TON']);

export function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Country highlight state colours (iOS parity).
export const HIGHLIGHT_STATES = {
  none:      { fill: 'rgba(245, 245, 245, 1.0)', stroke: 'rgba(140, 173, 199, 1.0)', strokeWidth: 1 },
  selected:  { fill: 'rgba(46, 135, 171, 0.55)', stroke: 'rgba(46, 135, 171, 1.0)', strokeWidth: 2 },
  correct:   { fill: 'rgba(51, 199, 89, 0.80)',  stroke: 'rgba(51, 199, 89, 1.0)',  strokeWidth: 2.5 },
  incorrect: { fill: 'rgba(255, 59, 48, 0.80)',  stroke: 'rgba(255, 59, 48, 1.0)',  strokeWidth: 2.5 },
};

// Heatmap accuracy colour (0.0 = red → 1.0 = green) via HSL hue interpolation.
export function accuracyColor(pct) {
  if (pct == null) return { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--muted-foreground))' };
  const hue = Math.round(Math.max(0, Math.min(1, pct)) * 120);
  return {
    fill: `hsla(${hue}, 80%, 55%, 0.82)`,
    stroke: `hsla(${hue}, 90%, 45%, 1.0)`,
  };
}