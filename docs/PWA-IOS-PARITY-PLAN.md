# PWA / iOS parity — Terra execution plan

Status: ready for implementation; this document does not implement the changes.
Prepared: October 2, 2026.

## 1. Objective and boundaries

Bring the PWA's reachable gameplay, configuration, learning/review, statistics,
daily challenges, and replay-code behavior into parity with the reference iOS
app. Preserve the PWA's responsive web presentation, desktop sidebar, tablet
support, browser navigation, installation flow, and four existing themes.

The iOS app is the behavioral reference, not a layout template. Keep React,
Vite, Leaflet, existing shared builders, and static hosting. Do not introduce a
backend, accounts, cloud synchronization, a new UI framework, or an app rewrite.
Do not change the iOS checkout. Do not reproduce an iOS defect merely to claim
parity: document a demonstrated conflict and preserve sensible PWA behavior.

Work through the phases below in dependency order. Finish and validate one
phase before starting the next. Make focused local commits, with no unrelated
cleanup. This plan does not authorize a production deployment, merge, or push.

## 2. Checkouts and starting revisions

PWA working directory:
`/Users/balazshada/Documents/GeoLearn/GeoLearnPWA`

Reference iOS directory:
`/Users/balazshada/Documents/GeoLearn/GeoLearn-iOS-App`

- PWA baseline: `8ab8ab5ecec090275d0543c217dc846925a3f9c2`, branch
  `fix/regional-answer-zoom`.
- iOS reference: `ac804ce4063bdc54a9186a728d1fbd677e9fc536`.
- PWA history includes source import `16d0504`, documentation `10fc6b1`, and
  regional zoom fix `8ab8ab5`. Keep all three in the implementation ancestry.
- Both original ZIPs are provenance only. Edit unpacked source. Do not use the
  old dist ZIP as the implementation baseline.
- All 15 JSON datasets in PWA `public/data/` match iOS `GeoLearn/Data/`
  structurally. Preserve those values unless a separately justified fix needs
  to change them.
- Source references below are relative to their respective checkouts. iOS
  references start with `GeoLearn/`; PWA references start with `src/` or
  `public/`.

First inspect Git status and applicable `AGENTS.md`. Preserve any new user
changes. If HEAD has moved, review the intervening commits before applying
this plan; do not reset to the recorded revision. Create a working branch
such as `feat/pwa-ios-parity` from the current compatible PWA baseline.

## 3. Responsive layout contract — applies to every phase

- Preserve `src/components/Layout.jsx`: `md` and larger use the existing
  desktop/tablet sidebar and content offset; smaller widths use bottom tabs.
  Do not change navigation breakpoints as part of parity work.
- Preserve the existing `BuilderShell`, cards, typography, theme tokens,
  content widths, and responsive grids. Add options inside this system.
- Use available width for new review/statistics content: on wide screens,
  maps and detail panels can sit beside each other; stack them on narrow
  screens. Do not force a narrow iPhone-shaped column across the whole app.
- Keep existing compact forms compact where intentional. Responsive support
  does not require stretching every form across the viewport.
- New dialogs must fit the available viewport and scroll internally when
  needed. Avoid fixed phone dimensions. Menus, feedback, map controls, and
  buttons must remain reachable above bottom tabs and safe areas.
- Map size must update after resizing, sidebar/layout changes, and orientation
  changes. Preserve `ResizeObserver`/`invalidateSize` handling.
- Preserve keyboard access, visible focus, touch-sized targets, reduced-motion
  support, and English/Hungarian translations. No hover-only essential actions.
- Regression viewports: 390×844 phone; 768×1024 tablet portrait; 1024×768
  tablet landscape; 1440×900 desktop. Also check the 767/768px transition.
- At each viewport: no document-level horizontal overflow, clipped controls,
  inaccessible dialogs, sidebar overlap, or map collapsing to zero height.

## 4. Evidence and execution discipline

Create `docs/parity-status.md` with one row per capability: iOS source,
reachable iOS entry point, PWA implementation, tests, status, and exceptions.
Use statuses: pending, implemented, verified, intentional web difference,
blocked with reason. Update it with every phase's commit.

