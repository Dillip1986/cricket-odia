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
  let status = g.matchEnded ? 'FINISHED' : g.matchStarted ? 'LIVE' : 'UPCOMING';
  if (isResultText(g.status)) status = 'FINISHED'; // flags lag; decided game ≠ live
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
// Source C: ESPNcricinfo live page (no key needed — same data as cricinfo.com)
// ---------------------------------------------------------------------------
const ESPN_ENABLED = process.env.ESPN_ENABLED !== 'false';
const ESPN_TTL_MS = Number(process.env.ESPN_TTL_MS || 10 * 60_000);
const ESPN_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

// Admin gate: PIN lives ONLY in server env, never in shipped code.
// Leave ADMIN_PIN empty to disable the admin console entirely.
const ADMIN_PIN = process.env.ADMIN_PIN || '';
const adminAttempts = new Map(); // ip -> { count, resetAt }
let espnCache = { at: 0, matches: [] };
let espnCooldownUntil = 0;
let espnSourceStatus = { state: 'idle', checkedAt: 0, message: '' };

function espnLogoUrl(imageUrl) {
  const u = String(imageUrl || '');
  if (!u.startsWith('/lsci/')) return undefined;
  return `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50${u}`;
}

/** "220 & 44/2" → [{r:220},{r:44,w:2}]; overs from scoreInfo like "13.5 ov". */
function espnParseScore(score, scoreInfo) {
  const innings = String(score || '')
    .split('&')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = /^(\d+)(?:\/(\d+))?/.exec(s);
      if (!m) return null;
      return { r: Number(m[1]), w: m[2] !== undefined ? Math.min(10, Number(m[2])) : 0 };
    })
    .filter(Boolean);
  let overs;
  const om = /([\d.]+)\s*ov/i.exec(String(scoreInfo || ''));
  if (om && /^\d+\.[0-5]$/.test(om[1])) overs = om[1];
  return { innings, overs };
}

function espnStatus(state) {
  const s = String(state || '').toUpperCase();
  if (s.includes('PRE') || s.includes('UPCOMING') || s.includes('SQUAD')) return 'UPCOMING';
  if (
    s.includes('COMPLETE') || s.includes('RESULT') || s.includes('DRAWN') ||
    s.includes('DRAW') || s.includes('TIE') || s.includes('ABANDON') ||
    s.includes('CANCEL') || s.includes('NO RESULT')
  ) return 'FINISHED';
  return 'LIVE'; // Live, Stumps, Innings Break, Rain Delay, Toss…
}

/**
 * Provider flags sometimes lag behind the status line ("X won by …" while
 * the game is still flagged live). The text is authoritative: a decided
 * game is never LIVE.
 */
function isResultText(s) {
  return /won by|win by|wins by|drawn|match drawn|tied|match tied|no result|abandoned|cancelled/i.test(
    String(s || '')
  );
}

function espnFormat(format) {
  const f = String(format || '').toUpperCase();
  if (f.includes('ODI') || f.includes('ODM') || f.includes('LIST')) return 'ODI';
  if (f.includes('TEST') || f.includes('FIRST') || f.includes('FC')) return 'TEST';
  return 'T20';
}

function espnCategory(seriesName, t1, t2) {
  const s = `${seriesName} ${t1} ${t2}`.toLowerCase();
  if (/women|w\.?odi|w\.?t20|wtest/.test(s)) return 'WOMEN';
  if (/ranji|sheffield|county|qea trophy|duleep|plate|first-class| 4-day|test championship/i.test(s)) return 'DOMESTIC';
  if (/ipl|bbl|psl|cpl|sa20|hundred|bpl|lpl|mlc|t20 blast|super smash|ilt20/i.test(s)) return 'IPL';
  return 'INTERNATIONAL';
}

/** ESPN match-page lookup: live-list id → URL parts for the match centre. */
const espnPageUrls = new Map();
const centreCache = new Map(); // espn numeric id -> { at, data }
const CENTRE_TTL_MS = Number(process.env.CENTRE_TTL_MS || 2 * 60_000);

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function textItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((t) => (typeof t === 'string' ? t : stripHtml(t && t.html)))
    .filter(Boolean)
    .join(' ');
}

