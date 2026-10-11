import React from 'react';
import { Home, Radio, Calendar, Newspaper, Trophy } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { language } = useCricket();
  const isOdia = language === 'odia';

  const navItems = [
    { id: 'home', labelOdia: 'ମୁଖ୍ୟ', labelEn: 'Home', icon: Home },
    { id: 'live', labelOdia: 'ଲାଇଭ୍', labelEn: 'Live', icon: Radio },
    { id: 'fixtures', labelOdia: 'ଖେଳସୂଚୀ', labelEn: 'Fixtures', icon: Calendar },
    { id: 'news', labelOdia: 'ଖବର', labelEn: 'News', icon: Newspaper },
    { id: 'standings', labelOdia: 'ପଏଣ୍ଟ', labelEn: 'Table', icon: Trophy },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#091a32]/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.id === 'live' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {isOdia ? item.labelOdia : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
