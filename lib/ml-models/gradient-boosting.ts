export class GradientBoostingModel {
  predict(matchData: any): any {
    const features = this.extractFeatures(matchData);
    const score = this.calculateScore(features);
    
    return {
      outcome: score > 0 ? 'HOME' : score < 0 ? 'AWAY' : 'DRAW',
      confidence: Math.min(Math.abs(score) * 10 + 60, 90),
      probability: this.scoreToProb(score),
    };
  }

  private extractFeatures(data: any) {
    return {
      homeForm: this.parseForm(data.homeTeam?.form),
      awayForm: this.parseForm(data.awayTeam?.form),
      homeGoalsFor: data.homeTeam?.goalsFor || 0,
      homeGoalsAgainst: data.homeTeam?.goalsAgainst || 0,
      awayGoalsFor: data.awayTeam?.goalsFor || 0,
      awayGoalsAgainst: data.awayTeam?.goalsAgainst || 0,
      homeAdvantage: 1.3,
    };
  }

  private calculateScore(features: any): number {
    const formDiff = features.homeForm - features.awayForm;
    const goalDiff = (features.homeGoalsFor - features.homeGoalsAgainst) -
                     (features.awayGoalsFor - features.awayGoalsAgainst);
    
    return (formDiff * 0.4 + goalDiff * 0.4 + features.homeAdvantage * 0.2);
  }

  private parseForm(form: string = 'DDD'): number {
    let score = 0;
    for (let i = 0; i < form.length; i++) {
      if (form[i] === 'W') score += 3;
      else if (form[i] === 'D') score += 1;
    }
    return score / form.length;
  }

  private scoreToProb(score: number): number {
    return 1 / (1 + Math.exp(-score));
  }
}