Check active iOS navigation and builders, not just file names or README claims.
Legacy/free-play/endless/streak files may exist without a current entry point.
Inventory those paths first; port any genuinely reachable capability missing
from the PWA, using its existing layout. Record unreachable legacy code as
out of scope. Do not silently declare all of it implemented or absent.

Use small pure modules for selection, scoring, serialization, and statistics
where they create a useful test boundary. Avoid moving the entire app at once.
New module names below are suggestions; reuse an existing equivalent.

For a mismatch, first reproduce it with a failing test or precise manual case.
Cross-platform fixtures must come from the Swift reference, not from the JS
port being tested. Record reference revision and generation method. If native
execution is unavailable, mark source-derived fixtures as such and record the
remaining verification; do not claim an iOS runtime test passed.

## Phase 0 — Establish a reliable baseline

Files: `package.json`, `package-lock.json`, `eslint.config.js`, `jsconfig.json`,
`src/components/Layout.jsx`, `src/components/builder/BuilderPage.jsx`,
`src/components/daily/DailyBanner.jsx`; new test configuration and fixtures.

1. Record current build, lint, typecheck, and screenshots at all four viewports.
   Known baseline: build passes; lint has three unused imports; typecheck has
   193 diagnostics, 146 in Leaflet JS. These counts are diagnostic history,
   not permission to ignore new failures.
2. Remove the three unused imports. Repair Leaflet declarations/configuration
   and application typing so typecheck becomes useful and passes. Do not turn
   off `checkJs`, exclude changed code, or add blanket suppressions to get green.
   Avoid converting the entire project to TypeScript. Check that relevant JSX,
   shared libraries, hooks, and entry points are actually checked.
3. Add a minimal Vite-compatible test setup (Vitest, React Testing Library,
   and Playwright for browser regression tests are suitable). Declare any
   added dependency directly and update the npm lockfile. Add documented
   `test`, `test:run`, and `test:e2e` scripts as appropriate.
4. Add regression coverage for the existing regional reveal fix: Hungary and
   US preserve zoom throughout a wrong-answer reveal in Find, Explore, and
   Find Capital, including reduced motion and a user-adjusted zoom. Assert
   no delayed zoom phase runs. World/continent behavior remains separate.
5. Capture normal/correct/wrong/next-round behavior before later refactors.

Gate: build, lint, typecheck, and baseline tests pass; responsive screenshots
are recorded; `parity-status.md` inventories reachable features.
Commit: `test: establish PWA parity baseline and regression checks`.

## Phase 1 — Fix configuration and feedback behavior

PWA: `src/components/MapView.jsx`, `src/pages/Game.jsx`,
`src/components/game/{FindQuestion,ExploreQuestion,FindCapitalQuestion}.jsx`,
`src/pages/Settings.jsx`, `src/lib/{data,storage}.js`.
iOS: `GeoLearn/Views/Map/{MapView,HungaryMapView,USMapView}.swift`,
`GeoLearn/Views/GameModes/FindCountryView.swift`,
`GeoLearn/Views/US/USExploreView.swift`, and the corresponding Hungary/world
Explore views and result flows.

1. Make `showZoomControls` govern Leaflet controls on every relevant map,
   including new review/heatmap maps. Settings changes must take effect live;
   disabling controls must not disable normal map gestures.
2. Wire `showMissedCountryInfo` to the corresponding optional information flow.
   Derive exact behavior per mode from iOS. A hidden info sheet must not hide
   correctness feedback, trap progression, or bypass One Chance termination.
3. Enforce Explore One Chance according to each reachable iOS mode. The current
   PWA Explore branch returns before its general death-run logic. Confirm
   whether failure means a missed map selection, follow-up answer, or both;
   do not infer a single rule for every regional/world mode.
4. Correct `getFact(id, type, ds, lang)` to the declared argument order in
   `Game.jsx`. Test real English and Hungarian records and missing facts.
5. Ensure one submission, one completed round, and one saved result despite
   double clicks, timer expiry, animation completion, and navigation/unmount.

Gate: tests cover toggles on/off, correct/wrong answers, normal/One Chance,
each map mode and region; the regional no-zoom-out regression stays green.
Commit: `fix: honor gameplay settings and one-chance rules`.

