export class XGPredictor {
  predictGoals(teamStats: any): number {
    return teamStats.xG || teamStats.avgGoals || 1.5;
  }

  predictOverUnder(homeXG: number, awayXG: number, line: number = 2.5): any {
    const totalXG = homeXG + awayXG;
    const probability = totalXG > line ? 0.65 : 0.35;
    return { over: probability, under: 1 - probability };
  }
}
