import React, { useState } from 'react';
import {
  X,
  Radio,
  Share2,
  Calendar,
  MapPin,
  Award,
  ChevronRight,
  TrendingUp,
  Users,
  Shield,
  Info,
  Layers,
  ArrowLeft,
  Bell,
} from 'lucide-react';
import { Match, CommentaryDelivery } from '../types/cricket';
import { useCricket } from '../context/CricketContext';
import { formatScore, toOdiaDigits, ODIA_DICTIONARY } from '../utils/odiaLocalization';

interface MatchCentreModalProps {
  match: Match;
  onClose: () => void;
}

export const MatchCentreModal: React.FC<MatchCentreModalProps> = ({ match, onClose }) => {
  const {
    useOdiaDigits,
    language,
    hasReminder,
    toggleReminder,
  } = useCricket();

  const isOdia = language === 'odia';
  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING';
  const isReminded = hasReminder(match.id);

  const [activeTab, setActiveTab] = useState<'summary' | 'commentary' | 'scorecard' | 'playingXI' | 'matchInfo' | 'stats'>('summary');
  const [selectedInningsIdx, setSelectedInningsIdx] = useState<number>(0);
  const [commentaryFilter, setCommentaryFilter] = useState<'ALL' | 'BOUNDARIES' | 'WICKETS'>('ALL');
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle share
  const handleShare = () => {
    const text = `${match.titleOdia} - ${match.statusTextOdia} | Cricket Odia (କ୍ରିକେଟ୍ ଓଡ଼ିଆ)`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredCommentary = match.commentary.filter((c: CommentaryDelivery) => {
    if (commentaryFilter === 'BOUNDARIES') return c.event === 'FOUR' || c.event === 'SIX';
    if (commentaryFilter === 'WICKETS') return c.event === 'WICKET';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Match Header Bar */}
        <div className="bg-[#091a32] text-white p-4 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
              {/* CLEAR PROMINENT GO BACK BUTTON */}
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                title="ପଛକୁ ଫେରନ୍ତୁ (Go Back)"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span>{isOdia ? '← ପଛକୁ (Back)' : '← Back'}</span>
              </button>

              <span className="font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                {match.format}
              </span>
              <span className="truncate hidden sm:inline">{isOdia ? match.seriesOdia : match.series}</span>
              <span className="hidden sm:inline">·</span>
              <span className="truncate">{isOdia ? match.venueCityOdia : match.venue}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isUpcoming && (
                <button
                  onClick={() => toggleReminder(match)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isReminded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                  title={isReminded ? (isOdia ? 'ଆଲର୍ଟ ସେଟ୍ ହୋଇଛି' : 'Reminder active') : (isOdia ? 'ମନେ ପକାନ୍ତୁ (Remind me)' : 'Remind me')}
                >
                  <Bell className={`w-3.5 h-3.5 ${isReminded ? 'fill-white' : ''}`} />
                  <span>{isReminded ? (isOdia ? 'ସେଭ୍ ହେଲା' : 'Reminded') : (isOdia ? 'ମନେ ପକାନ୍ତୁ' : 'Remind me')}</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="ସେୟାର୍ କରନ୍ତୁ"
                aria-label="Share match"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-900/50 hover:text-rose-300 transition-colors cursor-pointer"
                title="ବନ୍ଦ କରନ୍ତୁ"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {copySuccess && (
            <div className="mb-2 py-1 px-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded text-center">
              {isOdia ? 'ଲିଙ୍କ୍ କପି ହୋଇଗଲା!' : 'Match details copied to clipboard!'}
            </div>
          )}

          {/* Teams and Big Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-slate-800/80 my-2">
            {/* Team 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shadow-sm shrink-0 border border-white/20"
                  style={{ backgroundColor: match.team1.flagColor }}
                />
                <div>
                  <h3 className="font-semibold text-white text-base">
                    {isOdia ? match.team1.nameOdia : match.team1.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">{match.team1.inningsDescription || '୧ମ ଇନିଂସ'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums text-2xl font-bold text-white">
                  {match.team1.score !== undefined
                    ? formatScore(match.team1.score, match.team1.wickets, undefined, useOdiaDigits)
                    : '-'}
                </div>
                {match.team1.overs && (
                  <div className="text-xs text-slate-400 font-mono">
                    ({useOdiaDigits ? toOdiaDigits(match.team1.overs) : match.team1.overs} {isOdia ? 'ଓଭର' : 'ov'})
                  </div>
                )}
              </div>
            </div>

            {/* Team 2 */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
              match.team2.isBatting ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full shadow-sm shrink-0 border border-white/20"
                  style={{ backgroundColor: match.team2.flagColor }}
                />
                <div>
                  <h3 className="font-semibold text-white text-base">
                    {isOdia ? match.team2.nameOdia : match.team2.name}
                    {match.team2.isBatting && ' *'}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    {match.team2.inningsDescription || '୨ୟ ଇନିଂସ'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono tabular-nums text-2xl font-bold text-emerald-400">
                  {match.team2.score !== undefined
                    ? formatScore(match.team2.score, match.team2.wickets, undefined, useOdiaDigits)
                    : '-'}
                </div>
                {match.team2.overs && (
                  <div className="text-xs text-slate-400 font-mono">
                    ({useOdiaDigits ? toOdiaDigits(match.team2.overs) : match.team2.overs} {isOdia ? 'ଓଭର' : 'ov'})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Equation Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              {isLive && <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500 shrink-0" />}
              <span>{isOdia ? match.statusTextOdia : match.statusTextOdia}</span>
            </div>

            {isLive && (
              <div className="flex items-center gap-3 text-slate-300 font-mono">
                {match.currentRunRate && (
                  <span>
                    CRR: <strong className="text-white">{useOdiaDigits ? toOdiaDigits(match.currentRunRate) : match.currentRunRate}</strong>
                  </span>
                )}
                {match.requiredRunRate && (
                  <span>
                    RRR: <strong className="text-amber-400">{useOdiaDigits ? toOdiaDigits(match.requiredRunRate) : match.requiredRunRate}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'summary'
                ? 'text-emerald-700 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ସଂକ୍ଷିପ୍ତ ସାରାଂଶ' : 'Summary'}
          </button>
          <button
            onClick={() => setActiveTab('commentary')}
            className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'commentary'
                ? 'text-emerald-700 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଧାରାବିବରଣୀ (ବଲ୍-ବାଇ-ବଲ୍)' : 'Ball-by-Ball'}
          </button>
          <button
            onClick={() => setActiveTab('scorecard')}
            className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'scorecard'
                ? 'text-emerald-700 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କୋରକାର୍ଡ' : 'Full Scorecard'}
          </button>
          <button
            onClick={() => setActiveTab('playingXI')}
            className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'playingXI'
                ? 'text-emerald-700 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଖେଳାଳି ଏକାଦଶ' : 'Playing XI'}
          </button>
          <button
            onClick={() => setActiveTab('matchInfo')}
            className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'matchInfo'
                ? 'text-emerald-700 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ମ୍ୟାଚ୍ ସୂଚନା' : 'Match Info'}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'text-emerald-700 border-emerald-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ପରିସଂଖ୍ୟାନ' : 'Statistics'}
          </button>
        </div>

        {/* Tab Body Scrollable View */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* At the Crease (Current Batsmen & Bowler) */}
              {isLive && match.currentBatsmen && match.currentBatsmen.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    {isOdia ? 'କ୍ରିଜ୍‌ରେ ଉପସ୍ଥିତ ବ୍ୟାଟର' : 'Batter at the Crease'}
                  </h4>

                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="pb-2 font-semibold">{isOdia ? 'ବ୍ୟାଟର' : 'Batter'}</th>
                          <th className="pb-2 text-right font-semibold">{isOdia ? 'ରନ୍' : 'R'}</th>
                          <th className="pb-2 text-right font-semibold">{isOdia ? 'ବଲ୍' : 'B'}</th>
                          <th className="pb-2 text-right font-semibold">{isOdia ? '୪' : '4s'}</th>
                          <th className="pb-2 text-right font-semibold">{isOdia ? '୬' : '6s'}</th>
                          <th className="pb-2 text-right font-semibold">{isOdia ? 'ଷ୍ଟ୍ରାଇକ୍ ରେଟ୍' : 'SR'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {match.currentBatsmen.map((b, idx) => (
                          <tr key={idx} className="font-medium text-slate-900">
                            <td className="py-2.5 flex items-center gap-1.5 font-bold">
                              <span>{isOdia ? b.nameOdia : b.name}</span>
                              {b.isOnStrike && <span className="text-emerald-600 font-bold">*</span>}
                            </td>
                            <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                              {useOdiaDigits ? toOdiaDigits(b.runs) : b.runs}
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-600">
                              {useOdiaDigits ? toOdiaDigits(b.balls) : b.balls}
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-600">
                              {useOdiaDigits ? toOdiaDigits(b.fours) : b.fours}
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-600">
                              {useOdiaDigits ? toOdiaDigits(b.sixes) : b.sixes}
                            </td>
                            <td className="py-2.5 text-right font-mono font-semibold text-emerald-700">
                              {useOdiaDigits ? toOdiaDigits(b.strikeRate.toFixed(1)) : b.strikeRate.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Current Bowler figures */}
                  {match.currentBowlers && match.currentBowlers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        {isOdia ? 'ବୋଲିଂ କରୁଛନ୍ତି' : 'Current Bowler'}
                      </h4>
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900">
                          {isOdia ? match.currentBowlers[0].nameOdia : match.currentBowlers[0].name}
                        </span>
                        <div className="flex items-center gap-4 font-mono">
                          <span>
                            {isOdia ? 'ଓଭର' : 'O'}: <strong>{useOdiaDigits ? toOdiaDigits(match.currentBowlers[0].overs) : match.currentBowlers[0].overs}</strong>
                          </span>
                          <span>
                            {isOdia ? 'ରନ୍' : 'R'}: <strong>{useOdiaDigits ? toOdiaDigits(match.currentBowlers[0].runs) : match.currentBowlers[0].runs}</strong>
                          </span>
                          <span>
                            {isOdia ? 'ୱିକେଟ୍' : 'W'}: <strong className="text-rose-600">{useOdiaDigits ? toOdiaDigits(match.currentBowlers[0].wickets) : match.currentBowlers[0].wickets}</strong>
                          </span>
                          <span>
                            {isOdia ? 'ଇକୋନୋମି' : 'Econ'}: <strong>{useOdiaDigits ? toOdiaDigits(match.currentBowlers[0].economy.toFixed(2)) : match.currentBowlers[0].economy.toFixed(2)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Partnership info */}
                  {match.partnershipOdia && (
                    <div className="mt-3 text-xs text-slate-600 flex items-center justify-between bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <span className="font-semibold text-emerald-800">{isOdia ? 'ସାମ୍ପ୍ରତିକ ଭାଗୀଦାରୀ (Partnership):' : 'Current Partnership:'}</span>
                      <span className="font-bold text-emerald-900 font-mono">{match.partnershipOdia}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Toss & Venue Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>{isOdia ? 'ଟସ୍ ନିଷ୍ପତ୍ତି' : 'Toss Result'}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {match.tossOdia}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{isOdia ? 'ଷ୍ଟାଡିୟମ୍ ଓ ସ୍ଥାନ' : 'Venue & Details'}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {isOdia ? `${match.venueOdia}, ${match.venueCityOdia}` : match.venue}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isOdia ? match.dateStrOdia : match.dateStrEn}
                  </p>
                </div>
              </div>

              {/* Key Deliveries Timeline */}
              {match.commentary.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isOdia ? 'ସଦ୍ୟତନ ଧାରାବିବରଣୀ ଝଲକ (Recent Balls)' : 'Recent Commentary Highlights'}
                  </h4>
                  <div className="space-y-2">
                    {match.commentary.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
                          c.isKeyMoment
                            ? 'bg-amber-50/50 border-amber-200 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 shrink-0">
                          {useOdiaDigits ? toOdiaDigits(c.over) : c.over}
                        </span>
                        <div className="flex-1">
                          <p className="leading-relaxed font-medium">
                            {isOdia ? c.commentaryOdia : c.commentaryEn}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {c.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMMENTARY (BALL-BY-BALL) */}
          {activeTab === 'commentary' && (
            <div className="space-y-4">
              {/* Commentary Filters */}
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCommentaryFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      commentaryFilter === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isOdia ? 'ସମସ୍ତ ବଲ୍' : 'All Balls'}
                  </button>
                  <button
                    onClick={() => setCommentaryFilter('BOUNDARIES')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      commentaryFilter === 'BOUNDARIES'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isOdia ? 'ଚୌକା ଓ ଛକା' : 'Boundaries (4/6)'}
                  </button>
                  <button
                    onClick={() => setCommentaryFilter('WICKETS')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      commentaryFilter === 'WICKETS'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isOdia ? 'ୱିକେଟ୍ (Out)' : 'Wickets'}
                  </button>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  {useOdiaDigits ? toOdiaDigits(filteredCommentary.length) : filteredCommentary.length} {isOdia ? 'ଟି ବଲ୍' : 'deliveries'}
                </span>
              </div>

              {/* Feed of commentary */}
              <div className="space-y-3">
                {filteredCommentary.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    {isOdia ? 'କୌଣସି ଧାରାବିବରଣୀ ମିଳିଲା ନାହିଁ।' : 'No commentary matching this filter.'}
                  </div>
                ) : (
                  filteredCommentary.map((c: CommentaryDelivery) => {
                    const isFour = c.event === 'FOUR';
                    const isSix = c.event === 'SIX';
                    const isWicket = c.event === 'WICKET';

                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-xl border transition-all text-xs flex items-start gap-3.5 ${
                          isWicket
                            ? 'bg-rose-50/80 border-rose-200 text-slate-900 ring-1 ring-rose-300/40'
                            : isSix
                            ? 'bg-purple-50/70 border-purple-200 text-slate-900'
                            : isFour
                            ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {/* Over tag */}
                        <div className="shrink-0 flex flex-col items-center">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                            {useOdiaDigits ? toOdiaDigits(c.over) : c.over}
                          </span>
                          <span
                            className={`mt-1 font-bold font-mono text-[11px] px-1.5 py-0.5 rounded ${
                              isWicket
                                ? 'bg-rose-600 text-white'
                                : isSix
                                ? 'bg-purple-600 text-white'
                                : isFour
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600'
                            }`}
                          >
                            {isWicket ? 'W' : useOdiaDigits ? toOdiaDigits(c.runs) : c.runs}
                          </span>
                        </div>

                        {/* Commentary Prose */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                            <span>{isOdia ? c.bowlerNameOdia : c.bowlerNameEn}</span>
                            <span>➔</span>
                            <span>{isOdia ? c.batsmanNameOdia : c.batsmanNameEn}</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-medium text-xs">
                            {isOdia ? c.commentaryOdia : c.commentaryEn}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {c.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FULL SCORECARD */}
          {activeTab === 'scorecard' && (
            <div className="space-y-6">
              {match.scorecards && match.scorecards.length > 0 ? (
                <>
                  {/* Innings Selector */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {match.scorecards.map((sc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedInningsIdx(idx)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedInningsIdx === idx
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isOdia ? sc.teamNameOdia : sc.teamName} (
                        {useOdiaDigits ? toOdiaDigits(`${sc.runs}/${sc.wickets}`) : `${sc.runs}/${sc.wickets}`})
                      </button>
                    ))}
                  </div>

                  {/* Active Innings Batting Table */}
                  {match.scorecards[selectedInningsIdx] && (
                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 flex items-center justify-between">
                          <span>
                            {isOdia ? match.scorecards[selectedInningsIdx].teamNameOdia : match.scorecards[selectedInningsIdx].teamName} - {isOdia ? 'ବ୍ୟାଟିଂ ସ୍କୋରକାର୍ଡ' : 'Batting Card'}
                          </span>
                          <span className="font-mono text-emerald-800">
                            {useOdiaDigits
                              ? toOdiaDigits(`${match.scorecards[selectedInningsIdx].runs}/${match.scorecards[selectedInningsIdx].wickets} (${match.scorecards[selectedInningsIdx].overs} ଓଭର)`)
                              : `${match.scorecards[selectedInningsIdx].runs}/${match.scorecards[selectedInningsIdx].wickets} (${match.scorecards[selectedInningsIdx].overs} ov)`}
                          </span>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                              <tr>
                                <th className="p-3">{isOdia ? 'ବ୍ୟାଟର' : 'Batter'}</th>
                                <th className="p-3">{isOdia ? 'କିପରି ଆଉଟ୍ ହେଲେ' : 'Dismissal'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ରନ୍' : 'R'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ବଲ୍' : 'B'}</th>
                                <th className="p-3 text-right">{isOdia ? '୪' : '4s'}</th>
                                <th className="p-3 text-right">{isOdia ? '୬' : '6s'}</th>
                                <th className="p-3 text-right">{isOdia ? 'SR' : 'SR'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                              {match.scorecards[selectedInningsIdx].batting.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                                    {isOdia ? row.batsmanNameOdia : row.batsmanName}
                                  </td>
                                  <td className="p-3 text-slate-500 whitespace-nowrap">
                                    {row.dismissal}
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                                    {useOdiaDigits ? toOdiaDigits(row.runs) : row.runs}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-600">
                                    {useOdiaDigits ? toOdiaDigits(row.balls) : row.balls}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-600">
                                    {useOdiaDigits ? toOdiaDigits(row.fours) : row.fours}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-600">
                                    {useOdiaDigits ? toOdiaDigits(row.sixes) : row.sixes}
                                  </td>
                                  <td className="p-3 text-right font-mono font-semibold text-emerald-700">
                                    {useOdiaDigits ? toOdiaDigits(row.strikeRate.toFixed(1)) : row.strikeRate.toFixed(1)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Extras & Total Summary */}
                        <div className="bg-slate-50/80 p-3 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
                          <div>
                            {isOdia ? 'ଅତିରିକ୍ତ ରନ୍ (Extras): ' : 'Extras: '}
                            <span className="font-mono font-semibold text-slate-800">
                              {useOdiaDigits
                                ? toOdiaDigits(match.scorecards[selectedInningsIdx].extras.total)
                                : match.scorecards[selectedInningsIdx].extras.total}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1">
                              (b {match.scorecards[selectedInningsIdx].extras.byes}, lb {match.scorecards[selectedInningsIdx].extras.legByes}, w {match.scorecards[selectedInningsIdx].extras.wides}, nb {match.scorecards[selectedInningsIdx].extras.noBalls})
                            </span>
                          </div>
                          <div>
                            {isOdia ? 'ମୋଟ ସ୍କୋର: ' : 'Total: '}
                            <strong className="font-mono text-sm text-slate-900">
                              {useOdiaDigits
                                ? toOdiaDigits(`${match.scorecards[selectedInningsIdx].runs}/${match.scorecards[selectedInningsIdx].wickets}`)
                                : `${match.scorecards[selectedInningsIdx].runs}/${match.scorecards[selectedInningsIdx].wickets}`}
                            </strong>{' '}
                            ({useOdiaDigits ? toOdiaDigits(match.scorecards[selectedInningsIdx].overs) : match.scorecards[selectedInningsIdx].overs} {isOdia ? 'ଓଭର' : 'ov'})
                          </div>
                        </div>
                      </div>

                      {/* Bowling Table */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="bg-slate-100 px-4 py-2 font-bold text-xs text-slate-800">
                          {isOdia ? 'ବୋଲିଂ ପରିସଂଖ୍ୟାନ (Bowling Figures)' : 'Bowling Figures'}
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                              <tr>
                                <th className="p-3">{isOdia ? 'ବୋଲର' : 'Bowler'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ଓଭର' : 'O'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ମେଡେନ୍' : 'M'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ରନ୍' : 'R'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ୱିକେଟ୍' : 'W'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ଇକୋନୋମି' : 'Econ'}</th>
                                <th className="p-3 text-right">{isOdia ? 'ଡଟ୍' : 'Dots'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                              {match.scorecards[selectedInningsIdx].bowling.map((b, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                                    {isOdia ? b.bowlerNameOdia : b.bowlerName}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {useOdiaDigits ? toOdiaDigits(b.overs) : b.overs}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {useOdiaDigits ? toOdiaDigits(b.maidens) : b.maidens}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {useOdiaDigits ? toOdiaDigits(b.runs) : b.runs}
                                  </td>
                                  <td className="p-3 text-right font-mono font-bold text-rose-600">
                                    {useOdiaDigits ? toOdiaDigits(b.wickets) : b.wickets}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-700">
                                    {useOdiaDigits ? toOdiaDigits(b.economy.toFixed(2)) : b.economy.toFixed(2)}
                                  </td>
                                  <td className="p-3 text-right font-mono text-slate-500">
                                    {useOdiaDigits ? toOdiaDigits(b.dots) : b.dots}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Fall of Wickets */}
                      {match.scorecards[selectedInningsIdx].fallOfWickets.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                          <h5 className="font-bold text-xs text-slate-800">
                            {isOdia ? 'ୱିକେଟ୍ ପତନ (Fall of Wickets):' : 'Fall of Wickets:'}
                          </h5>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {match.scorecards[selectedInningsIdx].fallOfWickets.map((fow, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
                              >
                                <strong className="font-mono text-slate-900">
                                  {useOdiaDigits ? toOdiaDigits(fow.score) : fow.score}/{useOdiaDigits ? toOdiaDigits(fow.wicketNumber) : fow.wicketNumber}
                                </strong>{' '}
                                ({fow.batsmanOdia}, {useOdiaDigits ? toOdiaDigits(fow.over) : fow.over} ov)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  {isOdia
                    ? 'ଏହି ମ୍ୟାଚ୍ ପାଇଁ ସ୍କୋରକାର୍ଡ ଖୁବ୍ ଶୀଘ୍ର ପ୍ରକାଶିତ ହେବ କିମ୍ବା ଡେମୋ ମୋଡ୍‌ରେ ଉପଲବ୍ଧ ନାହିଁ।'
                    : 'Detailed scorecard is not yet available for this demonstration fixture.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLAYING XI */}
          {activeTab === 'playingXI' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team 1 Squad */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 font-bold text-sm text-slate-900">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: match.team1.flagColor }}
                  />
                  <span>{isOdia ? match.team1.nameOdia : match.team1.name}</span>
                </div>
                <div className="space-y-1.5">
                  {match.playingXI.team1.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 text-xs"
                    >
                      <span className="font-semibold text-slate-900">
                        {useOdiaDigits ? toOdiaDigits(idx + 1) : idx + 1}. {isOdia ? p.nameOdia : p.name}
                        {p.isCaptain && ' (C)'}
                        {p.isWicketKeeper && ' (WK)'}
                      </span>
                      <span className="text-slate-500 text-[11px]">{p.roleOdia}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team 2 Squad */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 font-bold text-sm text-slate-900">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: match.team2.flagColor }}
                  />
                  <span>{isOdia ? match.team2.nameOdia : match.team2.name}</span>
                </div>
                <div className="space-y-1.5">
                  {match.playingXI.team2.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 text-xs"
                    >
                      <span className="font-semibold text-slate-900">
                        {useOdiaDigits ? toOdiaDigits(idx + 1) : idx + 1}. {isOdia ? p.nameOdia : p.name}
                        {p.isCaptain && ' (C)'}
                        {p.isWicketKeeper && ' (WK)'}
                      </span>
                      <span className="text-slate-500 text-[11px]">{p.roleOdia}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MATCH INFO */}
          {activeTab === 'matchInfo' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isOdia ? 'ସମ୍ପୂର୍ଣ୍ଣ ମ୍ୟାଚ୍ ସୂଚନା ଓ ଅଧିକାରୀ' : 'Match Details & Officials'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs divide-y sm:divide-y-0 divide-slate-100">
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ମ୍ୟାଚ୍' : 'Match'}:</span>
                  <p className="font-semibold text-slate-900">{isOdia ? match.titleOdia : match.title}</p>
                </div>
                <div className="space-y-1 pt-2 sm:pt-0">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ଶୃଙ୍ଖଳା' : 'Series'}:</span>
                  <p className="font-semibold text-slate-900">{isOdia ? match.seriesOdia : match.series}</p>
                </div>
                <div className="space-y-1 pt-2 sm:pt-0">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ସ୍ଥାନ ଓ ଷ୍ଟାଡିୟମ୍' : 'Venue'}:</span>
                  <p className="font-semibold text-slate-900">{isOdia ? `${match.venueOdia}, ${match.venueCityOdia}` : match.venue}</p>
                </div>
                <div className="space-y-1 pt-2 sm:pt-0">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ତାରିଖ' : 'Date'}:</span>
                  <p className="font-semibold text-slate-900">{isOdia ? match.dateStrOdia : match.dateStrEn}</p>
                </div>
                <div className="space-y-1 pt-2 sm:pt-0">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ଅମ୍ପାୟାର୍' : 'Umpires'}:</span>
                  <p className="font-semibold text-slate-900">{match.umpiresOdia || 'ନିତିନ ମେନନ୍ ଓ ରିଚାର୍ଡ ଇଲିଙ୍ଗୱର୍ଥ'}</p>
                </div>
                <div className="space-y-1 pt-2 sm:pt-0">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ମ୍ୟାଚ୍ ରେଫେରୀ' : 'Referee'}:</span>
                  <p className="font-semibold text-slate-900">{match.refereeOdia || 'ଜାଭାଗଲ ଶ୍ରୀନାଥ (ICC Elite Panel)'}</p>
                </div>
              </div>

              {/* Data Verification banner */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isOdia
                    ? 'ଏହା କ୍ରିକେଟ୍ ଓଡ଼ିଆ ପ୍ରଦର୍ଶନ ତଥ୍ୟ। ପ୍ରକୃତ କ୍ରିକେଟ୍ API କ୍ରେଡେନ୍ସିଆଲ୍ ଯୋଡ଼ିବା ପାଇଁ ଆଡମିନ୍ ପୋର୍ଟାଲ୍ ବ୍ୟବହାର କରନ୍ତୁ।'
                    : 'Demonstration sports data. Cricket Odia is configured to seamlessly connect live production Cricket APIs.'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 6: STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-800 font-semibold">{isOdia ? 'ଚୌକା (୪s)' : 'Fours (4s)'}</span>
                  <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
                    {useOdiaDigits ? toOdiaDigits('୩୨') : '32'}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <span className="text-xs text-purple-800 font-semibold">{isOdia ? 'ଛକା (୬s)' : 'Sixes (6s)'}</span>
                  <div className="text-2xl font-bold font-mono text-purple-900 mt-1">
                    {useOdiaDigits ? toOdiaDigits('୧୮') : '18'}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <span className="text-xs text-blue-800 font-semibold">{isOdia ? 'ଅତିରିକ୍ତ ରନ୍' : 'Extras'}</span>
                  <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
                    {useOdiaDigits ? toOdiaDigits('୨୨') : '22'}
                  </div>
                </div>
              </div>

              {/* Head-to-Head */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isOdia ? 'ମୁହାଁମୁହିଁ ରେକର୍ଡ (Head to Head in T20I)' : 'Head to Head Record'}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span>{isOdia ? match.team1.nameOdia : match.team1.name}: <strong>୧୪ ବିଜୟ</strong></span>
                    <span>{isOdia ? match.team2.nameOdia : match.team2.name}: <strong>୧୯ ବିଜୟ</strong></span>
                  </div>
                  {/* Graphical bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="w-[42%] bg-amber-400" title="Australia 14" />
                    <div className="w-[58%] bg-blue-600" title="India 19" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
