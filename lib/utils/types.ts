export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  time: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
  liveScore?: {
    home: number;
    away: number;
    minute: number;
  };
}

export interface Prediction {
  matchId: string;
  prediction: 'HOME' | 'DRAW' | 'AWAY' | 'OVER' | 'UNDER' | 'BTTS';
  confidence: number;
  expectedValue: number;
  recommendedStake: number;
  odds: number;
  reasoning: string[];
}

export interface ModelPrediction {
  model: string;
  outcome: string;
  confidence: number;
  value: number;
}

export interface ValueBet {
  matchId: string;
  market: string;
  prediction: string;
  odds: number;
  fairOdds: number;
  value: number;
  confidence: number;
  recommendation: 'STRONG_BET' | 'MODERATE_BET' | 'WEAK_BET' | 'AVOID';
}

export interface PerformanceMetrics {
  total: number;
  correct: number;
  accuracy: number;
  profit: number;
  avgConfidence: number;
  roi: number;
}

export interface TeamStats {
  name: string;
  form: string;
  goalsFor: number;
  goalsAgainst: number;
  xG: number;
  xGA: number;
  position: number;
}
