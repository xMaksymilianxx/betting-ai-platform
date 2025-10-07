import { EnsembleModel } from './ensemble-model';
import { GradientBoostingModel } from './gradient-boosting';
import { XGPredictor } from './xg-predictor';

export class MetaLearner {
  private ensemble: EnsembleModel;
  private gradientBoosting: GradientBoostingModel;
  private xgPredictor: XGPredictor;

  constructor() {
    this.ensemble = new EnsembleModel();
    this.gradientBoosting = new GradientBoostingModel();
    this.xgPredictor = new XGPredictor();
  }

  async synthesizePrediction(matchData: any, modelPredictions: Map<string, any>): Promise<any> {
    try {
      const predictions = Array.from(modelPredictions.values());
      
      const averageConfidence = predictions.reduce(
        (sum, p) => sum + (p.confidence || 0),
        0
      ) / predictions.length;

      const consensusOutcome = this.getConsensusOutcome(predictions);
      
      const homeXG = matchData.homeTeam?.statistics?.xG || 1.5;
      const awayXG = matchData.awayTeam?.statistics?.xG || 1.2;
      
      const overUnder = this.xgPredictor.predictOverUnder(homeXG, awayXG, 2.5);

      return {
        prediction: consensusOutcome,
        confidence: averageConfidence,
        models: predictions,
        overUnder,
        recommendation: this.getRecommendation(averageConfidence),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Meta-learner error:', error);
      return null;
    }
  }

  private getConsensusOutcome(predictions: any[]): string {
    const outcomes = new Map<string, number>();
    
    predictions.forEach(p => {
      const outcome = p.outcome || p.prediction;
      if (outcome) {
        outcomes.set(outcome, (outcomes.get(outcome) || 0) + (p.confidence || 50));
      }
    });

    let maxOutcome = '';
    let maxScore = 0;
    outcomes.forEach((score, outcome) => {
      if (score > maxScore) {
        maxScore = score;
        maxOutcome = outcome;
      }
    });

    return maxOutcome || 'HOME';
  }

  private getRecommendation(confidence: number): string {
    if (confidence >= 75) return 'STRONG_BET';
    if (confidence >= 65) return 'MODERATE_BET';
    if (confidence >= 55) return 'WEAK_BET';
    return 'AVOID';
  }
}
