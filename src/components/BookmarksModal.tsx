import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

interface BookmarksModalProps {
  onClose: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({ onClose }) => {
  const { news, bookmarkedArticles, toggleBookmarkArticle, setSelectedArticle, language } = useCricket();
  const isOdia = language === 'odia';

  const bookmarkedNews = news.filter((n) => bookmarkedArticles.includes(n.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="ପଛକୁ ଫେରନ୍ତୁ (Go Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isOdia ? 'ପଛକୁ' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                {isOdia ? 'ସାଇତି ରଖାଯାଇଥିବା ଖବର' : 'Saved Articles'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {bookmarkedNews.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
              <p>
                {isOdia
                  ? 'ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଖବର ସାଇତି ରଖିନାହାଁନ୍ତି।'
                  : 'You have not saved any articles yet.'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isOdia
                  ? 'ଖବର କାର୍ଡରେ ଥିବା ବୁକମାର୍କ ଚିହ୍ନ ଉପରେ କ୍ଲିକ୍ କରି ସାଇତି ରଖନ୍ତୁ।'
                  : 'Click the bookmark icon on any article card to save it.'}
              </p>
            </div>
          ) : (
            bookmarkedNews.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  setSelectedArticle(art);
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">
                    {isOdia ? art.categoryOdia : art.categoryEn}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2">
                    {isOdia ? art.titleOdia : art.titleOdia}
                  </h4>
                  <span className="text-[11px] text-slate-400 block">{art.publishedAtOdia}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmarkArticle(art.id);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  title="ତାଲିକାରୁ ହଟାନ୍ତୁ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
