/**
 * Centralized Odia-first UI strings.
 * All user-facing text for the redesigned shell lives here —
 * components must use useStrings() instead of hardcoded ternaries.
 */
import { useCricket } from '../context/CricketContext';

const odia = {
  brandSub: 'କ୍ରିକେଟ୍ ଓଡ଼ିଆ',
  tagline: 'ପ୍ରତିଟି ବଲ୍, ପ୍ରତିଟି ସ୍କୋର — ଓଡ଼ିଆରେ',
  today: 'ଆଜି',

  navHome: 'ମୁଖ୍ୟ',
  navLive: 'ଲାଇଭ୍',
  navFixtures: 'ଖେଳସୂଚୀ',
  navStandings: 'ପଏଣ୍ଟ ଟେବୁଲ',
  navNews: 'ଖବର',
  navRankings: 'ର‍୍ୟାଙ୍କିଙ୍ଗ୍',
  navTeams: 'ଦଳ ଓ ଖେଳାଳି',
  navSeries: 'ସିରିଜ୍',
  navFavorites: 'ପସନ୍ଦ',
  navMore: 'ଅଧିକ',

  actionSearch: 'ଖୋଜନ୍ତୁ',
  searchPlaceholder: 'ଦଳ, ମ୍ୟାଚ୍, ଖେଳାଳି ଖୋଜନ୍ତୁ…',
  actionSettings: 'ସେଟିଂସ୍',
  actionAdmin: 'ପରିଚାଳକ',
  actionBookmarks: 'ସାଇତା ଖବର',
  actionReminders: 'ରିମାଇଣ୍ଡର',
  actionMenu: 'ମେନୁ',
  actionClose: 'ବନ୍ଦ କରନ୍ତୁ',
  actionBack: 'ପଛକୁ',
  actionShare: 'ସେୟାର୍',
  actionRetry: 'ପୁଣି ଚେଷ୍ଟା',

  heroBadge: 'ଓଡ଼ିଶାର କ୍ରିକେଟ୍ ପ୍ଲାଟଫର୍ମ',
  heroTitle: 'ପ୍ରତିଟି ବଲ୍‌ର ଲାଇଭ୍ ସ୍କୋର, ଓଡ଼ିଆରେ',
  heroDesc: 'ଲାଇଭ୍ ସ୍କୋର, ସ୍କୋରକାର୍ଡ, ଖେଳସୂଚୀ, ଖବର ଓ ର‍୍ୟାଙ୍କିଙ୍ଗ୍ — ସବୁ ଗୋଟିଏ ଜାଗାରେ।',
  heroLiveBtn: 'ଲାଇଭ୍ ସ୍କୋର ଦେଖନ୍ତୁ',
  heroUpcomingBtn: 'ଆଗାମୀ ମ୍ୟାଚ୍',
  liveCountSuffix: 'ଟି ଲାଇଭ୍ ଚାଲୁଅଛି',

  tickerLabel: 'ମ୍ୟାଚ୍ ଟିକର୍',
  liveApiBadge: 'ଲାଇଭ୍ API',
  liveBadge: 'ଲାଇଭ୍',
  finishedBadge: 'ସମାପ୍ତ',
  upcomingBadge: 'ଆଗାମୀ',
  viewAll: 'ସବୁ ଦେଖନ୍ତୁ',

  filterAll: 'ସମସ୍ତ',
  filterLive: 'ଲାଇଭ୍',
  filterUpcoming: 'ଆଗାମୀ',
  filterResults: 'ଫଳାଫଳ',
  filterSearch: 'ଦଳ ବା ଷ୍ଟାଡିୟମ୍ ଖୋଜନ୍ତୁ…',

  cardTarget: 'ଲକ୍ଷ୍ୟ',
  cardNeed: 'ଦରକାର',
  cardBalls: 'ବଲ୍',
  cardDetails: 'ବିବରଣୀ',
  cardRemind: 'ମନେ ପକାନ୍ତୁ',
  cardReminded: 'ସେଟ୍ ଅଛି',
  cardFavorite: 'ପସନ୍ଦ କରନ୍ତୁ',
  cardLiveMatches: 'ଲାଇଭ୍ ମ୍ୟାଚ୍',
  cardUpcomingRecent: 'ଆଗାମୀ ଓ ସଦ୍ୟ ଫଳାଫଳ',

  noMatchTitle: 'ଆଜି କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ',
  noMatchDesc: 'ଯାଞ୍ଚିତ ଲାଇଭ୍ ଫିଡ୍‌ରେ ଆଜି କୌଣସି ଖେଳ ନାହିଁ। ପରେ ପୁଣି ଦେଖନ୍ତୁ।',
  noFilterTitle: 'ଏହି ଫିଲ୍ଟର୍‌ରେ କୌଣସି ମ୍ୟାଚ୍ ମିଳିଲା ନାହିଁ',
  loadingScores: 'ଲାଇଭ୍ ସ୍କୋର ଲୋଡ୍ ହେଉଛି…',
  matchGoneTitle: 'ମ୍ୟାଚ୍ ଉପଲବ୍ଧ ନାହିଁ',
  matchGoneDesc: 'ଏହି ମ୍ୟାଚ୍ ଲାଇଭ୍ ଫିଡ୍‌ରେ ଆଉ ନାହିଁ।',
  backToScores: 'ସ୍କୋରକୁ ଫେରନ୍ତୁ',

  tabSummary: 'ସାରାଂଶ',
  tabCommentary: 'ଧାରାବିବରଣୀ',
  tabScorecard: 'ସ୍କୋରକାର୍ଡ',
  tabPlayingXI: 'ଏକାଦଶ',
  tabTeams: 'ଦଳ',
  tabInfo: 'ସୂଚନା',

  footerTagline: 'ଭାରତ ତଥା ବିଶ୍ୱ କ୍ରିକେଟ୍‌ର ଲାଇଭ୍ ସ୍କୋର, ଖବର ଓ ର‍୍ୟାଙ୍କିଙ୍ଗ୍ — ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆରେ।',
  footerLinks: 'ଶୀଘ୍ର ଲିଙ୍କ୍',
  footerLiveFeed: 'ଲାଇଭ୍ ଫିଡ୍',
  footerFeedOn: 'ଯାଞ୍ଚିତ API ସକ୍ରିୟ',
  footerFeedOff: 'ଫିଡ୍ ଅପେକ୍ଷାରେ',
  footerRights: 'ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।',
} as const;

