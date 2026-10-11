# Cricket Odia – କ୍ରିକେଟ୍ ଓଡ଼ିଆ

Live cricket scores, scorecards, ball-by-ball commentary, news, rankings and fixtures — in Odia.

## Run locally

Prerequisites: Node.js 20+.

```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:3000 (demo/simulation mode)
```

With verified live scores (free key from https://www.cricapi.com):

```bash
cp .env.example .env   # then set CRICAPI_KEY
npm run build
npm run start      # serves dist/ + /api/live-matches on PORT (default 3000)
```

Without `CRICAPI_KEY` the app runs in demo mode: scores simulate every
12s and the ticker shows a `DEMO` badge. With a key and matching live
games upstream, patched matches show a `LIVE API` badge and the
simulator never overwrites real scores.

## Deploy (recommended: Render)

1. Push this folder to GitHub.
2. On https://render.com → New → Web Service → select the repo
   (`render.yaml` fills build/start commands automatically).
3. Add env var `CRICAPI_KEY` (optional — demo mode works without it).
4. Deploy. Every `git push` redeploys.

Static-only hosts (Vercel / Netlify / Cloudflare Pages / GitHub Pages)
also work: build command `npm run build`, output `dist/`. The app then
runs in demo mode (no `/api/*` backend).

## API

- `GET /api/health` → `{ ok, liveApi, time }`
- `GET /api/live-matches` → `{ ok, patches, fetchedAt }`
  - `patches[]`: `{ matchId, status, statusTextOdia, liveSummaryEn, team1, team2 }`
  - `{ ok: false, reason: 'no-key' }` when `CRICAPI_KEY` is unset.
