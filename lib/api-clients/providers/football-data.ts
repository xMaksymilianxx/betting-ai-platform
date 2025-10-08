import { Match } from '../types';

export class FootballDataClient {
  private readonly apiKey = process.env.FOOTBALL_DATA_KEY || '';
  private readonly baseUrl = 'https://api.football-data.org/v4';

  async fetchMatches(): Promise<Match[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch(`${this.baseUrl}/matches`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return this.parseMatches(data.matches);
      }
    } catch (error) {
      console.error('Football-Data error:', error);
    }
    return [];
  }

  async fetchOdds(matchId: string): Promise<any> {
    // Football-Data doesn't provide odds
    return null;
  }

  async fetchStatistics(matchId: string): Promise<any> {
    // Would need to fetch match details
    return null;
  }

  private parseMatches(matches: any[]): Match[] {
    return matches
      .filter(m => m.status === 'IN_PLAY')
      .map(match => ({
        id: `football-data-${match.id}`,
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        league: match.competition.name,
        country: match.competition.area?.name || 'Unknown',
        sport: 'football',
        status: 'live',
        homeScore: match.score.fullTime.home,
        awayScore: match.score.fullTime.away,
        minute: this.calculateMinute(match.utcDate),
        score: `${match.score.fullTime.home} - ${match.score.fullTime.away}`,
        time: match.utcDate
      }));
  }

  private calculateMinute(startTime: string): number {
    const start = new Date(startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 60000);
  }
}
