// Enhanced Self-Learning ML Engine with better parameter tuning

interface MatchResult {
  matchId: string;
  predicted: string;
  actual: string;
  confidence: number;
  correct: boolean;
  betType: string;
  league: string;
  timestamp: string;
}

interface ModelVersion {
  version: number;
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  parameters: ModelParameters;
  timestamp: string;
}

interface ModelParameters {
  overUnderLateGameThreshold: number;
  overUnderMidGameMultiplier: number;
  overUnderEarlyGameCaution: number;
  oneXTwoLeadThreshold: number;
  oneXTwoTimeMultiplier: number;
  bttsTimeThreshold: number;
  bttsConfidenceBoost: number;
  minimumMinuteForPrediction: number;
  confidenceDecayFactor: number;
  topLeagueBonus: number;
}

const DEFAULT_PARAMETERS: ModelParameters = {
  overUnderLateGameThreshold: 75,
  overUnderMidGameMultiplier: 1.3,
  overUnderEarlyGameCaution: 0.85,
  oneXTwoLeadThreshold: 2,
  oneXTwoTimeMultiplier: 1.2,
  bttsTimeThreshold: 80,
  bttsConfidenceBoost: 1.8,
  minimumMinuteForPrediction: 25,
  confidenceDecayFactor: 0.98,
  topLeagueBonus: 6
};

export class MLLearningEngine {
  private currentModel: ModelVersion;
  private history: MatchResult[] = [];
  private bestModel: ModelVersion;
  private learningRate = 0.08; // Increased for faster learning
  
  constructor() {
    this.currentModel = {
      version: 1,
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      parameters: { ...DEFAULT_PARAMETERS },
      timestamp: new Date().toISOString()
    };
    this.bestModel = { ...this.currentModel };
    this.loadModel();
  }

  getParameters(): ModelParameters {
    return this.currentModel.parameters;
  }

  recordResult(result: MatchResult) {
    this.history.push(result);
    this.currentModel.totalPredictions++;
    if (result.correct) this.currentModel.correctPredictions++;
    
    this.currentModel.accuracy = 
      (this.currentModel.correctPredictions / this.currentModel.totalPredictions) * 100;
    
    console.log(`📊 Model v${this.currentModel.version} accuracy: ${this.currentModel.accuracy.toFixed(2)}%`);
    
    // Learn every 8 predictions (faster improvement)
    if (this.currentModel.totalPredictions % 8 === 0) {
      this.learn();
    }
    
    this.saveModel();
  }

  private learn() {
    console.log('🧠 ML Learning iteration...');
    
    const recentResults = this.history.slice(-40);
    const byBetType = this.groupByBetType(recentResults);
    
    for (const [betType, results] of Object.entries(byBetType)) {
      const accuracy = this.calculateAccuracy(results);
      console.log(`  ${betType}: ${accuracy.toFixed(1)}% (${results.length} samples)`);
      
      if (betType.includes('Over/Under')) {
        this.optimizeOverUnder(results, accuracy);
      } else if (betType === '1X2') {
        this.optimize1X2(results, accuracy);
      } else if (betType === 'BTTS') {
        this.optimizeBTTS(results, accuracy);
      }
    }
    
    // Compare with best model
    if (this.currentModel.accuracy > this.bestModel.accuracy) {
      console.log(`✅ New best! ${this.currentModel.accuracy.toFixed(2)}% > ${this.bestModel.accuracy.toFixed(2)}%`);
      this.bestModel = JSON.parse(JSON.stringify(this.currentModel));
    } else if (this.currentModel.accuracy < this.bestModel.accuracy - 8) {
      console.log(`⚠️ Rollback to v${this.bestModel.version} (${this.bestModel.accuracy.toFixed(2)}%)`);
      this.currentModel = JSON.parse(JSON.stringify(this.bestModel));
      this.currentModel.version++;
    } else {
      this.currentModel.version++;
    }
    
    this.currentModel.timestamp = new Date().toISOString();
    this.saveModel();
  }

  private optimizeOverUnder(results: MatchResult[], accuracy: number) {
    const params = this.currentModel.parameters;
    const falseOvers = results.filter(r => !r.correct && r.predicted.includes('Over')).length;
    const falseUnders = results.filter(r => !r.correct && r.predicted.includes('Under')).length;
    
    if (falseOvers > falseUnders + 2) {
      // Too many false Overs - be more conservative
      params.overUnderLateGameThreshold += 3;
      params.overUnderEarlyGameCaution -= 0.08;
      console.log('  📉 Reducing Over predictions (more conservative)');
    } else if (falseUnders > falseOvers + 2) {
      // Too many false Unders - be more aggressive
      params.overUnderLateGameThreshold -= 3;
      params.overUnderEarlyGameCaution += 0.08;
      console.log('  📈 Increasing Over predictions (more aggressive)');
    }
    
    // Ensure within reasonable bounds
    params.overUnderLateGameThreshold = Math.max(65, Math.min(85, params.overUnderLateGameThreshold));
    params.overUnderEarlyGameCaution = Math.max(0.7, Math.min(1.0, params.overUnderEarlyGameCaution));
  }

