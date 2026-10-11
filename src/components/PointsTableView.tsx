import React, { useState } from 'react';
import { Trophy, Shield, Info, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { toOdiaDigits } from '../utils/odiaLocalization';

interface PointsTableViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const PointsTableView: React.FC<PointsTableViewProps> = ({ setCurrentTab }) => {
  const { standings, useOdiaDigits, language } = useCricket();
  const isOdia = language === 'odia';

  const [tournament, setTournament] = useState<'wtc' | 'ipl' | 't20wc'>('wtc');

  return (
    <div className="space-y-6">
      {/* View Header */}
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

          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>{isOdia ? 'ଟୁର୍ଣ୍ଣାମେଣ୍ଟ ପଏଣ୍ଟ ଟେବୁଲ' : 'Tournament Standings'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOdia
              ? 'ମ୍ୟାଚ୍ ବିଜୟ, ପଏଣ୍ଟ, ନେଟ୍ ରନ୍ ରେଟ୍ (NRR) ଏବଂ ଯୋଗ୍ୟତା ସ୍ଥିତି'
              : 'Official tournament points, Net Run Rate (NRR), and qualification spots'}
          </p>
        </div>

        {/* Tournament Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTournament('wtc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tournament === 'wtc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'WTC ୨୦୨୫-୨୭' : 'ICC WTC'}
          </button>
          <button
            onClick={() => setTournament('ipl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tournament === 'ipl' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଆଇପିଏଲ୍ ୨୦୨୬' : 'IPL 2026'}
          </button>
          <button
            onClick={() => setTournament('t20wc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tournament === 't20wc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଟି-୨୦ ବିଶ୍ୱ କପ୍' : 'T20 WC'}
          </button>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>
            {tournament === 'wtc'
              ? isOdia ? 'ଆଇସିସି ବିଶ୍ୱ ଟେଷ୍ଟ ଚାମ୍ପିୟନସିପ୍ ୨୦୨୫-୨୭' : 'ICC World Test Championship'
              : tournament === 'ipl'
              ? isOdia ? 'ଇଣ୍ଡିଆନ୍ ପ୍ରିମିୟର ଲିଗ୍ (IPL) ୨୦୨୬ ସ୍ଥିତି' : 'IPL 2026 Table'
              : isOdia ? 'ଆଇସିସି ପୁରୁଷ ଟି-୨୦ ବିଶ୍ୱ କପ୍ ଗ୍ରୁପ୍' : 'ICC T20 World Cup Table'}
          </span>
          <span className="text-slate-500 text-[11px]">
            {isOdia ? 'ଶୀର୍ଷ ୨ ଦଳ ଫାଇନାଲ୍ ଖେଳିବେ' : 'Top 2 qualify for Final'}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">{isOdia ? 'ଦଳ' : 'Team'}</th>
                <th className="p-3.5 text-center">{isOdia ? 'ମ୍ୟାଚ୍ (P)' : 'P'}</th>
                <th className="p-3.5 text-center">{isOdia ? 'ଜିତିଲେ (W)' : 'W'}</th>
                <th className="p-3.5 text-center">{isOdia ? 'ହାରିଲେ (L)' : 'L'}</th>
                <th className="p-3.5 text-center">{isOdia ? 'ଟାଇ (T)' : 'T'}</th>
                <th className="p-3.5 text-center font-bold text-slate-900">{isOdia ? 'ପଏଣ୍ଟ (Pts)' : 'Pts'}</th>
                <th className="p-3.5 text-right">{isOdia ? 'ନେଟ୍ ରନ୍ ରେଟ୍ (NRR)' : 'NRR'}</th>
                <th className="p-3.5 text-center">{isOdia ? 'ସଦ୍ୟ ଫର୍ମ' : 'Form'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {standings.map((row, idx) => {
                const isQualifying = idx < 2;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isQualifying ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                      {useOdiaDigits ? toOdiaDigits(idx + 1) : idx + 1}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: row.flagColor }}
                        />
                        <span>{isOdia ? row.teamOdia : row.teamEn}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {useOdiaDigits ? toOdiaDigits(row.played) : row.played}
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold text-emerald-700">
                      {useOdiaDigits ? toOdiaDigits(row.won) : row.won}
                    </td>
                    <td className="p-3.5 text-center font-mono text-rose-600">
                      {useOdiaDigits ? toOdiaDigits(row.lost) : row.lost}
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-500">
                      {useOdiaDigits ? toOdiaDigits(row.tied) : row.tied}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-sm text-slate-900">
                      {useOdiaDigits ? toOdiaDigits(row.points) : row.points}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-700">
                      {useOdiaDigits ? toOdiaDigits(row.nrr) : row.nrr}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className={`w-4 h-4 rounded-full text-[9px] font-bold font-mono flex items-center justify-center ${
                              f === 'W'
                                ? 'bg-emerald-600 text-white'
                                : f === 'L'
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{isOdia ? 'ଶୀର୍ଷ ୨ ଦଳ (ଲର୍ଡ୍ସ ଫାଇନାଲ୍ ପାଇଁ ଯୋଗ୍ୟ)' : 'Top 2 qualify for Lords Final'}</span>
          </div>
          <div className="text-[11px]">
            {isOdia ? 'ସଦ୍ୟତନ: ୧୧ ଅକ୍ଟୋବର, ୨୦୨୬' : 'Last updated: 11 Oct 2026'}
          </div>
        </div>
      </div>
    </div>
  );
};