## Phase 2 — Match target selection, major cities, and score rules

PWA: `src/lib/{builderConfig,options,scoring,swiftCode}.js`,
`src/components/builder/{useBuilder,BuilderPage,controls}.jsx`,
`src/pages/Game.jsx`, `src/components/game/{ExploreQuestion,QuizQuestion,
FindCapitalQuestion}.jsx`; proposed `src/lib/targetSelection.js`.
iOS: `GeoLearn/Services/{CapitalLocationSelection,CapitalLocationEngine,
CapitalMatchEngine,DetailEngine,RegionDetailEngine,ScoreService,GeoDistance,
AntiRepeatPicker,RecentTargetsStore}.swift`, `GeoLearn/Views/Builder/`,
`GeoLearn/Views/GameModes/CapitalLocationView.swift`.

1. Define normalized session configuration with mode, scope, count, seed,
   variant, expert/hints, mixCities, hideRegionName, bullseye radius, duration,
   and explicit ordinary/daily/friend origin. Preserve defaults for old configs.
2. Implement the exact major-city eligibility, exclusions, per-region caps,
   ordering, names, and coordinates used by iOS. Capital Location needs actual
   city targets, not merely alternate labels or multiple-choice distractors.
3. Give each target a stable city/entity identity plus its containing region
   ID. Use the region ID for geometry and regional accuracy aggregation; use
   target identity for replay order. Avoid ID collisions and undefined capitals.
4. Enable Explore's applicable major-city option and use it in its follow-up
   choices. Validate existing Capital Quiz distractors against iOS as well.
5. Match ordinary-game anti-repeat selection and region spacing where iOS uses
   it. Daily and friend replays must remain independent of local history.
6. Compare scoring and completion rules with Swift fixtures across modes and
   scopes, including bullseye boundaries, distance penalties, streak caps,
   wrong answers, time bonus, and Hungary/Budapest special cases. Preserve
   existing formulas that already match rather than rewriting them gratuitously.

Gate: identical fixtures produce expected IDs, target coordinates, options,
and scores. Major-city toggles alter gameplay; off retains capital-only pools.
Fresh vs experienced browsers produce the same seeded friend/daily session.
Commit separately: target/major-city parity; anti-repeat behavior; any scoring
corrections that are demonstrated by tests.

## Phase 3 — Match timers and friend-code interoperability

PWA: `src/components/GameHeader.jsx`, `src/pages/Game.jsx`,
`src/lib/{challenge,swiftCode,builderConfig}.js`, shared builder files,
`src/pages/Home.jsx`, `src/components/ResultsScreen.jsx`.
iOS: `GeoLearn/Models/ChallengeCode.swift`,
`GeoLearn/Views/Builder/{ChallengesBuilderView,ChallengeFriendBuilderView,
CapitalLocationBuilderView}.swift`, `GeoLearnTests/ChallengeCodeRoundtripTests.swift`.

1. Add duration configuration where the active iOS builder exposes it. Its
   general challenge control starts at 60s and moves in 30s steps; inspect
   mode-specific rules before generalizing. Carry duration through preview,
   launch, timer, result, retry, stats, and replay code.
2. Start the actual deadline when gameplay becomes ready, not while flags,
   boundaries, or loader transitions are pending. Preserve iOS rules for
   feedback/background timing and bullseye bonus seconds. Stop on unmount;
   expire exactly once. Do not let browser interval throttling extend play.
3. Port the actual `GL2` payload decoding/encoding and validation from Swift.
   Do not invent a new schema from the README's example. Support all fields
   the reference uses, including ordered targets and custom time limits.
4. Preserve compact-code support and its exact UInt64 overflow/seed behavior.
   JS BigInt may be required; do not convert 64-bit arithmetic to lossy Numbers.
5. Audit every input path. The friend builder currently uppercases the whole
   input; preserve case-sensitive encoded payloads and only normalize portions
   the format permits. Reject malformed/unsupported payloads with useful UI.
6. Choose compact versus rich output using the reference encoder's conditions.
   Confirm custom-duration and major-city replays, not only encode/decode
   round trips. A syntactically valid code must actually launch the right game.

