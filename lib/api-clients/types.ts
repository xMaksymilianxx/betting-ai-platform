// Complete TypeScript definitions for all APIs

export interface Match {
  id: string;
  home: string;
  away: string;
  league: string;
  country?: string;
  sport: string;
  status: 'live' | 'scheduled' | 'finished';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  score?: string;
  time: string;
  statistics?: MatchStatistics;
  odds?: MatchOdds;
  form?: TeamForm;
  venue?: string;
  referee?: string;
}

export interface MatchStatistics {
  corners?: number;
  homeCorners?: number;
  awayCorners?: number;
  cards?: number;
  homeCards?: number;
  awayCards?: number;
  redCards?: number;
  shots?: number;
  homeShots?: number;
  awayShots?: number;
  shotsOnTarget?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  possession?: number;
  homePossession?: number;
  awayPossession?: number;
  attacks?: number;
  homeAttacks?: number;
  awayAttacks?: number;
  dangerousAttacks?: number;
  homeDangerousAttacks?: number;
  awayDangerousAttacks?: number;
  offsides?: number;
  homeOffsides?: number;
  awayOffsides?: number;
  fouls?: number;
  homeFouls?: number;
  awayFouls?: number;
  saves?: number;
  homeSaves?: number;
  awaySaves?: number;
}

export interface MatchOdds {
  home?: number;
  draw?: number;
  away?: number;
  over05?: number;
  under05?: number;
  over15?: number;
  under15?: number;
  over25?: number;
  under25?: number;
  over35?: number;
  under35?: number;
  over45?: number;
  under45?: number;
  bttsYes?: number;
  bttsNo?: number;
  handicap?: HandicapOdds[];
  doubleChance?: DoubleChanceOdds;
  firstHalf?: FirstHalfOdds;
}

export interface HandicapOdds {
  line: number;
  home: number;
  away: number;
}

export interface DoubleChanceOdds {
  homeOrDraw?: number;
  homeOrAway?: number;
  drawOrAway?: number;
}

export interface FirstHalfOdds {
  home?: number;
  draw?: number;
  away?: number;
  over05?: number;
  under05?: number;
}

export interface TeamForm {
  homeForm?: string[]; // ['W', 'L', 'D', 'W', 'W']
  awayForm?: string[];
  homeGoalsScored?: number;
  homeGoalsConceded?: number;
  awayGoalsScored?: number;
  awayGoalsConceded?: number;
  homeWinRate?: number;
  awayWinRate?: number;
  h2h?: H2HData;
}

export interface H2HData {
  homeWins?: number;
  draws?: number;
  awayWins?: number;
  lastMeetings?: H2HMatch[];
  avgGoals?: number;
  bttsPercentage?: number;
}

export interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

export interface APIConfig {
  enabled: boolean;
  priority: number;
  key?: string;
  rateLimit: number;
  features: APIFeatures;
}

export interface APIFeatures {
  liveMatches: boolean;
  scheduledMatches: boolean;
  statistics: boolean;
  odds: boolean;
  form: boolean;
  h2h: boolean;
  lineups: boolean;
}

export interface APIResponse {
  success: boolean;
  matches: Match[];
  source: string;
  cached: boolean;
  timestamp: string;
}
