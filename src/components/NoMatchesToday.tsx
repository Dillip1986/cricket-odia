import React from 'react';
import { CalendarX2 } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

interface NoMatchesTodayProps {
  compact?: boolean;
}

/**
 * Shown when the verified feed has no matches.
 * "Today there is no match" — never demo data.
 */
export const NoMatchesToday: React.FC<NoMatchesTodayProps> = ({ compact = false }) => {
  const { language, isLoadingMatches } = useCricket();
  const isOdia = language === 'odia';

  if (isLoadingMatches) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 text-center ${compact ? 'p-6' : 'p-12'}`}>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          {isOdia ? 'ଲାଇଭ୍ ସ୍କୋର ଲୋଡ୍ ହେଉଛି…' : 'Loading live scores…'}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 text-center ${compact ? 'p-6 space-y-2' : 'p-12 space-y-3'}`}>
      <CalendarX2 className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} text-slate-400 mx-auto`} />
      <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-slate-700`}>
        {isOdia ? 'ଆଜି କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ' : 'Today there is no match'}
      </h3>
      {!compact && (
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {isOdia
            ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ ଫିଡ୍‌ରେ ଆଜି କୌଣସି ଖେଳ ନାହିଁ। ପରେ ପୁଣି ଦେଖନ୍ତୁ।'
            : 'No games on the verified live feed today. Check back later.'}
        </p>
      )}
    </div>
  );
};
