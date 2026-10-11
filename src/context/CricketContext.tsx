import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Match, NewsArticle, PointsTableRow, PlayerProfile, CommentaryDelivery, MatchReminder } from '../types/cricket';
import { INITIAL_MATCHES, INITIAL_NEWS, INITIAL_STANDINGS, INITIAL_PLAYERS, INITIAL_RANKINGS } from '../services/cricketData';
import { fetchLivePatches, ScorePatch } from '../services/liveApi';

interface CricketContextType {
  matches: Match[];
  news: NewsArticle[];
  standings: PointsTableRow[];
  players: PlayerProfile[];
  rankings: typeof INITIAL_RANKINGS;
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match | null) => void;
  selectedArticle: NewsArticle | null;
  setSelectedArticle: (article: NewsArticle | null) => void;
  language: 'odia' | 'english';
  setLanguage: (lang: 'odia' | 'english') => void;
  useOdiaDigits: boolean;
  setUseOdiaDigits: (use: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  favouriteTeams: string[];
  toggleFavouriteTeam: (teamId: string) => void;
  bookmarkedArticles: string[];
  toggleBookmarkArticle: (articleId: string) => void;
  reminders: MatchReminder[];
  hasReminder: (matchId: string) => boolean;
  toggleReminder: (match: Match) => void;
  dismissReminder: (reminderId: string) => void;
  activeAlertBanner: MatchReminder | null;
  dismissActiveAlert: () => void;
  triggerTestNotification: () => void;
  toastMessage: string | null;
  isSimulatingLive: boolean;
  setIsSimulatingLive: (sim: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  addNewArticle: (article: Omit<NewsArticle, 'id' | 'viewsCount'>) => void;
  updateMatchScore: (matchId: string, updates: Partial<Match>) => void;
  triggerNextBallSimulation: (matchId: string) => void;
  resetDemoData: () => void;
  /** 'api' when the last poll applied verified scores, else 'sim' (demo engine). */
  liveSource: 'api' | 'sim';
}

const CricketContext = createContext<CricketContextType | undefined>(undefined);

// Storage schema version — bump when persisted shapes change so stale
// data from older builds can never put the app in a broken state.
const STORAGE_VERSION = 'v2';
const STORAGE_KEYS = [
  'cricket_odia_matches',
  'cricket_odia_news',
  'cricket_odia_fav_teams',
  'cricket_odia_bookmarks',
  'cricket_odia_reminders',
  'cricket_odia_language',
  'cricket_odia_digits',
  'cricket_odia_simulating',
  'cricket_odia_theme',
];

function ensureStorageVersion(): void {
  try {
    if (localStorage.getItem('cricket_odia_version') === STORAGE_VERSION) return;
    for (const key of STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    localStorage.setItem('cricket_odia_version', STORAGE_VERSION);
  } catch {
    /* storage unavailable -> nothing to migrate */
  }
}

// --- Safe localStorage helpers (fix: JSON.parse crash + schema drift) ---
function safeLoad<T>(key: string, fallback: T, isValid?: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (isValid ? isValid(parsed) : parsed !== null) return parsed as T;
    return fallback;
  } catch {
    // Corrupt storage (private mode / schema change) -> fall back safely
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return fallback;
  }
}

function safeSave(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded / unavailable -> non-fatal
  }
}

const isMatchArray = (v: unknown): boolean =>
  Array.isArray(v) && v.every((m) => typeof m === 'object' && m !== null && 'id' in m && 'team1' in m && 'team2' in m);
const isNewsArray = (v: unknown): boolean =>
  Array.isArray(v) && v.every((n) => typeof n === 'object' && n !== null && 'id' in n);
const isStringArray = (v: unknown): boolean => Array.isArray(v) && v.every((s) => typeof s === 'string');
const isReminderArray = (v: unknown): boolean =>
  Array.isArray(v) && v.every((r) => typeof r === 'object' && r !== null && 'id' in r && 'matchId' in r);

