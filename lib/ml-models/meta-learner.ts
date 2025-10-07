import { Prediction, Match, BettingDecision } from '../utils/types';

export class MetaLearner {
  private modelWeights: Map<string, number>;

  constructor() {
    // Initial weights - będą aktualizowane przez learning system
    this.modelWeights = new Map([
      ['gradient_boosting', 0.20],
      ['xg_predictor', 0.18],
      ['momentum_analyzer', 0.15],
      ['context_aware_nn', 0.17],
      ['value_bet_hunter', 0.15],
      ['live_in_play', 0.15],
    ]);
  }

  async synthesizePrediction(
    match: Match,
    modelPredictions: Map<string, any>
  ): Promise<BettingDecision> {
    // Weighted voting system
    let totalConfidence = 0;
    let weightedPrediction = 0;
    const insights: string[] = [];

    for (const [modelName, prediction] of modelPredictions) {
      const weight = this.modelWeights.get(modelName) || 0.1;
      totalConfidence += prediction.confidence * weight;
      weightedPrediction += prediction.value * weight;
    }

    // Calculate consensus
    const consensus = this.calculateConsensus(modelPredictions);
    
    // Risk assessment
    const riskLevel = this.assessRisk(totalConfidence, consensus);
    
    // Expected value calculation
    const expectedValue = this.calculateExpectedValue(
      weightedPrediction,
      totalConfidence
    );

    // Final recommendation
    const recommendation = this.makeRecommendation(
      totalConfidence,
      expectedValue,
      riskLevel
    );

    return {
      recommendation,
      confidence: totalConfidence,
      expectedValue,
      riskLevel,
      stakeRecommendation: this.calculateStake(expectedValue, riskLevel),
      reasoning: insights,
      alternativeMarkets: [],
    };
  }

  private calculateConsensus(predictions: Map<string, any>): number {
    const outcomes = Array.from(predictions.values()).map(p => p.outcome);
    const mode = this.findMode(outcomes);
    const agreement = outcomes.filter(o => o === mode).length / outcomes.length;
    return agreement;
  }

  private assessRisk(confidence: number, consensus: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (confidence > 75 && consensus > 0.8) return 'LOW';
    if (confidence > 60 && consensus > 0.6) return 'MEDIUM';
    return 'HIGH';
  }

  private calculateExpectedValue(prediction: number, confidence: number): number {
    // Kelly Criterion-based calculation
    const edge = (confidence / 100) * prediction - (1 - confidence / 100);
    return edge;
  }

  private makeRecommendation(
    confidence: number,
    ev: number,
    risk: string
  ): BettingDecision['recommendation'] {
    if (confidence > 75 && ev > 0.10 && risk === 'LOW') return 'STRONG_BET';
    if (confidence > 65 && ev > 0.05 && risk !== 'HIGH') return 'MODERATE_BET';
    if (ev < 0 || confidence < 60) return 'AVOID';
    return 'PASS';
  }

  private calculateStake(ev: number, risk: string): number {
    const baseStake = ev * 20; // Kelly fraction
    const riskMultiplier = risk === 'LOW' ? 1 : risk === 'MEDIUM' ? 0.5 : 0.25;
    return Math.min(Math.max(baseStake * riskMultiplier, 0), 5); // Max 5% bankroll
  }

  private findMode(arr: any[]): any {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }
}
