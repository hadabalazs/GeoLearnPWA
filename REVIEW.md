# Initial repository review — October 2, 2026

Reviewed GitHub baseline `b665250` and the unpacked v4 source. This is an
initial setup and focused code review, not a comprehensive gameplay audit.

## Setup and validation

- Source imported byte-for-byte from `geolearn-web-v4-src.zip`.
- Recovered all 15 missing geography datasets from the supplied dist archive.
  Every JSON parses: 196 countries, 50 US states, and 20 Hungarian counties.
- Locked dependencies installed with `npm ci --ignore-scripts`.
- Production build passes and includes the datasets. Main JavaScript chunk is
  about 602 kB (186 kB gzip); Vite reports its >500 kB warning.
- Browser smoke check: home renders and the daily County Seats quiz opens with
  round 1/20 and four answer options. Full gameplay, installation, and offline
  scenarios have not been exhaustively tested.
- Lint fails with three unused imports: `WifiOff` in `Layout.jsx`,
  `availableToggles` in `BuilderPage.jsx`, and `hasTrophy` in `DailyBanner.jsx`.
- Typecheck reports 193 errors, including 146 in Leaflet JavaScript. Remaining
  errors concern application/component typing. No test script or CI workflow
  was supplied. No dependency security audit was performed.
- Existing Git author identity is configured. HTTPS push access passed a
  `git push --dry-run` check; no remote changes were made.

## Findings to address next

### P2 — Missed-answer facts use reversed arguments

`src/pages/Game.jsx:153` calls `getFact(id, type, ds, lang)`, while
`src/lib/data.js:111` declares `(id, type, lang, ds)`. Missed questions store a
null fact even when the dataset has one. A direct reproduction returns
`undefined` for the current call and the expected fact when arguments are
corrected. Swap the final two arguments.

### P2 — Failed boundary loads cannot retry in the same session

`src/lib/boundaries.js:37-56` retains rejected promises in `pending` because
cleanup only runs on success. A transient failure permanently fails subsequent
loads for that scope until a reload. A mocked outage followed by recovery
produced two rejections but only one fetch. Clear the pending entry in a
`finally` block, check response status, and handle rejection in consumers.

### P2 — Cached quiz data never refreshes

`src/lib/data.js:32-47` always accepts existing localStorage data and fetches
only when it is absent. Publishing corrected datasets or changing the service
worker cache version does not update returning players' localStorage copies.
Introduce dataset versioning or revalidation with a cached offline fallback.

### Repository and delivery issues

The source archive lacked the datasets promised by the README; this checkout
restores them. The supplied dist predates portions of the source according to
archive timestamps and must not be treated as the latest build. The README
also overstated self-containment: flags, boundaries, and tiles are external.
These setup/documentation issues are addressed in the prepared baseline.

Absolute routes, asset URLs, and service-worker scope assume domain-root
hosting. GitHub is suitable for source control as configured; deploying to a
GitHub Pages project subpath would need separate routing/base-path work.

## Suggested next changes

1. Fix the two reproduced runtime defects in focused commits.
2. Remove unused imports and repair the typecheck configuration/typing.
3. Validate cache upgrades, offline routes, and boundary retry behavior.
4. Add CI once checks provide a useful passing baseline.

The import intentionally preserves original application behavior so subsequent
fixes can be reviewed independently. The current working branch is
`chore/source-baseline`; publishing it is a separate step.