function normalizeEspn(m) {
  // Remember how to reach this match's ball-by-ball page.
  if (m && m.id && m.objectId && m.slug && m.series) {
    espnPageUrls.set(String(m.id), {
      seriesSlug: m.series.slug,
      seriesObj: m.series.objectId,
      matchSlug: m.slug,
      matchObj: m.objectId,
    });
  }
  const sides = Array.isArray(m.teams) ? m.teams : [];
  const s1 = sides[0] || {};
  const s2 = sides[1] || {};
  const n1 = s1.team?.longName || s1.team?.name || 'Team 1';
  const n2 = s2.team?.longName || s2.team?.name || 'Team 2';
  const short1 = String(s1.team?.abbreviation || shortFor(n1, [])).toUpperCase().slice(0, 7);
  const short2 = String(s2.team?.abbreviation || shortFor(n2, [])).toUpperCase().slice(0, 7);
  let status = espnStatus(m.state);
  if (isResultText(m.statusText) || isResultText(m.status)) status = 'FINISHED';
  const format = espnFormat(m.format);
  const seriesName = m.series?.longName || m.series?.name || '';
  const season = m.series?.season ? ` ${m.series.season}` : '';

  const mkTeam = (side, name, short, inningsLabel) => {
    const { innings, overs } = espnParseScore(side.score, side.scoreInfo);
    const first = innings[0];
    const second = innings[1];
    const team = {
      id: `espn-${normTokens(name) || short.toLowerCase()}`,
      name,
      nameOdia: name,
      shortName: short,
      shortNameOdia: short,
      flagColor: colorFor(name),
      logoUrl: espnLogoUrl(side.team?.imageUrl),
      isBatting: status === 'LIVE' ? Boolean(side.isLive) : false,
      inningsDescription: inningsLabel,
    };
    if (first) {
      team.score = first.r;
      team.wickets = first.w;
      // Overs belong to the latest innings; single-innings side gets them.
      if (overs && (!second || side.isLive)) team.overs = overs;
    }
    if (second) {
      team.secondInningsScore = second.r;
      team.secondInningsWickets = second.w;
      if (overs && side.isLive) team.secondInningsOvers = overs;
    }
    return team;
  };

  const team1 = mkTeam(s1, n1, short1, '1st Innings');
  const team2 = mkTeam(s2, n2, short2, '2nd Innings');
  const ground = m.ground || {};
  const venueStr = ground.longName || ground.name || '—';
  const cityStr = ground.town?.name || ground.smallName || venueStr;
  const statusLine = String(m.statusText || m.status || '').trim() || '—';
  const dateStr = String(m.startDate || '').slice(0, 10);
  const recentBalls = Array.isArray(m.liveRecentBalls)
    ? m.liveRecentBalls.map(String).slice(0, 6)
    : [];
  const match = {
    id: `espn-${m.id}`,
    title: `${n1} vs ${n2}${seriesName ? `, ${seriesName}${season}` : ''}`,
    titleOdia: `${n1} vs ${n2}${seriesName ? `, ${seriesName}${season}` : ''}`,
    series: seriesName || 'Live Cricket',
    seriesOdia: seriesName || 'ଲାଇଭ୍ କ୍ରିକେଟ୍',
    format,
    status,
    statusTextOdia: statusLine,
    liveSummaryEn: statusLine,
    category: espnCategory(seriesName, n1, n2),
    team1,
    team2,
    venue: venueStr,
    venueOdia: venueStr,
    venueCityOdia: cityStr,
    dateStrOdia: dateStr,
    dateStrEn: dateStr,
    tossOdia: '',
    recentBalls,
    commentary: [],
    scorecards: [],
    playingXI: { team1: [], team2: [] },
    isVerifiedApi: true,
  };
  return applyChaseMath(match, team1, team2, maxOvers(format), status);
}

