import React, { useState } from 'react';
import { Newspaper, Clock, User, ArrowRight, Bookmark, Search, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';
import { NewsArticle } from '../types/cricket';

interface NewsSectionProps {
  setCurrentTab?: (tab: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ setCurrentTab }) => {
  const { news, setSelectedArticle, language, bookmarkedArticles, toggleBookmarkArticle } = useCricket();

  const isOdia = language === 'odia';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [newsQuery, setNewsQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', labelOdia: 'ସମସ୍ତ', labelEn: 'All' },
    { id: 'INTERNATIONAL', labelOdia: 'ଆନ୍ତର୍ଜାତୀୟ', labelEn: 'International' },
    { id: 'DOMESTIC', labelOdia: 'ଘରୋଇ କ୍ରିକେଟ୍', labelEn: 'Domestic' },
    { id: 'IPL', labelOdia: 'ଆଇପିଏଲ୍ (IPL)', labelEn: 'IPL' },
    { id: 'RECORDS', labelOdia: 'ରେକର୍ଡ ଓ ପରିସଂଖ୍ୟାନ', labelEn: 'Records' },
  ];

  const filteredNews = news.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'INTERNATIONAL' && item.categoryOdia.includes('ଆନ୍ତର୍ଜାତୀୟ')) ||
      (selectedCategory === 'DOMESTIC' && item.categoryOdia.includes('ଘରୋଇ')) ||
      (selectedCategory === 'IPL' && item.categoryOdia.includes('ଆଇପିଏଲ୍')) ||
      (selectedCategory === 'RECORDS' && item.categoryOdia.includes('ରେକର୍ଡ'));

    const matchesSearch =
      newsQuery.trim() === '' ||
      item.titleOdia.toLowerCase().includes(newsQuery.toLowerCase()) ||
      item.summaryOdia.toLowerCase().includes(newsQuery.toLowerCase()) ||
      item.titleEn.toLowerCase().includes(newsQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featured = filteredNews.find((n) => n.isFeatured) || filteredNews[0];
  const regularNews = filteredNews.filter((n) => n.id !== featured?.id);

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
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

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isOdia ? 'ସଦ୍ୟତନ କ୍ରିକେଟ୍ ଖବର' : 'Latest Cricket News'}
              </h2>
              <p className="text-xs text-slate-500">
                {isOdia ? 'ଭାରତ ଓ ବିଶ୍ୱ କ୍ରିକେଟ୍‌ର ଟିକିନିକି ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆରେ' : 'Comprehensive cricket reporting in Odia'}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isOdia ? cat.labelOdia : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Lead Story */}
      {featured && (
        <div
          onClick={() => setSelectedArticle(featured)}
          className="group bg-gradient-to-br from-slate-900 via-[#0a213e] to-[#0d2a4d] rounded-2xl p-6 sm:p-8 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all border border-slate-800 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
                {isOdia ? featured.categoryOdia : featured.categoryEn}
              </span>
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isOdia ? featured.publishedAtOdia : featured.publishedAtEn}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
              {isOdia ? featured.titleOdia : featured.titleOdia}
            </h3>

            <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">
              {isOdia ? featured.summaryOdia : featured.summaryOdia}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {featured.authorOdia}
              </span>
              <div className="flex items-center gap-1 text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                <span>{isOdia ? 'ସମ୍ପୂର୍ଣ୍ଣ ପଢ଼ନ୍ତୁ' : 'Read Full Story'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {regularNews.map((art) => {
          const isBookmarked = bookmarkedArticles.includes(art.id);

          return (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    {isOdia ? art.categoryOdia : art.categoryEn}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkArticle(art.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      isBookmarked ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-600'
                    }`}
                    title="ସାଇତି ରଖନ୍ତୁ"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-emerald-600' : ''}`} />
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm leading-snug">
                  {isOdia ? art.titleOdia : art.titleOdia}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {isOdia ? art.summaryOdia : art.summaryOdia}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{isOdia ? art.publishedAtOdia : art.publishedAtEn}</span>
                <span className="font-medium text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  {isOdia ? 'ପଢ଼ନ୍ତୁ' : 'Read'} →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
