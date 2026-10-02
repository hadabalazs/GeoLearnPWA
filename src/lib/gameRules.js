// Gameplay decisions shared by the route-level game controller and tests.

export function shouldEndExploreAfterResult({ oneChance, allCorrect }) {
  return Boolean(oneChance) && !allCorrect;
}

export function shouldAutoAdvanceMapMiss({ family, showMissedCountryInfo, wasMapMiss = false }) {
  const isFindMap = family === 'findWorld' || family === 'findRegion';
  return showMissedCountryInfo === false && (isFindMap || wasMapMiss);
}
