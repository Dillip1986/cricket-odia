import React from 'react';
import { CalendarX2 } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';

interface NoMatchesTodayProps {
  compact?: boolean;
}

/**
 * Shown when the verified feed has no matches.
 * "Today there is no match" — never demo data.
 */
export const NoMatchesToday: React.FC<NoMatchesTodayProps> = ({ compact = false }) => {
  const { isLoadingMatches } = useCricket();
  const t = useStrings();

  if (isLoadingMatches) {
    return (
      <div className={`card text-center ${compact ? 'p-6' : 'p-12'}`}>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          {t.loadingScores}
        </p>
      </div>
    );
  }

  return (
    <div className={`card text-center ${compact ? 'p-6 space-y-2' : 'p-8 sm:p-12 space-y-3'}`}>
      <CalendarX2 className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} text-slate-400 mx-auto`} aria-hidden="true" />
      <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-slate-700 dark:text-slate-200`}>
        {t.noMatchTitle}
      </h3>
      {!compact && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {t.noMatchDesc}
        </p>
      )}
    </div>
  );
};
