import React, { useState } from 'react';
import { Users, Search, Award, ChevronRight, User, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { PlayerProfile } from '../types/cricket';
import { PlayerProfileModal } from './PlayerProfileModal';

interface TeamsPlayersViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const TeamsPlayersView: React.FC<TeamsPlayersViewProps> = ({ setCurrentTab }) => {
  const { players, language } = useCricket();
  const isOdia = language === 'odia';

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [playerQuery, setPlayerQuery] = useState('');

  const filteredPlayers = players.filter(
    (p) =>
      p.nameOdia.toLowerCase().includes(playerQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(playerQuery.toLowerCase()) ||
      p.teamOdia.toLowerCase().includes(playerQuery.toLowerCase())
  );

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
            <Users className="w-6 h-6 text-emerald-600" />
            <span>{isOdia ? 'ଦଳ ଓ ଖେଳାଳି ପ୍ରୋଫାଇଲ୍' : 'Teams & Player Profiles'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isOdia
              ? 'ଭାରତୀୟ, ଓଡ଼ିଶା ତଥା ଅନ୍ତର୍ଜାତୀୟ ଖେଳାଳିଙ୍କ କ୍ୟାରିୟର୍ ରେକର୍ଡ ଓ ତଥ୍ୟ'
              : 'Career statistics, batting & bowling styles, and milestone records'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={playerQuery}
            onChange={(e) => setPlayerQuery(e.target.value)}
            placeholder={isOdia ? 'ଖେଳାଳିଙ୍କ ନାମ ଖୋଜନ୍ତୁ...' : 'Search player by name...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-bold font-mono text-base shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  {player.nameEn.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                    {isOdia ? player.nameOdia : player.nameEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">{player.teamOdia}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ଭୂମିକା' : 'Role'}:</span>
                  <span className="font-semibold text-slate-800 truncate ml-2">{player.roleOdia}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ଦିନିକିଆ ରନ୍' : 'ODI Runs'}:</span>
                  <span className="font-mono font-bold text-slate-900">{player.stats.odi.runs.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-500 font-medium">{isOdia ? 'ଶତକ (୧୦୦)' : '100s'}:</span>
                  <span className="font-mono font-bold text-amber-700">{player.stats.odi.hundreds}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>{isOdia ? 'କ୍ୟାରିୟର୍ ରେକର୍ଡ ଦେଖନ୍ତୁ' : 'View Full Career'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
};
