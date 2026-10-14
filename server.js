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

// Second source: Cricbuzz via RapidAPI (covers internationals, IPL,
// Ranji Trophy, women's games missing from CricAPI). Optional.
const CRICBUZZ_KEY = process.env.CRICBUZZ_KEY || '';
const CRICBUZZ_HOST = process.env.CRICBUZZ_HOST || 'cricbuzz-cricket.p.rapidapi.com';
const CBZ_LIVE_TTL_MS = Number(process.env.CRICBUZZ_LIVE_TTL_MS || 15 * 60_000);
const CBZ_FIX_TTL_MS = Number(process.env.CRICBUZZ_FIX_TTL_MS || 120 * 60_000);

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
  applyChaseMath(match, team1, team2, maxOvers(g.matchType), status);
  return match;
}

/**
 * Shared chase equation: CRR always; target/RRR + status line for live chases.
 * Mutates and returns the match.
 */
function applyChaseMath(match, team1, team2, maxOv, status) {
  const batting = team2.score !== undefined && team2.isBatting ? team2 : team1.isBatting ? team1 : null;
  if (!batting || batting.score === undefined || !batting.overs) return match;
  const faced = ballsFromOvers(batting.overs);
  if (faced > 0) match.currentRunRate = (batting.score / (faced / 6)).toFixed(2);
  const other = batting === team2 ? team1 : team2;
  if (!maxOv || other.score === undefined) return match;
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

// ---------------------------------------------------------------------------
// Source B: Cricbuzz via RapidAPI
// ---------------------------------------------------------------------------
let cbzCache = { at: 0, fixAt: 0, live: [], upcoming: [] };
let cbzCooldownUntil = 0;

async function fetchCricbuzz(path) {
  const res = await fetch(`https://${CRICBUZZ_HOST}${path}`, {
    headers: { 'x-rapidapi-key': CRICBUZZ_KEY, 'x-rapidapi-host': CRICBUZZ_HOST },
    signal: AbortSignal.timeout(12_000),
  });
  const remaining =
    res.headers.get('x-ratelimit-requests-remaining') ?? res.headers.get('X-RateLimit-Remaining');
  if (remaining !== null) console.log(`[cbz-quota] ${path}: ${remaining} requests remaining`);
  if (res.status === 429 || res.status === 403) {
    const err = new Error(`Cricbuzz ${path} HTTP ${res.status} (quota?)`);
    err.code = res.status;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(`Cricbuzz ${path} HTTP ${res.status}`);
    err.code = res.status;
    throw err;
  }
  return res.json();
}

/** Flatten typeMatches[].seriesMatches[].matchInfo[] into one list. */
function flattenCbz(json) {
  const out = [];
  const groups = Array.isArray(json.typeMatches) ? json.typeMatches : [];
  for (const grp of groups) {
    const series = Array.isArray(grp.seriesMatches) ? grp.seriesMatches : [];
    for (const s of series) {
      const infos = Array.isArray(s.matchInfo) ? s.matchInfo : [];
      for (const info of infos) {
        if (info && typeof info === 'object') {
          if (!info.seriesName && s.seriesAdWrapper) {
            info._seriesName = s.seriesAdWrapper.seriesName || grp.matchType || '';
          }
          out.push(info);
        }
      }
    }
  }
  return out;
}

/** Tolerant score extraction: handles several Cricbuzz payload shapes. */
function cbzScores(info) {
  const raw = []
    .concat(info.score || [], info.matchScore || [], info.inningsScoreList || [])
    .filter(Boolean);
  const parsed = [];
  for (const s of raw) {
    const inner = s.teamScore || s.score || s;
    const team = s.batTeamName || s.teamName || inner.teamName || '';
    let r = inner.teamRuns ?? inner.runs ?? inner.r;
    let w = inner.teamWkts ?? inner.wickets ?? inner.w;
    let o = inner.teamOvers ?? inner.overs ?? inner.o;
    // "204 (48.3 Ovs)" style strings
    if ((r === undefined || o === undefined) && typeof s.run === 'string') {
      const m = /(\d+)(?:\/(\d+))?\s*\(?([\d.]+)?/.exec(s.run);
      if (m) {
        r = r ?? Number(m[1]);
        w = w ?? (m[2] !== undefined ? Number(m[2]) : undefined);
        o = o ?? m[3];
      }
    }
    if (!Number.isFinite(Number(r))) continue;
    parsed.push({
      team: String(team),
      r: Number(r),
      w: Number.isFinite(Number(w)) ? Math.min(10, Number(w)) : 0,
      o: parseOvers(o),
    });
  }
  return parsed;
}

function cbzFormat(info) {
  const f = String(info.matchFormat || '').toUpperCase();
  if (f.includes('ODI') || f.includes('ODM')) return 'ODI';
  if (f.includes('TEST') || f.includes('FIRST')) return 'TEST';
  if (f.includes('T10')) return 'T20';
  if (f.includes('T20') || f.includes('IT20')) return 'T20';
  return formatLabel('', `${info.matchDesc || ''} ${info.seriesName || ''}`, []);
}

function cbzStatus(info) {
  const st = String(info.state || '').toLowerCase();
  if (st.includes('complete') || st.includes('result')) return 'FINISHED';
  if (st.includes('preview') || st.includes('upcoming') || st.includes('squad') || st === '') return 'UPCOMING';
  return 'LIVE'; // In Progress, Stumps, Innings Break, Rain, Toss…
}

function cbzDate(info) {
  const n = Number(info.startDate);
  if (Number.isFinite(n) && n > 0) {
    const d = new Date(n > 1e12 ? n : n * 1000);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 16).replace('T', ' ');
  }
  return String(info.startDate || '');
}

/** Normalize one Cricbuzz matchInfo into the app's Match shape. */
function normalizeCbz(info) {
  const t1 = info.team1 || {};
  const t2 = info.team2 || {};
  const t1Name = t1.teamName || 'Team 1';
  const t2Name = t2.teamName || 'Team 2';
  const t1Short = String(t1.teamSName || shortFor(t1Name, [])).toUpperCase().slice(0, 7);
  const t2Short = String(t2.teamSName || shortFor(t2Name, [])).toUpperCase().slice(0, 7);
  const scores = cbzScores(info);
  const status = cbzStatus(info);
  const format = cbzFormat(info);
  const seriesName = info.seriesName || info._seriesName || '';
  const isWomen =
    /women/i.test(`${t1Name} ${t2Name} ${seriesName} ${info.matchType || ''}`) ||
    /w(odi|t20|test)\b/i.test(String(info.matchFormat || ''));

  const entryFor = (name, short) => {
    const want = [normTokens(name), normTokens(short)].filter(Boolean);
    return scores.find((s) => {
      const parts = new Set(normTokens(s.team).split('|'));
      return want.some((w) => w.split('|').every((tok) => parts.has(tok)));
    });
  };

  const mkTeam = (name, short, inningsLabel) => {
    const entry = entryFor(name, short);
    const team = {
      id: `cbz-${normTokens(name) || short.toLowerCase()}`,
      name,
      nameOdia: name,
      shortName: short,
      shortNameOdia: short,
      flagColor: colorFor(name),
      isBatting: false,
      inningsDescription: inningsLabel,
    };
    if (entry) {
      team.score = entry.r;
      team.wickets = entry.w;
      if (entry.o) team.overs = entry.o;
    }
    return team;
  };

  const team1 = mkTeam(t1Name, t1Short, '1st Innings');
  const team2 = mkTeam(t2Name, t2Short, '2nd Innings');
  if (status === 'LIVE' && scores.length > 0) {
    // Latest score entry belongs to the batting side.
    const last = scores[scores.length - 1];
    const lastParts = new Set(normTokens(last.team).split('|'));
    const hits = (name, short) =>
      [normTokens(name), normTokens(short)]
        .filter(Boolean)
        .some((w) => w.split('|').every((tok) => lastParts.has(tok)));
    const t1Hit = hits(t1Name, t1Short);
    const t2Hit = hits(t2Name, t2Short);
    team1.isBatting = t1Hit && !t2Hit;
    team2.isBatting = t2Hit && !t1Hit;
  }

  const venue = info.venueInfo || {};
  const venueStr = [venue.ground, venue.city].filter(Boolean).join(', ') || '—';
  const statusLine = String(info.status || '').trim() || '—';
  const match = {
    id: `cbz-${info.matchId}`,
    title: `${t1Name} vs ${t2Name}, ${info.matchDesc || ''}`.trim(),
    titleOdia: `${t1Name} vs ${t2Name}, ${info.matchDesc || ''}`.trim(),
    series: seriesName || 'Live Cricket',
    seriesOdia: seriesName || 'ଲାଇଭ୍ କ୍ରିକେଟ୍',
    format,
    status,
    statusTextOdia: statusLine,
    liveSummaryEn: statusLine,
    category: isWomen ? 'WOMEN' : 'INTERNATIONAL',
    team1,
    team2,
    venue: venueStr,
    venueOdia: venueStr,
    venueCityOdia: venue.city || venueStr,
    dateStrOdia: cbzDate(info),
    dateStrEn: cbzDate(info),
    tossOdia: '',
    commentary: [],
    scorecards: [],
    playingXI: { team1: [], team2: [] },
    isVerifiedApi: true,
  };
  return applyChaseMath(match, team1, team2, maxOvers(format), status);
}

/** Refresh Cricbuzz caches (live + upcoming), quota-aware. Returns matches. */
async function loadCricbuzzMatches() {
  if (!CRICBUZZ_KEY) return [];
  const now = Date.now();
  if (now - cbzCache.at > CBZ_LIVE_TTL_MS || cbzCache.live.length === 0) {
    if (now < cbzCooldownUntil) return [...cbzCache.live, ...cbzCache.upcoming];
    try {
      const [live, recent] = await Promise.all([
        fetchCricbuzz('/matches/v1/live'),
        fetchCricbuzz('/matches/v1/recent'),
      ]);
      cbzCache.live = [...flattenCbz(live), ...flattenCbz(recent)].filter(
        (i) => i && i.matchId && !isPlaceholder([i.team1?.teamName, i.team2?.teamName])
      );
      cbzCache.at = now;
    } catch (e) {
      console.error('[cricbuzz-live]', e.message);
      if (e.code === 429 || e.code === 403) cbzCooldownUntil = now + 60 * 60_000;
    }
  }
  if (now - cbzCache.fixAt > CBZ_FIX_TTL_MS) {
    if (now < cbzCooldownUntil) return [...cbzCache.live, ...cbzCache.upcoming];
    try {
      const up = await fetchCricbuzz('/matches/v1/upcoming');
      cbzCache.upcoming = flattenCbz(up).filter(
        (i) => i && i.matchId && !isPlaceholder([i.team1?.teamName, i.team2?.teamName])
      );
      cbzCache.fixAt = now;
    } catch (e) {
      console.error('[cricbuzz-upcoming]', e.message);
      if (e.code === 429 || e.code === 403) cbzCooldownUntil = now + 60 * 60_000;
    }
  }
  return [...cbzCache.live, ...cbzCache.upcoming].map(normalizeCbz);
}
/** Same fixture on both providers? Compare both team token-sets. */
function sameFixture(aTeams, bTeams) {
  if (aTeams.length !== 2 || bTeams.length !== 2) return false;
  const norm = (names) => names.map(normTokens).sort().join('+');
  return norm(aTeams) === norm(bTeams);
}

async function cricGet(endpoint) {  const url = `https://api.cricapi.com/v1/${endpoint}?apikey=${encodeURIComponent(CRICAPI_KEY)}&offset=0`;
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
  res.json({
    ok: true,
    liveApi: Boolean(CRICAPI_KEY),
    secondSource: CRICBUZZ_KEY ? 'cricbuzz' : null,
    time: new Date().toISOString(),
  });
});