Gate: Swift-generated compact and GL2 codes launch correct PWA sessions;
PWA-generated codes decode through the reference and reproduce configuration
and target order. Include 60/90/120s, all region families, city targets,
malformed inputs, and backwards compatibility. Document any reference format
that cannot preserve a field instead of claiming lossless compatibility.
Commits: `feat: support configurable time trials`; `feat: support iOS replay codes`.

## Phase 4 — Align daily challenges without destroying historical progress

PWA: `src/lib/{challenge,dailyChallenge,storage}.js`,
`src/components/{DailyCalendarDialog,daily/DailyBanner,daily/WeeklyTracker}.jsx`,
`src/pages/Daily.jsx`, `src/pages/Game.jsx`.
iOS: `GeoLearn/Models/{DailyChallengeConfig,DailyChallengeStore}.swift`,
`GeoLearn/Views/HomeView.swift`, `GeoLearn/Views/DailyChallengeCalendarView.swift`,
`GeoLearnTests/DailyChallengeInvariantsTests.swift`.

1. Port all 31 configurations, their options/counts/translations, and the
   monthly selection algorithm. PWA currently uses a different list and
   Mulberry32 shuffle; iOS uses its UInt64 LCG. Reuse a verified Swift-compatible
   implementation rather than maintaining another almost-equivalent generator.
2. Trace the actual iOS launch path to determine question seeds and options.
   Matching the banner's name alone is insufficient. Preserve false hints,
   expert flags, region counts, and scoring/ratio definitions.
3. Match trophy threshold, best-ratio persistence, streaks, calendar availability,
   completion, and replay rules. Use local-calendar date semantics intentionally.
4. Version the schedule. Preserve old PWA daily records as legacy records with
   their original identity when known; do not relabel an old County Seats score
   as USA Capitals. Do not manufacture historical per-question details. Retain
   earned progress and make legacy provenance clear where needed.

Gate: fixtures cover all days in representative 28/29/30/31-day months,
month/year transitions, multiple timezones, and replay of past days. Known
schedule case: October 2, 2026 must select USA Capitals for the iOS schedule
(old PWA selected County Seats). Existing daily progress survives migration.
Commit: `feat: align daily challenge schedule and completion rules`.

## Phase 5 — Bring learning and missed-answer review up to parity

PWA: `src/components/ResultsScreen.jsx`, gameplay components, `src/lib/data.js`;
proposed `src/components/review/` and shared profile UI.
iOS: `GeoLearn/Views/GameModes/{MissedReviewView,MissedCountryMapView,
GeoProfileSection,DetailChallengeView,CapitalLocationResultsView}.swift`,
`GeoLearn/Views/Hungary/{MissedCountyReviewView,MissedCountyMapView,
CountyDetailChallengeView}.swift`, US result/detail views.

1. Render the already-bundled profile/fact data where the active iOS flow
   provides learning information. Match meaningful fields and localization;
   do not blindly dump every JSON key.
2. Track the actual missed phase and answer: a missed capital/flag must not
   disappear merely because the map selection was correct. Preserve per-round
   coordinates and distance where useful for Capital Location review.
3. Add map-based review with target highlight and selected/actual locations,
   switching among missed items and handling unavailable geometry gracefully.
4. On desktop/tablet, use a responsive list/detail or map/detail arrangement;
   on phone, stack or use an accessible sheet. Reuse map controls and themes.
5. Provide per-round distance/points details and result fields supported by
   the reference; keep retry and Home accessible in every layout.

Gate: wrong map, flag, and capital answers appear correctly in review; empty
and partial results work; EN/HU fields and missing-data fallbacks are tested;
maps remain correctly sized at all required viewports.
Commit: `feat: add geographic profiles and map-based answer review`.

## Phase 6 — Match statistics and high-score semantics

PWA: `src/lib/storage.js`, `src/lib/AppContext.jsx`, `src/pages/Stats.jsx`,
`src/pages/Game.jsx`; proposed `src/lib/statistics.js` and heatmap components.
iOS: `GeoLearn/Models/{GameSession,AccuracyStats}.swift`,
`GeoLearn/Services/HighScoreStore.swift`,
`GeoLearn/Views/Stats/{StatsView,HeatmapView}.swift`.

