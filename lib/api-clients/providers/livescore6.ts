import { Match } from '../types';

export class Livescore6Client {
  private readonly apiKey = process.env.RAPIDAPI_KEY || '';
  private readonly baseUrl = 'https://livescore6.p.rapidapi.com';

  async fetchMatches(): Promise<Match[]> {
    try {
      const response = await fetch(`${this.baseUrl}/matches/v2/list-live?Category=soccer`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        console.log(`Livescore6 API: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return this.parseMatches(data);
      
    } catch (error) {
      console.error('Livescore6 error:', error);
      return [];
    }
  }

  async fetchOdds(matchId: string): Promise<any> {
    // Livescore6 doesn't provide odds
    return null;
  }

  async fetchStatistics(matchId: string): Promise<any> {
    // Livescore6 doesn't provide detailed statistics
    return null;
  }

  private parseMatches(data: any): Match[] {
    const matches: Match[] = [];

    try {
      if (!data.Stages) return [];

      data.Stages.forEach((stage: any) => {
        stage.Events?.forEach((event: any) => {
          // Only LIVE matches
          if (event.Eps !== 'LIVE') return;

          matches.push({
            id: `livescore6-${event.Eid}`,
            home: event.T1?.[0]?.Nm || 'Home Team',
            away: event.T2?.[0]?.Nm || 'Away Team',
            league: stage.Snm || 'Unknown League',
            country: stage.Ccd || 'Unknown',
            sport: 'football',
            status: 'live',
            homeScore: event.Tr1 || 0,
            awayScore: event.Tr2 || 0,
            minute: event.Epr || 0,
            score: `${event.Tr1 || 0} - ${event.Tr2 || 0}`,
            time: new Date(event.Esd * 1000).toISOString()
          });
        });
      });

      console.log(`Livescore6: Parsed ${matches.length} matches`);
      
    } catch (error) {
      console.error('Livescore6 parse error:', error);
    }

    return matches;
  }
}
