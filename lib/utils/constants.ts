export const API_ENDPOINTS = {
  FOOTBALL_DATA: 'https://api.football-data.org/v4',
  SPORTMONKS: 'https://api.sportmonks.com/v3/football',
  LIVE_SCORE: 'https://api.live-score-api.com/api/v1',
  API_FOOTBALL: 'https://v3.football.api-sports.io',
};

export const SPORTS = [
  'Football',
  'Basketball',
  'Tennis',
  'Ice Hockey',
  'Baseball',
  'American Football',
  'Volleyball',
  'Handball',
] as const;

export const PREDICTION_TYPES = {
  MATCH_WINNER: 'Match Winner (1X2)',
  OVER_UNDER: 'Over/Under 2.5',
  BTTS: 'Both Teams to Score',
  CORRECT_SCORE: 'Correct Score',
  DOUBLE_CHANCE: 'Double Chance',
  HANDICAP: 'Handicap',
  FIRST_HALF: 'First Half Result',
  TOTAL_GOALS: 'Total Goals',
} as const;

export const CONFIDENCE_THRESHOLDS = {
  STRONG: 75,
  MODERATE: 65,
  WEAK: 55,
  MINIMUM: 50,
};

export const RISK_LEVELS = {
  LOW: { max: 3, color: 'green', stake: 0.03 },
  MEDIUM: { max: 2, color: 'yellow', stake: 0.02 },
  HIGH: { max: 1, color: 'red', stake: 0.01 },
};

export const CACHE_TTL = {
  LIVE_MATCHES: 30,
  FIXTURES: 900,
  STANDINGS: 3600,
  PREDICTIONS: 14400,
  STATISTICS: 7200,
};

export const MODEL_NAMES = [
  'Gradient Boosting',
  'XG Predictor',
  'Momentum Analyzer',
  'Context-Aware NN',
  'Value Bet Hunter',
  'Live In-Play Model',
] as const;

export const TOP_LEAGUES = [
  { id: 'PL', name: 'Premier League', country: 'England' },
  { id: 'PD', name: 'La Liga', country: 'Spain' },
  { id: 'SA', name: 'Serie A', country: 'Italy' },
  { id: 'BL1', name: 'Bundesliga', country: 'Germany' },
  { id: 'FL1', name: 'Ligue 1', country: 'France' },
  { id: 'CL', name: 'Champions League', country: 'Europe' },
];
