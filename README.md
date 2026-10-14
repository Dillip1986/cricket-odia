# Cricket Odia – କ୍ରିକେଟ୍ ଓଡ଼ିଆ

Live cricket scores, scorecards, ball-by-ball commentary, news, rankings and fixtures — in Odia.

## Run locally

Prerequisites: Node.js 20+.

```bash
npm install --legacy-peer-deps
npm run dev        # vite dev server (uses same-origin /api when proxied)
```

Live scores come from two sources (no key needed for the first):

- **ESPNcricinfo live page** — same match list as cricinfo.com
  (internationals, Ranji Trophy, women's games), with team logos,
  ball-by-ball commentary and full scorecards per match.
- **Cricbuzz via RapidAPI** (optional) — extra coverage. Free key at
  https://rapidapi.com/cricketapilive/api/cricbuzz-cricket

```bash
cp .env.example .env   # then set CRICBUZZ_KEY (optional)
npm run build
npm run start      # serves dist/ + /api/live-matches on PORT (default 3000)
```

The app is live-only: matches come exclusively from the verified
ESPNcricinfo + Cricbuzz feeds. When the feeds have no games, every view shows
"ଆଜି କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ / Today there is no match" — there is no
demo or simulated data anywhere.

## Deploy (recommended: Render)

1. Push this folder to GitHub.
2. On https://render.com → New → Web Service → select the repo
   (`render.yaml` fills build/start commands automatically).
3. Add env var `CRICBUZZ_KEY` (optional) and `ADMIN_PIN` (optional —
   without it the admin console stays disabled).
4. Deploy. Every `git push` redeploys.

Static-only hosts (Vercel / Netlify / Cloudflare Pages / GitHub Pages)
also work: build command `npm run build`, output `dist/`. Without the
`/api/*` backend the app shows the "no match today" state.

## API

- `GET /api/health` → `{ ok, secondSource, cricbuzz, espn, adminEnabled, time }`
- `GET /api/live-matches` → `{ ok, matches, fetchedAt, count }`
- `GET /api/match-centre?matchId=espn-<id>` → `{ ok, commentary[], scorecards[], currentBatsmen[], currentBowlers[] }`
  - Ball-by-ball commentary + full scorecard scraped from the match's
    Cricinfo page (2-min cache). Works without any API key.
  - `matches[]`: full `Match` objects, merged from two sources —
    **ESPNcricinfo live page** (same list as cricinfo.com: internationals,
    IPL, Ranji Trophy, women; includes team logos; needs no key),
    and Cricbuzz via RapidAPI (needs `CRICBUZZ_KEY`). ESPN wins
    fixtures present on both; duplicates are dropped; list is sorted
    LIVE → upcoming → results.
  - `{ ok: false, reason: 'no-key' }` only when every source is disabled.

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
- Match pages load ball-by-ball commentary, full scorecards and
  at-the-crease players on demand from `/api/match-centre`.
- Native audio readout of every ball via the Web Speech API
  (`src/hooks/useSpeech.ts`): per-ball speaker buttons plus an
  auto-read-latest toggle. Prefers an Odia voice when the device has
  one, otherwise English. Commentary text itself is Cricinfo English —
  readout follows the text language.

## Admin console

The admin PIN is verified **server-side** (`ADMIN_PIN` env var) and is
never bundled into the app or displayed on the site — there is no
public password. Leave `ADMIN_PIN` empty to disable the console
entirely. Set it locally in `.env` and on Render as an env var.
Verification is rate-limited (8 tries/minute/IP). Admin edits and
published articles affect only that visitor's own browser.
