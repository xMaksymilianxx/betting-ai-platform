import { FootballDataAPI } from './football-data';
import { SportmonksAPI } from './sportmonks';
import { LiveScoreAPI } from './live-score';
import { APIFootballClient } from './api-football';

export class UnifiedDataAggregator {
  private footballData: FootballDataAPI;
  private sportmonks: SportmonksAPI;
  private liveScore: LiveScoreAPI;
  private apiFootball: APIFootballClient;

  constructor() {
    this.footballData = new FootballDataAPI();
    this.sportmonks = new SportmonksAPI();
    this.liveScore = new LiveScoreAPI();
    this.apiFootball = new APIFootballClient();
  }

  async fetchMatchData(matchId: string): Promise<any> {
    try {
      const [
        footballDataMatch,
        sportmonksPredictions,
        apiFootballStats,
      ] = await Promise.allSettled([
        this.footballData.getMatch(matchId),
        this.sportmonks.getPredictions(matchId),
        this.apiFootball.getStatistics(matchId),
      ]);

      return {
        basicData: footballDataMatch.status === 'fulfilled' ? footballDataMatch.value : null,
        predictions: sportmonksPredictions.status === 'fulfilled' ? sportmonksPredictions.value : null,
        statistics: apiFootballStats.status === 'fulfilled' ? apiFootballStats.value : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Aggregation error:', error);
      return null;
    }
  }

  async getLiveMatches(): Promise<any[]> {
    try {
      const [liveScoreData, apiFootballData] = await Promise.allSettled([
        this.liveScore.getLiveMatches(),
        this.apiFootball.getLiveMatches(),
      ]);

      const liveMatches = liveScoreData.status === 'fulfilled' ? liveScoreData.value : [];
      const apiMatches = apiFootballData.status === 'fulfilled' ? apiFootballData.value : [];

      return [...liveMatches, ...apiMatches];
    } catch (error) {
      console.error('Live matches error:', error);
      return [];
    }
  }

  async getPredictions(matchId: string): Promise<any> {
    try {
      const [sportmonks, apiFootball] = await Promise.allSettled([
        this.sportmonks.getPredictions(matchId),
        this.apiFootball.getPredictions(matchId),
      ]);

      return {
        sportmonks: sportmonks.status === 'fulfilled' ? sportmonks.value : null,
        apiFootball: apiFootball.status === 'fulfilled' ? apiFootball.value : null,
      };
    } catch (error) {
      console.error('Predictions error:', error);
      return null;
    }
  }
}
