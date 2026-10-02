# AGENTS.md

## Project Context

GeoLearn is a self-hosted, static geography quiz PWA (React + Vite + Leaflet).
No backend, no external API, no third-party SDK. Treat it as user-owned
application code, keep changes focused on the user's request, and preserve
existing project conventions.

Start with `README.md` for local setup and the build/deploy workflow.

## Key Files

- `src/`: frontend application source.
- `src/lib/data.js`: loads the geography datasets from `public/data/` (bundled
  static JSON — no network dependency at runtime).
- `src/lib/AppContext.jsx`: app-wide state (settings, stats, datasets).
- `public/sw.js`: service worker — caches data, flags, and map tiles for
  offline play.
- `vite.config.js`: plain Vite config, no custom plugins.

## Working Notes

- `npm run dev` starts the frontend against the bundled static data — that's
  the only local dev command needed.
- `npm run build` produces a fully static `dist/` (including `dist/data/`)
  ready to deploy to Netlify or any static host.
- Run the relevant checks from `package.json` (`lint`, `typecheck`) before
  finishing code changes.