1. Define/version a session record containing mode, variant, scope, count,
   origin, timestamps, score, timing, per-round correctness/region IDs, and
   available distance/target metadata. Follow iOS stats eligibility rules.
2. Match high-score bucket keys, tie behavior, and period filters (24h, 7d,
   30d, all time). Do not mix incomparable lengths/scopes/variants. Check exact
   Swift keys before adding duration or other dimensions not present there.
3. Implement geographic accuracy heatmaps for world, Hungary, and US, with
   accessible legends and selected-region details. The PWA activity calendar
   may remain as an additional feature; it is not a geographic heatmap.
4. Migrate storage without resetting settings, high scores, totals, or daily
   results. Existing storage has only 50 retained sessions and 40 recent misses;
   do not pretend to reconstruct lost history or per-region accuracy. Preserve
   legacy totals, identify incomplete historical breakdowns, and accumulate
   richer records going forward. Use IndexedDB if needed for reliable growth;
   keep migration idempotent, retryable, and preserve old data until verified.
5. Make reset-all cover both old and new statistics stores while retaining
   settings. A persistence failure must not crash or duplicate a result.

Gate: seeded sessions produce expected period totals, score buckets, and
heatmap ratios. Test legacy migration, repeated migration, malformed records,
storage errors, exactly-once save, and reset. Validate all responsive layouts.
Commits: storage migration/session model; statistics UI and heatmaps.

## Phase 7 — Strengthen offline behavior and asset updates

PWA: `public/sw.js`, `src/lib/{data,boundaries,preload}.js`,
`src/lib/AppContext.jsx`, `src/components/OfflineIndicator.jsx`, `vite.config.js`.
iOS: bundled `GeoLearn/Data/geodata/`, `GeoLearn/Assets.xcassets/Flags/`,
`GeoLearn/Services/{MapDataCache,FlagImageStore}.swift`.

1. Bundle equivalent boundary geometry and fallback flags from the supplied
   reference assets, preserving attribution. Compare ID/name mappings and
   geometry compatibility before swapping datasets. In particular validate
   Budapest/Pest, small countries, Alaska/Hawaii, and antimeridian geometry.
2. Keep high-resolution remote imagery as an enhancement with bundled flag
   fallbacks. Map tiles remain external; document that unvisited regions may
   need a connection. Do not promise a fully downloaded offline basemap.
3. Version/revalidate cached geography data so updates reach existing players.
   Remove the current permanent localStorage-staleness behavior while retaining
   a valid offline fallback. Clear rejected boundary promises in `finally`,
   check HTTP status, and allow recovery after a transient failure.
4. Cache the built application shell and required lazy route chunks, using a
   build-derived asset manifest or a suitable Vite PWA integration. Handle
   update activation atomically; avoid old HTML/new chunk mismatches and avoid
   interrupting an active game for an update.
5. Expose retry/error states for failed startup instead of an endless loader.
   Bound tile/image caches. Do not let app cleanup delete unrelated origin data.

Gate: after successful install/precache, offline reload and direct navigation
to key routes work; bundled data/flags/boundaries remain usable. Test interrupted
install, old-to-new build upgrade, cache eviction, network recovery, and a
mid-game update. Test with fresh storage, not only a warmed browser profile.
Commits: bundled asset fallbacks; cache lifecycle and recovery.

## Phase 8 — Results sharing and final reachable-feature closure

PWA: `src/components/ResultsScreen.jsx`, relevant settings/install UI,
`src/lib/i18n.js`; proposed result-card renderer.
iOS: `GeoLearn/Views/GameModes/{ShareImageRenderer,ResultsView}.swift`,
regional results views, `GeoLearn/Views/WhatsNewView.swift` and active routing.

1. Add result-image export with equivalent score/mode/region/challenge details,
   adapted to the PWA visual system. Render independently of current viewport
   and DOM scroll position; avoid remote-image canvas tainting.
2. Use file sharing where available, PNG download otherwise, and retain code
   copy. Handle clipboard/share denial and user cancellation without a crash.
