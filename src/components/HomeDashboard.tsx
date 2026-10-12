import React from 'react';
import {
  Radio,
  Trophy,
  Newspaper,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Users,
  ShieldAlert,
  Bell,
  X,
  Send,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { MatchCard } from './MatchCard';
import { NoMatchesToday } from './NoMatchesToday';
import { NewsSection } from './NewsSection';
import { formatScore, toOdiaDigits } from '../utils/odiaLocalization';

interface HomeDashboardProps {
  setCurrentTab: (tab: string) => void;
  openReminders?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ setCurrentTab, openReminders }) => {
  const {
    matches,
    rankings,
    language,
    setSelectedMatch,
    useOdiaDigits,
    liveSource,
    activeAlertBanner,
    dismissActiveAlert,
    triggerTestNotification,
    reminders,
  } = useCricket();
  const isOdia = language === 'odia';

  const liveMatches = matches.filter((m) => m.status === 'LIVE');
  const upcomingMatches = matches.filter((m) => m.status === 'UPCOMING');
  const finishedMatches = matches.filter((m) => m.status === 'FINISHED');

  return (
    <div className="space-y-6">
      {/* 1. PERSISTENT MATCH REMINDER NOTIFICATION BANNER */}
      {activeAlertBanner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-300/40 relative animate-in slide-in-from-top-3 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 text-white">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-100 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>{isOdia ? 'ମ୍ୟାଚ୍ ଆଲର୍ଟ ନୋଟିଫିକେସନ୍' : 'MATCH STARTING ALERT'}</span>
                  <span>·</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] text-white">
                    {activeAlertBanner.format}
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-white truncate mt-0.5">
                  {isOdia ? activeAlertBanner.matchTitleOdia : activeAlertBanner.matchTitleEn}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-amber-100 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {activeAlertBanner.dateStrOdia}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1 text-white/90">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeAlertBanner.venueOdia}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => {
                  const target = matches.find((m) => m.id === activeAlertBanner.matchId);
                  if (target) setSelectedMatch(target);
                }}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isOdia ? 'ମ୍ୟାଚ୍ ସେଣ୍ଟର ଦେଖନ୍ତୁ' : 'Open Match'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={triggerTestNotification}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                title="ଆଉ ଏକ ନୋଟିଫିକେସନ୍ ସିମୁଲେଟ୍ କରନ୍ତୁ"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isOdia ? 'ଟେଷ୍ଟ' : 'Test'}</span>
              </button>

              <button
                onClick={dismissActiveAlert}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-colors cursor-pointer"
                title={isOdia ? 'ବନ୍ଦ କରନ୍ତୁ (Dismiss)' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#091a32] via-[#0d2a4d] to-[#064e3b] text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isOdia ? 'ଓଡ଼ିଶାର ପ୍ରଥମ ପୂର୍ଣ୍ଣାଙ୍ଗ କ୍ରିକେଟ୍ ପ୍ଲାଟଫର୍ମ' : "Odisha's Premier Cricket Hub"}</span>
            </span>
            {liveSource === 'api' && liveMatches.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 text-[11px] border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isOdia ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍' : 'Verified live'}
              </span>
            )}
            {reminders.length > 0 && (
              <button
                onClick={openReminders}
                className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold flex items-center gap-1 text-[11px] border border-amber-400/30 hover:bg-amber-400/30 transition-colors cursor-pointer"
              >
                <Bell className="w-3 h-3" />
                <span>
                  {reminders.length} {isOdia ? 'ଟି ଆଲର୍ଟ ସକ୍ରିୟ' : 'alerts set'}
                </span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {isOdia
              ? 'କ୍ରିକେଟ୍ ଓଡ଼ିଆ – ପ୍ରତିଟି ବଲ୍, ପ୍ରତିଟି ରନ୍ ଏବଂ ପ୍ରତିଟି ରୋମାଞ୍ଚ!'
              : 'Cricket Odia – Every Ball, Every Run, Every Thrill!'}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
            {isOdia
              ? 'କଟକ ବାରବାଟୀରୁ ମେଲବୋର୍ଣ୍ଣ, ଆଇପିଏଲ୍‌ରୁ ରଣଜୀ ଟ୍ରଫି ପର୍ଯ୍ୟନ୍ତ – ସମସ୍ତ ମ୍ୟାଚ୍‌ର ଲାଇଭ୍ ସ୍କୋର, ସମ୍ପୂର୍ଣ୍ଣ ସ୍କୋରକାର୍ଡ, ଧାରାବିବରଣୀ ଓ ବିଶ୍ଳେଷଣ ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆ ଭାଷାରେ।'
              : 'From Cuttack Barabati to Melbourne, IPL to Ranji Trophy – live scores, commentary, and scorecards in the Odia language.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (liveMatches[0]) setSelectedMatch(liveMatches[0]);
                else setCurrentTab('live');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer flex items-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse text-slate-950" />
              <span>{isOdia ? 'ଲାଇଭ୍ ମ୍ୟାଚ୍ ସେଣ୍ଟର (କଟକ ଟି୨୦)' : 'Go to Live Match'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('fixtures')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              {isOdia ? 'ସମ୍ପୂର୍ଣ୍ଣ ଖେଳସୂଚୀ ଦେଖନ୍ତୁ' : 'View Fixtures'}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Live Matches Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              <span>{isOdia ? 'ଲାଇଭ୍ ମ୍ୟାଚ୍' : 'Live Matches'}</span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              ({useOdiaDigits ? toOdiaDigits(liveMatches.length) : liveMatches.length} {isOdia ? 'ଟି ଚାଲୁଅଛି' : 'in progress'})
            </span>
          </div>

          <button
            onClick={() => setCurrentTab('live')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{isOdia ? 'ସମସ୍ତ ସ୍କୋର' : 'All Scores'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {liveMatches.length === 0 ? (
          <NoMatchesToday compact />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} featured={true} />
            ))}
          </div>
        )}
      </section>

      {/* 2-Column Split: Rankings Quick Widget + Upcoming Fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming & Highlights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{isOdia ? 'ଆଗାମୀ ଓ ସଦ୍ୟତମ ମ୍ୟାଚ୍‌ସ' : 'Upcoming & Recent Results'}</span>
              </h3>
              <button
                onClick={() => setCurrentTab('fixtures')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isOdia ? 'ଅଧିକ' : 'More'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingMatches.slice(0, 2).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
              {finishedMatches.slice(0, 2).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
              {upcomingMatches.length === 0 && finishedMatches.length === 0 && (
                <div className="sm:col-span-2">
                  <NoMatchesToday compact />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: ICC T20 Rankings Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{isOdia ? 'ଆଇସିସି T20I ର‍୍ୟାଙ୍କିଙ୍ଗ୍' : 'ICC T20I Rankings'}</span>
              </h3>
              <button
                onClick={() => setCurrentTab('rankings')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isOdia ? 'ପୂର୍ଣ୍ଣ ତାଲିକା' : 'Full Table'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {rankings.t20Teams.slice(0, 4).map((team) => (
                <div
                  key={team.rank}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-400 w-4 text-center">
                      {useOdiaDigits ? toOdiaDigits(team.rank) : team.rank}
                    </span>
                    <span className="font-bold text-slate-900">
                      {isOdia ? team.nameOdia : team.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-slate-700">
                      {useOdiaDigits ? toOdiaDigits(team.rating) : team.rating}
                    </span>
                    <span className="text-emerald-600 font-bold text-[10px]">★</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Link to Players */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{isOdia ? 'ଶ୍ରେଷ୍ଠ T20 ବ୍ୟାଟର:' : 'No.1 Batter:'}</span>
              <span className="font-bold text-slate-900">ସୂର୍ଯ୍ୟକୁମାର ଯାଦବ (ଭାରତ)</span>
            </div>
          </div>

          {/* Ranji Odisha Card Special */}
          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">
                ଓଡ଼ିଶା କ୍ରିକେଟ୍ ସ୍ପେଶାଲ୍
              </span>
              <span className="text-slate-400 text-[11px]">ରଣଜୀ ଟ୍ରଫି</span>
            </div>
            <h4 className="font-bold text-base text-white">
              ଶୁଭ୍ରାଂଶୁ ସେନାପତିଙ୍କ ଶତକ (୧୦୮* ରନ୍)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              କଟକ ଡ୍ରିମ୍ସରେ ବେଙ୍ଗଲ ବିପକ୍ଷ ମ୍ୟାଚ୍‌ରେ ଓଡ଼ିଶା ଅଧିନାୟକଙ୍କ ଲଢ଼ୁଆ ଇନିଂସ।
            </p>
            <button
              onClick={() => setCurrentTab('teams')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>{isOdia ? 'ଓଡ଼ିଶା ଦଳ ବିବରଣୀ ଦେଖନ୍ତୁ' : 'View Odisha Squad'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Latest Cricket News Section */}
      <NewsSection />
    </div>
  );
};
