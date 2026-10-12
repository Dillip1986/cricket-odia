import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Match, NewsArticle, PointsTableRow, PlayerProfile, MatchReminder } from '../types/cricket';
import { INITIAL_NEWS, INITIAL_STANDINGS, INITIAL_PLAYERS, INITIAL_RANKINGS } from '../services/cricketData';
import { fetchLiveMatches } from '../services/liveApi';

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
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  addNewArticle: (article: Omit<NewsArticle, 'id' | 'viewsCount'>) => void;
  updateMatchScore: (matchId: string, updates: Partial<Match>) => void;
  /** 'api' once the verified feed has loaded, else 'none' (show "no match today"). */
  liveSource: 'api' | 'none';
  /** True while the first live-feed fetch is in flight. */
  isLoadingMatches: boolean;
}

const CricketContext = createContext<CricketContextType | undefined>(undefined);

// Storage schema version — bump when persisted shapes change so stale
// data from older builds can never put the app in a broken state.
const STORAGE_VERSION = 'v3';
const STORAGE_KEYS = [
  'cricket_odia_matches',
  'cricket_odia_news',
  'cricket_odia_fav_teams',
  'cricket_odia_bookmarks',
  'cricket_odia_reminders',
  'cricket_odia_language',
  'cricket_odia_digits',
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


export const CricketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time migration: drop state persisted by older builds before reading it.
  ensureStorageVersion();

  // Live-only: matches come exclusively from the verified API feed.
  // Empty list means "today there is no match" — never demo data.
  const [matches, setMatches] = useState<Match[]>(() => safeLoad('cricket_odia_matches', [], isMatchArray));
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

  const [reminders, setReminders] = useState<MatchReminder[]>(() =>
    safeLoad('cricket_odia_reminders', [], isReminderArray)
  );

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

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Verified live feed state.
  const [liveSource, setLiveSource] = useState<'api' | 'none'>('none');
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(true);

  const pollLiveMatches = useCallback(async () => {
    const live = await fetchLiveMatches();
    if (live === null) {
      // Backend unreachable / no key: keep previous list (may be empty).
      setIsLoadingMatches(false);
      return;
    }
    setMatches(live);
    setLiveSource('api');
    setIsLoadingMatches(false);
  }, []);

  // Poll the verified API every 30s (server caches upstream for 60s).
  useEffect(() => {
    pollLiveMatches();
    const interval = setInterval(pollLiveMatches, 30_000);
    return () => clearInterval(interval);
  }, [pollLiveMatches]);

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
        isAdmin,
        setIsAdmin,
        addNewArticle,
        updateMatchScore,
        liveSource,
        isLoadingMatches,
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
