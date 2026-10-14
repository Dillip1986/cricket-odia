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
// Free keys allow ~100 upstream hits/day: 10-min live cache + 90-min
// fixtures cache keeps a full day of browsing inside budget.
const LIVE_TTL_MS = Number(process.env.LIVE_CACHE_TTL_MS || 10 * 60_000);
const FIXTURES_TTL_MS = Number(process.env.FIXTURES_CACHE_TTL_MS || 90 * 60_000);
const ERROR_COOLDOWN_MS = Number(process.env.UPSTREAM_COOLDOWN_MS || 10 * 60_000);

const app = express();
app.use(express.json());

// --- Caches ---
let liveCache = { at: 0, payload: null };
let fixturesCache = { at: 0, games: [] };
let cooldownUntil = 0;

function normTokens(s) {
  return String(s || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .sort()
    .join('|');
}

const FLAG_PALETTE = [
  '#0033a0', '#ffcc00', '#007749', '#dc2626', '#0ea5e9',
  '#16a34a', '#7c3aed', '#ea580c', '#0891b2', '#be123c',
];

function colorFor(name) {
  const s = String(name || '?');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return FLAG_PALETTE[h % FLAG_PALETTE.length];
}

function shortFor(name, teamInfo) {
  const info = (teamInfo || []).find(
    (t) => normTokens(t.name).split('|').every((tok) => normTokens(name).split('|').includes(tok)) ||
      normTokens(name).split('|').every((tok) => normTokens(t.name).split('|').includes(tok))
  );
  if (info && info.shortname) return String(info.shortname).toUpperCase().slice(0, 7);
  const words = String(name || '?').split(/[^A-Za-z]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return String(name || '?').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || '???';
}

function formatLabel(matchType, title, scores) {
  const t = String(matchType || '').toLowerCase();
  if (t === 'odi') return 'ODI';
  if (t === 'test') return 'TEST';
  if (t === 't20' || t === 't10') return 'T20';
  // matchType missing on some games — infer from title, then from innings length.
  const name = String(title || '').toLowerCase();
  if (/test/.test(name)) return 'TEST';
  if (/odi|one[\s-]?day|list[\s-]?a/.test(name)) return 'ODI';
  if (/t20|t10/.test(name)) return 'T20';
  let maxBalls = 0;
  for (const s of scores || []) {
    const m = /^\d+\.[0-5]$/.exec(String(s.o ?? ''));
    if (m) {
      const [o, b] = String(s.o).split('.').map(Number);
      maxBalls = Math.max(maxBalls, o * 6 + b);
    }
  }
  if (maxBalls > 300) return 'TEST';
  if (maxBalls > 120) return 'ODI';
  return 'T20';
}

function maxOvers(matchType) {
  const t = String(matchType || '').toLowerCase();
  if (t === 'odi') return 50;
  if (t === 't10') return 10;
  if (t === 'test') return null;
  return 20;
}

/** Placeholder fixtures ("Tbc vs Tbc") carry no teams — drop them. */
function isPlaceholder(teams) {
  return (teams || []).some((t) => /^(tbc|tbd|to be (confirmed|decided))$/i.test(String(t || '').trim()));
}

function ballsFromOvers(overs) {  const m = /^\d+\.[0-5]$/.exec(String(overs ?? ''));
  if (!m) return 0;
  const [o, b] = String(overs).split('.').map(Number);
  return o * 6 + b;
}

/**
 * Normalize one CricAPI match into the app's Match shape.
 * Missing Odia strings fall back to English (UI renders English text).
 */
function normalizeMatch(g) {
  const teams = Array.isArray(g.teams) ? g.teams : [];
  const teamInfo = Array.isArray(g.teamInfo) ? g.teamInfo : [];
  const scores = Array.isArray(g.score) ? g.score : [];
  const t1Name = teams[0] || 'Team 1';
  const t2Name = teams[1] || 'Team 2';
  const format = formatLabel(g.matchType, g.name, scores);
  const status = g.matchEnded ? 'FINISHED' : g.matchStarted ? 'LIVE' : 'UPCOMING';
  const isWomen = teams.some((t) => String(t).toLowerCase().includes('women'));

  const entryFor = (name, short) => {
    const want = [normTokens(name), normTokens(short)].filter(Boolean);
    return scores.find((s) => {
      const parts = new Set(normTokens(s.inning || '').split('|'));
      return want.some((w) => w.split('|').every((tok) => parts.has(tok)));
    });
  };

  const mkTeam = (name, isBatting, inningsLabel) => {
    const short = shortFor(name, teamInfo);
    const entry = entryFor(name, short);
    const team = {
      id: normTokens(name) || short.toLowerCase(),
      name,
      nameOdia: name,
      shortName: short,
      shortNameOdia: short,
      flagColor: colorFor(name),
      isBatting: status === 'LIVE' ? isBatting : false,
      inningsDescription: inningsLabel,
    };
    if (entry && Number.isFinite(Number(entry.r))) {
      team.score = Number(entry.r);
      team.wickets = Number.isFinite(Number(entry.w)) ? Math.min(10, Number(entry.w)) : 0;
      team.overs = parseOvers(entry.o);
    }
    return team;
  };

  // Batting side: only when the latest entry mentions exactly one team.
  // Combined entries ("A,B Inning 2") are ambiguous — flag no one.
  const lastEntry = scores.length > 0 ? scores[scores.length - 1] : null;
  const lastTokens = lastEntry ? new Set(normTokens(lastEntry.inning || '').split('|')) : new Set();
  const mentions = (name, short) =>
    [normTokens(name), normTokens(short)]
      .filter(Boolean)
      .some((w) => w.split('|').every((tok) => lastTokens.has(tok)));
  const t1Short = shortFor(t1Name, teamInfo);
  const t2Short = shortFor(t2Name, teamInfo);
  const lastMentionsT1 = mentions(t1Name, t1Short);
  const lastMentionsT2 = mentions(t2Name, t2Short);

  const team1 = mkTeam(t1Name, lastMentionsT1 && !lastMentionsT2, '1st Innings');
  const team2 = mkTeam(t2Name, lastMentionsT2 && !lastMentionsT1, '2nd Innings');

  const match = {
    id: `cric-${g.id}`,
    title: g.name || `${t1Name} vs ${t2Name}`,
    titleOdia: g.name || `${t1Name} vs ${t2Name}`,
    series: 'Live Cricket',
    seriesOdia: 'ଲାଇଭ୍ କ୍ରିକେଟ୍',
    format,
    status,
    statusTextOdia: (g.status || '').trim() || '—',
    liveSummaryEn: (g.status || '').trim(),
    category: isWomen ? 'WOMEN' : 'INTERNATIONAL',
    team1,
    team2,
    venue: g.venue || '—',
    venueOdia: g.venue || '—',
    venueCityOdia: String(g.venue || '').split(',').pop()?.trim() || g.venue || '—',
    dateStrOdia: g.date || g.dateTimeGMT || '',
    dateStrEn: g.date || g.dateTimeGMT || '',
    tossOdia: '',
    commentary: [],
    scorecards: [],
    playingXI: { team1: [], team2: [] },
    isVerifiedApi: true,
  };

  // Chase math for limited-overs games with both innings present.
  const maxOv = maxOvers(g.matchType);
  const batting = team2.score !== undefined && team2.isBatting ? team2 : team1.isBatting ? team1 : null;
  if (batting && batting.score !== undefined && batting.overs) {
    const faced = ballsFromOvers(batting.overs);
    if (faced > 0) match.currentRunRate = (batting.score / (faced / 6)).toFixed(2);
    const other = batting === team2 ? team1 : team2;
    if (maxOv && other.score !== undefined) {
      const target = other.score + 1;
      match.target = target;
      const need = Math.max(0, target - batting.score);
      const left = Math.max(0, maxOv * 6 - faced);
      if (left > 0) match.requiredRunRate = (need / (left / 6)).toFixed(2);
      // Only replace the API status line for a genuine live chase.
      if (status === 'LIVE' && need > 0 && left > 0) {
        match.statusTextOdia = `${batting.name} need ${need} run(s) from ${left} ball(s)`;
        match.liveSummaryEn = match.statusTextOdia;
      }
    }
  }
  return match;
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

async function cricGet(endpoint) {
  const url = `https://api.cricapi.com/v1/${endpoint}?apikey=${encodeURIComponent(CRICAPI_KEY)}&offset=0`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) {
    const err = new Error(`CricAPI ${endpoint} HTTP ${res.status}`);
    err.code = res.status;
    throw err;
  }
  const json = await res.json();
  if (json.status !== 'success' || !Array.isArray(json.data)) {
    const err = new Error(`CricAPI ${endpoint} error: ${json.message || json.status || 'unknown'}`);
    err.code = 'bad-payload';
    throw err;
  }
  if (json.info && typeof json.info.hitsToday !== 'undefined') {
    console.log(`[quota] ${endpoint}: ${json.info.hitsToday}/${json.info.hitsLimit ?? '?'} hits used today`);
  }
  return json.data;
}

async function fetchLiveGames() {
  return cricGet('currentMatches');
}

async function fetchFixtureGames() {
  return cricGet('matches');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, liveApi: Boolean(CRICAPI_KEY), time: new Date().toISOString() });
});

