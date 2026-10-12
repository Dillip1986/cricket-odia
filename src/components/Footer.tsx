import React from 'react';
import { useCricket } from '../context/CricketContext';
import { useStrings } from '../i18n/strings';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  openAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, openAdmin }) => {
  const { language, liveSource } = useCricket();
  const t = useStrings();
  const isOdia = language === 'odia';
  const feedOn = liveSource === 'api';

  const links: { id: string; label: string }[] = [
    { id: 'live', label: t.navLive },
    { id: 'fixtures', label: t.navFixtures },
    { id: 'standings', label: t.navStandings },
    { id: 'rankings', label: t.navRankings },
  ];

  return (
    <footer className="bg-[#071426] text-slate-400 border-t border-slate-800 mt-10 sm:mt-14 pb-24 lg:pb-8">
      <div className="app-container py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 pb-7 border-b border-slate-800/80">
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B887] to-[#00573f] flex items-center justify-center text-white font-extrabold text-sm shrink-0" aria-hidden="true">
                CO
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-white tracking-tight truncate">Cricket Odia</p>
                <p className="text-[11px] text-[#00e6a8] font-medium">{t.brandSub}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">{t.footerTagline}</p>
            <p className="flex items-center gap-2 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${feedOn ? 'bg-[#00B887] animate-pulse' : 'bg-amber-400'}`} aria-hidden="true" />
              <span className="font-semibold text-slate-300">
                {t.footerLiveFeed}: {feedOn ? t.footerFeedOn : t.footerFeedOff}
              </span>
            </p>
          </div>

          <nav aria-label="Footer">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">
              {t.footerLinks}
            </h4>
            <ul className="space-y-1 text-xs">
              {links.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => setCurrentTab(l.id)}
                    className="hover:text-[#00e6a8] transition-colors cursor-pointer min-h-[32px]"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">
              {t.actionAdmin}
            </h4>
            <button
              onClick={openAdmin}
              className="text-xs text-[#00e6a8] hover:text-white font-semibold transition-colors cursor-pointer min-h-[32px]"
            >
              {isOdia ? 'ପରିଚାଳକ ଲଗ୍ଇନ୍' : 'Admin Console'}
            </button>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© ୨୦୨୬ Cricket Odia ({t.brandSub}). {t.footerRights}</p>
          <p className="text-[11px]">{isOdia ? 'ଫଣ୍ଟ: Noto Sans Oriya' : 'Font: Noto Sans Oriya'}</p>
        </div>
      </div>
    </footer>
  );
};
