# GeoLearn

A geography quiz PWA — find countries/states/counties on the map, flag and
capital quizzes, and daily challenges. Static React + Vite + Leaflet application with no backend or account system.
Geography quiz data is bundled locally; flags, boundary geometry, and map tiles
are downloaded from external providers and cached where possible.

## Prerequisites

1. Install Node.js and npm (validated with Node.js 24.19.0).
2. Clone the repository and enter its root folder.
3. Install the locked dependencies: `npm ci`.

## Run Locally

```bash
npm run dev
```

Open the local URL printed by Vite.

## Data

The 15 geography datasets live as static JSON in `public/data/` and are
already included in this repo — nothing to fetch or configure.

## Build & Deploy

```bash
npm run build
```

This produces a static `dist/` folder — everything the app needs, including
`dist/data/`. Deploy it to Netlify (or any static host) as-is; no environment
variables or backend configuration required.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run typecheck` — type-check via `jsconfig.json`


## Git workflow

- Edit the unpacked `src/`, `public/`, and configuration files directly.
- Keep `package-lock.json` committed; use `npm ci` for reproducible installs.
- Use a branch per change, review the diff, and make focused commits.
- Run `npm run build`, `npm run lint`, and `npm run typecheck` before pushing.
  The imported baseline has known lint/typecheck failures documented in
  [REVIEW.md](REVIEW.md); distinguish those from new regressions.
- Push the working branch and review it before merging into `main`.
- `node_modules/`, generated `dist/`, and local environment files are ignored.
  Build deployment artifacts from the source revision being released.

## Import provenance

The original GitHub upload contained two ZIP archives and this README.
The source was unpacked from `geolearn-web-v4-src.zip` without code changes.
That archive omitted `public/data/`, so all 15 datasets were recovered from
`geolearn-web-dist.zip`. Both original archives remain for provenance; future
changes should be committed as individual files, not replacement ZIP uploads.

The supplied build archive has July 18, 2026 timestamps, while the source
archive includes September changes. Rebuild from source before deploying.
The application currently expects hosting at the domain root and an SPA
fallback to `index.html` for direct navigation to nested routes. The bundled
`public/_redirects` provides that fallback for Netlify.

## Offline behavior

Offline support depends on assets having been loaded and cached previously.
Unvisited map tiles, flags, boundaries, or lazily loaded screens may still need
a connection. See the initial review for cache freshness and retry limitations.
