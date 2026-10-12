import React, { useState } from 'react';
import { Radio, Filter, Sparkles, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { MatchCard } from './MatchCard';
import { NoMatchesToday } from './NoMatchesToday';
import { MatchFormat, MatchCategory, MatchStatus } from '../types/cricket';
import { toOdiaDigits } from '../utils/odiaLocalization';

interface LiveScoresViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const LiveScoresView: React.FC<LiveScoresViewProps> = ({ setCurrentTab }) => {
  const { matches, language, useOdiaDigits } = useCricket();
  const isOdia = language === 'odia';

  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | MatchCategory>('ALL');

  const filteredMatches = matches.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {setCurrentTab && (
            <button
              onClick={() => setCurrentTab('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isOdia ? '← ମୁଖ୍ୟ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ' : '← Back to Home'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {isOdia ? 'ଲାଇଭ୍ କ୍ରିକେଟ୍ ସ୍କୋର' : 'Live Cricket Scores'}
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isOdia ? 'ସଦ୍ୟତମ' : 'LIVE'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isOdia
              ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ ଫିଡ୍‌ରୁ ତାଜା ସ୍କୋରକାର୍ଡ'
              : 'Real-time scores from the verified live feed'}
          </p>
        </div>
      </div>

      {/* Primary Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl">
        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'LIVE', 'UPCOMING', 'FINISHED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL'
                ? isOdia ? 'ସମସ୍ତ' : 'All'
                : st === 'LIVE'
                ? isOdia ? 'ଲାଇଭ୍' : 'Live'
                : st === 'UPCOMING'
                ? isOdia ? 'ଆଗାମୀ' : 'Upcoming'
                : isOdia ? 'ସମାପ୍ତ' : 'Results'}
            </button>
          ))}
        </div>

        {/* Competition filter tags */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['ALL', 'INTERNATIONAL', 'IPL', 'DOMESTIC', 'WOMEN'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL'
                ? isOdia ? 'ସବୁ ଦଳ' : 'All'
                : cat === 'INTERNATIONAL'
                ? isOdia ? 'ଆନ୍ତର୍ଜାତୀୟ' : 'Intl'
                : cat === 'IPL'
                ? 'IPL'
                : cat === 'DOMESTIC'
                ? isOdia ? 'ଘରୋଇ' : 'Domestic'
                : isOdia ? 'ମହିଳା' : 'Women'}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid (empty → "today there is no match") */}
      {matches.length === 0 ? (
        <NoMatchesToday />
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Filter className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            {isOdia ? 'ଏହି ଫିଲ୍ଟର୍‌ରେ କୌଣସି ମ୍ୟାଚ୍ ମିଳିଲା ନାହିଁ' : 'No matches found matching these filters'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatches.map((m) => (
            <MatchCard key={m.id} match={m} featured={m.status === 'LIVE'} />
          ))}
        </div>
      )}
    </div>
  );
};
