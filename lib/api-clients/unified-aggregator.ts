import axios from 'axios';
import { Match, Prediction } from '../utils/types';

export class UnifiedDataAggregator {
  private footballDataKey: string;
  private sportmonksKey: string;
  private liveScoreKey: string;
  private liveScoreSecret: string;
  private apiFootballKey: string;

  constructor() {
    this.footballDataKey = process.env.FOOTBALL_DATA_API_KEY || '';
    this.sportmonksKey = process.env.SPORTMONKS_API_KEY || '';
    this.liveScoreKey = process.env.LIVE_SCORE_API_KEY || '';
    this.liveScoreSecret = process.env.LIVE_SCORE_API_SECRET || '';
    this.apiFootballKey = process.env.API_FOOTBALL_KEY || '';
  }

  async fetchMatchData(matchId: string): Promise<Match | null> {
    try {
      const [footballData, apiFootball] = await Promise.allSettled([
        this.getFootballDataMatch(matchId),
        this.getAPIFootballMatch(matchId),
      ]);

      return this.mergeMatchData(footballData, apiFootball);
    } catch (error) {
      console.error('Error fetching match data:', error);
      return null;
    }
  }

  private async getFootballDataMatch(matchId: string) {
    const response = await axios.get(
      `https://api.football-data.org/v4/matches/${matchId}`,
      { headers: { 'X-Auth-Token': this.footballDataKey } }
    );
    return response.data;
  }

  private async getAPIFootballMatch(matchId: string) {
    const response = await axios.get(
      `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
      { headers: { 'x-rapidapi-key': this.apiFootballKey } }
    );
    return response.data.response[0];
  }

  async getLiveMatches(): Promise<Match[]> {
    try {
      const response = await axios.get(
        'https://v3.football.api-sports.io/fixtures?live=all',
        { headers: { 'x-rapidapi-key': this.apiFootballKey } }
      );
      
      return response.data.response.map((match: any) => this.normalizeMatch(match));
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  async getPredictions(matchId: string): Promise<Prediction | null> {
    try {
      const response = await axios.get(
        `https://v3.football.api-sports.io/predictions?fixture=${matchId}`,
        { headers: { 'x-rapidapi-key': this.apiFootballKey } }
      );
      
      return this.normalizePrediction(response.data.response[0]);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return null;
    }
  }

  private normalizeMatch(data: any): Match {
    return {
      id: data.fixture.id.toString(),
      homeTeam: {
        id: data.teams.home.id.toString(),
        name: data.teams.home.name,
        logo: data.teams.home.logo,
        form: '',
      },
      awayTeam: {
        id: data.teams.away.id.toString(),
        name: data.teams.away.name,
        logo: data.teams.away.logo,
        form: '',
      },
      competition: {
        id: data.league.id.toString(),
        name: data.league.name,
        country: data.league.country,
        logo: data.league.logo,
        season: data.league.season.toString(),
      },
      date: new Date(data.fixture.date),
      status: this.mapStatus(data.fixture.status.short),
      score: data.goals.home !== null ? {
        home: data.goals.home,
        away: data.goals.away,
      } : undefined,
    };
  }

  private mapStatus(status: string): Match['status'] {
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P'];
    if (liveStatuses.includes(status)) return 'LIVE';
    if (status === 'FT') return 'FINISHED';
    if (status === 'PST' || status === 'CANC') return 'POSTPONED';
    return 'SCHEDULED';
  }

  private normalizePrediction(data: any): Prediction {
    return {
      id: Math.random().toString(36).substr(2, 9),
      matchId: data.fixture.id.toString(),
      type: 'MATCH_WINNER',
      prediction: data.predictions.winner.name,
      confidence: parseFloat(data.predictions.percent.home) || 50,
      expectedValue: 0,
      aiInsights: [],
      modelBreakdown: [],
      createdAt: new Date(),
    };
  }

  private mergeMatchData(source1: any, source2: any): Match | null {
    if (source1.status === 'fulfilled') {
      return this.normalizeMatch(source1.value);
    }
    if (source2.status === 'fulfilled') {
      return this.normalizeMatch(source2.value);
    }
    return null;
  }
}
