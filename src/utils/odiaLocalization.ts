/**
 * Odia Localization utilities for Cricket Odia (କ୍ରିକେଟ୍ ଓଡ଼ିଆ)
 */

export const odiaNumeralsMap: { [key: string]: string } = {
  '0': '୦',
  '1': '୧',
  '2': '୨',
  '3': '୩',
  '4': '୪',
  '5': '୫',
  '6': '୬',
  '7': '୭',
  '8': '୮',
  '9': '୯',
};

export const englishNumeralsMap: { [key: string]: string } = {
  '୦': '0',
  '୧': '1',
  '୨': '2',
  '୩': '3',
  '୪': '4',
  '୫': '5',
  '୬': '6',
  '୭': '7',
  '୮': '8',
  '୯': '9',
};

/**
 * Converts any numeric digits inside a string or number to Odia script
 */
export function toOdiaDigits(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  return str.replace(/[0-9]/g, (digit) => odiaNumeralsMap[digit] || digit);
}

/**
 * Formats score display: e.g. "184/3 (19.2)" in Odia or standard numerals
 */
export function formatScore(
  runs?: number,
  wickets?: number,
  overs?: string,
  useOdiaDigits: boolean = true
): string {
  if (runs === undefined) return '';
  const w = wickets !== undefined ? wickets : 0;
  const raw = `${runs}/${w}${overs ? ` (${overs} ଓଭର)` : ''}`;
  return useOdiaDigits ? toOdiaDigits(raw) : raw;
}

export const ODIA_DICTIONARY = {
  appName: 'କ୍ରିକେଟ୍ ଓଡ଼ିଆ',
  tagline: 'ଭାରତ ଓ ବିଶ୍ୱ କ୍ରିକେଟ୍‌ର ଲାଇଭ୍ ସ୍କୋର, ସ୍କୋରକାର୍ଡ ଓ ଧାରାବିବରଣୀ',
  // Navigation
  navHome: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
  navLiveScores: 'ଲାଇଭ୍ ସ୍କୋର',
  navFixtures: 'ଖେଳସୂଚୀ',
  navSeries: 'ଟୁର୍ଣ୍ଣାମେଣ୍ଟ',
  navStandings: 'ପଏଣ୍ଟ ଟେବୁଲ',
  navNews: 'ଖବର',
  navRankings: 'ର‍୍ୟାଙ୍କିଙ୍ଗ୍',
  navTeams: 'ଦଳ ଓ ଖେଳାଳି',
  navAdmin: 'ପରିଚାଳକ',
  navSettings: 'ସେଟିଂସ୍',
  // Filters
  filterAll: 'ସମସ୍ତ',
  filterLive: 'ଲାଇଭ୍',
  filterUpcoming: 'ଆଗାମୀ',
  filterResults: 'ସମାପ୍ତ',
  filterInternational: 'ଆନ୍ତର୍ଜାତୀୟ',
  filterIPL: 'ଆଇପିଏଲ୍ (IPL)',
  filterDomestic: 'ଘରୋଇ',
  filterWomen: 'ମହିଳା',
  // Match Status
  statusLive: 'ଲାଇଭ୍ ମ୍ୟାଚ୍',
  statusUpcoming: 'ଆଗାମୀ ମ୍ୟାଚ୍',
  statusCompleted: 'ସମାପ୍ତ',
  statusInningsBreak: 'ଇନିଂସ ବିରତି',
  statusStumps: 'ଷ୍ଟମ୍ପ୍ସ (ଦିନ ସମାପ୍ତ)',
  statusRain: 'ବର୍ଷା ବାଧାପ୍ରାପ୍ତ',
  // Match Card Elements
  crr: 'ସାମ୍ପ୍ରତିକ ରନ୍ ହାର (CRR)',
  rrr: 'ଆବଶ୍ୟକ ରନ୍ ହାର (RRR)',
  target: 'ଲକ୍ଷ୍ୟ',
  needRuns: 'ଜିତିବା ପାଇଁ ଆବଶ୍ୟକ',
  fromBalls: 'ବଲ୍‌ରୁ',
  runs: 'ରନ୍',
  wickets: 'ୱିକେଟ୍',
  overs: 'ଓଭର',
  toss: 'ଟସ୍',
  venue: 'ଷ୍ଟାଡିୟମ୍',
  mom: 'ମ୍ୟାନ୍ ଅଫ୍ ଦି ମ୍ୟାଚ୍',
  matchCentre: 'ମ୍ୟାଚ୍ ସେଣ୍ଟର ଦେଖନ୍ତୁ',
  // Match Centre Tabs
  tabSummary: 'ସଂକ୍ଷିପ୍ତ ସାରାଂଶ',
  tabCommentary: 'ଲାଇଭ୍ ଧାରାବିବରଣୀ',
  tabScorecard: 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କୋରକାର୍ଡ',
  tabPlayingXI: 'ଖେଳାଳି ଏକାଦଶ',
  tabMatchInfo: 'ମ୍ୟାଚ୍ ସୂଚନା',
  tabStats: 'ପରିସଂଖ୍ୟାନ',
  // Scorecard Headings
  batter: 'ବ୍ୟାଟର',
  bowler: 'ବୋଲର',
  runsScored: 'ରନ୍',
  ballsFaced: 'ବଲ୍',
  fours: '୪ (ଚୌକା)',
  sixes: '୬ (ଛକା)',
  strikeRate: 'SR',
  oversBowled: 'ଓଭର',
  maidens: 'ମେଡେନ୍',
  wicketsTaken: 'ୱିକେଟ୍',
  economy: 'ଇକୋନୋମି',
  extras: 'ଅତିରିକ୍ତ (Extras)',
  total: 'ମୋଟ',
  fallOfWickets: 'ୱିକେଟ୍ ପତନ',
  yetToBat: 'ବ୍ୟାଟିଂ କରିନାହାଁନ୍ତି',
  partnership: 'ଭାଗୀଦାରୀ (ପାର୍ଟନରସିପ୍)',
  // Common Actions
  searchPlaceholder: 'ଦଳ, ଖେଳାଳି, ମ୍ୟାଚ୍ କିମ୍ବା ଖବର ଖୋଜନ୍ତୁ...',
  readMore: 'ସମ୍ପୂର୍ଣ୍ଣ ପଢ଼ନ୍ତୁ',
  share: 'ସେୟାର୍ କରନ୍ତୁ',
  bookmark: 'ସାଇତି ରଖନ୍ତୁ',
  refresh: 'ସଦ୍ୟତନ (ରିଫ୍ରେଶ୍)',
  autoRefresh: 'ସ୍ୱୟଂକ୍ରିୟ ଲାଇଭ୍ ଅପଡେଟ୍',
  demoNotice: 'ପ୍ରଦର୍ଶନ ତଥ୍ୟ (Demo Data) - ଏହା କେବଳ ଉଦାହରଣ ଉଦ୍ଦେଶ୍ୟରେ ଉପଲବ୍ଧ',
  today: 'ଆଜି',
  todayEn: 'Today',
};

