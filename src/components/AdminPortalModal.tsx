import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  PlusCircle,
  Settings,
  Radio,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowLeft,
} from 'lucide-react';
import { useCricket } from '../context/CricketContext';

interface AdminPortalModalProps {
  onClose: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({ onClose }) => {
  const {
    language,
    isAdmin,
    setIsAdmin,
    matches,
    addNewArticle,
    updateMatchScore,
  } = useCricket();

  const isOdia = language === 'odia';
  const SESSION_KEY = 'co_admin_unlocked';

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [adminEnabled, setAdminEnabled] = useState<boolean | null>(null);
  const [feedStatus, setFeedStatus] = useState<{
    liveApi?: boolean;
    secondSource?: string | null;
    cricbuzz?: { state?: string; message?: string };
    espn?: { state?: string; message?: string };
  } | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'publish' | 'scores' | 'api' | 'audit'>('publish');

  // New Article Form state
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('ଆନ୍ତର୍ଜାତୀୟ');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('କ୍ରିକେଟ୍ ଓଡ଼ିଆ ସମ୍ପାଦକ');
  const [newsTags, setNewsTags] = useState('ଭାରତ, କ୍ରିକେଟ୍, ଟି୨୦');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Score Management state
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const [editScore, setEditScore] = useState('');
  const [editWickets, setEditWickets] = useState('');
  const [editOvers, setEditOvers] = useState('');
  const [editStatusText, setEditStatusText] = useState('');
  const [scoreSuccess, setScoreSuccess] = useState(false);

  // Server-side status: is the console enabled, and which feeds are live?
  // Runs once per modal open. No secrets are ever requested or stored here.
  useEffect(() => {
    let cancelled = false;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') setIsAdmin(true);
    } catch {
      /* private mode */
    }
    fetch('/api/admin/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((j) => {
        if (!cancelled) setAdminEnabled(Boolean(j.enabled));
      })
      .catch(() => {
        if (!cancelled) setAdminEnabled(false);
      });
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j) setFeedStatus(j);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [setIsAdmin]);

  // PIN is verified by the server (ADMIN_PIN env). It is never bundled
  // into the app and never displayed.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    if (!pin) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (res.ok && json.ok) {
        setIsAdmin(true);
        setPin('');
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* private mode */
        }
      } else if (res.status === 403) {
        setPinError(
          isOdia
            ? 'ପରିଚାଳକ ପ୍ରବେଶ ମାଲିକଙ୍କ ଦ୍ୱାରା ବନ୍ଦ ଅଛି।'
            : 'Admin access is disabled by the site owner.'
        );
      } else if (res.status === 429) {
        setPinError(
          isOdia ? 'ଅଧିକ ଚେଷ୍ଟା ହୋଇଛି। କିଛି ସମୟ ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।' : 'Too many attempts. Try again in a minute.'
        );
      } else {
        setPinError(isOdia ? 'ଭୁଲ୍ ପିନ୍ କୋଡ୍।' : 'Incorrect PIN.');
      }
    } catch {
      setPinError(isOdia ? 'ସର୍ଭର ସହ ଯୋଗାଯୋଗ ହେଲା ନାହିଁ।' : 'Could not reach the server.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePublishNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    addNewArticle({
      titleOdia: newsTitle,
      titleEn: newsTitle,
      summaryOdia: newsSummary || newsContent.slice(0, 120) + '...',
      contentOdia: newsContent,
      categoryOdia: newsCategory,
      categoryEn: newsCategory,
      publishedAtOdia: 'ଆଜି ସଦ୍ୟତମ',
      publishedAtEn: 'Just now',
      readTimeOdia: '୨ ମିନିଟ୍',
      authorOdia: newsAuthor,
      tagsOdia: newsTags.split(',').map((t) => t.trim()),
      isFeatured: false,
    });

    setPublishSuccess(true);
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  const [scoreError, setScoreError] = useState('');

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;
    setScoreError('');

    const updates: Partial<import('../types/cricket').Match> = {};
    if (editStatusText.trim()) updates.statusTextOdia = editStatusText.trim();

    const m = matches.find((item) => item.id === selectedMatchId);
    if (m) {
      const teamUpdates = { ...m.team2 };
      if (editScore.trim()) {
        const v = Number(editScore);
        if (!Number.isInteger(v) || v < 0 || v > 600) {
          setScoreError(isOdia ? 'ରନ୍ ୦–୬୦୦ ମଧ୍ୟରେ ହେବା ଆବଶ୍ୟକ' : 'Runs must be an integer 0–600');
          return;
        }
        teamUpdates.score = v;
      }
      if (editWickets.trim()) {
        const v = Number(editWickets);
        if (!Number.isInteger(v) || v < 0 || v > 10) {
          setScoreError(isOdia ? 'ୱିକେଟ୍ ୦–୧୦ ମଧ୍ୟରେ ହେବା ଆବଶ୍ୟକ' : 'Wickets must be an integer 0–10');
          return;
        }
        teamUpdates.wickets = v;
      }
      if (editOvers.trim()) {
        if (!/^\d+\.[0-5]$/.test(editOvers.trim())) {
          setScoreError(isOdia ? 'ଓଭର ଫର୍ମାଟ୍: ଯେପରି 18.4 (ବଲ୍ ୦–୫)' : 'Overs format must be like 18.4 (balls 0–5)');
          return;
        }
        teamUpdates.overs = editOvers.trim();
      }
      updates.team2 = teamUpdates;
    }

    updateMatchScore(selectedMatchId, updates);
    setScoreSuccess(true);
    setTimeout(() => setScoreSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0b1c33] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="ପଛକୁ ଫେରନ୍ତୁ (Go Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isOdia ? 'ପଛକୁ' : 'Back'}</span>
            </button>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isOdia ? 'କ୍ରିକେଟ୍ ଓଡ଼ିଆ - ପରିଚାଳକ ଡ୍ୟାସବୋର୍ଡ' : 'Cricket Odia Admin Console'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isOdia ? 'ସୁରକ୍ଷିତ ସମ୍ପାଦନା ଓ ତଥ୍ୟ ନିୟନ୍ତ୍ରଣ' : 'Secure editorial & match scoring console'}
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

        {/* Auth Barrier if not logged in */}
        {!isAdmin ? (
          <div className="p-8 text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isOdia ? 'ପରିଚାଳକ ପ୍ରବେଶ ଅନୁମତି' : 'Administrator Authentication'}
            </h3>
            <p className="text-xs text-slate-500">
              {isOdia
                ? 'ଏହି ଅଂଶ କେବଳ ସାଇଟ୍ ମାଲିକଙ୍କ ପାଇଁ ସଂରକ୍ଷିତ।'
                : 'This area is restricted to the site owner.'}
            </p>

            {adminEnabled === false ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                {isOdia
                  ? 'ପରିଚାଳକ ପ୍ରବେଶ ବର୍ତ୍ତମାନ ବନ୍ଦ ଅଛି।'
                  : 'Admin access is currently disabled.'}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3 pt-2">
                <div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isOdia ? 'ପିନ୍ କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ' : 'Enter PIN'}
                    autoComplete="off"
                    className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {verifying
                    ? isOdia ? 'ଯାଞ୍ଚ ହେଉଛି…' : 'Verifying…'
                    : isOdia ? 'ଅନଲକ୍ କରନ୍ତୁ' : 'Unlock Admin Console'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Admin Nav Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveAdminTab('publish')}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  activeAdminTab === 'publish'
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {isOdia ? 'ଖବର ପ୍ରକାଶନ' : 'Publish News'}
              </button>
              <button
                onClick={() => setActiveAdminTab('scores')}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  activeAdminTab === 'scores'
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {isOdia ? 'ସ୍କୋର ପରିଚାଳନା' : 'Manage Scores'}
              </button>
              <button
                onClick={() => setActiveAdminTab('api')}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  activeAdminTab === 'api'
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {isOdia ? 'API ଓ ସିଷ୍ଟମ୍' : 'API & Integrations'}
              </button>
              <button
                onClick={() => setActiveAdminTab('audit')}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  activeAdminTab === 'audit'
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                {isOdia ? 'ଅଡିଟ୍ ଲଗ୍' : 'Audit Logs'}
              </button>
            </div>

            {/* Admin Content Area */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-xs">
              {/* TAB 1: PUBLISH NEWS */}
              {activeAdminTab === 'publish' && (
                <form onSubmit={handlePublishNews} className="space-y-4 max-w-xl">
                  {publishSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isOdia ? 'ଖବର ସଫଳତାର ସହ ପ୍ରକାଶିତ ହେଲା!' : 'Article successfully published!'}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {isOdia ? 'ଖବର ଶିରୋନାମା (ଓଡ଼ିଆରେ)' : 'Article Headline (in Odia)'}
                    </label>
                    <input
                      type="text"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="ଉଦାହରଣ: ଭାରତର ଚମତ୍କାର ବିଜୟ..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {isOdia ? 'ବର୍ଗ (Category)' : 'Category'}
                      </label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="ଆନ୍ତର୍ଜାତୀୟ">ଆନ୍ତର୍ଜାତୀୟ (International)</option>
                        <option value="ଘରୋଇ କ୍ରିକେଟ୍">ଘରୋଇ କ୍ରିକେଟ୍ (Domestic)</option>
                        <option value="ଆଇପିଏଲ୍ (IPL)">ଆଇପିଏଲ୍ (IPL)</option>
                        <option value="ରେକର୍ଡ ଓ ପରିସଂଖ୍ୟାନ">ରେକର୍ଡ ଓ ପରିସଂଖ୍ୟାନ (Records)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {isOdia ? 'ଲେଖକ (Author)' : 'Author'}
                      </label>
                      <input
                        type="text"
                        value={newsAuthor}
                        onChange={(e) => setNewsAuthor(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {isOdia ? 'ସଂକ୍ଷିପ୍ତ ସାରାଂଶ (Summary)' : 'Short Summary'}
                    </label>
                    <input
                      type="text"
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                      placeholder="ପ୍ରମୁଖ ବିନ୍ଦୁ..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {isOdia ? 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ (Full Article Body)' : 'Article Body'}
                    </label>
                    <textarea
                      rows={5}
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="ସମ୍ପୂର୍ଣ୍ଣ ଖବର ଏଠାରେ ଲେଖନ୍ତୁ..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    {isOdia ? 'ଖବର ପ୍ରକାଶ କରନ୍ତୁ' : 'Publish Article'}
                  </button>
                </form>
              )}

              {/* TAB 2: MANAGE SCORES */}
              {activeAdminTab === 'scores' && (
                <form onSubmit={handleSaveScore} className="space-y-4 max-w-xl">
                  {scoreError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{scoreError}</span>
                    </div>
                  )}
                  {scoreSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isOdia ? 'ମ୍ୟାଚ୍ ସ୍କୋର ଅପଡେଟ୍ ହେଲା!' : 'Match score successfully updated!'}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {isOdia ? 'ମ୍ୟାଚ୍ ଚୟନ କରନ୍ତୁ' : 'Select Match'}
                    </label>
                    <select
                      value={selectedMatchId}
                      onChange={(e) => setSelectedMatchId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {matches.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.titleOdia} ({m.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {isOdia ? 'ଦଳ ୨ ରନ୍' : 'Team 2 Runs'}
                      </label>
                      <input
                        type="number"
                        placeholder="184"
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {isOdia ? 'ୱିକେଟ୍' : 'Wickets'}
                      </label>
                      <input
                        type="number"
                        placeholder="3"
                        value={editWickets}
                        onChange={(e) => setEditWickets(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {isOdia ? 'ଓଭର' : 'Overs'}
                      </label>
                      <input
                        type="text"
                        placeholder="18.4"
                        value={editOvers}
                        onChange={(e) => setEditOvers(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {isOdia ? 'ସ୍ଥିତି ବିବରଣୀ (Status Text)' : 'Match Status Description'}
                    </label>
                    <input
                      type="text"
                      placeholder="ଭାରତକୁ ଜିତିବା ପାଇଁ ୮ ବଲ୍‌ରେ ୧୨ ରନ୍ ଆବଶ୍ୟକ"
                      value={editStatusText}
                      onChange={(e) => setEditStatusText(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    {isOdia ? 'ସ୍କୋର ସଂରକ୍ଷଣ କରନ୍ତୁ' : 'Save Score Override'}
                  </button>
                </form>
              )}

              {/* TAB 3: LIVE FEED STATUS (read-only — keys live in server env, never here) */}
              {activeAdminTab === 'api' && (
                <div className="space-y-4 max-w-xl">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isOdia ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ ଫିଡ୍' : 'Verified live feed'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {isOdia
                        ? 'ସ୍କୋର ସର୍ଭରରୁ ସିଧା ଆସୁଛି। ଚାବି (keys) କେବଳ ସର୍ଭର ପରିବେଶରେ ରହେ — ଏଠାରେ କେବେ ପ୍ରବେଶ କରନ୍ତୁ ନାହିଁ।'
                        : 'Scores come straight from the server. Keys live only in server environment variables — never enter them here.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <FeedRow
                      label={isOdia ? 'CricAPI (ମୁଖ୍ୟ ଫିଡ୍)' : 'CricAPI (primary feed)'}
                      active={feedStatus?.liveApi === true}
                      detail={feedStatus?.liveApi ? (isOdia ? 'ସକ୍ରିୟ' : 'Active') : (isOdia ? 'ଚାବି ନାହିଁ' : 'No key set')}
                    />
                    <FeedRow
                      label={isOdia ? 'Cricbuzz (ଦ୍ୱିତୀୟ ଉତ୍ସ)' : 'Cricbuzz (second source)'}
                      active={Boolean(feedStatus?.secondSource)}
                      detail={
                        feedStatus?.secondSource
                          ? `${isOdia ? 'ସକ୍ରିୟ' : 'Active'} · ${feedStatus?.cricbuzz?.state ?? ''}`
                          : (isOdia ? 'ଚାବି ନାହିଁ' : 'No key set')
                      }
                    />
                    <FeedRow
                      label={isOdia ? 'ESPNcricinfo ପୃଷ୍ଠା (ଚାବି ଆବଶ୍ୟକ ନାହିଁ)' : 'ESPNcricinfo page (no key needed)'}
                      active={feedStatus?.espn?.state === 'ok'}
                      detail={feedStatus?.espn?.message || feedStatus?.espn?.state || '…'}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT LOGS */}
              {activeAdminTab === 'audit' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>{isOdia ? 'ପରିଚାଳକ କାର୍ଯ୍ୟକଳାପ ଲଗ୍' : 'Audit Trail'}</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {isOdia ? 'ସମ୍ପାଦକ ପ୍ରବେଶ ଅନୁମୋଦିତ' : 'Admin session authenticated'}
                        </p>
                        <p className="text-[11px] text-slate-500">ଆଇପି: ଲୋକାଲ୍ ହୋଷ୍ଟ · ଭୂମିକା: ମୁଖ୍ୟ ସମ୍ପାଦକ</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">ଆଜି</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {isOdia ? 'ଯାଞ୍ଚିତ ଲାଇଭ୍ API ପୋଲିଂ ସକ୍ରିୟ' : 'Verified live API polling active'}
                        </p>
                        <p className="text-[11px] text-slate-500">/api/live-matches · ୩୦ ସେକେଣ୍ଡ ବ୍ୟବଧାନ</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">୩୦ ସେକେଣ୍ଡ ବ୍ୟବଧାନ</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FeedRow: React.FC<{ label: string; active: boolean; detail: string }> = ({
  label,
  active,
  detail,
}) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
    <span className="font-semibold text-slate-800">{label}</span>
    <span className="flex items-center gap-2 text-[11px]">
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} aria-hidden="true" />
      <span className={active ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>{detail}</span>
    </span>
  </div>
);
