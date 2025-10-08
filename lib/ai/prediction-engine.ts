import { matchArchiver } from '../db/match-archiver';
import { supabase } from '../db/supabase';

export interface AdvancedPredictionInput {
  homeTeam: string;
  awayTeam: string;
  league: string;
  matchId: string;
  matchDate: string;
  isLive: boolean;
  currentOdds: any;
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
  private modelVersion = 'v2.1.0-pro';

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

    // Over/Under 2.5
    if (input.currentOdds.over25) {
      const pred = this.predictOverUnder(features, input.currentOdds, '2.5', input.isLive);
      if (pred) predictions.push(pred);
    }

    // Over/Under 1.5
    if (input.currentOdds.over15) {
      const pred = this.predictOverUnder(features, input.currentOdds, '1.5', input.isLive);
      if (pred) predictions.push(pred);
    }

    // Over/Under 3.5
    if (input.currentOdds.over35) {
      const pred = this.predictOverUnder(features, input.currentOdds, '3.5', input.isLive);
      if (pred) predictions.push(pred);
    }

    // BTTS
    if (input.currentOdds.bttsYes && input.currentOdds.bttsNo) {
      const pred = this.predictBTTS(features, input.currentOdds, input.isLive);
      if (pred) predictions.push(pred);
    }

    console.log(`✅ [ADVANCED-AI] Generated ${predictions.length} predictions`);

