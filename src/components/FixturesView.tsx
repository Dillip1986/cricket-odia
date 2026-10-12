import React, { useState, useMemo } from 'react';
import { Filter, ArrowLeft, Search } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';
import { MatchCard } from './MatchCard';
import { NoMatchesToday } from './NoMatchesToday';
import { MatchGridSkeleton } from './MatchGridSkeleton';
import { MatchFormat, MatchCategory } from '../types/cricket';

interface FixturesViewProps {
  setCurrentTab?: (tab: string) => void;
}

type StatusFilter = 'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED';

export const FixturesView: React.FC<FixturesViewProps> = ({ setCurrentTab }) => {
  const { matches, language, isLoadingMatches } = useCricket();
  const t = useStrings();
  const isOdia = language === 'odia';

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [formatFilter, setFormatFilter] = useState<MatchFormat | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<MatchCategory | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (formatFilter !== 'ALL' && m.format !== formatFilter) return false;
      if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
      if (q) {
        const hay = `${m.title} ${m.titleOdia} ${m.team1.name} ${m.team2.name} ${m.venue} ${m.series}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [matches, statusFilter, formatFilter, categoryFilter, query]);

  const statusLabel = (st: StatusFilter) =>
    st === 'ALL' ? t.filterAll
    : st === 'LIVE' ? t.filterLive
    : st === 'UPCOMING' ? t.filterUpcoming
    : t.filterResults;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="card p-4 sm:p-6">
        {setCurrentTab && (
          <button
            onClick={() => setCurrentTab('home')}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00B887]" aria-hidden="true" />
            <span>{isOdia ? '← ମୁଖ୍ୟ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ' : '← Back to Home'}</span>
          </button>
        )}

        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {isOdia ? 'କ୍ରିକେଟ୍ ଖେଳସୂଚୀ ଓ ଫଳାଫଳ' : 'Cricket Fixtures & Results'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isOdia ? 'ଆଗାମୀ, ଲାଇଭ୍ ଏବଂ ସମାପ୍ତ ମ୍ୟାଚ୍‌ର ସମ୍ପୂର୍ଣ୍ଣ ତାଲିକା' : 'Complete schedule of upcoming, live, and completed matches'}
        </p>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.filterSearch}
            aria-label={t.filterSearch}
            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#00B887]"
          />
        </div>
      </div>

      {/* Status pills */}
      <div className="pill-bar" role="group" aria-label="Status filter">
        {(['ALL', 'LIVE', 'UPCOMING', 'FINISHED'] as const).map((st) => (
          <button key={st} onClick={() => setStatusFilter(st)} aria-pressed={statusFilter === st} className="pill pill-accent">
            {statusLabel(st)}
          </button>
        ))}
      </div>

      {/* Format + category pills */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <div className="pill-bar flex-1" role="group" aria-label="Format and category filter">
          {(['ALL', 'T20', 'ODI', 'TEST'] as const).map((fmt) => (
            <button key={fmt} onClick={() => setFormatFilter(fmt)} aria-pressed={formatFilter === fmt} className="pill">
              {fmt === 'ALL' ? t.filterAll : fmt}
            </button>
          ))}
          <span className="w-px h-5 bg-slate-300 dark:bg-slate-600 shrink-0 mx-1" aria-hidden="true" />
          {(['ALL', 'INTERNATIONAL', 'IPL', 'DOMESTIC', 'WOMEN'] as const).map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} aria-pressed={categoryFilter === cat} className="pill">
              {cat === 'ALL' ? t.filterAll : cat === 'IPL' ? 'IPL' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid / skeleton / empty */}
      {isLoadingMatches && matches.length === 0 ? (
        <MatchGridSkeleton />
      ) : matches.length === 0 ? (
        <NoMatchesToday />
      ) : filteredMatches.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">{t.noFilterTitle}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredMatches.map((m) => (
            <MatchCard key={m.id} match={m} featured={m.status === 'LIVE'} />
          ))}
        </div>
      )}
    </div>
  );
};
