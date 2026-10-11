import React from 'react';
import { Radio, MapPin, Award, ChevronRight, Heart, Bell } from 'lucide-react';
import { Match } from '../types/cricket';
import { useCricket } from '../context/CricketContext';
import { formatScore, toOdiaDigits } from '../utils/odiaLocalization';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, featured = false }) => {
  const {
    setSelectedMatch,
    useOdiaDigits,
    language,
    favouriteTeams,
    toggleFavouriteTeam,
    hasReminder,
    toggleReminder,
  } = useCricket();

  const isOdia = language === 'odia';
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isUpcoming = match.status === 'UPCOMING';

  const isFav = favouriteTeams.includes(match.team1.id) || favouriteTeams.includes(match.team2.id);
  const isReminded = hasReminder(match.id);

  return (
    <div
      onClick={() => setSelectedMatch(match)}
      className={`group bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
        featured
          ? 'border-emerald-600/40 shadow-md ring-1 ring-emerald-500/10 hover:shadow-lg'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top series & status banner */}
      <div className="bg-slate-50/90 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-slate-800 tracking-wide uppercase px-1.5 py-0.5 bg-slate-200 rounded text-[10px]">
            {match.format}
          </span>
          <span className="text-slate-600 font-medium truncate">
            {isOdia ? match.seriesOdia : match.series}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Upcoming "Remind me" Bell Button */}
          {isUpcoming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(match);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                isReminded
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
              title={isReminded ? (isOdia ? 'ସ୍ମାରକୀ ସକ୍ରିୟ ଅଛି' : 'Reminder active') : (isOdia ? 'ମନେ ପକାନ୍ତୁ (Remind me)' : 'Remind me')}
            >
              <Bell className={`w-3.5 h-3.5 ${isReminded ? 'fill-white' : ''}`} />
              <span>{isReminded ? (isOdia ? 'ସେଟ୍ ଅଛି' : 'Set') : (isOdia ? 'ମନେ ପକାନ୍ତୁ' : 'Remind me')}</span>
            </button>
          )}

          {/* Favorite heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavouriteTeam(match.team1.id);
            }}
            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
            title="ପ୍ରିୟ ଦଳରେ ଯୋଡ଼ନ୍ତୁ"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>

          {/* Status badge */}
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-[11px] border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              {isOdia ? 'ଲାଇଭ୍' : 'LIVE'}
            </span>
          ) : isFinished ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
              {isOdia ? 'ସମାପ୍ତ' : 'RESULT'}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
              {isOdia ? 'ଆଗାମୀ' : 'UPCOMING'}
            </span>
          )}
        </div>
      </div>

      {/* Main Scoreboard Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Team 1 Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                style={{ backgroundColor: match.team1.flagColor }}
              />
              <span className={`text-base font-semibold truncate ${match.team1.isBatting ? 'text-emerald-800' : 'text-slate-800'}`}>
                {isOdia ? match.team1.nameOdia : match.team1.name}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono tabular-nums text-lg font-bold text-slate-900">
                {match.team1.score !== undefined
                  ? formatScore(match.team1.score, match.team1.wickets, match.team1.overs, useOdiaDigits)
                  : '-'}
              </span>
            </div>
          </div>

          {/* Team 2 Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-black/10"
                style={{ backgroundColor: match.team2.flagColor }}
              />
              <span className={`text-base font-semibold truncate ${match.team2.isBatting ? 'text-emerald-700' : 'text-slate-800'}`}>
                {isOdia ? match.team2.nameOdia : match.team2.name}
                {match.team2.isBatting && ' *'}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono tabular-nums text-lg font-bold text-slate-900">
                {match.team2.score !== undefined
                  ? formatScore(match.team2.score, match.team2.wickets, match.team2.overs, useOdiaDigits)
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Equation / Run Rates */}
        {isLive && (match.currentRunRate || match.requiredRunRate) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {match.currentRunRate && (
              <span>
                CRR: <strong className="text-slate-700 font-mono">{useOdiaDigits ? toOdiaDigits(match.currentRunRate) : match.currentRunRate}</strong>
              </span>
            )}
            {match.requiredRunRate && (
              <span>
                RRR: <strong className="text-rose-600 font-mono">{useOdiaDigits ? toOdiaDigits(match.requiredRunRate) : match.requiredRunRate}</strong>
              </span>
            )}
            {match.target && (
              <span>
                {isOdia ? 'ଲକ୍ଷ୍ୟ' : 'Target'}: <strong className="text-slate-800 font-mono">{useOdiaDigits ? toOdiaDigits(match.target) : match.target}</strong>
              </span>
            )}
          </div>
        )}

        {/* Recent balls ribbon if live */}
        {isLive && match.recentBalls && match.recentBalls.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-medium">{isOdia ? 'ସଦ୍ୟ ବଲ୍:' : 'Recent:'}</span>
            <div className="flex items-center gap-1">
              {match.recentBalls.map((b, idx) => (
                <span
                  key={idx}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                    b === '4'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : b === '6'
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : b === 'W'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {useOdiaDigits ? toOdiaDigits(b) : b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status Text (Key narrative sentence) */}
        <div className="mt-3 text-xs font-semibold text-emerald-800 bg-emerald-50/60 rounded-lg p-2 border border-emerald-100/80">
          {isOdia ? match.statusTextOdia : match.statusTextOdia}
        </div>

        {/* Player of match if finished */}
        {isFinished && match.playerOfTheMatchOdia && (
          <div className="mt-2 text-xs text-amber-800 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              {isOdia ? 'ଶ୍ରେଷ୍ଠ ଖେଳାଳି:' : 'PoTM:'} {match.playerOfTheMatchOdia}
            </span>
          </div>
        )}

        {/* Venue footer info */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{isOdia ? `${match.venueOdia}, ${match.venueCityOdia}` : match.venue}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:text-emerald-800 shrink-0">
            <span>{isOdia ? 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କୋର' : 'Scorecard'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