async function loadEspnMatches() {
  if (!ESPN_ENABLED) return [];
  const now = Date.now();
  if (now - espnCache.at < ESPN_TTL_MS && espnCache.matches.length > 0) {
    return espnCache.matches;
  }
  if (now < espnCooldownUntil) return espnCache.matches;
  try {
    const res = await fetch('https://www.espncricinfo.com/live-cricket-score', {
      headers: { 'User-Agent': ESPN_UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw Object.assign(new Error(`ESPN page HTTP ${res.status}`), { code: res.status });
    const html = await res.text();
    const start = html.indexOf('>', html.indexOf('__NEXT_DATA__')) + 1;
    const end = html.indexOf('</script>', start);
    if (start <= 0 || end <= start) throw new Error('ESPN markup changed (no embedded data)');
    const data = JSON.parse(html.slice(start, end));
    const pp = data.props?.appPageProps || data.props?.pageProps;
    const list = pp?.data?.content?.matches;
    if (!Array.isArray(list)) throw new Error('ESPN markup changed (no matches array)');
    const matches = list
      .filter((g) => g && g.id && Array.isArray(g.teams) && g.teams.length >= 2)
      .filter((g) => !isPlaceholder([(g.teams[0] || {}).team?.name, (g.teams[1] || {}).team?.name]))
      .map(normalizeEspn);
    espnCache = { at: now, matches };
    espnSourceStatus = { state: 'ok', checkedAt: now, message: `${matches.length} matches` };
    return matches;
  } catch (e) {
    console.error('[espn]', e.message);
    espnSourceStatus = { state: 'error', checkedAt: Date.now(), message: String(e.message).slice(0, 120) };
    espnCooldownUntil = now + 30 * 60_000;
    return espnCache.matches;
  }
}

// ---------------------------------------------------------------------------
// Source B: Cricbuzz via RapidAPI
// ---------------------------------------------------------------------------
let cbzCache = { at: 0, fixAt: 0, live: [], upcoming: [] };
let cbzCooldownUntil = 0;
let cbzSourceStatus = { state: 'idle', checkedAt: 0, message: '' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  let status = cbzStatus(info);
  if (isResultText(info.status)) status = 'FINISHED';
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
  // Independent fetches: one endpoint failing must not discard the others.
  // Sequential with a gap — free plans enforce strict per-second limits.
  if (now - cbzCache.at > CBZ_LIVE_TTL_MS || cbzCache.live.length === 0) {
    if (now >= cbzCooldownUntil) {
      const fresh = [];
      for (const path of ['/matches/v1/live', '/matches/v1/recent']) {
        try {
          const json = await fetchCricbuzz(path);
          fresh.push(...flattenCbz(json));
        } catch (e) {
          console.error(`[cricbuzz${path}]`, e.message);
          cbzSourceStatus = { state: e.code === 429 ? 'rate-limited' : 'error', checkedAt: Date.now(), message: e.message.slice(0, 120) };
          if (e.code === 429 || e.code === 403) cbzCooldownUntil = now + 60 * 60_000;
        }
        await sleep(2500);
      }
      const valid = fresh.filter(
        (i) => i && i.matchId && !isPlaceholder([i.team1?.teamName, i.team2?.teamName])
      );
      if (valid.length > 0) {
        cbzCache.live = valid;
        cbzCache.at = now;
        cbzSourceStatus = { state: 'ok', checkedAt: Date.now(), message: `${valid.length} matches` };
      } else if (cbzCache.live.length === 0 && !cbzSourceStatus.message) {
        cbzSourceStatus = { state: 'empty', checkedAt: Date.now(), message: 'no matches returned' };
      }
    }
  }
  if (now - cbzCache.fixAt > CBZ_FIX_TTL_MS) {
    if (now >= cbzCooldownUntil) {
      try {
        const up = await fetchCricbuzz('/matches/v1/upcoming');
        const valid = flattenCbz(up).filter(
          (i) => i && i.matchId && !isPlaceholder([i.team1?.teamName, i.team2?.teamName])
        );
        if (valid.length > 0) {
          cbzCache.upcoming = valid;
          cbzCache.fixAt = now;
        }
      } catch (e) {
        console.error('[cricbuzz-upcoming]', e.message);
        cbzSourceStatus = { state: e.code === 429 ? 'rate-limited' : 'error', checkedAt: Date.now(), message: e.message.slice(0, 120) };
        if (e.code === 429 || e.code === 403) cbzCooldownUntil = now + 60 * 60_000;
      }
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
    cricbuzz: cbzSourceStatus,
    espn: espnSourceStatus,
    adminEnabled: Boolean(ADMIN_PIN),
    time: new Date().toISOString(),
  });
});

// --- Admin authentication (PIN verified server-side, rate-limited) ---
app.get('/api/admin/status', (_req, res) => {
  res.json({ enabled: Boolean(ADMIN_PIN) });
});

app.post('/api/admin/verify', (req, res) => {
  if (!ADMIN_PIN) return res.status(403).json({ ok: false, reason: 'disabled' });
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const rec = adminAttempts.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > rec.resetAt) {
    rec.count = 0;
    rec.resetAt = now + 60_000;
  }
  rec.count += 1;
  adminAttempts.set(ip, rec);
  if (rec.count > 8) return res.status(429).json({ ok: false, reason: 'too-many-attempts' });
  const pin = String((req.body || {}).pin || '');
  if (pin.length > 0 && pin.length < 128 && pin === ADMIN_PIN) {
    return res.json({ ok: true });
  }
  // Small delay blunts brute force without hurting real logins.
  setTimeout(() => res.status(401).json({ ok: false, reason: 'invalid-pin' }), 600);
});

const STATUS_RANK = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };

