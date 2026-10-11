import React, { useState } from 'react';
import { Award, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { toOdiaDigits } from '../utils/odiaLocalization';
import { RankingEntry } from '../types/cricket';

interface RankingsViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ setCurrentTab }) => {
  const { rankings, useOdiaDigits, language } = useCricket();
  const isOdia = language === 'odia';

  const [activeCategory, setActiveCategory] = useState<'teams' | 'batters' | 'bowlers'>('teams');
  const [activeFormat, setActiveFormat] = useState<'t20' | 'odi' | 'test'>('t20');

  let currentList: RankingEntry[] = [];
  if (activeCategory === 'teams') {
    if (activeFormat === 't20') currentList = rankings.t20Teams;
    else if (activeFormat === 'odi') currentList = rankings.odiTeams;
    else currentList = rankings.testTeams;
  } else if (activeCategory === 'batters') {
    currentList = rankings.batters;
  } else {
    currentList = rankings.bowlers;
  }

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
            <Award className="w-6 h-6 text-emerald-600" />
            <span>{isOdia ? 'ଆଇସିସି କ୍ରିକେଟ୍ ର‍୍ୟାଙ୍କିଙ୍ଗ୍' : 'ICC Cricket Rankings'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOdia
              ? 'ଆନ୍ତର୍ଜାତୀୟ କ୍ରିକେଟ୍ କାଉନସିଲ୍ (ICC) ର ସଦ୍ୟତମ ଦଳ ଓ ଖେଳାଳି ର‍୍ୟାଙ୍କିଙ୍ଗ୍'
              : 'Official ICC International Team & Player Rankings'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveCategory('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'teams' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ଦଳ ର‍୍ୟାଙ୍କିଙ୍ଗ୍' : 'Teams'}
          </button>
          <button
            onClick={() => setActiveCategory('batters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'batters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ବ୍ୟାଟର' : 'Batters'}
          </button>
          <button
            onClick={() => setActiveCategory('bowlers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeCategory === 'bowlers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isOdia ? 'ବୋଲର' : 'Bowlers'}
          </button>
        </div>
      </div>

      {/* Format Selector if Teams */}
      {activeCategory === 'teams' && (
        <div className="flex items-center gap-2">
          {(['t20', 'odi', 'test'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeFormat === fmt
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {fmt === 't20' ? 'T20I' : fmt === 'odi' ? 'ODI' : 'TEST'}
            </button>
          ))}
        </div>
      )}

      {/* Rankings List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>
            {isOdia ? 'ଆଇସିସି ସରକାରୀ ର‍୍ୟାଙ୍କିଙ୍ଗ୍ ତାଲିକା' : 'ICC Official Table'}
          </span>
          <span className="text-slate-500 text-[11px]">
            {isOdia ? 'ସଦ୍ୟତନ: ଅକ୍ଟୋବର ୨୦୨୬' : 'Updated: Oct 2026'}
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 w-16 text-center">{isOdia ? 'କ୍ରମ' : 'Rank'}</th>
                <th className="p-4">{isOdia ? 'ନାମ / ଦଳ' : 'Name / Team'}</th>
                <th className="p-4 text-center">{isOdia ? 'ଦେଶ' : 'Country'}</th>
                <th className="p-4 text-right font-bold text-slate-900">{isOdia ? 'ରେଟିଂ (Rating)' : 'Rating'}</th>
                <th className="p-4 text-center">{isOdia ? 'ପରିବର୍ତ୍ତନ' : 'Trend'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {currentList.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-center font-mono font-bold text-slate-900 text-sm">
                    {useOdiaDigits ? toOdiaDigits(item.rank) : item.rank}
                  </td>
                  <td className="p-4 font-bold text-slate-900 whitespace-nowrap text-sm">
                    {isOdia ? item.nameOdia : item.nameEn}
                  </td>
                  <td className="p-4 text-center font-mono font-medium text-slate-600">
                    {item.countryOdia}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-800 text-sm">
                    {useOdiaDigits ? toOdiaDigits(item.rating) : item.rating}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      {item.change === 'up' ? (
                        <div className="flex items-center gap-0.5 text-emerald-600 font-bold text-[11px]">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+1</span>
                        </div>
                      ) : item.change === 'down' ? (
                        <div className="flex items-center gap-0.5 text-rose-600 font-bold text-[11px]">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>-1</span>
                        </div>
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