const STATUS_RANK = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };

app.get('/api/live-matches', async (_req, res) => {
  if (!CRICAPI_KEY && !CRICBUZZ_KEY) {
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
    const matches = [];
    let count = 0;

    // Source A: CricAPI (when keyed).
    if (CRICAPI_KEY) {
      // 1) Live + recent games with scores (primary, every cycle).
      const games = await fetchLiveGames();
      count += games.length;
      const seen = new Set(games.map((g) => g && g.id).filter(Boolean));
      for (const g of games) {
        if (!g || !Array.isArray(g.teams) || g.teams.length < 2 || isPlaceholder(g.teams)) continue;
        matches.push(normalizeMatch(g));
      }

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
    }

    // Source B: Cricbuzz via RapidAPI (broader coverage: IND men, IPL, Ranji).
    // Cricbuzz wins fixtures present on both providers.
    if (CRICBUZZ_KEY) {
      try {
        const cbz = await loadCricbuzzMatches();
        count += cbz.length;
        const cbzTeams = (m) => [m.team1.name, m.team2.name];
        const merged = [];
        for (const m of matches) {
          const dup = cbz.some((c) => sameFixture(cbzTeams(c), [m.team1.name, m.team2.name]));
          if (!dup) merged.push(m);
        }
        matches.length = 0;
        matches.push(...cbz, ...merged);
      } catch (e) {
        console.error('[cricbuzz-merge]', e.message);
      }
    }

    // LIVE first, then upcoming, then results.
    matches.sort((a, b) => (STATUS_RANK[a.status] ?? 3) - (STATUS_RANK[b.status] ?? 3));

    const payload = { ok: true, matches, fetchedAt: Date.now(), count };
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
  console.log(
    `Cricket Odia live on :${PORT} (CricAPI ${CRICAPI_KEY ? 'ENABLED' : 'disabled — set CRICAPI_KEY'}, ` +
      `Cricbuzz ${CRICBUZZ_KEY ? 'ENABLED' : 'disabled — set CRICBUZZ_KEY'})`
  );
});
