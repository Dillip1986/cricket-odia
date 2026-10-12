import React, { useState } from 'react';
import { Calendar, Filter, Clock, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { MatchCard } from './MatchCard';
import { NoMatchesToday } from './NoMatchesToday';
import { MatchFormat, MatchCategory } from '../types/cricket';

interface FixturesViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const FixturesView: React.FC<FixturesViewProps> = ({ setCurrentTab }) => {
  const { matches, language } = useCricket();
  const isOdia = language === 'odia';

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED'>('ALL');
  const [formatFilter, setFormatFilter] = useState<MatchFormat | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<MatchCategory | 'ALL'>('ALL');

  const filteredMatches = matches.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (formatFilter !== 'ALL' && m.format !== formatFilter) return false;
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Title */}
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

          <h1 className="text-2xl font-bold text-slate-900">
            {isOdia ? 'କ୍ରିକେଟ୍ ଖେଳସୂଚୀ ଓ ଫଳାଫଳ' : 'Cricket Fixtures & Results'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOdia
              ? 'ଆଗାମୀ, ଲାଇଭ୍ ଏବଂ ସମାପ୍ତ ହୋଇଥିବା ସମସ୍ତ ମ୍ୟାଚ୍‌ର ସମ୍ପୂର୍ଣ୍ଣ ତାଲିକା'
              : 'Complete schedule of upcoming, live, and completed matches'}
          </p>
        </div>

        {/* Primary Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ସମସ୍ତ' : 'All'}
          </button>
          <button
            onClick={() => setStatusFilter('LIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'LIVE' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଲାଇଭ୍' : 'Live'}
          </button>
          <button
            onClick={() => setStatusFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'UPCOMING' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଆଗାମୀ' : 'Upcoming'}
          </button>
          <button
            onClick={() => setStatusFilter('FINISHED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'FINISHED' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ସମାପ୍ତ' : 'Results'}
          </button>
        </div>
      </div>

      {/* Secondary Format & Competition Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          {isOdia ? 'ଫର୍ମାଟ୍:' : 'Format:'}
        </span>
        {(['ALL', 'T20', 'ODI', 'TEST'] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => setFormatFilter(fmt)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              formatFilter === fmt
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {fmt === 'ALL' ? (isOdia ? 'ସବୁ ଫର୍ମାଟ୍' : 'All') : fmt}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-300 mx-2 hidden sm:block" />

        <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
          {isOdia ? 'ବର୍ଗ:' : 'Category:'}
        </span>
        {(['ALL', 'INTERNATIONAL', 'IPL', 'DOMESTIC', 'WOMEN'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              categoryFilter === cat
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat === 'ALL'
              ? isOdia ? 'ସମସ୍ତ' : 'All'
              : cat === 'INTERNATIONAL'
              ? isOdia ? 'ଆନ୍ତର୍ଜାତୀୟ' : 'International'
              : cat === 'IPL'
              ? 'IPL'
              : cat === 'DOMESTIC'
              ? isOdia ? 'ଘରୋଇ (Ranji)' : 'Domestic'
              : isOdia ? 'ମହିଳା କ୍ରିକେଟ୍' : 'Women'}
          </button>
        ))}
      </div>

      {/* Grid of Matches (empty feed → "today there is no match") */}
      {matches.length === 0 ? (
        <NoMatchesToday />
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            {isOdia ? 'ଏହି ଫିଲ୍ଟର୍‌ରେ କୌଣସି ମ୍ୟାଚ୍ ମିଳିଲା ନାହିଁ' : 'No matches found matching these filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isOdia ? 'ଅନ୍ୟ ଏକ ଫିଲ୍ଟର୍ ବାଛିବା ପାଇଁ ଉପର ବଟନ୍ ଚୟନ କରନ୍ତୁ।' : 'Try resetting your filter to view all fixtures.'}
          </p>
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
