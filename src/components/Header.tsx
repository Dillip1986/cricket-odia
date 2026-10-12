import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Bookmark,
  Settings,
  ShieldCheck,
  Heart,
  Bell,
  Menu,
  X,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';
import { formatFullDate } from '../utils/odiaLocalization';
import type { TabKey } from '../router';

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

const NAV_ITEMS: { id: TabKey; labelKey: 'navHome' | 'navLive' | 'navFixtures' | 'navStandings' | 'navNews' | 'navRankings' | 'navTeams' }[] = [
  { id: 'home', labelKey: 'navHome' },
  { id: 'live', labelKey: 'navLive' },
  { id: 'fixtures', labelKey: 'navFixtures' },
  { id: 'standings', labelKey: 'navStandings' },
  { id: 'news', labelKey: 'navNews' },
  { id: 'rankings', labelKey: 'navRankings' },
  { id: 'teams', labelKey: 'navTeams' },
];

const iconBtn =
  'min-w-[40px] min-h-[40px] p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center relative';

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
  const t = useStrings();
  const isOdia = language === 'odia';

  const [today, setToday] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [currentTab]);

  const go = (tab: string) => {
    setMenuOpen(false);
    setCurrentTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#071426] text-white border-b border-slate-800 shadow-md">
      {/* Date strip */}
      <div className="bg-[#040d1a] border-b border-slate-800/60">
        <div className="app-container py-1 flex items-center gap-2 text-[11px] text-slate-300">
          <CalendarDays className="w-3.5 h-3.5 text-[#00B887] shrink-0" aria-hidden="true" />
          <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {t.today}: {formatFullDate(today, isOdia, useOdiaDigits)}
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div className="app-container min-h-[60px] flex items-center justify-between gap-3 py-2">
        {/* Left: mobile menu button + brand */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`${iconBtn} lg:hidden`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t.actionClose : t.actionMenu}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => go('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none shrink-0 rounded-lg"
            aria-label="Cricket Odia — home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B887] to-[#00573f] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                <path d="M12 3 C10 8 10 16 12 21" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeDasharray="1.5,1.5" />
                <path d="M7 6 L17 16" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#00e6a8] transition-colors whitespace-nowrap leading-tight">
                Cricket Odia
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#00e6a8] font-medium tracking-wider whitespace-nowrap leading-tight">
                {t.brandSub}
              </span>
            </div>
          </button>
        </div>

        {/* Center: desktop nav */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 text-sm font-medium min-w-0">
          {NAV_ITEMS.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`whitespace-nowrap px-3 min-h-[44px] flex items-center border-b-2 transition-colors cursor-pointer ${
                  active
                    ? 'text-[#00e6a8] border-[#00B887] font-semibold'
                    : 'text-slate-300 border-transparent hover:text-white hover:border-slate-600'
                }`}
              >
                {t[item.labelKey]}
              </button>
            );
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-2.5 min-h-[40px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title={`${t.actionSearch} (/)`}
            aria-label={t.actionSearch}
          >
            <Search className="w-4 h-4 text-[#00e6a8]" />
            <span className="hidden md:inline">{t.searchPlaceholder}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 text-slate-400 rounded" aria-hidden="true">
              /
            </kbd>
          </button>

          <button
            onClick={() => setLanguage(language === 'odia' ? 'english' : 'odia')}
            className="px-2.5 min-h-[40px] rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition-colors cursor-pointer"
            title="ଭାଷା / Language"
            aria-label="Switch language"
          >
            {language === 'odia' ? 'ଓ' : 'EN'}
          </button>

          <button
            onClick={() => setUseOdiaDigits(!useOdiaDigits)}
            className="hidden sm:flex items-center px-2.5 min-h-[40px] rounded-lg bg-slate-800/60 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/80 transition-colors cursor-pointer font-bold"
            title="ଅଙ୍କ: ୧୨୩ / 123"
            aria-label="Toggle numeral script"
          >
            <span className="text-[#00e6a8]">{useOdiaDigits ? '୧୨୩' : '123'}</span>
          </button>

          <button
            onClick={openReminders}
            className={iconBtn}
            title={t.actionReminders}
            aria-label={`${t.actionReminders} (${reminders.length})`}
          >
            <Bell className={`w-[18px] h-[18px] ${reminders.length > 0 ? 'fill-[#00B887] text-[#00B887]' : ''}`} />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-amber-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center animate-pulse">
                {reminders.length}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
            <button onClick={openBookmarks} className={iconBtn} title={t.actionBookmarks} aria-label={`${t.actionBookmarks} (${bookmarkedArticles.length})`}>
              <Bookmark className="w-[18px] h-[18px]" />
              {bookmarkedArticles.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-[#00B887] text-[10px] font-bold text-[#04120d] rounded-full flex items-center justify-center">
                  {bookmarkedArticles.length}
                </span>
              )}
            </button>

            <button onClick={openFavourites} className={iconBtn} title={t.navFavorites} aria-label={t.navFavorites}>
              <Heart className={`w-[18px] h-[18px] ${favouriteTeams.length > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
            </button>

            <button onClick={openAdmin} className={iconBtn} title={t.actionAdmin} aria-label={t.actionAdmin}>
              <ShieldCheck className="w-[18px] h-[18px]" />
            </button>

            <button onClick={openSettings} className={iconBtn} title={t.actionSettings} aria-label={t.actionSettings}>
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav aria-label="Mobile" className="lg:hidden border-t border-slate-800 bg-[#040d1a]">
          <ul className="app-container py-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const active = currentTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => go(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center justify-between min-h-[48px] px-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      active ? 'bg-[#00B887]/15 text-[#00e6a8]' : 'text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{t[item.labelKey]}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
            <li className="border-t border-slate-800 mt-2 pt-2 grid grid-cols-2 gap-1 pb-2">
              <button onClick={() => { setMenuOpen(false); openBookmarks(); }} className="flex items-center gap-2 min-h-[48px] px-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/60 cursor-pointer">
                <Bookmark className="w-4 h-4 text-[#00e6a8]" /> {t.actionBookmarks}
              </button>
              <button onClick={() => { setMenuOpen(false); openFavourites(); }} className="flex items-center gap-2 min-h-[48px] px-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/60 cursor-pointer">
                <Heart className="w-4 h-4 text-rose-400" /> {t.navFavorites}
              </button>
              <button onClick={() => { setMenuOpen(false); openSettings(); }} className="flex items-center gap-2 min-h-[48px] px-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/60 cursor-pointer">
                <Settings className="w-4 h-4 text-slate-400" /> {t.actionSettings}
              </button>
              <button onClick={() => { setMenuOpen(false); openAdmin(); }} className="flex items-center gap-2 min-h-[48px] px-3 rounded-xl text-sm text-slate-200 hover:bg-slate-800/60 cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-slate-400" /> {t.actionAdmin}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};
