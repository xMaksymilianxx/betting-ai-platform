import { matchArchiver } from '../db/match-archiver';
import { supabase } from '../db/supabase';

export interface AdvancedPredictionInput {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchId: string;
  matchDate: string;
  isLive: boolean;
  currentOdds: {
    home?: number;
    draw?: number;
    away?: number;
    over05?: number;
    over15?: number;
    over25?: number;
    over35?: number;
    over45?: number;
    under05?: number;
    under15?: number;
    under25?: number;
    under35?: number;
    under45?: number;
    bttsYes?: number;
    bttsNo?: number;
    homeWinBtts?: number;
    awayWinBtts?: number;
    htHome?: number;
    htDraw?: number;
    htAway?: number;
    ftHome?: number;
    ftDraw?: number;
    ftAway?: number;
    corners?: any;
    cards?: any;
    doubleChance?: any;
  };
  liveStats?: any;
  historicalStats?: any;
}

export interface AdvancedPrediction {
  market: string;
  prediction: string;
  confidence: number;
  recommendedOdds: number;
  expectedValue: number;
  valuePercentage: number;
  stakeSize: number;
  reasoning: string[];
  features: any;
  risk: 'low' | 'medium' | 'high';
  timing: 'prematch' | 'live';
}

export class AdvancedPredictionEngine {
  private modelVersion = 'v2.0.0-advanced';
  private enabledMarkets: string[] = [
    '1X2',
    'Over/Under 0.5',
    'Over/Under 1.5',
    'Over/Under 2.5',
    'Over/Under 3.5',
    'Over/Under 4.5',
    'BTTS',
    'BTTS & Win',
    'Half Time',
    'Full Time',
    'Double Chance',
    'Corners',
    'Cards',
    'Asian Handicap',
    'European Handicap'
  ];

