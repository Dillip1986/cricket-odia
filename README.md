# Cricket Odia – କ୍ରିକେଟ୍ ଓଡ଼ିଆ

Live cricket scores, scorecards, ball-by-ball commentary, news, rankings and fixtures — in Odia.

## Run locally

Prerequisites: Node.js 20+.

```bash
npm install --legacy-peer-deps
npm run dev        # vite dev server (uses same-origin /api when proxied)
```

With verified live scores (free key from https://www.cricapi.com):

```bash
cp .env.example .env   # then set CRICAPI_KEY
npm run build
npm run start      # serves dist/ + /api/live-matches on PORT (default 3000)
```

The app is live-only: matches come exclusively from the verified
CricAPI feed. When the feed has no games, every view shows
"ଆଜି କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ / Today there is no match" — there is no
demo or simulated data anywhere.

## Deploy (recommended: Render)

1. Push this folder to GitHub.
2. On https://render.com → New → Web Service → select the repo
   (`render.yaml` fills build/start commands automatically).
3. Add env var `CRICAPI_KEY` (optional — demo mode works without it).
4. Deploy. Every `git push` redeploys.

Static-only hosts (Vercel / Netlify / Cloudflare Pages / GitHub Pages)
also work: build command `npm run build`, output `dist/`. Without the
`/api/*` backend the app shows the "no match today" state.

## API

- `GET /api/health` → `{ ok, liveApi, time }`
- `GET /api/live-matches` → `{ ok, matches, fetchedAt, count }`
  - `matches[]`: full `Match` objects normalized from CricAPI
    (scores, overs, CRR/RRR, chase equations, venues, status).
  - `{ ok: false, reason: 'no-key' }` when `CRICAPI_KEY` is unset.

## Frontend

- Hash routes (no router dependency): `#/` home, `#/live`,
  `#/fixtures`, `#/standings`, `#/news`, `#/rankings`, `#/teams`,
  `#/match/:id` (dedicated match page — shareable deep links).
- Centralized Odia-first strings in `src/i18n/strings.ts`
  (`useStrings()`); Odia is default, English toggle in header.
- Design tokens (navy `#071426`, green `#00B887`) and reusable
  primitives (`.card`, `.btn-primary`, `.pill`, `.skeleton`, `.score`)
  in `src/index.css`.
- Live data polls every 30s and swaps state in place — no full-page
  reloads, scroll position preserved.
