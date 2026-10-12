import React, { useState, useMemo } from 'react';
import { Radio, Filter, ArrowLeft, Search } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';
import { MatchCard } from './MatchCard';
import { NoMatchesToday } from './NoMatchesToday';
import { MatchGridSkeleton } from './MatchGridSkeleton';
import { MatchCategory, MatchStatus } from '../types/cricket';
import { toOdiaDigits } from '../utils/odiaLocalization';

interface LiveScoresViewProps {
  setCurrentTab?: (tab: string) => void;
}

const STATUS_FILTERS: ('ALL' | MatchStatus)[] = ['ALL', 'LIVE', 'UPCOMING', 'FINISHED'];
const CATEGORY_FILTERS: ('ALL' | MatchCategory)[] = ['ALL', 'INTERNATIONAL', 'IPL', 'DOMESTIC', 'WOMEN'];

export const LiveScoresView: React.FC<LiveScoresViewProps> = ({ setCurrentTab }) => {
  const { matches, language, useOdiaDigits, isLoadingMatches } = useCricket();
  const t = useStrings();
  const isOdia = language === 'odia';

  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | MatchCategory>('ALL');
  const [query, setQuery] = useState('');

  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matches.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
      if (q) {
        const hay = `${m.title} ${m.titleOdia} ${m.team1.name} ${m.team2.name} ${m.venue} ${m.series}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [matches, statusFilter, categoryFilter, query]);

  const statusLabel = (st: 'ALL' | MatchStatus) =>
    st === 'ALL' ? t.filterAll
    : st === 'LIVE' ? t.filterLive
    : st === 'UPCOMING' ? t.filterUpcoming
    : t.filterResults;

  const liveCount = matches.filter((m) => m.status === 'LIVE').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
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

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isOdia ? 'ଲାଇଭ୍ କ୍ରିକେଟ୍ ସ୍କୋର' : 'Live Cricket Scores'}
          </h1>
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-bold">
              <Radio className="w-3 h-3 animate-pulse" aria-hidden="true" />
              <span className="score">{useOdiaDigits && isOdia ? toOdiaDigits(liveCount) : liveCount} {t.liveBadge}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isOdia ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ ଫିଡ୍‌ରୁ ତାଜା ସ୍କୋରକାର୍ଡ' : 'Real-time scores from the verified live feed'}
        </p>

        {/* Search */}
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
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            aria-pressed={statusFilter === st}
            className="pill pill-accent"
          >
            {statusLabel(st)}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <div className="pill-bar flex-1" role="group" aria-label="Category filter">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              aria-pressed={categoryFilter === cat}
              className="pill"
            >
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
