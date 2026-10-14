import React, { useState, useEffect } from 'react';
import { CricketProvider, useCricket } from './context/CricketContext';
import { Header } from './components/Header';
import { LiveScoresTicker } from './components/LiveScoresTicker';
import { HomeDashboard } from './components/HomeDashboard';
import { LiveScoresView } from './components/LiveScoresView';
import { FixturesView } from './components/FixturesView';
import { PointsTableView } from './components/PointsTableView';
import { NewsSection } from './components/NewsSection';
import { RankingsView } from './components/RankingsView';
import { TeamsPlayersView } from './components/TeamsPlayersView';
import { MatchCentrePage } from './components/MatchCentreModal';
import { ArticleModal } from './components/ArticleModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { BookmarksModal } from './components/BookmarksModal';
import { RemindersModal } from './components/RemindersModal';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { Bell } from 'lucide-react';
import { useHashRoute, goToTab, type TabKey } from './router';

function CricketApp() {
  const {
    matches,
    selectedArticle,
    setSelectedArticle,
    toastMessage,
  } = useCricket();

  const route = useHashRoute();
  const currentTab: TabKey = route.tab;
  const setCurrentTab = (tab: string) => goToTab(tab as TabKey);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  // Global keyboard shortcuts: "/" for search, "Escape" to close layers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen || isSettingsOpen || isAdminOpen || isBookmarksOpen || isRemindersOpen) {
          setIsSearchOpen(false);
          setIsSettingsOpen(false);
          setIsAdminOpen(false);
          setIsBookmarksOpen(false);
          setIsRemindersOpen(false);
        } else if (route.matchId) {
          window.history.back();
        }
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isSettingsOpen, isAdminOpen, isBookmarksOpen, isRemindersOpen, route.matchId, setSelectedArticle]);

  const activeMatch = route.matchId
    ? matches.find((m) => m.id === route.matchId) ?? null
    : null;

  // If a finished game drops off the fresh feed while being read, keep
  // showing the last-known card (marked finished) instead of a dead end.
  const [lastMatch, setLastMatch] = useState<(typeof matches)[number] | null>(null);
  useEffect(() => {
    if (activeMatch) setLastMatch(activeMatch);
  }, [activeMatch]);
  const shownMatch =
    activeMatch ??
    (lastMatch && route.matchId === lastMatch.id
      ? lastMatch.status === 'LIVE'
        ? { ...lastMatch, status: 'FINISHED' as const }
        : lastMatch
      : null);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#071426] text-slate-900 dark:text-slate-100 flex flex-col font-odia antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#00B887] focus:text-[#04120d] focus:font-bold focus:text-sm"
      >
        Skip to content
      </a>

      {/* 0. Floating toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 max-w-md w-[90%] sm:w-auto"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <span className="text-xs font-semibold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* 1. Primary Header */}
      <Header
        currentTab={route.matchId ? 'live' : currentTab}
        setCurrentTab={setCurrentTab}
        openSearch={() => setIsSearchOpen(true)}
        openSettings={() => setIsSettingsOpen(true)}
        openAdmin={() => setIsAdminOpen(true)}
        openBookmarks={() => setIsBookmarksOpen(true)}
        openFavourites={() => setIsSettingsOpen(true)}
        openReminders={() => setIsRemindersOpen(true)}
      />

      {/* 2. Live Match Ticker */}
      <LiveScoresTicker />

      {/* 3. Main Content Canvas */}
      <main id="main-content" className="flex-1 w-full">
        <div className="app-container py-5 sm:py-7">
          {route.matchId ? (
            <MatchCentrePage matchId={route.matchId} match={shownMatch} />
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeDashboard
                  setCurrentTab={setCurrentTab}
                  openReminders={() => setIsRemindersOpen(true)}
                />
              )}
              {currentTab === 'live' && <LiveScoresView setCurrentTab={setCurrentTab} />}
              {currentTab === 'fixtures' && <FixturesView setCurrentTab={setCurrentTab} />}
              {currentTab === 'standings' && <PointsTableView setCurrentTab={setCurrentTab} />}
              {currentTab === 'news' && <NewsSection setCurrentTab={setCurrentTab} />}
              {currentTab === 'rankings' && <RankingsView setCurrentTab={setCurrentTab} />}
              {currentTab === 'teams' && <TeamsPlayersView setCurrentTab={setCurrentTab} />}
            </>
          )}
        </div>
      </main>

      {/* 4. Footer */}
      <Footer setCurrentTab={setCurrentTab} openAdmin={() => setIsAdminOpen(true)} />

      {/* 5. Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        currentTab={route.matchId ? 'live' : currentTab}
        setCurrentTab={setCurrentTab}
        openBookmarks={() => setIsBookmarksOpen(true)}
        openFavorites={() => setIsSettingsOpen(true)}
        openSettings={() => setIsSettingsOpen(true)}
        openAdmin={() => setIsAdminOpen(true)}
      />

      {/* 6. Modals */}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      {isSearchOpen && (
        <GlobalSearchModal onClose={() => setIsSearchOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isAdminOpen && (
        <AdminPortalModal onClose={() => setIsAdminOpen(false)} />
      )}

      {isBookmarksOpen && (
        <BookmarksModal onClose={() => setIsBookmarksOpen(false)} />
      )}

      {isRemindersOpen && (
        <RemindersModal onClose={() => setIsRemindersOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CricketProvider>
      <CricketApp />
    </CricketProvider>
  );
}
