export class XGPredictor {
  predictOverUnder(homeXG: number, awayXG: number, line: number = 2.5): any {
    const totalXG = homeXG + awayXG;
    const probability = this.poissonProbability(totalXG, line);
    
    return {
      market: `Over/Under ${line}`,
      prediction: totalXG > line ? 'OVER' : 'UNDER',
      confidence: Math.abs(totalXG - line) * 20 + 60,
      expectedGoals: totalXG,
      probability,
    };
  }

  predictBTTS(homeXG: number, awayXG: number): any {
    const homeProb = 1 - Math.exp(-homeXG);
    const awayProb = 1 - Math.exp(-awayXG);
    const bttsProb = homeProb * awayProb;
    
    return {
      market: 'Both Teams to Score',
      prediction: bttsProb > 0.5 ? 'YES' : 'NO',
      confidence: Math.abs(bttsProb - 0.5) * 100 + 50,
      probability: bttsProb,
    };
  }

  predictCorrectScore(homeXG: number, awayXG: number): any {
    const homeGoals = Math.round(homeXG);
    const awayGoals = Math.round(awayXG);
    
    return {
      market: 'Correct Score',
      prediction: `${homeGoals}-${awayGoals}`,
      confidence: 45,
      probability: this.scoreProb(homeXG, homeGoals) * this.scoreProb(awayXG, awayGoals),
    };
  }

  private poissonProbability(lambda: number, k: number): number {
    let prob = 0;
    for (let i = 0; i <= Math.floor(k); i++) {
      prob += this.poissonExact(lambda, i);
    }
    return 1 - prob;
  }

  private poissonExact(lambda: number, k: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  private scoreProb(xg: number, goals: number): number {
    return this.poissonExact(xg, goals);
  }
}
