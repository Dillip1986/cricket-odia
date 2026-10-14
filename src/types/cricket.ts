export type MatchFormat = 'T20' | 'ODI' | 'TEST';

export interface MatchReminder {
  id: string;
  matchId: string;
  matchTitleOdia: string;
  matchTitleEn: string;
  format: MatchFormat;
  dateStrOdia: string;
  venueOdia: string;
  addedAt: number;
  isTriggered?: boolean;
}

export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED';
export type MatchCategory = 'INTERNATIONAL' | 'IPL' | 'DOMESTIC' | 'WOMEN';

export interface BatsmanLiveState {
  name: string;
  nameOdia: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOnStrike: boolean;
}

export interface BowlerLiveState {
  name: string;
  nameOdia: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface TeamMatchInfo {
  id: string;
  name: string;
  nameOdia: string;
  shortName: string;
  shortNameOdia: string;
  flagColor: string;
  /** Absolute team logo URL (optional; UI falls back to the color dot). */
  logoUrl?: string;
  score?: number;
  wickets?: number;
  overs?: string;
  isBatting?: boolean;
  inningsDescription?: string; // e.g. "1st Innings"
  secondInningsScore?: number; // For Test matches
  secondInningsWickets?: number;
  secondInningsOvers?: string;
}

export interface CommentaryDelivery {
  id: string;
  over: string; // e.g. "18.4"
  runs: number;
  event: 'DOT' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'SIX' | 'WICKET' | 'WIDE' | 'NO_BALL' | 'BYE';
  commentaryOdia: string;
  commentaryEn: string;
  batsmanNameOdia: string;
  bowlerNameOdia: string;
  batsmanNameEn: string;
  bowlerNameEn: string;
  timestamp: string;
  isKeyMoment?: boolean;
}

export interface BattingScorecardRow {
  batsmanName: string;
  batsmanNameOdia: string;
  dismissal: string; // e.g. "c କୋହଲି b ବୁମରା" or "ନଟ୍ ଆଉଟ୍"
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
}

export interface BowlingScorecardRow {
  bowlerName: string;
  bowlerNameOdia: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

export interface FallOfWicket {
  score: number;
  wicketNumber: number;
  over: string;
  batsmanOdia: string;
}

export interface InningsScorecard {
  teamName: string;
  teamNameOdia: string;
  inningsNumber: number;
  runs: number;
  wickets: number;
  overs: string;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    total: number;
  };
  batting: BattingScorecardRow[];
  bowling: BowlingScorecardRow[];
  fallOfWickets: FallOfWicket[];
}

export interface MatchPlayer {
  id: string;
  name: string;
  nameOdia: string;
  roleOdia: string;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  avatarUrl?: string;
}

export interface Match {
  id: string;
  title: string;
  titleOdia: string;
  series: string;
  seriesOdia: string;
  format: MatchFormat;
  status: MatchStatus;
  statusTextOdia: string;
  category: MatchCategory;
  team1: TeamMatchInfo;
  team2: TeamMatchInfo;
  currentRunRate?: string;
  requiredRunRate?: string;
  target?: number;
  venue: string;
  venueOdia: string;
  venueCityOdia: string;
  dateStrOdia: string;
  dateStrEn: string;
  tossOdia: string;
  playerOfTheMatchOdia?: string;
  currentBatsmen?: BatsmanLiveState[];
  currentBowlers?: BowlerLiveState[];
  partnershipOdia?: string;
  recentBalls?: string[]; // e.g. ["1", "4", "0", "W", "6", "1"]
  commentary: CommentaryDelivery[];
  scorecards: InningsScorecard[];
  playingXI: {
    team1: MatchPlayer[];
    team2: MatchPlayer[];
  };
  umpiresOdia?: string;
  refereeOdia?: string;
  isVerifiedApi?: boolean;
  /** English live summary from the verified API (shown when UI is in English). */
  liveSummaryEn?: string;
}

export interface NewsArticle {
  id: string;
  titleOdia: string;
  titleEn: string;
  summaryOdia: string;
  contentOdia: string;
  categoryOdia: string;
  categoryEn: string;
  publishedAtOdia: string;
  publishedAtEn: string;
  readTimeOdia: string;
  authorOdia: string;
  imageUrl?: string;
  tagsOdia: string[];
  isFeatured?: boolean;
  viewsCount?: number;
}

export interface PointsTableRow {
  id: string;
  teamOdia: string;
  teamEn: string;
  shortName: string;
  flagColor: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  nrr: string;
  form: ('W' | 'L' | 'D' | 'NR')[];
}

export interface SeriesInfo {
  id: string;
  nameOdia: string;
  nameEn: string;
  format: MatchFormat;
  datesOdia: string;
  matchesCount: number;
  standings?: PointsTableRow[];
}

export interface PlayerProfile {
  id: string;
  nameOdia: string;
  nameEn: string;
  teamOdia: string;
  teamEn: string;
  country: string;
  roleOdia: string;
  roleEn: string;
  battingStyleOdia: string;
  bowlingStyleOdia: string;
  bornOdia: string;
  stats: {
    test: { matches: number; runs: number; hs: string; avg: number; sr: number; hundreds: number; fifties: number; wickets: number; bbi: string };
    odi: { matches: number; runs: number; hs: string; avg: number; sr: number; hundreds: number; fifties: number; wickets: number; bbi: string };
    t20i: { matches: number; runs: number; hs: string; avg: number; sr: number; hundreds: number; fifties: number; wickets: number; bbi: string };
  };
  recentPerformancesOdia: string[];
}

export interface RankingEntry {
  rank: number;
  nameOdia: string;
  nameEn: string;
  countryOdia: string;
  rating: number;
  change: 'up' | 'down' | 'same';
}
