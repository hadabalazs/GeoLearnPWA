// iOS Swift GeoLearn scoring parity.
// Shared ScoreService for find/flag/capital quiz modes, fixed phase points for
// Explore, and distance scoring for Capital Location.

export function scoreServicePoints({ variant, streak, timeElapsedSeconds }) {
  let points = 100;

  // Streak multiplier: +10% per streak level, capped at 3x.
  const multiplier = Math.min(1.0 + (streak - 1) * 0.1, 3.0);
  points = Math.trunc(points * multiplier);

  // Time Trial speed bonus: full +50 at <=3s, linear down to 0 at >=10s.
  if (variant === 'timeTrial') {
    const speedBonus = Math.max(
      0,
      Math.trunc(50 * (1.0 - Math.max(0, timeElapsedSeconds - 3) / 7.0))
    );
    points += speedBonus;
  }

  return points;
}

export function isBullseye(distanceKm, bullseyeRadiusKM = 50) {
  return distanceKm <= Math.max(1, bullseyeRadiusKM);
}

export function capitalLocationScorePoints({
  distanceKm,
  bullseyeRadiusKM = 50,
  maxPoints = 5000,
  fullDistancePenalty = false,
  maxScoringDistanceKM = null,
}) {
  const bullseyeRadius = Math.max(1, bullseyeRadiusKM);

  if (distanceKm <= bullseyeRadius) {
    return maxPoints;
  }

  if (maxScoringDistanceKM !== null && maxScoringDistanceKM !== undefined) {
    if (distanceKm >= maxScoringDistanceKM) {
      return 0;
    }

    const excess = distanceKm - bullseyeRadius;
    const range = maxScoringDistanceKM - bullseyeRadius;
    const ratio = Math.max(0.0, 1.0 - excess / range);

    return Math.max(0, Math.round(maxPoints * ratio));
  }

  if (fullDistancePenalty) {
    return Math.max(0, maxPoints - Math.round(distanceKm));
  }

  const kmOver = Math.round(distanceKm) - bullseyeRadius;
  const points = maxPoints - bullseyeRadius - (kmOver - 1);

  return Math.max(0, points);
}

const CONTINENT_SCOPES = ['africa', 'americas', 'asia', 'europe', 'oceania'];

// Per-scope Capital Location scoring parameters.
export function capitalLocationParams(scope) {
  if (scope === 'hungary') {
    return { maxPoints: 1000, fullDistancePenalty: false, maxScoringDistanceKM: 1000, defaultBullseyeRadiusKM: 10 };
  }
  if (scope === 'us') {
    return { maxPoints: 5000, fullDistancePenalty: false, maxScoringDistanceKM: null, defaultBullseyeRadiusKM: 50 };
  }
  if (CONTINENT_SCOPES.includes(scope)) {
    return { maxPoints: 1000, fullDistancePenalty: true, maxScoringDistanceKM: null, defaultBullseyeRadiusKM: 50 };
  }
  return { maxPoints: 5000, fullDistancePenalty: false, maxScoringDistanceKM: null, defaultBullseyeRadiusKM: 50 };
}