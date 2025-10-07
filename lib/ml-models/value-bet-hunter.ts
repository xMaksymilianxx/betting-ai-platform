export class ValueBetHunter {
  findValueBets(matches: any[], odds: any[]): any[] {
    const valueBets = [];
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchOdds = odds[i];
      
      const prediction = this.predictProbabilities(match);
      const value = this.calculateValue(prediction, matchOdds);
      
      if (value.edge > 0.05) {
        valueBets.push({
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          market: value.market,
          prediction: value.prediction,
          odds: value.odds,
          probability: value.probability,
          edge: value.edge,
          expectedValue: value.expectedValue,
          confidence: value.confidence,
          recommendation: this.getRecommendation(value.edge, value.confidence),
        });
      }
    }
    
    return valueBets.sort((a, b) => b.expectedValue - a.expectedValue);
  }

  private predictProbabilities(match: any): any {
    const homeWinProb = this.calculateWinProbability(match.homeTeam, match.awayTeam, true);
    const awayWinProb = this.calculateWinProbability(match.awayTeam, match.homeTeam, false);
    const drawProb = 1 - homeWinProb - awayWinProb;
    
    return {
      home: homeWinProb,
      draw: Math.max(drawProb, 0.1),
      away: awayWinProb,
    };
  }

  private calculateWinProbability(team1: any, team2: any, isHome: boolean): number {
    const formDiff = this.parseForm(team1.form) - this.parseForm(team2.form);
    const goalDiff = (team1.goalsFor - team1.goalsAgainst) - 
                     (team2.goalsFor - team2.goalsAgainst);
    
    let prob = 0.33 + (formDiff * 0.05) + (goalDiff * 0.01);
    if (isHome) prob += 0.1;
    
    return Math.min(Math.max(prob, 0.15), 0.75);
  }

  private calculateValue(prediction: any, odds: any): any {
    const markets = [
      { name: 'home', probability: prediction.home, odds: odds.home },
      { name: 'draw', probability: prediction.draw, odds: odds.draw },
      { name: 'away', probability: prediction.away, odds: odds.away },
    ];
    
    let bestValue = { edge: -1, expectedValue: 0 };
    
    for (const market of markets) {
      const impliedProb = 1 / market.odds;
      const edge = market.probability - impliedProb;
      const expectedValue = (market.probability * market.odds) - 1;
      
      if (edge > bestValue.edge) {
        bestValue = {
          market: market.name,
          prediction: market.name.toUpperCase(),
          odds: market.odds,
          probability: market.probability,
          edge,
          expectedValue,
          confidence: market.probability * 100,
        };
      }
    }
    
    return bestValue;
  }

  private parseForm(form: string = 'DDD'): number {
    let score = 0;
    for (const char of form) {
      if (char === 'W') score += 3;
      else if (char === 'D') score += 1;
    }
    return score / form.length;
  }

  private getRecommendation(edge: number, confidence: number): string {
    if (edge > 0.15 && confidence > 70) return 'STRONG_BET';
    if (edge > 0.10 && confidence > 60) return 'MODERATE_BET';
    if (edge > 0.05 && confidence > 55) return 'WEAK_BET';
    return 'AVOID';
  }
}
