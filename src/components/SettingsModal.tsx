import React from 'react';
import { X, Globe, Heart, Bell, Cpu, Moon, Sun, Check, ArrowLeft } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    language,
    setLanguage,
    useOdiaDigits,
    setUseOdiaDigits,
    isSimulatingLive,
    setIsSimulatingLive,
    favouriteTeams,
    toggleFavouriteTeam,
    theme,
    setTheme,
  } = useCricket();

  const isOdia = language === 'odia';

  const allTeamsList = [
    { id: 'ind', nameOdia: 'ଭାରତ (India)', flagColor: '#0033a0' },
    { id: 'aus', nameOdia: 'ଅଷ୍ଟ୍ରେଲିଆ (Australia)', flagColor: '#ffcc00' },
    { id: 'odi', nameOdia: 'ଓଡ଼ିଶା କ୍ରିକେଟ୍ ଦଳ (Odisha)', flagColor: '#16a34a' },
    { id: 'csk', nameOdia: 'ଚେନ୍ନାଇ ସୁପର କିଙ୍ଗ୍ସ (CSK)', flagColor: '#f9cd05' },
    { id: 'mi', nameOdia: 'ମୁମ୍ବାଇ ଇଣ୍ଡିଆନ୍ସ (MI)', flagColor: '#004f9f' },
    { id: 'rcb', nameOdia: 'ରୟାଲ ଚ୍ୟାଲେଞ୍ଜର୍ସ (RCB)', flagColor: '#ec1c24' },
    { id: 'eng', nameOdia: 'ଇଂଲଣ୍ଡ (England)', flagColor: '#dc2626' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
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
            <div>
              <h2 className="text-base font-bold text-white">
                {isOdia ? 'ସେଟିଂସ୍ ଓ ବ୍ୟକ୍ତିଗତ ପସନ୍ଦ' : 'Settings & Preferences'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isOdia ? 'ଭାଷା, ଅଙ୍କ ଫର୍ମାଟ୍ ଏବଂ ପ୍ରିୟ ଦଳ ଚୟନ କରନ୍ତୁ' : 'Configure language, numerals, and favorites'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          {/* Language Selection */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{isOdia ? 'ପ୍ରାଥମିକ ଭାଷା (Language)' : 'Primary Language'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('odia')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  language === 'odia'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm">ଓଡ଼ିଆ</span>
                  <span className="text-[11px] text-slate-500 font-normal">ମୂଳ ଓ ଡିଫଲ୍ଟ ଭାଷା</span>
                </div>
                {language === 'odia' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={() => setLanguage('english')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  language === 'english'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm">English</span>
                  <span className="text-[11px] text-slate-500 font-normal">Secondary interface</span>
                </div>
                {language === 'english' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Numeral System Format */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>{isOdia ? 'ସ୍କୋର ଓ ଅଙ୍କ ଲିପି (Numeral System)' : 'Numeral Format'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUseOdiaDigits(true)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  useOdiaDigits
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm font-mono">୧୨୩୪୫୬୭୮୯</span>
                  <span className="text-[11px] text-slate-500 font-normal">ଓଡ଼ିଆ ଅଙ୍କ (ଉଦାହରଣ: ୧୮୪/୩)</span>
                </div>
                {useOdiaDigits && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                onClick={() => setUseOdiaDigits(false)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  !useOdiaDigits
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="block text-sm font-mono">123456789</span>
                  <span className="text-[11px] text-slate-500 font-normal">Standard digits (184/3)</span>
                </div>
                {!useOdiaDigits && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Live Simulator Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Moon className="w-4 h-4 text-slate-700" />
                <span>{isOdia ? 'ଥିମ୍ (ଆଲୋକ / ଅନ୍ଧାର)' : 'Theme'}</span>
              </span>
              <p className="text-slate-500">
                {isOdia ? 'ଡାର୍କ ମୋଡ୍ ଚାଲୁ କରନ୍ତୁ' : 'Toggle dark mode'}
              </p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                theme === 'dark' ? 'bg-slate-900' : 'bg-slate-300'
              }`}
              aria-label="Toggle theme"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-3 h-3 text-slate-900" /> : <Sun className="w-3 h-3 text-amber-500" />}
              </div>
            </button>
          </div>

          {/* Live Simulator Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>{isOdia ? 'ସ୍ୱୟଂକ୍ରିୟ ଲାଇଭ୍ ମ୍ୟାଚ୍ ସିମୁଲେଟର୍' : 'Live Ball Simulator'}</span>
              </span>
              <p className="text-slate-500">
                {isOdia
                  ? 'ପ୍ରତି ୧୨ ସେକେଣ୍ଡରେ ଭାରତ ବନାମ ଅଷ୍ଟ୍ରେଲିଆ ମ୍ୟାଚ୍‌ରେ ନୂଆ ବଲ୍ ଏବଂ ରନ୍ ଯୋଗ କରନ୍ତୁ'
                  : 'Simulate realistic live ball delivery updates automatically'}
              </p>
            </div>
            <button
              onClick={() => setIsSimulatingLive(!isSimulatingLive)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                isSimulatingLive ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isSimulatingLive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Favorite Teams Selection */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>{isOdia ? 'ପ୍ରିୟ କ୍ରିକେଟ୍ ଦଳ (Favourite Teams)' : 'Favourite Teams'}</span>
            </label>
            <p className="text-slate-500">
              {isOdia ? 'ଆପଣଙ୍କ ପ୍ରିୟ ଦଳର ମ୍ୟାଚ୍ ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ ପ୍ରଥମେ ଦେଖାଯିବ।' : 'Selected teams will be highlighted.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {allTeamsList.map((t) => {
                const selected = favouriteTeams.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleFavouriteTeam(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: t.flagColor }}
                      />
                      <span>{t.nameOdia}</span>
                    </div>
                    {selected && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isOdia ? 'ସମ୍ପନ୍ନ (Save & Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
