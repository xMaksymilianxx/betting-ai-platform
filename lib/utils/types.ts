// Core Types for the entire application

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  competition: Competition;
  date: Date;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED';
  score?: Score;
  odds?: Odds;
  venue?: Venue;
  weather?: Weather;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  form: string; // e.g., "WWDLW"
  position?: number;
  statistics?: TeamStatistics;
}

export interface Competition {
  id: string;
  name: string;
  country: string;
  logo: string;
  season: string;
}

export interface Score {
  home: number;
  away: number;
  halftime?: { home: number; away: number };
}

export interface Odds {
  home: number;
  draw: number;
  away: number;
  overUnder25?: { over: number; under: number };
  btts?: { yes: number; no: number };
}

export interface TeamStatistics {
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
  cleanSheets: number;
  xG?: number; // Expected Goals
  xGA?: number; // Expected Goals Against
}

export interface Prediction {
  id: string;
  matchId: string;
  type: 'MATCH_WINNER' | 'OVER_UNDER' | 'BTTS' | 'CORRECT_SCORE';
  prediction: string;
  confidence: number; // 0-100
  expectedValue: number; // positive = value bet
  aiInsights: AIInsight[];
  modelBreakdown: ModelPrediction[];
  createdAt: Date;
}

export interface AIInsight {
  factor: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface ModelPrediction {
  modelName: string;
  prediction: string;
  confidence: number;
  weight: number;
}

export interface BettingDecision {
  recommendation: 'STRONG_BET' | 'MODERATE_BET' | 'PASS' | 'AVOID';
  confidence: number;
  expectedValue: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  stakeRecommendation: number;
  reasoning: string[];
  alternativeMarkets: string[];
}

export interface Venue {
  name: string;
  city: string;
  capacity?: number;
}

export interface Weather {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
}

export interface PerformanceMetrics {
  accuracy7d: number;
  accuracy30d: number;
  accuracyAllTime: number;
  roi7d: number;
  roi30d: number;
  totalPredictions: number;
  correctPredictions: number;
  profitLoss: number;
}
