import React from 'react';
import { ChevronRight, Radio } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { Match } from '../types/cricket';
import { formatScore, toOdiaDigits } from '../utils/odiaLocalization';

export const LiveScoresTicker: React.FC = () => {
  const { matches, setSelectedMatch, useOdiaDigits, language, liveSource } = useCricket();

  const isOdia = language === 'odia';
  const isApi = liveSource === 'api';

  return (
    <div className="bg-[#0f2444] border-b border-slate-800 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Ticker label & status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <Radio className="w-3 h-3 animate-pulse text-rose-500" />
            <span>{isOdia ? 'ମ୍ୟାଚ୍ ଟିକର୍' : 'MATCHES'}</span>
          </div>
          {/* Data source badge: verified live API */}
          {isApi && (
            <span
              title={isOdia ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ API ରୁ ସ୍କୋର' : 'Scores from verified live API'}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            >
              {isOdia ? 'ଲାଇଭ୍ API' : 'LIVE API'}
            </span>
          )}
        </div>

        {/* Horizontal scroll cards (live matches only; empty → "no match today") */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 flex-1">
          {matches.length === 0 && (
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap px-1">
              {isOdia ? 'ଆଜି କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ' : 'Today there is no match'}
            </span>
          )}
          {matches.map((m: Match) => {
            const isLive = m.status === 'LIVE';
            const isFinished = m.status === 'FINISHED';

            return (
              <button
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className="shrink-0 bg-slate-900/90 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-700/70 rounded-xl p-2.5 min-w-[240px] max-w-[280px] text-left transition-all cursor-pointer group shadow-sm"
              >
                {/* Header row: format & status */}
                <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {m.format} · {isOdia ? m.venueCityOdia : m.venue.split(',')[0]}
                  </span>
                  {isLive ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      {isOdia ? 'ଲାଇଭ୍' : 'LIVE'}
                    </span>
                  ) : isFinished ? (
                    <span className="text-slate-400 font-medium">{isOdia ? 'ସମାପ୍ତ' : 'FT'}</span>
                  ) : (
                    <span className="text-amber-400 font-medium">{isOdia ? 'ଆଗାମୀ' : 'Upcoming'}</span>
                  )}
                </div>

                {/* Team 1 Score */}
                <div className="flex items-center justify-between text-xs py-0.5">
                  <span className="font-medium text-slate-200 truncate pr-2">
                    {isOdia ? m.team1.nameOdia : m.team1.shortName}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-100">
                    {m.team1.score !== undefined
                      ? formatScore(m.team1.score, m.team1.wickets, m.team1.overs, useOdiaDigits)
                      : '-'}
                  </span>
                </div>

                {/* Team 2 Score */}
                <div className="flex items-center justify-between text-xs py-0.5">
                  <span className={`font-medium truncate pr-2 ${m.team2.isBatting ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                    {isOdia ? m.team2.nameOdia : m.team2.shortName}
                    {m.team2.isBatting && ' *'}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-100">
                    {m.team2.score !== undefined
                      ? formatScore(m.team2.score, m.team2.wickets, m.team2.overs, useOdiaDigits)
                      : '-'}
                  </span>
                </div>

                {/* Footer status text */}
                <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-emerald-400/90 truncate group-hover:text-emerald-300">
                  {isOdia ? m.statusTextOdia : m.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* View all prompt */}
        {matches.length > 0 && (
          <button
            onClick={() => matches[0] && setSelectedMatch(matches[0])}
            className="hidden xl:flex items-center text-xs text-slate-300 hover:text-emerald-400 whitespace-nowrap gap-1 cursor-pointer"
          >
            <span>{isOdia ? 'ସବୁ ଦେଖନ୍ତୁ' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
