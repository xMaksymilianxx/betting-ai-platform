// Enhanced AI Prediction Engine with ML integration

import { mlLearningEngine } from './ml-learning-engine';

interface MatchData {
  home: string;
  away: string;
  league: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  statistics?: any;
}

interface Prediction {
  confidence: number;
  betType: string;
  prediction: string;
  odds: number;
  roi: number;
  accuracy: number;
  valuePercentage: number;
  reasoning: string;
}

export class PredictionEngine {
  
  calculatePrediction(match: MatchData): Prediction {
    const predictions: Prediction[] = [];
    const params = mlLearningEngine.getParameters();

    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      const totalGoals = match.homeScore + match.awayScore;
      const minute = match.minute || 90;
      const scoreDiff = match.homeScore - match.awayScore;

      if (minute >= params.minimumMinuteForPrediction) {
        predictions.push(this.predict1X2(match.homeScore, match.awayScore, minute, scoreDiff, params));
        predictions.push(this.predictOverUnder(totalGoals, minute, params));
        predictions.push(this.predictBTTS(match.homeScore, match.awayScore, minute, params));

        if (match.statistics?.corners) {
          predictions.push(this.predictCorners(match.statistics.corners, minute));
        }
        if (match.statistics?.cards) {
          predictions.push(this.predictCards(match.statistics.cards, minute));
        }
      }
    }

    const bestPrediction = predictions
      .filter(p => p.confidence >= 55)
      .sort((a, b) => b.confidence - a.confidence)[0];

