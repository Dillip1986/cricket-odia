import React from 'react';
import { useCricket } from '../context/CricketContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  openAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, openAdmin }) => {
  const { language } = useCricket();
  const isOdia = language === 'odia';

  return (
    <footer className="bg-[#091a32] text-slate-400 border-t border-slate-800 mt-16 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                CO
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Cricket Odia – କ୍ରିକେଟ୍ ଓଡ଼ିଆ
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isOdia
                ? 'ଭାରତ ତଥା ବିଶ୍ୱ କ୍ରିକେଟ୍‌ର ପ୍ରତ୍ୟେକ ବଲ୍, ସ୍କୋରକାର୍ଡ, ଧାରାବିବରଣୀ, ର‍୍ୟାଙ୍କିଙ୍ଗ୍ ଏବଂ ଖବର ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆ ଭାଷାରେ। ଖେଳପ୍ରେମୀଙ୍କ ପାଇଁ ନିରନ୍ତର ସେବା।'
                : 'India and world cricket scores, commentary, rankings, and analysis in pure Odia language.'}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {isOdia ? 'ସଂକ୍ଷିପ୍ତ ଲିଙ୍କ୍' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setCurrentTab('live')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isOdia ? 'ଲାଇଭ୍ ସ୍କୋର (Live)' : 'Live Scores'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('fixtures')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isOdia ? 'ଖେଳସୂଚୀ ଓ ଫଳାଫଳ' : 'Fixtures & Results'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('standings')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isOdia ? 'ପଏଣ୍ଟ ଟେବୁଲ (WTC / IPL)' : 'Points Table'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentTab('rankings')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isOdia ? 'ଆଇସିସି ର‍୍ୟାଙ୍କିଙ୍ଗ୍' : 'ICC Rankings'}
                </button>
              </li>
            </ul>
          </div>

          {/* Editorial & Admin */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {isOdia ? 'ପରିଚାଳନା ଓ ନୀତି' : 'Editorial & Admin'}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={openAdmin}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  {isOdia ? 'ପରିଚାଳକ ଲଗ୍ଇନ୍ (Admin Portal)' : 'Admin Console'}
                </button>
              </li>
              <li>
                <span className="text-slate-500">
                  {isOdia ? 'ଡେମୋ ଡାଟା ମୋଡ୍ ସକ୍ରିୟ' : 'Demonstration Data Active'}
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  {isOdia ? 'କପିରାଇଟ୍ ସୁରକ୍ଷିତ' : 'Original Content Protected'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © ୨୦୨୬ Cricket Odia (କ୍ରିକେଟ୍ ଓଡ଼ିଆ). {isOdia ? 'ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।' : 'All rights reserved.'}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{isOdia ? 'ଫଣ୍ଟ: Noto Sans Oriya' : 'Font: Noto Sans Oriya'}</span>
            <span>·</span>
            <span>{isOdia ? 'କ୍ରୀଡ଼ା ତଥ୍ୟ: ESPNcricinfo ଶୈଳୀରେ ପ୍ରସ୍ତୁତ' : 'ESPNcricinfo Inspired'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
