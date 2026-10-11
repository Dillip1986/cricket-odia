import React from 'react';
import { X, Bell, Trash2, ChevronRight, Clock, MapPin, ArrowLeft, Send } from 'lucide-react';
import { useCricket } from '../context/CricketContext';

interface RemindersModalProps {
  onClose: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({ onClose }) => {
  const {
    reminders,
    dismissReminder,
    matches,
    setSelectedMatch,
    triggerTestNotification,
    language,
  } = useCricket();

  const isOdia = language === 'odia';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[88vh]">
        {/* Header with Back button and Close */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
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
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {isOdia ? 'ମ୍ୟାଚ୍ ରିମାଇଣ୍ଡର୍ ଓ ଆଲର୍ଟ' : 'Match Reminders & Alerts'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {isOdia ? `${reminders.length} ଟି ମ୍ୟାଚ୍ ସ୍ମାରକୀ ସେଭ୍ ହୋଇଛି` : `${reminders.length} match alerts saved`}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="ବନ୍ଦ କରନ୍ତୁ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs">
          {/* Quick Simulation Trigger action */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 block">
                {isOdia ? 'ପୁଶ୍-ନୋଟିଫିକେସନ୍ ଟେଷ୍ଟ କରନ୍ତୁ' : 'Test Push-Notification'}
              </span>
              <p className="text-emerald-800 text-[11px]">
                {isOdia
                  ? 'କ୍ଲିକ୍ କଲେ ଡ୍ୟାସବୋର୍ଡ ଶୀର୍ଷରେ ତୁରନ୍ତ ଏକ ଲାଇଭ୍ ଆଲର୍ଟ ଦେଖାଯିବ।'
                  : 'Triggers an alert banner at the top of the dashboard.'}
              </p>
            </div>
            <button
              onClick={triggerTestNotification}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>{isOdia ? 'ଟେଷ୍ଟ ଆଲର୍ଟ' : 'Test Alert'}</span>
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">
                {isOdia ? 'କୌଣସି ସ୍ମାରକୀ ସେଟ୍ ହୋଇନାହିଁ' : 'No active match reminders'}
              </p>
              <p className="text-slate-500 max-w-xs mx-auto">
                {isOdia
                  ? 'ଆଗାମୀ ମ୍ୟାଚ୍ କାର୍ଡରେ ଥିବା ଘଣ୍ଟି (🔔) ଆଇକନ୍ ଉପରେ କ୍ଲିକ୍ କରି ଆଲର୍ଟ ସେଟ୍ କରନ୍ତୁ।'
                  : 'Click the bell icon on upcoming matches to receive starting alerts.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders.map((rem) => {
                const targetMatch = matches.find((m) => m.id === rem.matchId);

                return (
                  <div
                    key={rem.id}
                    className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {rem.format}
                          </span>
                          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rem.dateStrOdia}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {isOdia ? rem.matchTitleOdia : rem.matchTitleEn}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{rem.venueOdia}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissReminder(rem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={isOdia ? 'ସ୍ମାରକୀ ହଟାନ୍ତୁ' : 'Remove reminder'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-medium">
                        {isOdia ? '🔔 ଆଲର୍ଟ ସକ୍ରିୟ ଅଛି' : '🔔 Alert Active'}
                      </span>
                      {targetMatch && (
                        <button
                          onClick={() => {
                            setSelectedMatch(targetMatch);
                            onClose();
                          }}
                          className="text-[11px] font-semibold text-slate-800 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isOdia ? 'ମ୍ୟାଚ୍ ସେଣ୍ଟର' : 'Match Centre'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Back button */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isOdia ? 'ପଛକୁ ଫେରନ୍ତୁ' : 'Go Back'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            {isOdia ? 'ଠିକ୍ ଅଛି' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
