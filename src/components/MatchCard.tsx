import React from 'react';
import { MapPin, Award, ChevronRight, Heart, Bell } from 'lucide-react';
import { Match } from '../types/cricket';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';
import { openMatch } from '../router';
import { formatScore, toOdiaDigits } from '../utils/odiaLocalization';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

function equation(m: Match, needLabel: string): string | null {
  if (m.status !== 'LIVE' || m.target === undefined) return null;
  const batting = m.team2.isBatting ? m.team2 : m.team1.isBatting ? m.team1 : null;
  if (!batting || batting.score === undefined) return null;
  const need = Math.max(0, m.target - batting.score);
  if (need <= 0) return null;
  return `${needLabel} ${need}`;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, featured = false }) => {
  const {
    useOdiaDigits,
    language,
    favouriteTeams,
    toggleFavouriteTeam,
    hasReminder,
    toggleReminder,
  } = useCricket();
  const t = useStrings();
  const isOdia = language === 'odia';
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isUpcoming = match.status === 'UPCOMING';

  const isFav = favouriteTeams.includes(match.team1.id) || favouriteTeams.includes(match.team2.id);
  const isReminded = hasReminder(match.id);
  const needLine = equation(match, `${t.cardNeed}`);

  return (
    <article
      onClick={() => openMatch(match.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMatch(match.id);
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`${isOdia ? match.titleOdia : match.title} — ${t.cardDetails}`}
      className={`group card overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-md min-h-[248px] ${
        featured ? 'ring-1 ring-[#00B887]/30' : ''
      }`}
    >
      {/* Top series & status banner */}
      <div className="bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-slate-800 dark:text-slate-100 tracking-wide px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] shrink-0">
            {match.format}
          </span>
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
            {isOdia ? match.seriesOdia : match.series}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isUpcoming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(match);
              }}
              aria-pressed={isReminded}
              aria-label={isReminded ? t.cardReminded : t.cardRemind}
              className={`flex items-center justify-center min-w-[36px] min-h-[36px] px-2 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                isReminded
                  ? 'bg-[#00B887] text-[#04120d]'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isReminded ? 'fill-[#04120d]' : ''}`} aria-hidden="true" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavouriteTeam(match.team1.id);
            }}
            aria-pressed={isFav}
            aria-label={t.cardFavorite}
            className="flex items-center justify-center min-w-[36px] min-h-[36px] text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} aria-hidden="true" />
          </button>

          {isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] border border-rose-200 dark:border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" aria-hidden="true" />
              {t.liveBadge}
            </span>
          ) : isFinished ? (
            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
              {t.finishedBadge}
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[11px] border border-amber-200 dark:border-amber-500/30">
              {t.upcomingBadge}
            </span>
          )}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col gap-2.5">
        {([match.team1, match.team2] as const).map((team) => (
          <div key={team.id} className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                style={{ backgroundColor: team.flagColor }}
                aria-hidden="true"
              />
              <span
                className={`text-[15px] font-semibold truncate min-w-0 ${
                  team.isBatting ? 'text-emerald-800 dark:text-[#00e6a8]' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {isOdia ? team.nameOdia : team.name}
                {team.isBatting && ' *'}
              </span>
            </div>
            <div className="text-right shrink-0 leading-tight">
              <div className="score text-[17px] text-slate-900 dark:text-white">
                {team.score !== undefined
                  ? `${useOdiaDigits && isOdia ? toOdiaDigits(team.score) : team.score}/${useOdiaDigits && isOdia ? toOdiaDigits(team.wickets ?? 0) : team.wickets ?? 0}`
                  : '-'}
              </div>
              {team.overs && (
                <div className="score text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  ({useOdiaDigits && isOdia ? toOdiaDigits(team.overs) : team.overs} {isOdia ? 'ଓଭର' : 'ov'})
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Target / equation line */}
        {needLine && (
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
            {needLine} {t.cardBalls}
            <span className="font-medium text-slate-500 dark:text-slate-400">
              {' '}
              · {t.cardTarget}: <span className="score">{useOdiaDigits && isOdia ? toOdiaDigits(match.target!) : match.target}</span>
            </span>
          </p>
        )}

        {/* Live rates */}
        {isLive && (match.currentRunRate || match.requiredRunRate) && (
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            {match.currentRunRate && (
              <span>
                CRR <strong className="score text-slate-700 dark:text-slate-200">{useOdiaDigits && isOdia ? toOdiaDigits(match.currentRunRate) : match.currentRunRate}</strong>
              </span>
            )}
            {match.requiredRunRate && (
              <span>
                RRR <strong className="score text-rose-600">{useOdiaDigits && isOdia ? toOdiaDigits(match.requiredRunRate) : match.requiredRunRate}</strong>
              </span>
            )}
          </div>
        )}

        {/* Status narrative */}
        <p className="text-xs font-semibold text-emerald-800 dark:text-[#00e6a8] bg-emerald-50/70 dark:bg-[#00B887]/10 rounded-lg px-2.5 py-2 border border-emerald-100/80 dark:border-[#00B887]/20 leading-snug">
          {isOdia ? match.statusTextOdia : match.liveSummaryEn || match.title}
        </p>

        {isFinished && match.playerOfTheMatchOdia && (
          <p className="text-[11px] text-amber-800 dark:text-amber-400 flex items-center gap-1.5 min-w-0">
            <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {isOdia ? 'ଶ୍ରେଷ୍ଠ ଖେଳାଳି:' : 'PoTM:'} {match.playerOfTheMatchOdia}
            </span>
          </p>
        )}

        {/* Venue + details */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{match.venueCityOdia && !match.venueOdia.includes(match.venueCityOdia) ? `${match.venueOdia}, ${match.venueCityOdia}` : match.venueOdia}</span>
          </span>
          <span className="flex items-center gap-0.5 text-[#00966f] dark:text-[#00e6a8] font-bold shrink-0 min-h-[32px]">
            {t.cardDetails}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
};