app.get('/api/live-matches', async (_req, res) => {
  // ESPN needs no key; each keyed source self-guards. All missing → no-key.
  if (!CRICAPI_KEY && !CRICBUZZ_KEY && !ESPN_ENABLED) {
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
    const teamPair = (m) => [m.team1.name, m.team2.name];
    const hasFixture = (list, t1, t2) =>
      list.some((m) => sameFixture(teamPair(m), [t1, t2]));

    // Source C: ESPNcricinfo live page (editorial priority — same list as cricinfo.com).
    try {
      const espn = await loadEspnMatches();
      count += espn.length;
      matches.push(...espn);
    } catch (e) {
      console.error('[espn-merge]', e.message);
    }

    // Source A: CricAPI (when keyed; fixtures ESPN already has are skipped).
    // One source failing must never discard the others.
    if (CRICAPI_KEY) {
      try {
        // 1) Live + recent games with scores (primary, every cycle).
        const games = await fetchLiveGames();
        count += games.length;
        const seen = new Set(games.map((g) => g && g.id).filter(Boolean));
        for (const g of games) {
          if (!g || !Array.isArray(g.teams) || g.teams.length < 2 || isPlaceholder(g.teams)) continue;
          const nm = normalizeMatch(g);
          if (hasFixture(matches, nm.team1.name, nm.team2.name)) continue; // ESPN wins
          matches.push(nm);
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
          const nm = normalizeMatch(g);
          if (hasFixture(matches, nm.team1.name, nm.team2.name)) continue; // ESPN wins
          matches.push(nm);
        }
      } catch (e) {
        console.error('[cricapi-merge]', e.message);
        const quotaHit = /credit|quota|limit|auth|key|failure/i.test(e.message);
        cooldownUntil = Date.now() + (quotaHit ? 60 * 60_000 : ERROR_COOLDOWN_MS);
      }
    }

    // Source B: Cricbuzz via RapidAPI — fills gaps (keeps ESPN/CricAPI versions on collision).
    if (CRICBUZZ_KEY) {
      try {
        const cbz = await loadCricbuzzMatches();
        count += cbz.length;
        for (const c of cbz) {
          if (!hasFixture(matches, c.team1.name, c.team2.name)) matches.push(c);
        }
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

function espnEventOf(c) {
  const runs = Number(c.totalRuns ?? 0);
  if (c.isWicket) return 'WICKET';
  if (c.isSix) return 'SIX';
  if (c.isFour) return 'FOUR';
  if (Number(c.wides) > 0) return 'WIDE';
  if (Number(c.noballs) > 0) return 'NO_BALL';
  if (Number(c.byes) > 0 || Number(c.legbyes) > 0) return 'BYE';
  if (runs >= 3) return 'THREE';
  if (runs === 2) return 'TWO';
  if (runs === 1) return 'ONE';
  return 'DOT';
}

function espnPlayerName(p) {
  return (p && (p.longName || p.name)) || '';
}

/** Map one Cricinfo ball-comment into the app's CommentaryDelivery shape. */
function mapEspnBall(c, playerById) {
  const title = String(c.title || '');
  const parts = title.split(' to ');
  const bowler = (c.bowlerPlayerId && playerById[c.bowlerPlayerId]) || (parts[0] || '').trim();
  const batsman = (c.batsmanPlayerId && playerById[c.batsmanPlayerId]) || (parts[1] || '').trim();
  const body = textItems(c.commentTextItems) || stripHtml(c.commentPreTextItems && c.commentPreTextItems[0]);
  const dismissal = stripHtml(c.dismissalText);
  const text = [body, dismissal].filter(Boolean).join(' ');
  const over = c.oversActual != null ? String(c.oversActual) : String(c.oversUnique ?? '');
  const runs = Number(c.totalRuns ?? 0);
  const event = espnEventOf(c);
  let ts = '';
  try {
    const d = new Date(c.timestamp);
    if (!Number.isNaN(d.getTime())) {
      ts = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  } catch {
    /* ignore */
  }
  return {
    id: `espn-c-${c.id ?? `${c.inningNumber}-${c.oversUnique}`}`,
    over,
    runs,
    event,
    commentaryOdia: text,
    commentaryEn: text,
    batsmanNameOdia: batsman,
    bowlerNameOdia: bowler,
    batsmanNameEn: batsman,
    bowlerNameEn: bowler,
    timestamp: ts,
    isKeyMoment: runs >= 4 || event === 'WICKET',
  };
}

function espnOversStr(b) {
  const balls = Number(b.balls ?? 0);
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

/** Map one Cricinfo innings into the app's InningsScorecard shape. */
function mapEspnInnings(inn) {
  const teamName = (inn.team && (inn.team.longName || inn.team.name)) || 'Innings';
  const batting = (Array.isArray(inn.inningBatsmen) ? inn.inningBatsmen : [])
    .filter((b) => b && (b.battedType === 'yes' || Number(b.runs) > 0 || b.isOut))
    .map((b) => ({
      batsmanName: espnPlayerName(b.player),
      batsmanNameOdia: espnPlayerName(b.player),
      dismissal: stripHtml(b.dismissalText) || (b.isOut ? 'out' : 'batting'),
      runs: Number(b.runs ?? 0),
      balls: Number(b.balls ?? 0),
      fours: Number(b.fours ?? 0),
      sixes: Number(b.sixes ?? 0),
      strikeRate: Number(b.strikerate ?? 0),
    }));
  const bowling = (Array.isArray(inn.inningBowlers) ? inn.inningBowlers : [])
    .filter((b) => b && b.bowledType === 'yes')
    .map((b) => {
      const balls = Number(b.balls ?? 0);
      return {
        bowlerName: espnPlayerName(b.player),
        bowlerNameOdia: espnPlayerName(b.player),
        overs: espnOversStr(b),
        maidens: Number(b.maidens ?? 0),
        runs: Number(b.conceded ?? 0),
        wickets: Number(b.wickets ?? 0),
        economy: Number(b.economy ?? 0),
        dots: Number(b.dots ?? 0),
      };
    });
  const fallOfWickets = (Array.isArray(inn.inningFallOfWickets) ? inn.inningFallOfWickets : []).map((f) => ({
    score: Number(f.fowRuns ?? 0),
    wicketNumber: Number(f.fowWicketNum ?? 0),
    over: String(f.fowOvers ?? ''),
    batsmanOdia: espnPlayerName(f.dismissalBatsman),
  }));
  return {
    teamName,
    teamNameOdia: teamName,
    inningsNumber: Number(inn.inningNumber ?? 1),
    runs: Number(inn.runs ?? 0),
    wickets: Number(inn.wickets ?? 0),
    overs: String(inn.overs ?? ''),
    extras: {
      wides: Number(inn.wides ?? 0),
      noBalls: Number(inn.noballs ?? 0),
      byes: Number(inn.byes ?? 0),
      legByes: Number(inn.legbyes ?? 0),
      total: Number(inn.extras ?? 0),
    },
    batting,
    bowling,
    fallOfWickets,
  };
}

/**
 * GET /api/match-centre?matchId=espn-<live-list-id>
 * Ball-by-ball commentary + full scorecard scraped from the match's
 * Cricinfo page. Cached briefly per match (live data).
 */
app.get('/api/match-centre', async (req, res) => {
  const rawId = String(req.query.matchId || '');
  const espnId = rawId.startsWith('espn-') ? rawId.slice(5) : rawId;
  const meta = espnPageUrls.get(espnId);
  if (!meta || !meta.matchObj || !meta.seriesSlug || !meta.seriesObj || !meta.matchSlug) {
    return res.json({ ok: false, reason: 'unknown-match', commentary: [], scorecards: [] });
  }
  const hit = centreCache.get(espnId);
  if (hit && Date.now() - hit.at < CENTRE_TTL_MS) {
    return res.json({ ok: true, cached: true, ...hit.data });
  }
  try {
    const url =
      `https://www.cricinfo.com/series/${meta.seriesSlug}-${meta.seriesObj}/` +
      `${meta.matchSlug}-${meta.matchObj}/ball-by-ball-commentary`;
    const page = await fetch(url, {
      headers: {
        'User-Agent': ESPN_UA,
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!page.ok) throw Object.assign(new Error(`ESPN match page HTTP ${page.status}`), { code: page.status });
    const html = await page.text();
    const start = html.indexOf('>', html.indexOf('__NEXT_DATA__')) + 1;
    const end = html.indexOf('</script>', start);
    if (start <= 0 || end <= start) throw new Error('ESPN markup changed (no embedded data)');
    const data = JSON.parse(html.slice(start, end));
    const content = data.props?.appPageProps?.data?.content || data.props?.pageProps?.data?.content;
    if (!content) throw new Error('ESPN markup changed (no content)');

    // Player directory for full names.
    const playerById = {};
    const inningsRaw = Array.isArray(content.innings) ? content.innings : [];
    for (const inn of inningsRaw) {
      for (const b of [...(inn.inningBatsmen || []), ...(inn.inningBowlers || [])]) {
        if (b && b.player && b.player.id && b.player.longName) playerById[b.player.id] = b.player.longName;
      }
    }

    const balls = [
      ...(Array.isArray(content.comments) ? content.comments : []),
      ...(Array.isArray(content.recentBallCommentary?.ballComments)
        ? content.recentBallCommentary.ballComments
        : []),
    ];
    const seenBall = new Set();
    const commentary = balls
      .filter((c) => c && (c.id === 0 || c.id) && !seenBall.has(c.id) && seenBall.add(c.id))
      .map((c) => ({ c, key: `${c.inningNumber}:${c.oversActual ?? c.oversUnique ?? 0}` }))
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .map(({ c }) => mapEspnBall(c, playerById))
      .filter((c) => c.commentaryEn)
      .slice(0, 60);

    const scorecards = inningsRaw
      .filter((inn) => inn && (inn.isBatted || (inn.inningBatsmen || []).length > 0))
      .map(mapEspnInnings);

    // Current batters/bowler from the latest ball + current innings stats.
    let currentBatsmen = [];
    let currentBowlers = [];
    const currentInn = inningsRaw.find((i) => i.isCurrent) || inningsRaw[inningsRaw.length - 1];
    if (currentInn) {
      const notOut = (currentInn.inningBatsmen || []).filter((b) => b && b.battedType === 'yes' && !b.isOut);
      const lastBall = commentary.length > 0 ? balls.find((c) => `espn-c-${c.id}` === commentary[0].id) : null;
      const onStrike = lastBall && (playerById[lastBall.batsmanPlayerId] || '');
      currentBatsmen = notOut.slice(-2).map((b) => ({
        name: espnPlayerName(b.player),
        nameOdia: espnPlayerName(b.player),
        runs: Number(b.runs ?? 0),
        balls: Number(b.balls ?? 0),
        fours: Number(b.fours ?? 0),
        sixes: Number(b.sixes ?? 0),
        strikeRate: Number(b.strikerate ?? 0),
        isOnStrike: onStrike ? espnPlayerName(b.player) === onStrike : false,
      }));
      const lastBowlerId = lastBall && lastBall.bowlerPlayerId;
      const lb = (currentInn.inningBowlers || []).find((b) => b && b.player && b.player.id === lastBowlerId)
        || (currentInn.inningBowlers || [])[(currentInn.inningBowlers || []).length - 1];
      if (lb) {
        currentBowlers = [{
          name: espnPlayerName(lb.player),
          nameOdia: espnPlayerName(lb.player),
          overs: espnOversStr(lb),
          maidens: Number(lb.maidens ?? 0),
          runs: Number(lb.conceded ?? 0),
          wickets: Number(lb.wickets ?? 0),
          economy: Number(lb.economy ?? 0),
        }];
      }
    }

    const result = { commentary, scorecards, currentBatsmen, currentBowlers };
    centreCache.set(espnId, { at: Date.now(), data: result });
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error('[match-centre]', e.message);
    res.status(502).json({ ok: false, reason: 'centre-unavailable', commentary: [], scorecards: [] });
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
