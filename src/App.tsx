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
import { MatchCentreModal } from './components/MatchCentreModal';
import { ArticleModal } from './components/ArticleModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { BookmarksModal } from './components/BookmarksModal';
import { RemindersModal } from './components/RemindersModal';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { Bell } from 'lucide-react';

function CricketApp() {
  const {
    selectedMatch,
    setSelectedMatch,
    selectedArticle,
    setSelectedArticle,
    toastMessage,
  } = useCricket();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  // Global keyboard shortcuts: "/" for search, "Escape" to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsSettingsOpen(false);
        setIsAdminOpen(false);
        setIsBookmarksOpen(false);
        setIsRemindersOpen(false);
        setSelectedMatch(null);
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedMatch, setSelectedArticle]);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-odia antialiased">
      {/* 0. Floating Push Notification Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-[90%] sm:w-auto">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <span className="text-xs font-semibold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* 1. Primary Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSearch={() => setIsSearchOpen(true)}
        openSettings={() => setIsSettingsOpen(true)}
        openAdmin={() => setIsAdminOpen(true)}
        openBookmarks={() => setIsBookmarksOpen(true)}
        openFavourites={() => setIsSettingsOpen(true)}
        openReminders={() => setIsRemindersOpen(true)}
      />

      {/* 2. ESPNcricinfo Style Live Match Ticker */}
      <LiveScoresTicker />

      {/* 3. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
      </main>

      {/* 4. Footer */}
      <Footer setCurrentTab={setCurrentTab} openAdmin={() => setIsAdminOpen(true)} />

      {/* 5. Mobile Fixed Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* 6. Modals */}
      {selectedMatch && (
        <MatchCentreModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

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