    return predictions.sort((a, b) => b.expectedValue - a.expectedValue);
  }

  private extractAdvancedFeatures(data: any): any {
    const { h2h, homeForm, awayForm, homeStats, awayStats, currentOdds, liveStats, isLive } = data;

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
    const h2hOver25Percent = (h2h.filter((m: any) => m.total_goals > 2.5).length / (h2h.length || 1)) * 100;
    const h2hOver15Percent = (h2h.filter((m: any) => m.total_goals > 1.5).length / (h2h.length || 1)) * 100;
    const h2hOver35Percent = (h2h.filter((m: any) => m.total_goals > 3.5).length / (h2h.length || 1)) * 100;

    const homeFormScore = this.calculateAdvancedForm(homeForm);
    const awayFormScore = this.calculateAdvancedForm(awayForm);

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
        bttsPercent: h2hBttsPercent,
        over15Percent: h2hOver15Percent,
        over25Percent: h2hOver25Percent,
        over35Percent: h2hOver35Percent
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

  private calculateLiveAdjustment(liveStats: any): number {
    let adjustment = 0;
    
    if (liveStats.possession) {
      adjustment += (liveStats.possession.home - 50) * 0.5;
    }
    
    if (liveStats.shots) {
      const shotDiff = (liveStats.shots.home || 0) - (liveStats.shots.away || 0);
      adjustment += shotDiff * 2;
    }
    
    if (liveStats.corners) {
      const cornerDiff = (liveStats.corners.home || 0) - (liveStats.corners.away || 0);
      adjustment += cornerDiff * 3;
    }
    
    return Math.max(-30, Math.min(30, adjustment));
  }

  private predict1X2(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    const { h2h, form, stats, live, liveAdjustment } = features;
    
    const impliedProbHome = (1 / odds.home) * 100;
    const impliedProbDraw = (1 / odds.draw) * 100;
    const impliedProbAway = (1 / odds.away) * 100;
    const totalImplied = impliedProbHome + impliedProbDraw + impliedProbAway;
    
    let homeProb = (impliedProbHome / totalImplied) * 100;
    let drawProb = (impliedProbDraw / totalImplied) * 100;
    let awayProb = (impliedProbAway / totalImplied) * 100;

    // H2H (40% weight)
    if (h2h.totalMatches >= 3) {
      const h2hHomeRate = (h2h.homeWins / h2h.totalMatches) * 100;
      const h2hDrawRate = (h2h.draws / h2h.totalMatches) * 100;
      const h2hAwayRate = (h2h.awayWins / h2h.totalMatches) * 100;
      
      homeProb = homeProb * 0.6 + h2hHomeRate * 0.4;
      drawProb = drawProb * 0.6 + h2hDrawRate * 0.4;
      awayProb = awayProb * 0.6 + h2hAwayRate * 0.4;
    }

    // Form (30% weight)
    const formDiff = form.home - form.away;
    const formAdjustment = formDiff * 0.3;
    
    homeProb += formAdjustment;
    awayProb -= formAdjustment;

    // Stats (15% weight)
    if (stats.home && stats.away) {
      const homeWinRate = (stats.home.wins / stats.home.matches_played || 0) * 100;
      const awayWinRate = (stats.away.wins / stats.away.matches_played || 0) * 100;
      
      homeProb = homeProb * 0.85 + homeWinRate * 0.15;
      awayProb = awayProb * 0.85 + awayWinRate * 0.15;
    }

    // Live (15% weight)
    if (isLive && live) {
      homeProb += liveAdjustment * 0.5;
      awayProb -= liveAdjustment * 0.5;
      
      if (live.score) {
        if (live.score.home > live.score.away) {
          const scoreDiff = live.score.home - live.score.away;
          homeProb += scoreDiff * 10;
          awayProb -= scoreDiff * 8;
        } else if (live.score.away > live.score.home) {
          const scoreDiff = live.score.away - live.score.home;
          awayProb += scoreDiff * 10;
          homeProb -= scoreDiff * 8;
        }
      }
    }

    const total = homeProb + drawProb + awayProb;
    homeProb = (homeProb / total) * 100;
    drawProb = (drawProb / total) * 100;
    awayProb = (awayProb / total) * 100;

    const predictions = [
      { type: '1 (Home Win)', prob: homeProb, odds: odds.home, impliedProb: impliedProbHome },
      { type: 'X (Draw)', prob: drawProb, odds: odds.draw, impliedProb: impliedProbDraw },
      { type: '2 (Away Win)', prob: awayProb, odds: odds.away, impliedProb: impliedProbAway }
    ];

    let bestPrediction = predictions[0];
    let bestValue = -999;

    predictions.forEach(pred => {
      const ev = ((pred.prob / 100) * pred.odds - 1) * 100;
      if (ev > bestValue) {
        bestValue = ev;
        bestPrediction = pred;
      }
    });

    const confidence = bestPrediction.prob;
    const expectedValue = ((confidence / 100) * bestPrediction.odds - 1) * 100;
    const valuePercentage = ((bestPrediction.odds - (100 / confidence)) / (100 / confidence)) * 100;

    if (confidence < 40 || expectedValue < -5) {
      return null;
    }

    const reasoning: string[] = [];
    
    if (h2h.totalMatches >= 3) {
      reasoning.push(
        `📊 H2H (${h2h.totalMatches} mecze): ${h2h.homeWins}W-${h2h.draws}D-${h2h.awayWins}L ` +
        `(${((h2h.homeWins/h2h.totalMatches)*100).toFixed(0)}%-${((h2h.draws/h2h.totalMatches)*100).toFixed(0)}%-${((h2h.awayWins/h2h.totalMatches)*100).toFixed(0)}%)`
      );
    } else {
      reasoning.push(`⚠️ Ograniczone dane H2H (${h2h.totalMatches} mecze)`);
    }

    reasoning.push(
      `🔥 Forma: Home ${form.home.toFixed(0)}% vs Away ${form.away.toFixed(0)}% (Δ ${formDiff > 0 ? '+' : ''}${formDiff.toFixed(0)}%)`
    );

    if (stats.home && stats.away) {
      reasoning.push(
        `📈 Sezon: Home ${((stats.home.wins/stats.home.matches_played)*100).toFixed(0)}% win rate | ` +
        `Away ${((stats.away.wins/stats.away.matches_played)*100).toFixed(0)}% win rate`
      );
    }

    if (isLive && live?.score) {
      reasoning.push(
        `🔴 LIVE: Wynik ${live.score.home}-${live.score.away} | ` +
        `Min ${live.minute || '?'}' | ` +
        `Momentum: ${liveAdjustment > 0 ? 'Home' : liveAdjustment < 0 ? 'Away' : 'Neutral'}`
      );
      
      if (live.possession) {
        reasoning.push(`⚽ Posiadanie: ${live.possession.home}%-${live.possession.away}%`);
      }
    }

    reasoning.push(
      `🎲 Implied Probability: ${bestPrediction.impliedProb.toFixed(1)}% (z kursu ${bestPrediction.odds})`
    );
    reasoning.push(
      `🧠 Rzeczywiste Prawdopodobieństwo: ${confidence.toFixed(1)}% (obliczone przez AI)`
    );
    reasoning.push(
      `💎 Value: ${valuePercentage > 0 ? '+' : ''}${valuePercentage.toFixed(1)}% | ` +
      `EV: ${expectedValue > 0 ? '+' : ''}${expectedValue.toFixed(1)}%`
    );

    if (isLive) {
      reasoning.push(
        `💰 Aktualne Kursy: 1=${odds.home} X=${odds.draw} 2=${odds.away} ` +
        `(Rekomendowany: ${bestPrediction.odds})`
      );
    }

    return {
      market: '1X2',
      prediction: bestPrediction.type,
      confidence: Math.round(confidence),
      recommendedOdds: bestPrediction.odds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      valuePercentage: Math.round(valuePercentage * 10) / 10,
      stakeSize: this.calculateStake(confidence, expectedValue),
      reasoning,
      features: {
        impliedProbability: Math.round(bestPrediction.impliedProb * 10) / 10,
        realProbability: Math.round(confidence * 10) / 10,
        h2hSupport: h2h.totalMatches >= 3,
        formDiff: Math.round(formDiff),
        liveAdjustment: isLive ? Math.round(liveAdjustment * 10) / 10 : 0
      },
      risk: confidence >= 65 ? 'low' : confidence >= 50 ? 'medium' : 'high',
      timing: isLive ? 'live' : 'prematch'
    };
  }

  private predictOverUnder(features: any, odds: any, line: string, isLive: boolean): AdvancedPrediction | null {
    const { h2h, form, stats } = features;
    const lineValue = parseFloat(line);
    
    let overProb = 50;

    const h2hKey = `over${line.replace('.', '')}Percent` as keyof typeof h2h;
    if (h2h[h2hKey]) {
      overProb = h2h[h2hKey] as number;
    }

    if (stats.home?.over25_percentage) {
      overProb += (stats.home.over25_percentage - 50) * 0.2;
    }
    if (stats.away?.over25_percentage) {
      overProb += (stats.away.over25_percentage - 50) * 0.2;
    }

    const homeGoals = (stats.home?.goals_scored / stats.home?.matches_played) || 1.5;
    const awayGoals = (stats.away?.goals_conceded / stats.away?.matches_played) || 1.5;
    const expectedGoals = homeGoals + awayGoals;
    
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

    const reasoning = [
      `📊 H2H średnia goli: ${h2h.avgGoals.toFixed(1)}`,
      `📈 Oczekiwane: ${expectedGoals.toFixed(1)} goli`,
      `🎲 Implied Prob: ${((1/recommendedOdds)*100).toFixed(1)}%`,
      `🧠 Rzeczywiste Prob: ${confidence.toFixed(1)}%`,
      `💎 EV: ${expectedValue > 0 ? '+' : ''}${expectedValue.toFixed(1)}%`
    ];

    return {
      market: `Over/Under ${line}`,
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      valuePercentage: 0,
      stakeSize: this.calculateStake(confidence, expectedValue),
      reasoning,
      features: {
        impliedProbability: Math.round((1/recommendedOdds)*100 * 10) / 10,
        realProbability: Math.round(confidence * 10) / 10
      },
      risk: confidence >= 60 ? 'low' : confidence >= 50 ? 'medium' : 'high',
      timing: isLive ? 'live' : 'prematch'
    };
  }

  private predictBTTS(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
    const { h2h, stats } = features;
    
    let bttsProb = 50;

    bttsProb += (h2h.bttsPercent - 50) * 0.5;

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

    const reasoning = [
      `📊 H2H BTTS: ${h2h.bttsPercent.toFixed(0)}%`,
      `📈 Home BTTS%: ${stats.home?.btts_percentage || 'N/A'}%`,
      `📈 Away BTTS%: ${stats.away?.btts_percentage || 'N/A'}%`,
      `🎲 Implied Prob: ${((1/recommendedOdds)*100).toFixed(1)}%`,
      `🧠 Rzeczywiste Prob: ${confidence.toFixed(1)}%`
    ];

    return {
      market: 'BTTS',
      prediction,
      confidence: Math.round(confidence),
      recommendedOdds,
      expectedValue: Math.round(expectedValue * 10) / 10,
      valuePercentage: 0,
      stakeSize: this.calculateStake(confidence, expectedValue),
      reasoning,
      features: {
        impliedProbability: Math.round((1/recommendedOdds)*100 * 10) / 10,
        realProbability: Math.round(confidence * 10) / 10
      },
      risk: confidence >= 60 ? 'low' : 'medium',
      timing: isLive ? 'live' : 'prematch'
    };
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
    } catch (error) {
      console.error('❌ Save error:', error);
    }
  }
}

export const advancedPredictionEngine = new AdvancedPredictionEngine();
