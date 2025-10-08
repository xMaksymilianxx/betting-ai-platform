import { Match } from '../types';

export class APIFootballClient {
  private readonly apiKey = process.env.API_FOOTBALL_KEY || '';
  private readonly baseUrl = 'https://v3.football.api-sports.io';

  async fetchMatches(): Promise<Match[]> {
    if (!this.apiKey) {
      console.log('API-Football: No API key configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/fixtures?live=all`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (!response.ok) {
        console.log(`API-Football: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        console.log('API-Football: No live matches');
        return [];
      }

      return this.parseMatches(data.response);
      
    } catch (error) {
      console.error('API-Football error:', error);
      return [];
    }
  }

  async fetchOdds(matchId: string): Promise<any> {
    try {
      const fixtureId = matchId.replace('api-football-', '');
      const response = await fetch(`${this.baseUrl}/odds?fixture=${fixtureId}`, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return this.parseOdds(data.response);
      }
    } catch (error) {
      console.error('API-Football odds error:', error);
    }
    return null;
  }

  async fetchStatistics(matchId: string): Promise<any> {
    try {
      const fixtureId = matchId.replace('api-football-', '');
      const response = await fetch(`${this.baseUrl}/fixtures/statistics?fixture=${fixtureId}`, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return this.parseStatistics(data.response);
      }
    } catch (error) {
      console.error('API-Football stats error:', error);
    }
    return null;
  }

  private parseMatches(fixtures: any[]): Match[] {
    return fixtures.map(fixture => ({
      id: `api-football-${fixture.fixture.id}`,
      home: fixture.teams.home.name,
      away: fixture.teams.away.name,
      league: fixture.league.name,
      country: fixture.league.country,
      sport: 'football',
      status: this.mapStatus(fixture.fixture.status.short),
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      minute: fixture.fixture.status.elapsed,
      score: `${fixture.goals.home || 0} - ${fixture.goals.away || 0}`,
      time: fixture.fixture.date,
      venue: fixture.fixture.venue?.name,
      referee: fixture.fixture.referee
    }));
  }

  private parseOdds(oddsData: any[]): any {
    if (!oddsData || oddsData.length === 0) return null;

    const bookmaker = oddsData[0].bookmakers?.[0];
    if (!bookmaker) return null;

    const odds: any = {};

    bookmaker.bets?.forEach((bet: any) => {
      if (bet.name === 'Match Winner') {
        odds.home = parseFloat(bet.values.find((v: any) => v.value === 'Home')?.odd || '0');
        odds.draw = parseFloat(bet.values.find((v: any) => v.value === 'Draw')?.odd || '0');
        odds.away = parseFloat(bet.values.find((v: any) => v.value === 'Away')?.odd || '0');
      }
      if (bet.name === 'Goals Over/Under') {
        const over25 = bet.values.find((v: any) => v.value === 'Over 2.5');
        const under25 = bet.values.find((v: any) => v.value === 'Under 2.5');
        if (over25) odds.over25 = parseFloat(over25.odd);
        if (under25) odds.under25 = parseFloat(under25.odd);
      }
      if (bet.name === 'Both Teams Score') {
        odds.bttsYes = parseFloat(bet.values.find((v: any) => v.value === 'Yes')?.odd || '0');
        odds.bttsNo = parseFloat(bet.values.find((v: any) => v.value === 'No')?.odd || '0');
      }
    });

    return odds;
  }

  private parseStatistics(statsData: any[]): any {
    if (!statsData || statsData.length !== 2) return null;

    const homeStats = statsData[0].statistics;
    const awayStats = statsData[1].statistics;
    const stats: any = {};

    const getValue = (statArray: any[], type: string) => {
      const stat = statArray.find((s: any) => s.type === type);
      return parseInt(stat?.value) || 0;
    };

    stats.homeCorners = getValue(homeStats, 'Corner Kicks');
    stats.awayCorners = getValue(awayStats, 'Corner Kicks');
    stats.corners = stats.homeCorners + stats.awayCorners;

    stats.homeCards = getValue(homeStats, 'Yellow Cards') + getValue(homeStats, 'Red Cards') * 2;
    stats.awayCards = getValue(awayStats, 'Yellow Cards') + getValue(awayStats, 'Red Cards') * 2;
    stats.cards = stats.homeCards + stats.awayCards;

    stats.homeShots = getValue(homeStats, 'Total Shots');
    stats.awayShots = getValue(awayStats, 'Total Shots');
    stats.shots = stats.homeShots + stats.awayShots;

    stats.homeShotsOnTarget = getValue(homeStats, 'Shots on Goal');
    stats.awayShotsOnTarget = getValue(awayStats, 'Shots on Goal');
    stats.shotsOnTarget = stats.homeShotsOnTarget + stats.awayShotsOnTarget;

    stats.homePossession = getValue(homeStats, 'Ball Possession');
    stats.awayPossession = getValue(awayStats, 'Ball Possession');

    stats.homeAttacks = getValue(homeStats, 'Total attacks');
    stats.awayAttacks = getValue(awayStats, 'Total attacks');
    stats.attacks = stats.homeAttacks + stats.awayAttacks;

    stats.homeDangerousAttacks = getValue(homeStats, 'Dangerous attacks');
    stats.awayDangerousAttacks = getValue(awayStats, 'Dangerous attacks');
    stats.dangerousAttacks = stats.homeDangerousAttacks + stats.awayDangerousAttacks;

    return stats;
  }

  private mapStatus(status: string): 'live' | 'scheduled' | 'finished' {
    const live = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT'];
    const finished = ['FT', 'AET', 'PEN'];
    if (live.includes(status)) return 'live';
    if (finished.includes(status)) return 'finished';
    return 'scheduled';
  }
}
