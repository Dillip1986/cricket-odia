import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Radio, Newspaper, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { openMatch } from '../router';

interface GlobalSearchModalProps {
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const { matches, news, players, setSelectedArticle, language } = useCricket();
  const isOdia = language === 'odia';

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim().toLowerCase();

  const matchingMatches = trimmed
    ? matches.filter(
        (m) =>
          m.title.toLowerCase().includes(trimmed) ||
          m.titleOdia.toLowerCase().includes(trimmed) ||
          m.seriesOdia.toLowerCase().includes(trimmed) ||
          m.venueOdia.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingNews = trimmed
    ? news.filter(
        (n) =>
          n.titleOdia.toLowerCase().includes(trimmed) ||
          n.titleEn.toLowerCase().includes(trimmed) ||
          n.summaryOdia.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingPlayers = trimmed
    ? players.filter(
        (p) =>
          p.nameOdia.toLowerCase().includes(trimmed) ||
          p.nameEn.toLowerCase().includes(trimmed) ||
          p.teamOdia.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="ପଛକୁ ଫେରନ୍ତୁ (Go Back)"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">{isOdia ? 'ପଛକୁ' : 'Back'}</span>
          </button>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isOdia
                ? 'ଦଳ, ଖେଳାଳି (କୋହଲି, ରୋହିତ), ମ୍ୟାଚ୍ କିମ୍ବା ଖବର ଖୋଜନ୍ତୁ...'
                : 'Search teams, players, matches, or cricket news...'
            }
            className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {!trimmed ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p>{isOdia ? 'କୌଣସି ଶବ୍ଦ ଟାଇପ୍ କରି ଖୋଜିବା ଆରମ୍ଭ କରନ୍ତୁ।' : 'Type to search across cricket scores and stories.'}</p>
              <div className="flex justify-center gap-2 pt-2">
                <span
                  onClick={() => setQuery('ଭାରତ')}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  ଭାରତ
                </span>
                <span
                  onClick={() => setQuery('କୋହଲି')}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  କୋହଲି
                </span>
                <span
                  onClick={() => setQuery('ବାରବାଟୀ')}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  ବାରବାଟୀ
                </span>
                <span
                  onClick={() => setQuery('ଓଡ଼ିଶା')}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  ଓଡ଼ିଶା
                </span>
              </div>
            </div>
          ) : matchingMatches.length === 0 && matchingNews.length === 0 && matchingPlayers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              {isOdia
                ? `"${query}" ପାଇଁ କୌଣସି ଫଳାଫଳ ମିଳିଲା ନାହିଁ।`
                : `No results found for "${query}".`}
            </div>
          ) : (
            <>
              {/* Matches */}
              {matchingMatches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isOdia ? 'ମ୍ୟାଚ୍' : 'Matches'}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchingMatches.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          openMatch(m.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-xs text-slate-900">
                            {isOdia ? m.titleOdia : m.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {m.format} · {isOdia ? m.statusTextOdia : m.status}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players */}
              {matchingPlayers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isOdia ? 'ଖେଳାଳି' : 'Players'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchingPlayers.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onClose()}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        <p className="font-semibold text-xs text-slate-900">
                          {isOdia ? p.nameOdia : p.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-500">{p.roleOdia} · {p.teamOdia}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News Articles */}
              {matchingNews.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isOdia ? 'ଖବର' : 'News Articles'}</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchingNews.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setSelectedArticle(n);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        <p className="font-semibold text-xs text-slate-900 line-clamp-1">
                          {isOdia ? n.titleOdia : n.titleOdia}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{n.summaryOdia}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
