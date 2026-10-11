import React, { useState, useEffect } from 'react';
import { Search, Globe, Bookmark, Settings, ShieldCheck, Heart, Bell, CalendarDays } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { formatFullDate } from '../utils/odiaLocalization';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSearch: () => void;
  openSettings: () => void;
  openAdmin: () => void;
  openBookmarks: () => void;
  openFavourites: () => void;
  openReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openSearch,
  openSettings,
  openAdmin,
  openBookmarks,
  openFavourites,
  openReminders,
}) => {
  const {
    language,
    setLanguage,
    useOdiaDigits,
    setUseOdiaDigits,
    bookmarkedArticles,
    favouriteTeams,
    reminders,
  } = useCricket();

  const isOdia = language === 'odia';

  // Today's date, re-rendered every minute so it rolls over at midnight.
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0a1e38] text-white border-b border-slate-800 shadow-md">
      {/* Date strip */}
      <div className="bg-[#071426] border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center gap-2 text-[11px] text-slate-300">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium whitespace-nowrap">
            {isOdia ? 'ଆଜି: ' : 'Today: '}
            {formatFullDate(today, isOdia, useOdiaDigits)}
          </span>
        </div>
      </div>
      {/* Top Bar - Strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line */}
        <button
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
        >
          {/* Cricket Ball & Bat Stylized Vector Emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
              <path d="M12 3 C10 8 10 16 12 21" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeDasharray="1.5,1.5" />
              <path d="M7 6 L17 16" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              Cricket Odia
            </span>
            <span className="text-[11px] text-emerald-400 font-medium -mt-1 tracking-wider whitespace-nowrap">
              କ୍ରିକେଟ୍ ଓଡ଼ିଆ
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('live')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'live'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            {isOdia ? 'ଲାଇଭ୍ ସ୍କୋର' : 'Live Scores'}
          </button>
          <button
            onClick={() => setCurrentTab('fixtures')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'fixtures'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            {isOdia ? 'ଖେଳସୂଚୀ' : 'Fixtures'}
          </button>
          <button
            onClick={() => setCurrentTab('standings')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'standings'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            {isOdia ? 'ପଏଣ୍ଟ ଟେବୁଲ' : 'Standings'}
          </button>
          <button
            onClick={() => setCurrentTab('news')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'news'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            {isOdia ? 'କ୍ରିକେଟ୍ ଖବର' : 'News'}
          </button>
          <button
            onClick={() => setCurrentTab('rankings')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'rankings'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            {isOdia ? 'ର‍୍ୟାଙ୍କିଙ୍ଗ୍' : 'Rankings'}
          </button>
          <button
            onClick={() => setCurrentTab('teams')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              currentTab === 'teams'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            {isOdia ? 'ଦଳ ଓ ଖେଳାଳି' : 'Teams & Players'}
          </button>
        </nav>

        {/* Zone 3: 1 primary action button area */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search */}
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Search matches, players, news (ଖୋଜନ୍ତୁ)"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isOdia ? 'ଖୋଜନ୍ତୁ...' : 'Search...'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded">
              /
            </kbd>
          </button>

          {/* Odia / English Toggle */}
          <button
            onClick={() => setLanguage(language === 'odia' ? 'english' : 'odia')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors flex items-center gap-1 cursor-pointer"
            title="ଭାଷା ପରିବର୍ତ୍ତନ କରନ୍ତୁ"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'odia' ? 'ଓଡ଼ିଆ' : 'EN'}</span>
          </button>

          {/* Odia Numerals switch */}
          <button
            onClick={() => setUseOdiaDigits(!useOdiaDigits)}
            className="hidden sm:flex items-center px-2 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
            title="ଅଙ୍କ ଫର୍ମାଟ୍: ୧୨୩ / 123"
          >
            <span className="font-semibold text-emerald-300">{useOdiaDigits ? '୧୨୩' : '123'}</span>
          </button>

          {/* Match Reminders Bell Button with Counter */}
          <button
            onClick={openReminders}
            className={`p-2 rounded-lg transition-colors relative cursor-pointer ${
              reminders.length > 0
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isOdia ? 'ମ୍ୟାଚ୍ ରିମାଇଣ୍ଡର୍ ଓ ଆଲର୍ଟ' : 'Match Reminders'}
            aria-label="Reminders"
          >
            <Bell className={`w-4 h-4 ${reminders.length > 0 ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center animate-pulse">
                {reminders.length}
              </span>
            )}
          </button>

          {/* Bookmarks */}
          <button
            onClick={openBookmarks}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            title="ସାଇତି ରଖାଯାଇଥିବା ଖବର"
            aria-label="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkedArticles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {bookmarkedArticles.length}
              </span>
            )}
          </button>

          {/* Favourites */}
          <button
            onClick={openFavourites}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors relative cursor-pointer"
            title="ପ୍ରିୟ ଦଳ"
            aria-label="Favourites"
          >
            <Heart className={`w-4 h-4 ${favouriteTeams.length > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
          </button>

          {/* Settings / Admin Trigger */}
          <button
            onClick={openAdmin}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            title="ପରିଚାଳକ ଡ୍ୟାସବୋର୍ଡ (Admin Portal)"
            aria-label="Admin Portal"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            onClick={openSettings}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="ସେଟିଂସ୍"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

