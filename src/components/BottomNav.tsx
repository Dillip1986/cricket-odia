import React, { useState } from 'react';
import {
  Home,
  Radio,
  Calendar,
  Heart,
  Menu,
  X,
  Trophy,
  Newspaper,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openBookmarks: () => void;
  openFavorites: () => void;
  openSettings: () => void;
  openAdmin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openBookmarks,
  openFavorites,
  openSettings,
  openAdmin,
}) => {
  const { language } = useCricket();
  const t = useStrings();
  const isOdia = language === 'odia';
  const [moreOpen, setMoreOpen] = useState(false);

  const go = (tab: string) => {
    setMoreOpen(false);
    setCurrentTab(tab);
  };

  const primary = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'live', label: t.navLive, icon: Radio, dot: true },
    { id: 'fixtures', label: t.navSeries, icon: Calendar },
  ];

  const moreLinks: { label: string; icon: React.ElementType; action: () => void; activeId?: string }[] = [
    { label: t.navStandings, icon: Trophy, action: () => go('standings'), activeId: 'standings' },
    { label: t.navNews, icon: Newspaper, action: () => go('news'), activeId: 'news' },
    { label: t.navRankings, icon: BarChart3, action: () => go('rankings'), activeId: 'rankings' },
    { label: t.navTeams, icon: Users, action: () => go('teams'), activeId: 'teams' },
    { label: t.actionBookmarks, icon: Bookmark, action: () => { setMoreOpen(false); openBookmarks(); } },
    { label: t.actionSettings, icon: Settings, action: () => { setMoreOpen(false); openSettings(); } },
    { label: t.actionAdmin, icon: ShieldCheck, action: () => { setMoreOpen(false); openAdmin(); } },
  ];

  const moreActive = ['standings', 'news', 'rankings', 'teams'].includes(currentTab);

  return (
    <>
      {/* More sheet */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.navMore}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setMoreOpen(false)} aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0f2444] rounded-t-3xl border-t border-slate-200 dark:border-slate-700 shadow-2xl pb-safe">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mt-3" aria-hidden="true" />
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{t.navMore}</h2>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label={t.actionClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="px-3 pb-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {moreLinks.map((link) => {
                const Icon = link.icon;
                const active = link.activeId === currentTab;
                return (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className={`w-full flex items-center gap-3 min-h-[52px] px-4 rounded-2xl text-sm font-semibold cursor-pointer transition-colors ${
                        active ? 'bg-[#00B887]/12 text-[#00966f] dark:text-[#00e6a8]' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left">{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Bar */}
      <nav
        aria-label={isOdia ? 'ମୋବାଇଲ୍ ନାଭିଗେସନ୍' : 'Mobile navigation'}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071426]/97 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl pb-safe"
      >
        <div className="grid grid-cols-5 items-stretch max-w-lg mx-auto px-1">
          {primary.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[60px] transition-colors cursor-pointer rounded-lg ${
                  isActive ? 'text-[#00e6a8] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="relative">
                  <Icon className="w-[22px] h-[22px]" aria-hidden="true" />
                  {item.dot && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
                  )}
                </span>
                <span className="text-[10px] tracking-tight truncate max-w-[68px]">{item.label}</span>
                {isActive && <span className="w-6 h-0.5 rounded-full bg-[#00B887]" aria-hidden="true" />}
              </button>
            );
          })}

          <button
            onClick={openFavorites}
            aria-label={t.navFavorites}
            className="flex flex-col items-center justify-center gap-0.5 min-h-[60px] transition-colors cursor-pointer rounded-lg text-slate-400 hover:text-white"
          >
            <Heart className="w-[22px] h-[22px]" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[68px]">{t.navFavorites}</span>
          </button>

          <button
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-label={t.navMore}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[60px] transition-colors cursor-pointer rounded-lg ${
              moreActive || moreOpen ? 'text-[#00e6a8] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Menu className="w-[22px] h-[22px]" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[68px]">{t.navMore}</span>
            {(moreActive || moreOpen) && <span className="w-6 h-0.5 rounded-full bg-[#00B887]" aria-hidden="true" />}
          </button>
        </div>
      </nav>
    </>
  );
};
