export class MomentumAnalyzer {
  analyze(matchData: any): any {
    const homeMomentum = this.calculateMomentum(matchData.homeTeam);
    const awayMomentum = this.calculateMomentum(matchData.awayTeam);
    
    const diff = homeMomentum - awayMomentum;
    
    return {
      model: 'Momentum Analyzer',
      outcome: diff > 0.5 ? 'HOME' : diff < -0.5 ? 'AWAY' : 'DRAW',
      confidence: Math.min(Math.abs(diff) * 30 + 55, 85),
      homeMomentum,
      awayMomentum,
      momentumDiff: diff,
    };
  }

  private calculateMomentum(team: any): number {
    const form = team?.form || 'DDD';
    const recentForm = this.parseRecentForm(form);
    const goalsFor = team?.goalsFor || 0;
    const goalsAgainst = team?.goalsAgainst || 0;
    
    const formScore = recentForm / 3;
    const goalDiff = (goalsFor - goalsAgainst) / 10;
    
    return formScore * 0.7 + goalDiff * 0.3;
  }

  private parseRecentForm(form: string): number {
    let score = 0;
    const weights = [1.5, 1.3, 1.1, 0.9, 0.7];
    
    for (let i = 0; i < Math.min(form.length, 5); i++) {
      const weight = weights[i] || 1;
      if (form[i] === 'W') score += 3 * weight;
      else if (form[i] === 'D') score += 1 * weight;
    }
    
    return score / weights.slice(0, form.length).reduce((a, b) => a + b, 0);
  }

  detectTrend(form: string): 'RISING' | 'FALLING' | 'STABLE' {
    const recent = form.slice(0, 3);
    const older = form.slice(3, 6);
    
    const recentScore = this.parseRecentForm(recent);
    const olderScore = this.parseRecentForm(older);
    
    if (recentScore > olderScore * 1.2) return 'RISING';
    if (recentScore < olderScore * 0.8) return 'FALLING';
    return 'STABLE';
  }
}