export const ODIA_WEEKDAYS = [
  'ରବିବାର',
  'ସୋମବାର',
  'ମଙ୍ଗଳବାର',
  'ବୁଧବାର',
  'ଗୁରୁବାର',
  'ଶୁକ୍ରବାର',
  'ଶନିବାର',
];

export const ODIA_MONTHS = [
  'ଜାନୁଆରୀ',
  'ଫେବୃଆରୀ',
  'ମାର୍ଚ୍ଚ',
  'ଏପ୍ରିଲ',
  'ମଇ',
  'ଜୁନ',
  'ଜୁଲାଇ',
  'ଅଗଷ୍ଟ',
  'ସେପ୍ଟେମ୍ବର',
  'ଅକ୍ଟୋବର',
  'ନଭେମ୍ବର',
  'ଡିସେମ୍ବର',
];

const EN_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Formats a date as "ରବିବାର, ୧୧ ଅକ୍ଟୋବର ୨୦୨୬" (Odia) or
 * "Sunday, 11 October 2026" (English).
 */
export function formatFullDate(
  date: Date,
  useOdia: boolean = true,
  useOdiaDigits: boolean = true
): string {
  const weekday = useOdia ? ODIA_WEEKDAYS[date.getDay()] : EN_WEEKDAYS[date.getDay()];
  const month = useOdia ? ODIA_MONTHS[date.getMonth()] : EN_MONTHS[date.getMonth()];
  const day = useOdiaDigits && useOdia ? toOdiaDigits(date.getDate()) : String(date.getDate());
  const year = useOdiaDigits && useOdia ? toOdiaDigits(date.getFullYear()) : String(date.getFullYear());
  return `${weekday}, ${day} ${month} ${year}`;
}
