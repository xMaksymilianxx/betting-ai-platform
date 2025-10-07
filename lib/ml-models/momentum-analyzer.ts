export class MomentumAnalyzer {
  analyzeMomentum(recentResults: string[]): number {
    let score = 0;
    recentResults.forEach((result, idx) => {
      const weight = (recentResults.length - idx) / recentResults.length;
      if (result === 'W') score += weight * 10;
      else if (result === 'D') score += weight * 5;
    });
    return Math.min(Math.max(score, -10), 10);
  }
}
