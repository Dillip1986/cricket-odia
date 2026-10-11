import React, { useState } from 'react';
import { X, Bookmark, Share2, Eye, Calendar, User, Tag, Clock, ArrowLeft } from 'lucide-react';
import { NewsArticle } from '../types/cricket';
import { useCricket } from '../context/CricketContext';

interface ArticleModalProps {
  article: NewsArticle;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  const { language, bookmarkedArticles, toggleBookmarkArticle } = useCricket();
  const isOdia = language === 'odia';

  const isBookmarked = bookmarkedArticles.includes(article.id);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`${article.titleOdia} - Cricket Odia (କ୍ରିକେଟ୍ ଓଡ଼ିଆ)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="ପଛକୁ ଫେରନ୍ତୁ (Go Back)"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>{isOdia ? '← ପଛକୁ' : '← Back'}</span>
            </button>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {isOdia ? article.categoryOdia : article.categoryEn}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {isOdia ? article.readTimeOdia : '3 min read'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmarkArticle(article.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="ସାଇତି ରଖନ୍ତୁ"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="ସେୟାର୍ କରନ୍ତୁ"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-900/60 transition-colors cursor-pointer"
              title="ବନ୍ଦ କରନ୍ତୁ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copied && (
          <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center">
            {isOdia ? 'ଲେଖାଟିର ଶିରୋନାମା କପି ହୋଇଗଲା!' : 'Article headline copied to clipboard!'}
          </div>
        )}

        {/* Content area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Headline */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {isOdia ? article.titleOdia : article.titleOdia}
          </h1>

          {/* Author & Timestamp */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-slate-700">{article.authorOdia}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{isOdia ? article.publishedAtOdia : article.publishedAtEn}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.viewsCount?.toLocaleString() || '1,200'} {isOdia ? 'ଥର ପଢ଼ାଯାଇଛି' : 'views'}</span>
            </div>
          </div>

          {/* Editorial Styled Banner Graphic */}
          <div className="w-full h-48 sm:h-64 rounded-xl bg-gradient-to-br from-slate-900 via-[#0a2342] to-emerald-950 p-6 flex flex-col justify-end text-white relative overflow-hidden shadow-inner">
            <div className="absolute top-4 right-4 opacity-15">
              <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="relative z-10">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold mb-1 block">
                କ୍ରିକେଟ୍ ଓଡ଼ିଆ ସ୍ୱତନ୍ତ୍ର ରିପୋର୍ଟ
              </span>
              <p className="text-base sm:text-lg font-semibold text-slate-100 line-clamp-2">
                {isOdia ? article.summaryOdia : article.summaryOdia}
              </p>
            </div>
          </div>

          {/* Article Full Body */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {article.contentOdia.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {article.tagsOdia && article.tagsOdia.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">{isOdia ? 'ଟ୍ୟାଗ୍:' : 'Tags:'}</span>
              {article.tagsOdia.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