app.get('/api/live-matches', async (_req, res) => {
  if (!CRICAPI_KEY) {
    return res.json({ ok: false, reason: 'no-key', matches: [], fetchedAt: Date.now() });
  }
  try {
    // Quota backoff: after an upstream failure, serve stale cache only.
    if (Date.now() < cooldownUntil) {
      if (liveCache.payload) return res.json(liveCache.payload);
      return res.status(502).json({ ok: false, reason: 'upstream-cooldown', matches: [] });
    }
    if (Date.now() - liveCache.at < LIVE_TTL_MS && liveCache.payload) {
      return res.json(liveCache.payload);
    }
    // 1) Live + recent games with scores (primary, every cycle).
    const games = await fetchLiveGames();
    const seen = new Set(games.map((g) => g && g.id).filter(Boolean));
    const matches = games
      .filter((g) => g && Array.isArray(g.teams) && g.teams.length >= 2 && !isPlaceholder(g.teams))
      .map(normalizeMatch);

    // 2) Upcoming fixtures (cheap: refreshed rarely, merged by id).
    if (Date.now() - fixturesCache.at > FIXTURES_TTL_MS) {
      try {
        fixturesCache = { at: Date.now(), games: await fetchFixtureGames() };
      } catch (e) {
        console.error('[fixtures]', e.message);
      }
    }
    for (const g of fixturesCache.games) {
      if (!g || !g.id || seen.has(g.id)) continue;
      if (g.matchStarted || g.matchEnded) continue;
      if (!Array.isArray(g.teams) || g.teams.length < 2 || isPlaceholder(g.teams)) continue;
      seen.add(g.id);
      matches.push(normalizeMatch(g));
    }

    const payload = { ok: true, matches, fetchedAt: Date.now(), count: games.length };
    liveCache = { at: Date.now(), payload };
    res.json(payload);
  } catch (err) {
    console.error('[live-matches]', err.message);
    // Back off harder on rate-limit/quota responses.
    const quotaHit = err.code === 429 || /credit|quota|limit|auth|key/i.test(err.message);
    cooldownUntil = Date.now() + (quotaHit ? 60 * 60_000 : ERROR_COOLDOWN_MS);
    if (liveCache.payload) return res.json(liveCache.payload); // serve stale, 200
    res.status(502).json({ ok: false, reason: 'upstream-error', matches: [] });
  }
});

// --- Static frontend + SPA fallback (Express 4 & 5 safe) ---
const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.html');
app.use(express.static(distDir));
app.use((req, res) => {
  res.sendFile(indexFile, (err) => {
    if (err) {
      res
        .status(404)
        .type('text')
        .send(
          'Cricket Odia frontend is not built (dist/ is missing). ' +
            'Check the Render build logs for `npm run build` errors.'
        );
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cricket Odia live on :${PORT} (live API ${CRICAPI_KEY ? 'ENABLED' : 'disabled — set CRICAPI_KEY'})`);
});
