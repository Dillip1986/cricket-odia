/**
 * Cricket Odia — production server.
 *
 * Serves the Vite build (dist/) and proxies live scores from CricAPI,
 * keeping the API key server-side. Without CRICAPI_KEY the API routes
 * return { ok: false } and the frontend stays in demo/simulation mode.
 *
 *   PORT=3000 CRICAPI_KEY=xxx node server.js
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const CRICAPI_KEY = process.env.CRICAPI_KEY || '';
const CACHE_TTL_MS = Number(process.env.LIVE_CACHE_TTL_MS || 60_000);

const app = express();
app.use(express.json());

// --- In-memory cache (respects free-tier rate limits) ---
let cache = { at: 0, payload: null };

function normTokens(s) {
  return String(s || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join('|');
}

// Strict team matching on whole tokens: "India" must NOT match "India A".
// Compares full names and official shortnames from teamInfo.
function teamMatches(apiMatch, demoName, demoShort) {
  const apiNames = [
    ...(apiMatch.teams || []),
    ...((apiMatch.teamInfo || []).flatMap((t) => [t.name, t.shortname])),
  ].map(normTokens);
  const want = [normTokens(demoName), normTokens(demoShort)].filter(Boolean);
  return apiNames.some((n) => n && want.includes(n));
}

function parseOvers(o) {
  // CricAPI "o" can be 18.4 (number) or "18.4" (string)
  const s = String(o ?? '');
  if (!/^\d+\.[0-5]$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) {
      const over = Math.floor(n);
      const ball = Math.round((n - over) * 10);
      if (ball >= 0 && ball <= 5) return `${over}.${ball}`;
    }
    return undefined;
  }
  return s;
}

/**
 * Map one CricAPI match onto one demo match.
 * Returns a score patch or null when the API game doesn't correspond.
 */
function buildPatch(apiMatch, demo) {
  if (!teamMatches(apiMatch, demo.team1.name, demo.team1.shortName)) return null;
  if (!teamMatches(apiMatch, demo.team2.name, demo.team2.shortName)) return null;

  const patch = { matchId: demo.id, isVerifiedApi: true };
  const scores = Array.isArray(apiMatch.score) ? apiMatch.score : [];

  const inningFor = (team) => {
    const want = [normTokens(team.name), normTokens(team.shortName)].filter(Boolean);
    return scores.find((s) => {
      // Inning strings look like "Australia Inning 1" — token-subset match.
      const parts = new Set(normTokens(s.inning || '').split('|'));
      return want.some((w) => w.split('|').every((tok) => parts.has(tok)));
    });
  };

  for (const key of ['team1', 'team2']) {
    const entry = inningFor(demo[key]);
    if (entry && Number.isFinite(Number(entry.r))) {
      patch[key] = { ...demo[key] };
      patch[key].score = Number(entry.r);
      if (Number.isFinite(Number(entry.w))) {
        patch[key].wickets = Math.min(10, Number(entry.w));
      }
      const overs = parseOvers(entry.o);
      if (overs) patch[key].overs = overs;
    }
  }

  if (apiMatch.matchEnded) {
    patch.status = 'FINISHED';
  } else if (apiMatch.matchStarted) {
    patch.status = 'LIVE';
  }
  if (typeof apiMatch.status === 'string' && apiMatch.status.trim()) {
    patch.statusTextOdia = apiMatch.status.trim();
    patch.liveSummaryEn = apiMatch.status.trim();
  }
  return patch;
}

// Demo-match identity used for matching (mirrors src/services/cricketData.ts).
const DEMO_MATCHES = [
  { id: 'match-ind-aus-t20', team1: { name: 'Australia', shortName: 'AUS' }, team2: { name: 'India', shortName: 'IND' } },
  { id: 'match-csk-mi-ipl', team1: { name: 'Chennai Super Kings', shortName: 'CSK' }, team2: { name: 'Mumbai Indians', shortName: 'MI' } },
  { id: 'match-odisha-bengal', team1: { name: 'Bengal', shortName: 'BEN' }, team2: { name: 'Odisha', shortName: 'ODI' } },
  { id: 'match-ind-eng-result', team1: { name: 'England', shortName: 'ENG' }, team2: { name: 'India', shortName: 'IND' } },
  { id: 'match-ind-sa-upcoming', team1: { name: 'India', shortName: 'IND' }, team2: { name: 'South Africa', shortName: 'SA' } },
  { id: 'match-ind-aus-women', team1: { name: 'India Women', shortName: 'IND-W' }, team2: { name: 'Australia Women', shortName: 'AUS-W' } },
];

async function fetchUpstream() {
  const url =
    `https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(CRICAPI_KEY)}&offset=0`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`CricAPI HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success' || !Array.isArray(json.data)) {
    throw new Error(`CricAPI error: ${json.message || json.status || 'unknown'}`);
  }
  return json.data;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, liveApi: Boolean(CRICAPI_KEY), time: new Date().toISOString() });
});

app.get('/api/live-matches', async (_req, res) => {
  if (!CRICAPI_KEY) {
    return res.json({ ok: false, reason: 'no-key', patches: [], fetchedAt: Date.now() });
  }
  try {
    if (Date.now() - cache.at < CACHE_TTL_MS && cache.payload) {
      return res.json(cache.payload);
    }
    const games = await fetchUpstream();
    const patches = [];
    for (const demo of DEMO_MATCHES) {
      const apiMatch = games.find((g) => teamMatches(g, demo.team1.name, demo.team1.shortName) && teamMatches(g, demo.team2.name, demo.team2.shortName));
      if (apiMatch) {
        const patch = buildPatch(apiMatch, demo);
        if (patch && (patch.team1 || patch.team2)) patches.push(patch);
      }
    }
    const payload = { ok: true, patches, fetchedAt: Date.now(), count: games.length };
    cache = { at: Date.now(), payload };
    res.json(payload);
  } catch (err) {
    console.error('[live-matches]', err.message);
    res.status(502).json({ ok: false, reason: 'upstream-error', patches: [] });
  }
});

// --- Static frontend + SPA fallback ---
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cricket Odia live on :${PORT} (live API ${CRICAPI_KEY ? 'ENABLED' : 'disabled — set CRICAPI_KEY'})`);
});