  private optimize1X2(results: MatchResult[], accuracy: number) {
    const params = this.currentModel.parameters;
    const incorrect = results.filter(r => !r.correct).length;
    
    if (incorrect > results.length * 0.35) {
      // Too many errors - be more conservative
      params.oneXTwoLeadThreshold += 0.3;
      params.oneXTwoTimeMultiplier += 0.15;
      console.log('  🎯 More conservative 1X2 predictions');
    } else if (accuracy > 80) {
      // Very good accuracy - can be more aggressive
      params.oneXTwoLeadThreshold -= 0.15;
      console.log('  🎯 More aggressive 1X2 predictions');
    }
    
    params.oneXTwoLeadThreshold = Math.max(1.5, Math.min(3.0, params.oneXTwoLeadThreshold));
    params.oneXTwoTimeMultiplier = Math.max(0.9, Math.min(1.8, params.oneXTwoTimeMultiplier));
  }

  private optimizeBTTS(results: MatchResult[], accuracy: number) {
    const params = this.currentModel.parameters;
    const falseYes = results.filter(r => !r.correct && r.predicted.includes('Yes')).length;
    const falseNo = results.filter(r => !r.correct && r.predicted.includes('No')).length;
    
    if (falseNo > falseYes + 1) {
      // Too many false Nos
      params.bttsTimeThreshold += 3;
      console.log('  ⚽ Reducing BTTS No confidence');
    } else if (falseYes > falseNo + 1) {
      // Too many false Yes
      params.bttsTimeThreshold -= 3;
      console.log('  ⚽ Increasing BTTS No confidence');
    }
    
    params.bttsTimeThreshold = Math.max(70, Math.min(88, params.bttsTimeThreshold));
  }

  private groupByBetType(results: MatchResult[]): Record<string, MatchResult[]> {
    return results.reduce((acc, result) => {
      if (!acc[result.betType]) acc[result.betType] = [];
      acc[result.betType].push(result);
      return acc;
    }, {} as Record<string, MatchResult[]>);
  }

  private calculateAccuracy(results: MatchResult[]): number {
    if (results.length === 0) return 0;
    return (results.filter(r => r.correct).length / results.length) * 100;
  }

  getStatistics() {
    const recentResults = this.history.slice(-50);
    
    return {
      currentModel: this.currentModel,
      bestModel: this.bestModel,
      totalPredictions: this.history.length,
      recentAccuracy: this.calculateAccuracy(recentResults),
      last24hAccuracy: this.calculateAccuracy(
        this.history.filter(r => {
          const age = Date.now() - new Date(r.timestamp).getTime();
          return age < 24 * 60 * 60 * 1000;
        })
      ),
      byBetType: this.getAccuracyByBetType(),
      improvementRate: this.currentModel.accuracy - 75 // Compare to baseline 75%
    };
  }

  private getAccuracyByBetType() {
    const recent = this.history.slice(-100);
    const grouped = this.groupByBetType(recent);
    return Object.entries(grouped).map(([betType, results]) => ({
      betType,
      accuracy: this.calculateAccuracy(results),
      count: results.length,
      trend: this.calculateTrend(results)
    }));
  }

  private calculateTrend(results: MatchResult[]): 'improving' | 'declining' | 'stable' {
    if (results.length < 10) return 'stable';
    
    const firstHalf = results.slice(0, Math.floor(results.length / 2));
    const secondHalf = results.slice(Math.floor(results.length / 2));
    
    const firstAccuracy = this.calculateAccuracy(firstHalf);
    const secondAccuracy = this.calculateAccuracy(secondHalf);
    
    if (secondAccuracy > firstAccuracy + 5) return 'improving';
    if (secondAccuracy < firstAccuracy - 5) return 'declining';
    return 'stable';
  }

  private saveModel() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('ml_current_model', JSON.stringify(this.currentModel));
      localStorage.setItem('ml_best_model', JSON.stringify(this.bestModel));
      localStorage.setItem('ml_history', JSON.stringify(this.history.slice(-250)));
    } catch (e) {
      console.error('Save failed:', e);
    }
  }

  private loadModel() {
    if (typeof window === 'undefined') return;
    try {
      const current = localStorage.getItem('ml_current_model');
      const best = localStorage.getItem('ml_best_model');
      const history = localStorage.getItem('ml_history');
      
      if (current) this.currentModel = JSON.parse(current);
      if (best) this.bestModel = JSON.parse(best);
      if (history) this.history = JSON.parse(history);
      
      console.log(`📚 Loaded ML model v${this.currentModel.version} (${this.currentModel.accuracy.toFixed(2)}%)`);
      console.log(`🏆 Best model: v${this.bestModel.version} (${this.bestModel.accuracy.toFixed(2)}%)`);
    } catch (e) {
      console.error('Load failed:', e);
    }
  }

  reset() {
    this.currentModel = {
      version: 1,
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      parameters: { ...DEFAULT_PARAMETERS },
      timestamp: new Date().toISOString()
    };
    this.bestModel = { ...this.currentModel };
    this.history = [];
    this.saveModel();
    console.log('🔄 Model reset to defaults');
  }
}

export const mlLearningEngine = new MLLearningEngine();