function getInitialTheme(): 'light' | 'dark' {
  const saved = safeLoad<string | null>('cricket_odia_theme', null);
  if (saved === 'light' || saved === 'dark') return saved;
  try {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    /* ignore */
  }
  return 'light';
}

// --- Pure simulation helper (testable, no React side-effects inside) ---
interface SimOutcome {
  runs: number;
  event: CommentaryDelivery['event'];
  textOdia: string;
  textEn: string;
  isWicket: boolean;
}

const SIM_OUTCOMES: SimOutcome[] = [
  { runs: 4, event: 'FOUR', textOdia: 'ଚୌକା! ଫିଲ୍ଡରଙ୍କୁ ଚକମା ଦେଇ ବଲ୍ ସୀମାରେଖା ଅତିକ୍ରମ କଲା। ଚମତ୍କାର ଟାଇମିଂ!', textEn: 'FOUR! Beautiful boundary driven through extra cover.', isWicket: false },
  { runs: 1, event: 'ONE', textOdia: 'ଗୋଟିଏ ରନ୍। ସିଙ୍ଗଲ୍ ନେଇ ଷ୍ଟ୍ରାଇକ୍ ପରିବର୍ତ୍ତନ କଲେ।', textEn: 'Single taken towards midwicket.', isWicket: false },
  { runs: 6, event: 'SIX', textOdia: 'ଛକା! ଆକାଶଛୁଆଁ ଛକା! ବଲ୍ ସିଧା ଷ୍ଟାଣ୍ଡରେ ଯାଇ ପଡ଼ିଲା!', textEn: 'SIX! Dispatched deep into the tier!', isWicket: false },
  { runs: 2, event: 'TWO', textOdia: 'ଦୁଇ ରନ୍। ୱିକେଟ୍ ମଧ୍ୟରେ ତୀବ୍ର ଦୌଡ଼ ସହ ଦୁଇଟି ରନ୍ ସଫଳତାର ସହ ପୂରା।', textEn: 'Quick double taken, great running.', isWicket: false },
  { runs: 0, event: 'DOT', textOdia: 'ଡଟ୍ ବଲ୍। ଡିଫେନ୍ସିଭ୍ ସଟ୍, କୌଣସି ରନ୍ ହେଲା ନାହିଁ।', textEn: 'Dot ball, solid block on the front foot.', isWicket: false },
  { runs: 0, event: 'WICKET', textOdia: 'ୱିକେଟ୍! ବଡ଼ ସଟ୍ ଖେଳିବାକୁ ଯାଇ ବ୍ୟାଟର ଆଉଟ୍! ଦର୍ଶକ ସ୍ତବ୍ଧ।', textEn: 'WICKET! Big shot attempted, batter departs!', isWicket: true },
];

function parseOvers(overs?: string): { over: number; ball: number; totalBalls: number } {
  if (!overs || !/^\d+\.[0-5]$/.test(overs.trim())) return { over: 0, ball: 0, totalBalls: 0 };
  const [o, b] = overs.split('.').map(Number);
  return { over: o, ball: b, totalBalls: o * 6 + b };
}

function formatOvers(totalBalls: number): string {
  return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
}

function maxBallsForFormat(format: Match['format']): number | null {
  if (format === 'T20') return 120;
  if (format === 'ODI') return 300;
  return null; // TEST: no limit
}

