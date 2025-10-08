import { matchArchiver } from '../db/match-archiver';
import { supabase } from '../db/supabase';

interface PredictionInput {
  homeTeam: string;
  awayTeam: string;
  league: string;
  currentOdds: {
    home: number;
    draw: number;
    away: number;
    over25?: number;
    bttsYes?: number;
  };
  liveStats?: any;
}

interface Prediction {
  type: string;
  prediction: string;
  confidence: number;
  recommendedOdds: number;
  expectedValue: number;
  reasoning: string[];
  features: any;
}

class PredictionEngine {
  private modelVersion = 'v1.0.0';

  async generatePredictions(input: PredictionInput): Promise<Prediction[]> {
    console.log(`🧠 [AI] Generating predictions for ${input.homeTeam} vs ${input.awayTeam}`);

    const h2h = await matchArchiver.getH2H(input.homeTeam, input.awayTeam, 10);
    const homeForm = await matchArchiver.getTeamForm(input.homeTeam, 5);
    const awayForm = await matchArchiver.getTeamForm(input.awayTeam, 5);
    const homeStats = await matchArchiver.getTeamStats(input.homeTeam, input.league);
    const awayStats = await matchArchiver.getTeamStats(input.awayTeam, input.league);

    const features = this.extractFeatures({
      h2h,
      homeForm,
      awayForm,
      homeStats,
      awayStats,
      currentOdds: input.currentOdds,
      liveStats: input.liveStats
    });

    const predictions: Prediction[] = [];

    // 1X2 Prediction
    const result1X2 = this.predict1X2(features);
    if (result1X2.confidence >= 50) {
      predictions.push(result1X2);
    }

    // Over/Under 2.5
    const resultOU = this.predictOver25(features);
    if (resultOU.confidence >= 50) {
      predictions.push(resultOU);
    }

    // BTTS
    const resultBTTS = this.predictBTTS(features);
    if (resultBTTS.confidence >= 50) {
      predictions.push(resultBTTS);
    }

    console.log(`✅ [AI] Generated ${predictions.length} predictions`);
    return predictions;
  }

  private extractFeatures(data: any): any {
    const { h2h, homeForm, awayForm, homeStats, awayStats, currentOdds, liveStats } = data;

    // H2H Analysis
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
    const h2hBttsPercent = (h2h.filter((m: any) => m.btts).length / (h2h.length || 1)) * 100;

    // Form Analysis
    const homeFormScore = this.calculateFormScore(homeForm);
    const awayFormScore = this.calculateFormScore(awayForm);

    return {
      h2h: {
        totalMatches: h2h.length,
        homeWins: h2hHomeWins,
        draws: h2hDraws,
        awayWins: h2hAwayWins,
        avgGoals: h2hAvgGoals,
        bttsPercent: h2hBttsPercent
      },
      form: {
        home: homeFormScore,
        away: awayFormScore,
        diff: homeFormScore - awayFormScore
      },
      stats: {
        home: homeStats,
        away: awayStats
      },
      odds: currentOdds,
      live: liveStats
    };
  }

  private calculateFormScore(form: string[]): number {
    if (!form || form.length === 0) return 50;
    
    let score = 0;
    form.forEach((result, index) => {
      const weight = form.length - index;
      if (result === 'W') score += 3 * weight;
      else if (result === 'D') score += 1 * weight;
    });
    
    const maxScore = form.reduce((sum, _, i) => sum + (3 * (form.length - i)), 0);
    return (score / maxScore) * 100;
  }

