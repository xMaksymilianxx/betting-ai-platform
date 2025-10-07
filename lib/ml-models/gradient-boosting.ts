export class GradientBoostingModel {
  async predict(features: any): Promise<number> {
    const score = this.calculateScore(features);
    return 1 / (1 + Math.exp(-score));
  }

  private calculateScore(features: any): number {
    return (
      features.homeForm * 0.3 +
      features.awayForm * 0.2 +
      features.h2h * 0.25 +
      features.homeAdvantage * 0.15 +
      features.recentMomentum * 0.1
    );
  }
}
