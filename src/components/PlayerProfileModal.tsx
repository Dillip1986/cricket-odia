import React from 'react';
import { X, Award, MapPin, Calendar, Activity, ChevronRight, ArrowLeft } from 'lucide-react';
import { PlayerProfile } from '../types/cricket';
import { useCricket } from '../context/CricketContext';
import { toOdiaDigits } from '../utils/odiaLocalization';

interface PlayerProfileModalProps {
  player: PlayerProfile;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, onClose }) => {
  const { useOdiaDigits, language } = useCricket();
  const isOdia = language === 'odia';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0a2342] to-emerald-950 text-white p-6 relative">
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              title="ପଛକୁ ଫେରନ୍ତୁ (Go Back)"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-300" />
              <span>{isOdia ? '← ପଛକୁ' : '← Back'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="ବନ୍ଦ କରନ୍ତୁ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Player Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 p-0.5 shadow-xl shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white text-2xl font-bold font-mono">
                {player.nameEn.split(' ').map((n) => n[0]).join('')}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {player.roleOdia}
                </span>
                <span className="text-xs text-slate-300">
                  {player.teamOdia}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isOdia ? player.nameOdia : player.nameEn}
              </h2>
              <p className="text-xs text-slate-300">
                {isOdia ? `ଜନ୍ମ: ${player.bornOdia}` : `Born: ${player.bornOdia}`}
              </p>
            </div>
          </div>
        </div>

        {/* Career Details Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Batting & Bowling Styles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">{isOdia ? 'ବ୍ୟାଟିଂ ଶୈଳୀ' : 'Batting Style'}</span>
              <p className="font-semibold text-slate-900 text-sm">{player.battingStyleOdia}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-medium">{isOdia ? 'ବୋଲିଂ ଶୈଳୀ' : 'Bowling Style'}</span>
              <p className="font-semibold text-slate-900 text-sm">{player.bowlingStyleOdia}</p>
            </div>
          </div>

          {/* Career Stats Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {isOdia ? 'କ୍ୟାରିୟର୍ ପରିସଂଖ୍ୟାନ (Career Records)' : 'Career Statistics'}
            </h4>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{isOdia ? 'ଫର୍ମାଟ୍' : 'Format'}</th>
                      <th className="p-3 text-right">{isOdia ? 'ମ୍ୟାଚ୍' : 'M'}</th>
                      <th className="p-3 text-right">{isOdia ? 'ରନ୍' : 'Runs'}</th>
                      <th className="p-3 text-right">{isOdia ? 'ସର୍ବୋଚ୍ଚ' : 'HS'}</th>
                      <th className="p-3 text-right">{isOdia ? 'ହାରାହାରି' : 'Avg'}</th>
                      <th className="p-3 text-right">{isOdia ? 'SR' : 'SR'}</th>
                      <th className="p-3 text-right">{isOdia ? 'ଶତକ' : '100s'}</th>
                      <th className="p-3 text-right">{isOdia ? 'ୱିକେଟ୍' : 'Wkts'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">TEST</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.test.matches) : player.stats.test.matches}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{useOdiaDigits ? toOdiaDigits(player.stats.test.runs) : player.stats.test.runs}</td>
                      <td className="p-3 text-right font-mono">{player.stats.test.hs}</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-700">{useOdiaDigits ? toOdiaDigits(player.stats.test.avg) : player.stats.test.avg}</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.test.sr) : player.stats.test.sr}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">{useOdiaDigits ? toOdiaDigits(player.stats.test.hundreds) : player.stats.test.hundreds}</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.test.wickets) : player.stats.test.wickets}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">ODI</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.odi.matches) : player.stats.odi.matches}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{useOdiaDigits ? toOdiaDigits(player.stats.odi.runs) : player.stats.odi.runs}</td>
                      <td className="p-3 text-right font-mono">{player.stats.odi.hs}</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-700">{useOdiaDigits ? toOdiaDigits(player.stats.odi.avg) : player.stats.odi.avg}</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.odi.sr) : player.stats.odi.sr}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">{useOdiaDigits ? toOdiaDigits(player.stats.odi.hundreds) : player.stats.odi.hundreds}</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.odi.wickets) : player.stats.odi.wickets}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">T20I</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.t20i.matches) : player.stats.t20i.matches}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{useOdiaDigits ? toOdiaDigits(player.stats.t20i.runs) : player.stats.t20i.runs}</td>
                      <td className="p-3 text-right font-mono">{player.stats.t20i.hs}</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-700">{useOdiaDigits ? toOdiaDigits(player.stats.t20i.avg) : player.stats.t20i.avg}</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.t20i.sr) : player.stats.t20i.sr}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">{useOdiaDigits ? toOdiaDigits(player.stats.t20i.hundreds) : player.stats.t20i.hundreds}</td>
                      <td className="p-3 text-right font-mono">{useOdiaDigits ? toOdiaDigits(player.stats.t20i.wickets) : player.stats.t20i.wickets}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Performances */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {isOdia ? 'ସଦ୍ୟତମ ମ୍ୟାଚ୍ ପ୍ରଦର୍ଶନ' : 'Recent Form'}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {player.recentPerformancesOdia.map((perf, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-medium"
                >
                  {perf}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
