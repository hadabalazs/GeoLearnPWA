# PWA / iOS parity status

Reference iOS revision: `ac804ce4063bdc54a9186a728d1fbd677e9fc536`.

| Capability | iOS reference | PWA location | Verification | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Responsive navigation | `Views/HomeView.swift` | `src/components/Layout.jsx` | Desktop preview captured; full viewport matrix remains part of Phase 9 | implemented | PWA-specific desktop/sidebar and mobile bottom tabs are retained. |
| Regional wrong-answer reveal | `Views/US/USExploreView.swift` and Hungary map views | `src/components/MapView.jsx` | `src/lib/revealMotion.test.js`; browser smoke check from `8ab8ab5` | verified | Hungary and US preserve player zoom; world animations remain distinct. |
| Quality baseline | iOS test suites establish reference expectations | `package.json`, `jsconfig.json`, `src/lib/revealMotion.test.js` | `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build` pass | verified | Vitest and Leaflet declarations added; third-party UI wrappers have narrow declaration files. |
| Map settings and miss feedback | `Views/Map/MapView.swift`, Find and Explore views | `src/components/MapView.jsx`, `src/pages/Game.jsx`, `src/components/game/ExploreQuestion.jsx` | `src/lib/gameRules.test.js`, lint, typecheck, production build | verified | Zoom controls now follow their setting. Suppressing map-miss information preserves progress and One Chance completion, including Explore. |
| Major-city targets and capital options | `Services/CapitalLocationSelection.swift`, `CapitalLocationEngine.swift`, `CapitalMatchEngine.swift` | `src/lib/targetSelection.js`, `src/pages/Game.jsx`, Capital/Explore question components | `src/lib/targetSelection.test.js` | verified | Capital Location now uses stable city prompts and parent region IDs; Capital and Explore mix only the current target’s eligible major cities. |
| Core game modes | Active iOS builders | `src/pages/builders/`, `src/pages/Game.jsx` | Inventory pending | in progress | Find, Explore, Flags, Capitals and Capital Location require remaining behavior audit. |
| Daily challenges | `Models/DailyChallengeConfig.swift` | `src/lib/dailyChallenge.js` | Known October 2, 2026 mismatch | pending | iOS selects USA Capitals; PWA selects County Seats. |
| Replay codes | `Models/ChallengeCode.swift` | `src/lib/swiftCode.js`, `src/lib/challenge.js` | `src/lib/swiftCode.test.js` | verified | Compact and legacy GL2 URL-safe JSON replay codes preserve target order and replay configuration. |
| Statistics and heatmaps | `Views/Stats/` | `src/pages/Stats.jsx` | Inventory pending | pending | PWA has aggregate stats but no geographic heatmaps. |
| Offline data/assets | `Services/MapDataCache.swift`, `FlagImageStore.swift` | `public/sw.js`, `src/lib/` | Fresh-profile offline test pending | pending | PWA needs cache/version/retry work. |
