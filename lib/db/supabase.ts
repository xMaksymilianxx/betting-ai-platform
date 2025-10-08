import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface MatchHistory {
  id: string;
  match_id: string;
  home_team: string;
  away_team: string;
  league: string;
  country: string;
  match_date: string;
  final_score_home: number;
  final_score_away: number;
  final_result: '1' | 'X' | '2';
  half_time_score_home?: number;
  half_time_score_away?: number;
  odds_home: number;
  odds_draw: number;
  odds_away: number;
  odds_over25?: number;
  odds_under25?: number;
  odds_btts_yes?: number;
  odds_btts_no?: number;
  total_goals: number;
  btts: boolean;
  corners_home?: number;
  corners_away?: number;
  cards_home?: number;
  cards_away?: number;
  shots_home?: number;
  shots_away?: number;
  possession_home?: number;
  possession_away?: number;
  created_at: string;
  data_sources: string[];
  data_quality: number;
}

export interface PredictionHistory {
  id: string;
  match_id: string;
  match_history_id?: string;
  prediction_type: string;
  prediction: string;
  confidence: number;
  recommended_odds: number;
  stake_suggested: number;
  predicted_at: string;
  match_date: string;
  outcome?: 'won' | 'lost' | 'void';
  actual_result?: string;
  roi?: number;
  profit_loss?: number;
  model_version: string;
  features_used: any;
  created_at: string;
}

export interface MLModelPerformance {
  id: string;
  model_version: string;
  prediction_type: string;
  total_predictions: number;
  correct_predictions: number;
  accuracy: number;
  avg_confidence: number;
  avg_roi: number;
  total_profit_loss: number;
  by_league?: any;
  by_odds_range?: any;
  last_updated: string;
  created_at: string;
}

export interface TeamStatistics {
  id: string;
  team_name: string;
  league: string;
  season: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  avg_possession: number;
  avg_shots_per_game: number;
  avg_corners_per_game: number;
  btts_percentage: number;
  over25_percentage: number;
  form_last_5: string[];
  last_updated: string;
  created_at: string;
}

export interface AISettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  last_updated: string;
  created_at: string;
}
