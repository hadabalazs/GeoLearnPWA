# GeoLearn

A geography quiz PWA — find countries/states/counties on the map, flag and
capital quizzes, and daily challenges. Fully self-hosted static site: no
backend, no external API, no account system.

## Prerequisites

1. Clone the repository.
2. Install dependencies: `npm install`.

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