  async generateAllPredictions(input: AdvancedPredictionInput): Promise<AdvancedPrediction[]> {
    console.log(`🧠 [ADVANCED-AI] Generating predictions for ${input.homeTeam} vs ${input.awayTeam}`);
    console.log(`📊 [ADVANCED-AI] Mode: ${input.isLive ? 'LIVE' : 'PREMATCH'}`);

    // Get historical data
    const h2h = await matchArchiver.getH2H(input.homeTeam, input.awayTeam, 10);
    const homeForm = await matchArchiver.getTeamForm(input.homeTeam, 10);
    const awayForm = await matchArchiver.getTeamForm(input.awayTeam, 10);
    const homeStats = await matchArchiver.getTeamStats(input.homeTeam, input.league);
    const awayStats = await matchArchiver.getTeamStats(input.awayTeam, input.league);

    const features = this.extractAdvancedFeatures({
      h2h,
      homeForm,
      awayForm,
      homeStats,
      awayStats,
      currentOdds: input.currentOdds,
      liveStats: input.liveStats,
      isLive: input.isLive
    });

    const predictions: AdvancedPrediction[] = [];

    // 1X2
    if (input.currentOdds.home && input.currentOdds.draw && input.currentOdds.away) {
      const pred = this.predict1X2(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    // Over/Under (wszystkie warianty)
    ['0.5', '1.5', '2.5', '3.5', '4.5'].forEach(line => {
      const overKey = `over${line.replace('.', '')}` as keyof typeof input.currentOdds;
      const underKey = `under${line.replace('.', '')}` as keyof typeof input.currentOdds;
      
      if (input.currentOdds[overKey]) {
        const pred = this.predictOverUnder(features, input.currentOdds, line, input.isLive);
        if (pred) predictions.push(pred);
      }
    });

    // BTTS
    if (input.currentOdds.bttsYes && input.currentOdds.bttsNo) {
      const pred = this.predictBTTS(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    // BTTS & Win
    if (input.currentOdds.homeWinBtts && input.currentOdds.awayWinBtts) {
      const pred = this.predictBTTSAndWin(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    // Half Time
    if (input.currentOdds.htHome && input.currentOdds.htDraw && input.currentOdds.htAway) {
      const pred = this.predictHalfTime(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    // Double Chance
    if (input.currentOdds.doubleChance) {
      const pred = this.predictDoubleChance(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    // Corners (if available)
    if (input.currentOdds.corners) {
      const pred = this.predictCorners(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    // Cards (if available)
    if (input.currentOdds.cards) {
      const pred = this.predictCards(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    console.log(`✅ [ADVANCED-AI] Generated ${predictions.length} predictions across ${new Set(predictions.map(p => p.market)).size} markets`);

    // Sort by Expected Value (najlepsze na górze)
    return predictions.sort((a, b) => b.expectedValue - a.expectedValue);
  }

  private extractAdvancedFeatures(data: any): any {
    const { h2h, homeForm, awayForm, homeStats, awayStats, currentOdds, liveStats, isLive } = data;

    // H2H Analysis (deeper)
    const h2hHomeWins = h2h.filter((m: any) => 
      (m.home_team === homeStats?.team_name && m.final_result === '1') ||
      (m.away_team === homeStats?.team_name && m.final_result === '2')
    ).length;
    const h2hDraws = h2h.filter((m: any) => m.final_result === 'X').length;
    const h2hAwayWins = h2h.filter((m: any) => 
      (m.home_team === awayStats?.team_name && m.final_result === '1') ||
      (m.away_team === awayStats?.team_name && m.final_result === '2')
    ).length;

    const h2hAvgGoals = h2h.reduce((sum: number, m: any) => sum + m.total_goals, 0) / (h2h.length || 1);
    const h2hAvgGoalsFirst = h2h.reduce((sum: number, m: any) => sum + ((m.half_time_score_home || 0) + (m.half_time_score_away || 0)), 0) / (h2h.length || 1);
    const h2hBttsPercent = (h2h.filter((m: any) => m.btts).length / (h2h.length || 1)) * 100;
    const h2hOver25Percent = (h2h.filter((m: any) => m.total_goals > 2.5).length / (h2h.length || 1)) * 100;
    const h2hOver15Percent = (h2h.filter((m: any) => m.total_goals > 1.5).length / (h2h.length || 1)) * 100;
    const h2hOver35Percent = (h2h.filter((m: any) => m.total_goals > 3.5).length / (h2h.length || 1)) * 100;

    // Form Analysis (advanced)
    const homeFormScore = this.calculateAdvancedForm(homeForm);
    const awayFormScore = this.calculateAdvancedForm(awayForm);
    const homeLastGoals = this.calculateAverageGoals(homeStats, true);
    const awayLastGoals = this.calculateAverageGoals(awayStats, false);

    // Live adjustments
    let liveAdjustment = 0;
    if (isLive && liveStats) {
      liveAdjustment = this.calculateLiveAdjustment(liveStats);
    }

    return {
      h2h: {
        totalMatches: h2h.length,
        homeWins: h2hHomeWins,
        draws: h2hDraws,
        awayWins: h2hAwayWins,
        avgGoals: h2hAvgGoals,
        avgGoalsFirstHalf: h2hAvgGoalsFirst,
        bttsPercent: h2hBttsPercent,
        over15Percent: h2hOver15Percent,
        over25Percent: h2hOver25Percent,
        over35Percent: h2hOver35Percent
      },
      form: {
        home: homeFormScore,
        away: awayFormScore,
        diff: homeFormScore - awayFormScore,
        homeGoals: homeLastGoals,
        awayGoals: awayLastGoals
      },
      stats: {
        home: homeStats,
        away: awayStats
      },
      odds: currentOdds,
      live: liveStats,
      liveAdjustment,
      isLive
    };
  }

  private calculateAdvancedForm(form: string[]): number {
    if (!form || form.length === 0) return 50;
    
    let score = 0;
    let weight = form.length;
    
    form.forEach((result, index) => {
      const currentWeight = form.length - index;
      if (result === 'W') score += 3 * currentWeight;
      else if (result === 'D') score += 1 * currentWeight;
    });
    
    const maxScore = form.reduce((sum, _, i) => sum + (3 * (form.length - i)), 0);
    return (score / maxScore) * 100;
  }

  private calculateAverageGoals(stats: any, isHome: boolean): number {
    if (!stats) return 1.5;
    return isHome ? 
      (stats.goals_scored / stats.matches_played || 1.5) :
      (stats.goals_conceded / stats.matches_played || 1.5);
  }

  private calculateLiveAdjustment(liveStats: any): number {
    let adjustment = 0;
    
    // Possession adjustment
    if (liveStats.possession) {
      adjustment += (liveStats.possession.home - 50) * 0.5;
    }
    
    // Shots adjustment
    if (liveStats.shots) {
      const shotDiff = (liveStats.shots.home || 0) - (liveStats.shots.away || 0);
      adjustment += shotDiff * 2;
    }
    
    // Corners adjustment
    if (liveStats.corners) {
      const cornerDiff = (liveStats.corners.home || 0) - (liveStats.corners.away || 0);
      adjustment += cornerDiff * 3;
    }
    
    return Math.max(-30, Math.min(30, adjustment));
  }

  private predict1X2(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    const { h2h, form, live, liveAdjustment } = features;
    
    let homeProb = 33.33;
    let drawProb = 33.33;
    let awayProb = 33.33;

    // H2H influence (30%)
    if (h2h.totalMatches >= 3) {
      homeProb += (h2h.homeWins / h2h.totalMatches) * 30;
      drawProb += (h2h.draws / h2h.totalMatches) * 30;
      awayProb += (h2h.awayWins / h2h.totalMatches) * 30;
    }

    // Form influence (25%)
    homeProb += (form.diff * 0.25);
    awayProb -= (form.diff * 0.25);

    // Live adjustment (15% if live)
    if (isLive) {
      homeProb += liveAdjustment * 0.5;
      awayProb -= liveAdjustment * 0.5;
    }

    // Normalize
    const total = homeProb + drawProb + awayProb;
    homeProb = (homeProb / total) * 100;
    drawProb = (drawProb / total) * 100;
    awayProb = (awayProb / total) * 100;

    // Determine prediction
    let prediction = '1';
    let confidence = homeProb;
    let recommendedOdds = odds.home;

    if (drawProb > homeProb && drawProb > awayProb) {
      prediction = 'X';
      confidence = drawProb;
      recommendedOdds = odds.draw;
    } else if (awayProb > homeProb) {
      prediction = '2';
      confidence = awayProb;
      recommendedOdds = odds.away;
    }

    const expectedValue = ((confidence / 100) * recommendedOdds - 1) * 100;
    const valuePercentage = ((recommendedOdds - (100 / confidence)) / (100 / confidence)) * 100;

    // Minimum confidence threshold
    if (confidence < 45) return null;

    return {
      market: '1X2',
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      valuePercentage: Math.round(valuePercentage * 10) / 10,
      stakeSize: this.calculateStake(confidence, expectedValue),
      reasoning: [
        `H2H: ${h2h.homeWins}-${h2h.draws}-${h2h.awayWins} (${h2h.totalMatches} matches)`,
        `Form: Home ${form.home.toFixed(0)}% | Away ${form.away.toFixed(0)}%`,
        `Probability: ${confidence.toFixed(1)}%`,
        `Expected Value: ${expectedValue > 0 ? '+' : ''}${expectedValue.toFixed(1)}%`,
        isLive ? `Live Adjustment: ${liveAdjustment > 0 ? '+' : ''}${liveAdjustment.toFixed(1)}` : ''
      ].filter(Boolean),
      features,
      risk: confidence >= 65 ? 'low' : confidence >= 55 ? 'medium' : 'high',
      timing: isLive ? 'live' : 'prematch'
    };
  }

  private predictOverUnder(features: any, odds: any, line: string, isLive: boolean): AdvancedPrediction | null {
    const { h2h, form, stats } = features;
    const lineValue = parseFloat(line);
    
    let overProb = 50;

    // H2H goals
    const h2hKey = `over${line.replace('.', '')}Percent` as keyof typeof h2h;
    if (h2h[h2hKey]) {
      overProb = h2h[h2hKey] as number;
    }

    // Team stats
    if (stats.home?.over25_percentage) {
      overProb += (stats.home.over25_percentage - 50) * 0.2;
    }
    if (stats.away?.over25_percentage) {
      overProb += (stats.away.over25_percentage - 50) * 0.2;
    }

    // Form goals
    const expectedGoals = form.homeGoals + form.awayGoals;
    if (expectedGoals > lineValue + 0.5) overProb += 15;
    else if (expectedGoals < lineValue - 0.5) overProb -= 15;

    overProb = Math.max(0, Math.min(100, overProb));

    const prediction = overProb >= 50 ? `Over ${line}` : `Under ${line}`;
    const confidence = overProb >= 50 ? overProb : (100 - overProb);
    const overKey = `over${line.replace('.', '')}` as keyof typeof odds;
    const underKey = `under${line.replace('.', '')}` as keyof typeof odds;
    const recommendedOdds = overProb >= 50 ? 
      (odds[overKey] as number || 2.0) : 
      (odds[underKey] as number || 2.0);
    
    const expectedValue = ((confidence / 100) * recommendedOdds - 1) * 100;

    if (confidence < 50) return null;

    return {
      market: `Over/Under ${line}`,
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      valuePercentage: 0,
      stakeSize: this.calculateStake(confidence, expectedValue),
      reasoning: [
        `H2H avg goals: ${h2h.avgGoals.toFixed(1)}`,
        `Expected: ${expectedGoals.toFixed(1)} goals`,
        `Confidence: ${confidence.toFixed(1)}%`
      ],
      features,
      risk: confidence >= 60 ? 'low' : confidence >= 50 ? 'medium' : 'high',
      timing: isLive ? 'live' : 'prematch'
    };
  }

  private predictBTTS(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    const { h2h, stats } = features;
    
    let bttsProb = 50;

    // H2H BTTS
    bttsProb += (h2h.bttsPercent - 50) * 0.5;

    // Team stats
    if (stats.home?.btts_percentage) {
      bttsProb += (stats.home.btts_percentage - 50) * 0.3;
    }
    if (stats.away?.btts_percentage) {
      bttsProb += (stats.away.btts_percentage - 50) * 0.3;
    }

    bttsProb = Math.max(0, Math.min(100, bttsProb));

    const prediction = bttsProb >= 50 ? 'Yes' : 'No';
    const confidence = bttsProb >= 50 ? bttsProb : (100 - bttsProb);
    const recommendedOdds = bttsProb >= 50 ? odds.bttsYes : odds.bttsNo;
    const expectedValue = ((confidence / 100) * recommendedOdds - 1) * 100;

    if (confidence < 50) return null;

    return {
      market: 'BTTS',
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      valuePercentage: 0,
      stakeSize: this.calculateStake(confidence, expectedValue),
      reasoning: [
        `H2H BTTS: ${h2h.bttsPercent.toFixed(0)}%`,
        `Home BTTS%: ${stats.home?.btts_percentage || 'N/A'}%`,
        `Away BTTS%: ${stats.away?.btts_percentage || 'N/A'}%`
      ],
      features,
      risk: confidence >= 60 ? 'low' : 'medium',
      timing: isLive ? 'live' : 'prematch'
    };
  }

  // Dodaj więcej metod dla innych rynków...
  private predictBTTSAndWin(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    // Implementation
    return null;
  }

  private predictHalfTime(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    // Implementation
    return null;
  }

  private predictDoubleChance(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    // Implementation
    return null;
  }

  private predictCorners(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    // Implementation
    return null;
  }

  private predictCards(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    // Implementation
    return null;
  }

  private calculateStake(confidence: number, expectedValue: number): number {
    if (expectedValue <= 0) return 0;
    
    const kelly = (confidence / 100 - 0.5) * 2;
    const stake = Math.max(0, Math.min(10, kelly * 10));
    
    return Math.round(stake * 10) / 10;
  }

  async savePredictions(matchId: string, predictions: AdvancedPrediction[]): Promise<void> {
    try {
      const records = predictions.map(pred => ({
        match_id: matchId,
        prediction_type: pred.market,
        prediction: pred.prediction,
        confidence: pred.confidence,
        recommended_odds: pred.recommendedOdds,
        stake_suggested: pred.stakeSize,
        predicted_at: new Date().toISOString(),
        match_date: new Date().toISOString(),
        model_version: this.modelVersion,
        features_used: pred.features
      }));

      await supabase.from('prediction_history').insert(records);
      console.log(`✅ [ADVANCED-AI] Saved ${predictions.length} predictions for match ${matchId}`);
    } catch (error) {
      console.error('❌ [ADVANCED-AI] Error saving predictions:', error);
    }
  }
}

export const advancedPredictionEngine = new AdvancedPredictionEngine();