export function simulateNextBall(match: Match): Match | null {
  if (match.status !== 'LIVE') return null;
  const battingKey = match.team2.isBatting ? 'team2' : match.team1.isBatting ? 'team1' : 'team2';
  const batting = match[battingKey];
  if (batting.score === undefined || batting.wickets === undefined) return null;

  const { totalBalls } = parseOvers(batting.overs ?? '0.0');
  const nextTotalBalls = totalBalls + 1;
  const newOverStr = formatOvers(nextTotalBalls);

  const chosen = SIM_OUTCOMES[Math.floor(Math.random() * SIM_OUTCOMES.length)];
  const newScore = batting.score + chosen.runs;
  const newWickets = Math.min(10, batting.wickets + (chosen.isWicket ? 1 : 0));

  const newCommentary: CommentaryDelivery = {
    id: `sim-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    over: newOverStr,
    runs: chosen.runs,
    event: chosen.event,
    commentaryOdia: `${chosen.textOdia} (${newOverStr} ଓଭର)`,
    commentaryEn: `${chosen.textEn} (Over ${newOverStr})`,
    batsmanNameOdia: match.currentBatsmen?.[0]?.nameOdia ?? 'ବ୍ୟାଟର',
    bowlerNameOdia: match.currentBowlers?.[0]?.nameOdia ?? 'ବୋଲର',
    batsmanNameEn: match.currentBatsmen?.[0]?.name ?? 'Batter',
    bowlerNameEn: match.currentBowlers?.[0]?.name ?? 'Bowler',
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    isKeyMoment: chosen.runs >= 4 || chosen.isWicket,
  };

  // Run rates from actual balls faced (fix: previously static)
  const oversBowled = nextTotalBalls / 6;
  const crr = oversBowled > 0 ? (newScore / oversBowled).toFixed(2) : '0.00';
  let rrr: string | undefined;
  let finished = newWickets >= 10;
  let statusText = match.statusTextOdia;

  const maxBalls = maxBallsForFormat(match.format);
  if (match.target && match.target > 0 && maxBalls) {
    const runsNeeded = Math.max(0, match.target - newScore);
    const ballsRemaining = Math.max(0, maxBalls - nextTotalBalls);
    rrr = ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)).toFixed(2) : '0.00';
    if (runsNeeded <= 0) {
      finished = true;
      statusText = `ଭାରତ ${10 - newWickets} ୱିକେଟ୍‌ରେ ରୋମାଞ୍ଚକର ବିଜୟ ହାସଲ କଲା!`;
    } else if (ballsRemaining <= 0) {
      finished = true;
      statusText = 'ନିର୍ଦ୍ଧାରିତ ଓଭର ଶେଷ — ମ୍ୟାଚ୍ ସମାପ୍ତ';
    } else {
      statusText = `ଜିତିବା ପାଇଁ ${ballsRemaining} ବଲ୍‌ରେ ${runsNeeded} ରନ୍ ଆବଶ୍ୟକ`;
    }
  } else if (maxBalls && nextTotalBalls >= maxBalls) {
    finished = true;
    statusText = 'ନିର୍ଦ୍ଧାରିତ ଓଭର ଶେଷ — ମ୍ୟାଚ୍ ସମାପ୍ତ';
  } else if (match.format === 'TEST') {
    statusText = match.statusTextOdia; // day/session text managed manually
  }

  return {
    ...match,
    status: finished ? 'FINISHED' : 'LIVE',
    statusTextOdia: statusText,
    currentRunRate: crr,
    requiredRunRate: rrr ?? match.requiredRunRate,
    [battingKey]: {
      ...batting,
      score: newScore,
      wickets: newWickets,
      overs: newOverStr,
    },
    recentBalls: [
      chosen.isWicket ? 'W' : String(chosen.runs),
      ...(match.recentBalls || []),
    ].slice(0, 6),
    commentary: [newCommentary, ...match.commentary].slice(0, 50),
  } as Match;
}

export const CricketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time migration: drop state persisted by older builds before reading it.
  ensureStorageVersion();

  const [matches, setMatches] = useState<Match[]>(() => safeLoad('cricket_odia_matches', INITIAL_MATCHES, isMatchArray));
  const [news, setNews] = useState<NewsArticle[]>(() => safeLoad('cricket_odia_news', INITIAL_NEWS, isNewsArray));
  const [standings] = useState<PointsTableRow[]>(INITIAL_STANDINGS);
  const [players] = useState<PlayerProfile[]>(INITIAL_PLAYERS);
  const [rankings] = useState(INITIAL_RANKINGS);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const [language, setLanguage] = useState<'odia' | 'english'>(() =>
    safeLoad('cricket_odia_language', 'odia' as const)
  );
  const [useOdiaDigits, setUseOdiaDigits] = useState<boolean>(() => safeLoad('cricket_odia_digits', true));
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  const [favouriteTeams, setFavouriteTeams] = useState<string[]>(() =>
    safeLoad('cricket_odia_fav_teams', ['ind', 'csk', 'odi'], isStringArray)
  );
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(() =>
    safeLoad('cricket_odia_bookmarks', [], isStringArray)
  );

  const [reminders, setReminders] = useState<MatchReminder[]>(() => {
    const saved = safeLoad<MatchReminder[] | null>('cricket_odia_reminders', null, isReminderArray);
    if (saved) return saved;
    return [
      {
        id: 'rem-ind-aus-women',
        matchId: 'match-ind-aus-women',
        matchTitleOdia: 'ଭାରତ ମହିଳା ବନାମ ଅଷ୍ଟ୍ରେଲିଆ ମହିଳା, ସେମିଫାଇନାଲ୍',
        matchTitleEn: 'India Women vs Australia Women, Semifinal',
        format: 'T20',
        dateStrOdia: 'ଆସନ୍ତାକାଲି ସନ୍ଧ୍ୟା ୭:୦୦ (Lord\'s, London)',
        venueOdia: 'ଲର୍ଡ୍ସ କ୍ରିକେଟ୍ ଗ୍ରାଉଣ୍ଡ',
        addedAt: Date.now(),
        isTriggered: true,
      },
    ];
  });

  // Fix: don't read `reminders` state during init (stale closure) — read storage directly
  const [activeAlertBanner, setActiveAlertBanner] = useState<MatchReminder | null>(() => {
    const saved = safeLoad<MatchReminder[] | null>('cricket_odia_reminders', null, isReminderArray);
    return saved && saved.length > 0 ? saved[0] : null;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(() =>
    safeLoad('cricket_odia_simulating', true)
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Verified-API state: 'api' once a poll applies real scores.
  const [liveSource, setLiveSource] = useState<'api' | 'sim'>('sim');
  // Matches currently driven by the API are excluded from the sim engine.
  const apiDrivenRef = useRef<Set<string>>(new Set());

  const applyScorePatch = useCallback((patch: ScorePatch) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== patch.matchId) return m;
        const updated: Match = {
          ...m,
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.statusTextOdia ? { statusTextOdia: patch.statusTextOdia } : {}),
          ...(patch.liveSummaryEn ? { liveSummaryEn: patch.liveSummaryEn } : {}),
          isVerifiedApi: true,
          team1: patch.team1 ? { ...m.team1, ...patch.team1 } : m.team1,
          team2: patch.team2 ? { ...m.team2, ...patch.team2 } : m.team2,
        };
        const batting = updated.team2.isBatting || !updated.team1.isBatting ? updated.team2 : updated.team1;
        const note: CommentaryDelivery = {
          id: `api-${Date.now()}-${m.id}`,
          over: batting.overs ?? '',
          runs: 0,
          event: 'ONE',
          commentaryOdia: `✅ ଯାଞ୍ଚିତ ଲାଇଭ୍ ଅପଡେଟ୍: ${batting.score ?? ''}/${batting.wickets ?? ''} (${batting.overs ?? ''})`,
          commentaryEn: `Verified live update: ${batting.score ?? ''}/${batting.wickets ?? ''} (${batting.overs ?? ''}) — ${patch.liveSummaryEn ?? ''}`,
          batsmanNameOdia: '',
          bowlerNameOdia: '',
          batsmanNameEn: '',
          bowlerNameEn: '',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        updated.commentary = [note, ...m.commentary].slice(0, 50);
        return updated;
      })
    );
  }, []);

  const pollLiveScores = useCallback(async () => {
    const patches = await fetchLivePatches();
    if (!patches || patches.length === 0) return;
    apiDrivenRef.current = new Set(patches.map((p) => p.matchId));
    for (const patch of patches) applyScorePatch(patch);
    setLiveSource('api');
  }, [applyScorePatch]);

  // Poll the verified API every 30s (server caches upstream for 60s).
  useEffect(() => {
    pollLiveScores();
    const interval = setInterval(pollLiveScores, 30_000);
    return () => clearInterval(interval);
  }, [pollLiveScores]);

  // Keep open modal in sync with the matches list (single source of truth).
  // This avoids divergent random outcomes from updating both states independently.
  useEffect(() => {
    if (!selectedMatch) return;
    const fresh = matches.find((m) => m.id === selectedMatch.id);
    if (fresh && fresh !== selectedMatch) {
      setSelectedMatch(fresh);
    }
  }, [matches, selectedMatch]);

  // Persist everything that mutates (fix: matches/news/language/theme were lost on reload)
  useEffect(() => {
    safeSave('cricket_odia_matches', matches);
  }, [matches]);
  useEffect(() => {
    safeSave('cricket_odia_news', news);
  }, [news]);
  useEffect(() => {
    safeSave('cricket_odia_fav_teams', favouriteTeams);
  }, [favouriteTeams]);
  useEffect(() => {
    safeSave('cricket_odia_bookmarks', bookmarkedArticles);
  }, [bookmarkedArticles]);
  useEffect(() => {
    safeSave('cricket_odia_reminders', reminders);
  }, [reminders]);
  useEffect(() => {
    safeSave('cricket_odia_language', language);
  }, [language]);
  useEffect(() => {
    safeSave('cricket_odia_digits', useOdiaDigits);
  }, [useOdiaDigits]);
  useEffect(() => {
    safeSave('cricket_odia_simulating', isSimulatingLive);
  }, [isSimulatingLive]);

  // Fix: theme was stored but never applied — apply + persist
  useEffect(() => {
    safeSave('cricket_odia_theme', theme);
    try {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.style.colorScheme = theme;
    } catch {
      /* non-DOM env */
    }
  }, [theme]);

  const toggleFavouriteTeam = (teamId: string) => {
    setFavouriteTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const toggleBookmarkArticle = (articleId: string) => {
    setBookmarkedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const hasReminder = (matchId: string) => {
    return reminders.some((r) => r.matchId === matchId);
  };

  const toggleReminder = (match: Match) => {
    const existing = reminders.find((r) => r.matchId === match.id);
    if (existing) {
      setReminders((prev) => prev.filter((r) => r.matchId !== match.id));
      if (activeAlertBanner?.matchId === match.id) {
        setActiveAlertBanner(null);
      }
      showToast(
        language === 'odia'
          ? `ଘଣ୍ଟି ବନ୍ଦ: "${match.titleOdia}" ର ସ୍ମାରକୀ ହଟାଗଲା`
          : `Reminder removed for "${match.title}"`
      );
    } else {
      const newReminder: MatchReminder = {
        id: `rem-${Date.now()}`,
        matchId: match.id,
        matchTitleOdia: match.titleOdia,
        matchTitleEn: match.title,
        format: match.format,
        dateStrOdia: match.dateStrOdia,
        venueOdia: match.venueOdia,
        addedAt: Date.now(),
        isTriggered: true,
      };
      setReminders((prev) => [newReminder, ...prev]);
      setActiveAlertBanner(newReminder);
      showToast(
        language === 'odia'
          ? `🔔 ସ୍ମାରକୀ ସେଭ୍ ହେଲା! "${match.titleOdia}" ମ୍ୟାଚ୍ ଆରମ୍ଭ ବେଳେ ଆପଣଙ୍କୁ ନୋଟିଫିକେସନ୍ ମିଳିବ`
          : `🔔 Reminder set for "${match.title}". You will be notified!`
      );
    }
  };

  const dismissReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    if (activeAlertBanner?.id === reminderId) {
      setActiveAlertBanner(null);
    }
  };

  const dismissActiveAlert = () => {
    setActiveAlertBanner(null);
  };

  const triggerTestNotification = () => {
    const upcoming = matches.find((m) => m.status === 'UPCOMING') || matches[0];
    if (!upcoming) return;
    const testReminder: MatchReminder = {
      id: `test-rem-${Date.now()}`,
      matchId: upcoming.id,
      matchTitleOdia: upcoming.titleOdia,
      matchTitleEn: upcoming.title,
      format: upcoming.format,
      dateStrOdia: language === 'odia' ? 'ଆରମ୍ଭ ହେବାକୁ ଯାଉଛି (Starting in 5 mins)' : 'Starting in 5 minutes',
      venueOdia: upcoming.venueOdia,
      addedAt: Date.now(),
      isTriggered: true,
    };
    setActiveAlertBanner(testReminder);
    showToast(
      language === 'odia'
        ? `🔔 ମ୍ୟାଚ୍ ଆରମ୍ଭ ଆଲର୍ଟ: ${upcoming.titleOdia}`
        : `🔔 Match Starting Alert: ${upcoming.title}`
    );
  };

  const addNewArticle = (newArticle: Omit<NewsArticle, 'id' | 'viewsCount'>) => {
    const article: NewsArticle = {
      ...newArticle,
      id: `news-${Date.now()}`,
      viewsCount: 1,
    };
    setNews((prev) => [article, ...prev]);
  };

  // Fix: no setState-inside-updater — sync selectedMatch separately
  const updateMatchScore = useCallback((matchId: string, updates: Partial<Match>) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m)));
    setSelectedMatch((prevSel) => (prevSel?.id === matchId ? { ...prevSel, ...updates } : prevSel));
  }, []);

  const triggerNextBallSimulation = useCallback((matchId: string) => {
    // Skip matches driven by the verified API — never overwrite real scores.
    if (apiDrivenRef.current.has(matchId)) return;
    // Only the matches list is updated here; the open modal syncs via the effect above.
    setMatches((prevMatches) =>
      prevMatches.map((match) => {
        if (match.id !== matchId || match.status !== 'LIVE') return match;
        return simulateNextBall(match) ?? match;
      })
    );
  }, []);

  const resetDemoData = useCallback(() => {
    apiDrivenRef.current = new Set();
    setLiveSource('sim');
    setMatches(INITIAL_MATCHES);
    setNews(INITIAL_NEWS);
    setSelectedMatch(null);
    setSelectedArticle(null);
  }, []);

  // Fix: stable interval — no reset on selectedMatch change; simulate every LIVE match
  useEffect(() => {
    if (!isSimulatingLive) return;
    const interval = setInterval(() => {
      // Only update the list; the modal syncs via effect (same object, no divergent random ball).
      setMatches((prevMatches) => {
        const liveIds = prevMatches.filter((m) => m.status === 'LIVE').map((m) => m.id);
        if (liveIds.length === 0) return prevMatches;
        let changed = false;
        const next = prevMatches.map((match) => {
          if (match.status !== 'LIVE' || apiDrivenRef.current.has(match.id)) return match;
          const updated = simulateNextBall(match);
          if (updated) {
            changed = true;
            return updated;
          }
          return match;
        });
        return changed ? next : prevMatches;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  return (
    <CricketContext.Provider
      value={{
        matches,
        news,
        standings,
        players,
        rankings,
        selectedMatch,
        setSelectedMatch,
        selectedArticle,
        setSelectedArticle,
        language,
        setLanguage,
        useOdiaDigits,
        setUseOdiaDigits,
        theme,
        setTheme,
        favouriteTeams,
        toggleFavouriteTeam,
        bookmarkedArticles,
        toggleBookmarkArticle,
        reminders,
        hasReminder,
        toggleReminder,
        dismissReminder,
        activeAlertBanner,
        dismissActiveAlert,
        triggerTestNotification,
        toastMessage,
        isSimulatingLive,
        setIsSimulatingLive,
        isAdmin,
        setIsAdmin,
        addNewArticle,
        updateMatchScore,
        triggerNextBallSimulation,
        resetDemoData,
        liveSource,
      }}
    >
      {children}
    </CricketContext.Provider>
  );
};

export const useCricket = () => {
  const context = useContext(CricketContext);
  if (!context) {
    throw new Error('useCricket must be used within a CricketProvider');
  }
  return context;
};