3. Close all remaining reachable-feature gaps from Phase 0's inventory, in
   separate small commits with acceptance criteria derived from the reference.
   Include any reachable help/What's New, variant, or free-play flow; do not
   silently expand scope to abandoned legacy screens.
4. Record intentional platform differences: Leaflet/providers rather than
   MapKit, browser install rather than native distribution, browser-dependent
   haptics/sharing/mail integration, PWA responsive layouts, and external map
   tile availability. These are not excuses for nonfunctional visible options.

Gate: exported image is readable and complete in EN/HU with long names and
codes; desktop download and supported mobile share paths work; all inventory
rows are verified or explicitly categorized with evidence.
Commit: `feat: add shareable result cards`, then any scoped remaining features.

## Phase 9 — Full regression and release handoff

1. Run `npm ci`, production build, lint, typecheck, unit/component tests, and
   browser tests from a clean install. Add GitHub Actions for these checks once
   they are consistently green. Do not commit a deliberately failing workflow.
2. Cover these axes with a documented test matrix, using pairwise combinations
   plus full coverage for high-risk interactions rather than every Cartesian
   combination:
   - Find, Explore, Flag Match, Flag Reverse, Capital Quiz, Find Capital.
   - World, each continent, Hungary, US where supported.
   - Ordinary, daily, friend/replay; normal, One Chance, Time Trial.
   - Correct, wrong, timeout, retry, next round, exit/reenter.
   - Hints/expert, major cities, hidden region, duration and bullseye variants.
   - All four themes, both languages, required viewport sizes, reduced motion.
   - Fresh install, legacy storage, offline warm start, update, failed fetch.
3. Mandatory end-to-end cases: regional wrong-answer no-zoom-out in all three
   map modes; Explore One Chance; city-location targets; cross-platform replay;
   custom-duration timeout; daily month boundary; saved stats after upgrade.
4. Check supported Chromium, Firefox, and WebKit behavior where tooling permits.
   Add a real installed iPhone/iPad smoke check when available; do not label
   desktop WebKit as actual-device certification. Record unavailable checks.
5. Review responsive screenshots against Phase 0. Behavior additions may change
   content, but the sidebar, breakpoints, grids, typography, and touch usability
   must remain recognizable and functional. Investigate console/runtime errors.
6. Produce `docs/parity-report.md`: completed capabilities, tests and evidence,
   intentional differences, known limits, migration behavior, and commit IDs.
7. Build a fresh deployment ZIP named with the release commit. `index.html`
   must be at ZIP root; include generated assets, data, manifest, icons, service
   worker, and SPA redirects. Validate archive integrity and preview the exact
   archived build. Keep generated dist/ZIPs out of source commits unless asked.
8. Finish with clean Git status and a concise handoff: branch/commits, passing
   checks, any unverified platform checks, report link, and dist link. Do not
   claim full parity while inventory items remain pending.

## Definition of done

- Every reachable iOS capability has a verified PWA counterpart or a documented
  intentional platform difference; no visible setting silently does nothing.
- Daily and friend challenges pass independent reference-fixture checks.
- Existing user data survives upgrades; new stats are not fabricated from old
  aggregate records.
- Hungary/US wrong-answer reveals never zoom out; desktop/tablet/mobile layout
  checks pass and the PWA has not been redesigned into an iPhone-only UI.
- Build, lint, typecheck, tests, and fresh production preview pass.
- The final report and tested deployment archive are available. Any unavailable
  device verification is plainly distinguished from completed checks.

## Suggested execution message for Terra

Implement `docs/PWA-IOS-PARITY-PLAN.md` in the GeoLearnPWA checkout. Begin with
Phase 0 and proceed in dependency order, keeping the iOS checkout read-only.
Use its pinned implementation as the behavioral reference and preserve the
PWA's existing responsive layouts. Maintain `docs/parity-status.md`, commit
each verified phase locally, and finish with the parity report and a fresh
dist ZIP. Do not skip migrations or interoperability tests, broadly suppress
type errors, redesign the app, push, merge, or deploy. If a reference behavior
is ambiguous, inspect its reachable call path and tests; document concrete
conflicts and ask only where a product decision is genuinely required.
