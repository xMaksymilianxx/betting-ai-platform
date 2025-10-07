export class LiveInPlayModel {
  predictLiveOutcome(matchState: any): any {
    const { minute, homeScore, awayScore, statistics } = matchState;
    
    const scoreDiff = homeScore - awayScore;
    const timeRemaining = 90 - minute;
    const momentumShift = this.calculateLiveMomentum(statistics);
    
    return {
      model: 'Live In-Play',
      currentScore: `${homeScore}-${awayScore}`,
      minute,
      predictions: {
        nextGoal: this.predictNextGoal(momentumShift, statistics),
        finalScore: this.predictFinalScore(homeScore, awayScore, timeRemaining, momentumShift),
        overUnder: this.predictLiveOverUnder(homeScore + awayScore, timeRemaining),
      },
      confidence: this.calculateLiveConfidence(minute, momentumShift),
    };
  }

  private calculateLiveMomentum(stats: any): number {
    const homeShots = stats?.home?.shots || 0;
    const awayShots = stats?.away?.shots || 0;
    const homePossession = stats?.home?.possession || 50;
    
    const shotDiff = (homeShots - awayShots) / 10;
    const possessionDiff = (homePossession - 50) / 50;
    
    return shotDiff * 0.6 + possessionDiff * 0.4;
  }

  private predictNextGoal(momentum: number, stats: any): any {
    const homeProb = 0.5 + (momentum * 0.3);
    const awayProb = 0.5 - (momentum * 0.3);
    
    return {
      home: Math.max(Math.min(homeProb, 0.8), 0.2),
      away: Math.max(Math.min(awayProb, 0.8), 0.2),
    };
  }

  private predictFinalScore(home: number, away: number, timeLeft: number, momentum: number): any {
    const expectedGoals = (timeLeft / 90) * 2.5;
    const homeExpected = home + (expectedGoals * (0.5 + momentum * 0.3));
    const awayExpected = away + (expectedGoals * (0.5 - momentum * 0.3));
    
    return {
      home: Math.round(homeExpected),
      away: Math.round(awayExpected),
      confidence: Math.max(60 - timeLeft / 2, 40),
    };
  }

  private predictLiveOverUnder(currentGoals: number, timeLeft: number): any {
    const expectedAdditional = (timeLeft / 90) * 2.5;
    const projectedTotal = currentGoals + expectedAdditional;
    
    return {
      line: 2.5,
      prediction: projectedTotal > 2.5 ? 'OVER' : 'UNDER',
      projectedTotal: projectedTotal.toFixed(1),
      confidence: 70 - (timeLeft / 3),
    };
  }

  private calculateLiveConfidence(minute: number, momentum: number): number {
    const baseConfidence = 50 + (minute / 90) * 30;
    const momentumBonus = Math.abs(momentum) * 10;
    
    return Math.min(baseConfidence + momentumBonus, 90);
  }
}