  private predict1X2(features: any): Prediction {
    const { h2h, form, odds, live } = features;
    
    let homeProb = 33.33;
    let drawProb = 33.33;
    let awayProb = 33.33;

    // H2H influence
    if (h2h.totalMatches >= 3) {
      homeProb += (h2h.homeWins / h2h.totalMatches) * 20;
      drawProb += (h2h.draws / h2h.totalMatches) * 20;
      awayProb += (h2h.awayWins / h2h.totalMatches) * 20;
    }

    // Form influence
    homeProb += (form.diff * 0.2);
    awayProb -= (form.diff * 0.2);

    // Live stats influence
    if (live?.possession) {
      homeProb += (live.possession.home - 50) * 0.3;
      awayProb += (live.possession.away - 50) * 0.3;
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

    const reasoning = [
      `H2H: ${h2h.homeWins}-${h2h.draws}-${h2h.awayWins} (${h2h.totalMatches} mecze)`,
      `Forma: Home ${form.home.toFixed(0)}% | Away ${form.away.toFixed(0)}%`,
      `Prawdopodobieństwo: ${confidence.toFixed(1)}%`,
      `Expected Value: ${expectedValue > 0 ? '+' : ''}${expectedValue.toFixed(1)}%`
    ];

    return {
      type: '1X2',
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      reasoning,
      features
    };
  }

  private predictOver25(features: any): Prediction {
    const { h2h, stats, odds, live } = features;
    
    let overProb = 50;

    // H2H goals
    if (h2h.avgGoals >= 3) overProb += 20;
    else if (h2h.avgGoals <= 2) overProb -= 20;

    // Team stats
    if (stats.home?.over25_percentage) {
      overProb += (stats.home.over25_percentage - 50) * 0.3;
    }
    if (stats.away?.over25_percentage) {
      overProb += (stats.away.over25_percentage - 50) * 0.3;
    }

    // Live stats
    if (live?.shots) {
      const totalShots = (live.shots.home || 0) + (live.shots.away || 0);
      if (totalShots > 15) overProb += 15;
    }

    overProb = Math.max(0, Math.min(100, overProb));

    const prediction = overProb >= 50 ? 'Over 2.5' : 'Under 2.5';
    const confidence = overProb >= 50 ? overProb : (100 - overProb);
    const recommendedOdds = odds.over25 || 2.0;
    const expectedValue = ((confidence / 100) * recommendedOdds - 1) * 100;

    const reasoning = [
      `H2H średnia goli: ${h2h.avgGoals.toFixed(1)}`,
      `Home Over%: ${stats.home?.over25_percentage || 'N/A'}%`,
      `Away Over%: ${stats.away?.over25_percentage || 'N/A'}%`,
      `Confidence: ${confidence.toFixed(1)}%`
    ];

    return {
      type: 'Over/Under 2.5',
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      reasoning,
      features
    };
  }

  private predictBTTS(features: any): Prediction {
    const { h2h, stats, odds } = features;
    
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
    const recommendedOdds = odds.bttsYes || 1.8;
    const expectedValue = ((confidence / 100) * recommendedOdds - 1) * 100;

    const reasoning = [
      `H2H BTTS: ${h2h.bttsPercent.toFixed(0)}%`,
      `Home BTTS%: ${stats.home?.btts_percentage || 'N/A'}%`,
      `Away BTTS%: ${stats.away?.btts_percentage || 'N/A'}%`,
      `Confidence: ${confidence.toFixed(1)}%`
    ];

    return {
      type: 'BTTS',
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      reasoning,
      features
    };
  }

  async savePrediction(matchId: string, prediction: Prediction): Promise<void> {
    try {
      await supabase.from('prediction_history').insert([{
        match_id: matchId,
        prediction_type: prediction.type,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        recommended_odds: prediction.recommendedOdds,
        stake_suggested: this.calculateStake(prediction.confidence, prediction.expectedValue),
        predicted_at: new Date().toISOString(),
        match_date: new Date().toISOString(),
        model_version: this.modelVersion,
        features_used: prediction.features
      }]);

      console.log(`✅ [AI] Prediction saved for match ${matchId}`);
    } catch (error) {
      console.error('❌ [AI] Error saving prediction:', error);
    }
  }

  private calculateStake(confidence: number, expectedValue: number): number {
    // Kelly Criterion inspired
    if (expectedValue <= 0) return 0;
    
    const kelly = (confidence / 100 - 0.5) * 2;
    const stake = Math.max(0, Math.min(10, kelly * 10));
    
    return Math.round(stake * 10) / 10;
  }
}

export const predictionEngine = new PredictionEngine();