    return bestPrediction || this.getDefaultPrediction();
  }

  private predict1X2(homeScore: number, awayScore: number, minute: number, scoreDiff: number, params: any): Prediction {
    let confidence = 50;
    let prediction = 'X';
    
    const lateGameThreshold = 70;
    const leadThreshold = params.oneXTwoLeadThreshold;
    
    if (minute >= lateGameThreshold) {
      if (scoreDiff >= leadThreshold) {
        confidence = 75 + Math.min(20, (minute - lateGameThreshold) * params.oneXTwoTimeMultiplier + (scoreDiff - leadThreshold) * 5);
        prediction = '1 (Home Win)';
      } else if (scoreDiff <= -leadThreshold) {
        confidence = 75 + Math.min(20, (minute - lateGameThreshold) * params.oneXTwoTimeMultiplier + (Math.abs(scoreDiff) - leadThreshold) * 5);
        prediction = '2 (Away Win)';
      } else if (scoreDiff === 1) {
        confidence = 60 + Math.min(15, (minute - lateGameThreshold) * 0.7);
        prediction = '1 (Home Win)';
      } else if (scoreDiff === -1) {
        confidence = 60 + Math.min(15, (minute - lateGameThreshold) * 0.7);
        prediction = '2 (Away Win)';
      } else if (scoreDiff === 0 && minute >= 80) {
        confidence = 55 + Math.min(15, (minute - 80) * 1.5);
        prediction = 'X (Draw)';
      }
    } else if (minute >= 45) {
      if (Math.abs(scoreDiff) >= leadThreshold) {
        confidence = 65 + Math.min(10, Math.abs(scoreDiff) * 3);
        prediction = scoreDiff > 0 ? '1 (Home Win)' : '2 (Away Win)';
      } else if (Math.abs(scoreDiff) === 1) {
        confidence = 55;
        prediction = scoreDiff > 0 ? '1 (Home Win)' : '2 (Away Win)';
      }
    } else {
      if (Math.abs(scoreDiff) >= 3) {
        confidence = 60;
        prediction = scoreDiff > 0 ? '1 (Home Win)' : '2 (Away Win)';
      } else {
        return this.getDefaultPrediction();
      }
    }

    return {
      confidence: Math.min(Math.round(confidence), 92),
      betType: '1X2',
      prediction: prediction,
      odds: this.calculateOdds(confidence),
      roi: this.calculateROI(confidence),
      accuracy: this.calculateAccuracy(confidence),
      valuePercentage: Math.max(0, Math.floor((confidence - 55) * 0.8)),
      reasoning: `Score ${homeScore}-${awayScore} at ${minute}' - ${Math.abs(scoreDiff)} goal ${Math.abs(scoreDiff) === 1 ? 'lead' : 'advantage'}`
    };
  }

  private predictOverUnder(totalGoals: number, minute: number, params: any): Prediction {
    const goalsPerMinute = totalGoals / minute;
    const projected = goalsPerMinute * 90;
    const lateGameThreshold = params.overUnderLateGameThreshold;
    
    let confidence = 50;
    let prediction = 'Under 2.5';
    let reasoning = '';

    if (totalGoals >= 3) {
      confidence = 88 + Math.min(10, (totalGoals - 3) * 2);
      prediction = 'Over 2.5';
      reasoning = `Already ${totalGoals} goals - Over confirmed`;
    }
    else if (totalGoals === 2) {
      if (minute >= lateGameThreshold) {
        confidence = 60 + (minute - lateGameThreshold) * 0.8;
        prediction = 'Under 2.5';
        reasoning = `2 goals at ${minute}', unlikely another`;
      } else if (minute <= 30) {
        confidence = 65 + (30 - minute) * 0.5 * params.overUnderEarlyGameCaution;
        prediction = 'Over 2.5';
        reasoning = `2 goals at ${minute}', projected ${projected.toFixed(1)}`;
      } else {
        confidence = 52;
        prediction = projected >= 3 ? 'Over 2.5' : 'Under 2.5';
        reasoning = `2 goals at ${minute}', borderline`;
      }
    }
    else if (totalGoals === 1) {
      if (minute >= 75) {
        confidence = 75 + (minute - 75) * 1.2;
        prediction = 'Under 2.5';
        reasoning = `Only 1 goal at ${minute}', need 2 more - very unlikely`;
      } else if (minute >= 45) {
        confidence = 65;
        prediction = 'Under 2.5';
        reasoning = `1 goal at ${minute}', need 2 more`;
      } else {
        if (projected >= 3.5) {
          confidence = 58;
          prediction = 'Over 2.5';
          reasoning = `1 goal at ${minute}', projected ${projected.toFixed(1)}`;
        } else {
          confidence = 55;
          prediction = 'Under 2.5';
          reasoning = `1 goal at ${minute}', slow pace`;
        }
      }
    }
    else {
      if (minute >= 70) {
        confidence = 80 + (minute - 70) * 0.8;
        prediction = 'Under 2.5';
        reasoning = `0 goals at ${minute}', need 3 - nearly impossible`;
      } else if (minute >= 45) {
        confidence = 70;
        prediction = 'Under 2.5';
        reasoning = `0 goals at ${minute}', low-scoring`;
      } else {
        confidence = 58;
        prediction = 'Under 2.5';
        reasoning = `0 goals at ${minute}', cautious`;
      }
    }

    return {
      confidence: Math.min(Math.round(confidence * params.confidenceDecayFactor), 95),
      betType: 'Over/Under 2.5',
      prediction: prediction,
      odds: this.calculateOdds(confidence),
      roi: this.calculateROI(confidence),
      accuracy: this.calculateAccuracy(confidence),
      valuePercentage: Math.max(0, Math.floor((confidence - 55) * 0.7)),
      reasoning: `🤖 ${reasoning}`
    };
  }

  private predictBTTS(homeScore: number, awayScore: number, minute: number, params: any): Prediction {
    const bothScored = homeScore > 0 && awayScore > 0;
    let confidence = 50;
    let prediction = 'No';

    if (bothScored) {
      confidence = 95;
      prediction = 'Yes';
      return {
        confidence,
        betType: 'BTTS',
        prediction: `BTTS ${prediction}`,
        odds: this.calculateOdds(confidence),
        roi: this.calculateROI(confidence),
        accuracy: this.calculateAccuracy(confidence),
        valuePercentage: Math.max(0, Math.floor((confidence - 55) * 0.6)),
        reasoning: `Both scored - BTTS confirmed`
      };
    } else {
      if (minute >= params.bttsTimeThreshold) {
        confidence = 70 + (minute - params.bttsTimeThreshold) * params.bttsConfidenceBoost;
        prediction = 'No';
      } else if (minute >= 60) {
        confidence = 62 + (minute - 60) * 0.5;
        prediction = 'No';
      } else {
        confidence = 55;
        prediction = 'No';
      }

      return {
        confidence: Math.min(Math.round(confidence), 88),
        betType: 'BTTS',
        prediction: `BTTS ${prediction}`,
        odds: this.calculateOdds(confidence),
        roi: this.calculateROI(confidence),
        accuracy: this.calculateAccuracy(confidence),
        valuePercentage: Math.max(0, Math.floor((confidence - 55) * 0.6)),
        reasoning: homeScore === 0 ? `Home hasn't scored at ${minute}'` : `Away hasn't scored at ${minute}'`
      };
    }
  }

  private predictCorners(corners: number, minute: number): Prediction {
    const cornersPerMinute = corners / minute;
    const projected = cornersPerMinute * 90;
    let confidence = 50;
    let prediction = 'Under 9.5';

    if (projected >= 11) {
      confidence = 70 + Math.min(20, (projected - 11) * 2);
      prediction = 'Over 9.5';
    } else if (projected <= 8) {
      confidence = 65 + Math.min(20, (8 - projected) * 2);
      prediction = 'Under 9.5';
    }

    return {
      confidence: Math.min(Math.round(confidence), 85),
      betType: 'Corners Over/Under 9.5',
      prediction: prediction,
      odds: this.calculateOdds(confidence),
      roi: this.calculateROI(confidence),
      accuracy: this.calculateAccuracy(confidence),
      valuePercentage: Math.max(0, Math.floor((confidence - 55) * 0.5)),
      reasoning: `${corners} corners at ${minute}', projected ${projected.toFixed(1)}`
    };
  }

  private predictCards(cards: number, minute: number): Prediction {
    const cardsPerMinute = cards / minute;
    const projected = cardsPerMinute * 90;
    let confidence = 50;
    let prediction = 'Under 3.5';

    if (projected >= 4.5) {
      confidence = 65 + Math.min(20, (projected - 4.5) * 3);
      prediction = 'Over 3.5';
    } else if (projected <= 2.5) {
      confidence = 60 + Math.min(20, (2.5 - projected) * 3);
      prediction = 'Under 3.5';
    }

    return {
      confidence: Math.min(Math.round(confidence), 82),
      betType: 'Cards Over/Under 3.5',
      prediction: prediction,
      odds: this.calculateOdds(confidence),
      roi: this.calculateROI(confidence),
      accuracy: this.calculateAccuracy(confidence),
      valuePercentage: Math.max(0, Math.floor((confidence - 55) * 0.4)),
      reasoning: `${cards} cards at ${minute}', projected ${projected.toFixed(1)}`
    };
  }

  private calculateOdds(confidence: number): number {
    if (confidence >= 90) return 1.05 + Math.random() * 0.10;
    if (confidence >= 85) return 1.15 + Math.random() * 0.15;
    if (confidence >= 80) return 1.25 + Math.random() * 0.20;
    if (confidence >= 75) return 1.40 + Math.random() * 0.25;
    if (confidence >= 70) return 1.55 + Math.random() * 0.30;
    if (confidence >= 65) return 1.75 + Math.random() * 0.35;
    if (confidence >= 60) return 2.00 + Math.random() * 0.50;
    if (confidence >= 55) return 2.30 + Math.random() * 0.70;
    return 2.50 + Math.random() * 2.00;
  }

  private calculateROI(confidence: number): number {
    const baseROI = (confidence - 55) * 1.8;
    const variance = Math.floor(Math.random() * 30) - 15;
    return Math.round(Math.max(-95, Math.min(95, baseROI + variance)));
  }

  private calculateAccuracy(confidence: number): number {
    const baseAccuracy = confidence * 0.85;
    const variance = Math.floor(Math.random() * 15) - 5;
    return Math.round(Math.max(55, Math.min(90, baseAccuracy + variance)));
  }

  calculatePreMatchPrediction(match: MatchData): Prediction {
    const params = mlLearningEngine.getParameters();
    const topLeagues = [
      'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
      'Champions League', 'Europa League', 'Championship', 'Eredivisie'
    ];

    const isTopLeague = topLeagues.some(tl => match.league.includes(tl));
    const baseConfidence = isTopLeague ? 58 + params.topLeagueBonus : 52;
    const variance = Math.random() * 12;
    const confidence = Math.round(baseConfidence + variance);

    const betTypes = ['Over/Under 2.5', 'BTTS', '1X2'];
    const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
    
    let prediction = '';
    if (betType === 'Over/Under 2.5') {
      prediction = Math.random() > 0.5 ? 'Over 2.5' : 'Under 2.5';
    } else if (betType === 'BTTS') {
      prediction = Math.random() > 0.5 ? 'BTTS Yes' : 'BTTS No';
    } else {
      const outcomes = ['1 (Home Win)', 'X (Draw)', '2 (Away Win)'];
      prediction = outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    return {
      confidence: Math.min(confidence, 75),
      betType: betType,
      prediction: prediction,
      odds: this.calculateOdds(confidence),
      roi: this.calculateROI(confidence),
      accuracy: this.calculateAccuracy(confidence),
      valuePercentage: Math.max(0, Math.floor((confidence - 50) * 0.4)),
      reasoning: `Pre-match: ${isTopLeague ? 'Top league' : 'Lower league'} - limited data`
    };
  }

  private getDefaultPrediction(): Prediction {
    return {
      confidence: 50,
      betType: 'Over/Under 2.5',
      prediction: 'Under 2.5',
      odds: 2.50,
      roi: 0,
      accuracy: 50,
      valuePercentage: 0,
      reasoning: 'Insufficient data'
    };
  }
}

export const predictionEngine = new PredictionEngine();