type OdiaStrings = typeof odia;

const english: Record<keyof OdiaStrings, string> = {
  brandSub: 'Cricket Odia',
  tagline: 'Every ball, every score — in Odia',
  today: 'Today',

  navHome: 'Home',
  navLive: 'Live',
  navFixtures: 'Fixtures',
  navStandings: 'Table',
  navNews: 'News',
  navRankings: 'Rankings',
  navTeams: 'Teams',
  navSeries: 'Series',
  navFavorites: 'Favorites',
  navMore: 'More',

  actionSearch: 'Search',
  searchPlaceholder: 'Search teams, matches, players…',
  actionSettings: 'Settings',
  actionAdmin: 'Admin',
  actionBookmarks: 'Saved news',
  actionReminders: 'Reminders',
  actionMenu: 'Menu',
  actionClose: 'Close',
  actionBack: 'Back',
  actionShare: 'Share',
  actionRetry: 'Retry',

  heroBadge: "Odisha's cricket platform",
  heroTitle: 'Live ball-by-ball scores in Odia',
  heroDesc: 'Live scores, scorecards, fixtures, news and rankings — all in one place.',
  heroLiveBtn: 'View live scores',
  heroUpcomingBtn: 'Upcoming matches',
  liveCountSuffix: 'live now',

  tickerLabel: 'Matches',
  liveApiBadge: 'LIVE API',
  liveBadge: 'LIVE',
  finishedBadge: 'RESULT',
  upcomingBadge: 'Upcoming',
  viewAll: 'View all',

  filterAll: 'All',
  filterLive: 'Live',
  filterUpcoming: 'Upcoming',
  filterResults: 'Results',
  filterSearch: 'Search team or venue…',

  cardTarget: 'Target',
  cardNeed: 'Need',
  cardBalls: 'balls',
  cardDetails: 'Details',
  cardRemind: 'Remind me',
  cardReminded: 'Set',
  cardFavorite: 'Add to favorites',
  cardLiveMatches: 'Live matches',
  cardUpcomingRecent: 'Upcoming & recent results',

  noMatchTitle: 'Today there is no match',
  noMatchDesc: 'No games on the verified live feed today. Check back later.',
  noFilterTitle: 'No matches found matching these filters',
  loadingScores: 'Loading live scores…',
  matchGoneTitle: 'Match unavailable',
  matchGoneDesc: 'This match is no longer on the live feed.',
  backToScores: 'Back to scores',

  tabSummary: 'Summary',
  tabCommentary: 'Commentary',
  tabScorecard: 'Scorecard',
  tabPlayingXI: 'Playing XI',
  tabTeams: 'Teams',
  tabInfo: 'Info',

  footerTagline: 'India and world cricket — live scores, news and rankings in pure Odia.',
  footerLinks: 'Quick links',
  footerLiveFeed: 'Live feed',
  footerFeedOn: 'Verified API active',
  footerFeedOff: 'Feed pending',
  footerRights: 'All rights reserved.',
};

export type Strings = OdiaStrings;

export function useStrings(): Strings {
  const { language } = useCricket();
  return (language === 'odia' ? odia : english) as Strings;
}
