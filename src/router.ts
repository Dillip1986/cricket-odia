/**
 * Tiny hash router — no new dependencies.
 * Routes: #/ (home), #/live, #/fixtures, #/standings, #/news,
 * #/rankings, #/teams, #/match/:id
 */
import { useState, useEffect, useCallback } from 'react';

export type TabKey =
  | 'home'
  | 'live'
  | 'fixtures'
  | 'standings'
  | 'news'
  | 'rankings'
  | 'teams';

export const TABS: TabKey[] = [
  'home',
  'live',
  'fixtures',
  'standings',
  'news',
  'rankings',
  'teams',
];

export interface Route {
  tab: TabKey;
  matchId: string | null;
}

export function parseHash(hash: string): Route {
  const path = (hash || '').replace(/^#/, '');
  const match = /^\/match\/(.+)$/.exec(path);
  if (match) {
    return { tab: 'live', matchId: decodeURIComponent(match[1]) };
  }
  const seg = path.replace(/^\//, '').split('/')[0] as TabKey;
  if ((TABS as string[]).includes(seg)) {
    return { tab: seg, matchId: null };
  }
  return { tab: 'home', matchId: null };
}

export function navigate(path: string): void {
  const target = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}

export function openMatch(matchId: string): void {
  navigate(`#/match/${encodeURIComponent(matchId)}`);
}

export function goToTab(tab: TabKey): void {
  navigate(tab === 'home' ? '#/' : `#/${tab}`);
}

/** Current route; re-renders on hashchange and scrolls to top on change. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? { tab: 'home', matchId: null } : parseHash(window.location.hash)
  );

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

/** Stable navigate callback for components. */
export function useNavigate(): (path: string) => void {
  return useCallback((path: string) => navigate(path), []);
}
