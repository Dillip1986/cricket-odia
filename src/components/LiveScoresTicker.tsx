import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Radio } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';
import { openMatch, goToTab } from '../router';
import { Match } from '../types/cricket';
import { toOdiaDigits } from '../utils/odiaLocalization';

export const LiveScoresTicker: React.FC = () => {
  const { matches, useOdiaDigits, language, liveSource } = useCricket();
  const t = useStrings();
  const isOdia = language === 'odia';
  const isApi = liveSource === 'api';
  const scroller = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 560), behavior: 'smooth' });
  };

  return (
    <section aria-label={t.tickerLabel} className="bg-[#0f2444] border-b border-slate-800 overflow-hidden">
      <div className="app-container py-2.5 flex items-center gap-2 sm:gap-3">
        {/* Ticker label & status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold whitespace-nowrap">
            <Radio className="w-3 h-3 animate-pulse text-rose-500" aria-hidden="true" />
            <span>{t.tickerLabel}</span>
          </div>
          {isApi && (
            <span
              title={isOdia ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ API ରୁ ସ୍କୋର' : 'Scores from verified live API'}
              className="px-1.5 py-1 rounded-md text-[10px] font-bold border bg-[#00B887]/15 border-[#00B887]/40 text-[#00e6a8] whitespace-nowrap"
            >
              {t.liveApiBadge}
            </span>
          )}
        </div>

        {/* Scroll controls (pointer-fine devices) */}
        {matches.length > 1 && (
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <button
              onClick={() => scrollByCards(-1)}
              className="w-9 h-9 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              aria-label={isOdia ? 'ପୂର୍ବ ମ୍ୟାଚ୍' : 'Previous matches'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              className="w-9 h-9 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
              aria-label={isOdia ? 'ପର ମ୍ୟାଚ୍' : 'Next matches'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Horizontally scrollable cards — never overflows the page */}
        <div
          ref={scroller}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-0.5 flex-1 min-w-0"
        >
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
                onClick={() => openMatch(m.id)}
                aria-label={`${isOdia ? m.titleOdia : m.title} — ${t.cardDetails}`}
                className="shrink-0 snap-start bg-slate-900/90 hover:bg-slate-800 hover:border-[#00B887]/50 border border-slate-700/70 rounded-xl p-2.5 w-[240px] sm:w-[264px] text-left transition-colors cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400 gap-2">
                  <span className="font-semibold text-slate-300 truncate">
                    {m.format} · {isOdia ? m.venueCityOdia : m.venue.split(',')[0]}
                  </span>
                  {isLive ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" aria-hidden="true" />
                      {t.liveBadge}
                    </span>
                  ) : isFinished ? (
                    <span className="text-slate-400 font-medium shrink-0">{t.finishedBadge}</span>
                  ) : (
                    <span className="text-amber-400 font-medium shrink-0">{t.upcomingBadge}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs py-0.5 gap-2 min-w-0">
                  <span className="font-medium text-slate-200 truncate min-w-0">
                    {isOdia ? m.team1.nameOdia : m.team1.shortName}
                  </span>
                  <span className="text-right shrink-0 leading-tight">
                    <span className="score font-semibold text-slate-100 text-[13px]">
                      {m.team1.score !== undefined
                        ? `${useOdiaDigits && isOdia ? toOdiaDigits(m.team1.score) : m.team1.score}/${useOdiaDigits && isOdia ? toOdiaDigits(m.team1.wickets ?? 0) : m.team1.wickets ?? 0}`
                        : '-'}
                    </span>
                    {m.team1.overs && (
                      <span className="score block text-[10px] font-medium text-slate-400">
                        ({useOdiaDigits && isOdia ? toOdiaDigits(m.team1.overs) : m.team1.overs})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-0.5 gap-2 min-w-0">
                  <span className={`font-medium truncate min-w-0 ${m.team2.isBatting ? 'text-[#00e6a8] font-bold' : 'text-slate-200'}`}>
                    {isOdia ? m.team2.nameOdia : m.team2.shortName}
                    {m.team2.isBatting && ' *'}
                  </span>
                  <span className="text-right shrink-0 leading-tight">
                    <span className="score font-semibold text-slate-100 text-[13px]">
                      {m.team2.score !== undefined
                        ? `${useOdiaDigits && isOdia ? toOdiaDigits(m.team2.score) : m.team2.score}/${useOdiaDigits && isOdia ? toOdiaDigits(m.team2.wickets ?? 0) : m.team2.wickets ?? 0}`
                        : '-'}
                    </span>
                    {m.team2.overs && (
                      <span className="score block text-[10px] font-medium text-slate-400">
                        ({useOdiaDigits && isOdia ? toOdiaDigits(m.team2.overs) : m.team2.overs})
                      </span>
                    )}
                  </span>
                </div>

                <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-[#00e6a8]/90 truncate group-hover:text-[#00e6a8]">
                  {isOdia ? m.statusTextOdia : m.liveSummaryEn || m.title}
                </div>
              </button>
            );
          })}
        </div>

        {matches.length > 0 && (
          <button
            onClick={() => goToTab('live')}
            className="hidden xl:flex items-center text-xs text-slate-300 hover:text-[#00e6a8] whitespace-nowrap gap-1 cursor-pointer shrink-0 min-h-[44px]"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
};
