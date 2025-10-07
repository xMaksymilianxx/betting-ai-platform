// Enhanced Live Data Fetcher - Multi-sport support + Real odds

interface Match {
  id: string;
  home: string;
  away: string;
  league: string;
  country?: string;
  sport: string;
  status: 'live' | 'scheduled' | 'finished';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  score?: string;
  time: string;
  statistics?: {
    corners?: number;
    cards?: number;
    shots?: number;
    shotsOnTarget?: number;
    possession?: number;
    attacks?: number;
    dangerousAttacks?: number;
    offsides?: number;
    fouls?: number;
  };
  odds?: {
    home?: number;
    draw?: number;
    away?: number;
    over25?: number;
    under25?: number;
    bttsYes?: number;
    bttsNo?: number;
  };
}

class LiveDataFetcher {
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'c4e98069a3msh43378e5e19d1f3fp123456jsn1234567890ab';
  private readonly RAPIDAPI_HOST_LIVESCORE = 'livescore6.p.rapidapi.com';
  private readonly RAPIDAPI_HOST_FOOTBALL = 'api-football-v1.p.rapidapi.com';
  private readonly RAPIDAPI_HOST_BASKETBALL = 'api-basketball.p.rapidapi.com';

  async fetchAllMatches(): Promise<Match[]> {
    const allMatches: Match[] = [];

    try {
      const [livescoreMatches, footballMatches, basketballMatches, tennisMatches] = await Promise.allSettled([
        this.fetchFromLivescore(),
        this.fetchFromFootball(),
        this.fetchBasketball(),
        this.fetchTennis()
      ]);

      if (livescoreMatches.status === 'fulfilled') {
        console.log(`
🔴 LIVESCORE: ${livescoreMatches.value.length} matches`);
        allMatches.push(...livescoreMatches.value);
      }

      if (footballMatches.status === 'fulfilled') {
        console.log(`⚽ FOOTBALL: ${footballMatches.value.length} matches`);
        allMatches.push(...footballMatches.value);
      }

      if (basketballMatches.status === 'fulfilled') {
        console.log(`🏀 BASKETBALL: ${basketballMatches.value.length} matches`);
        allMatches.push(...basketballMatches.value);
      }

      if (tennisMatches.status === 'fulfilled') {
        console.log(`🎾 TENNIS: ${tennisMatches.value.length} matches`);
        allMatches.push(...tennisMatches.value);
      }

      console.log(`
📊 TOTAL: ${allMatches.length} matches
`);
      
    } catch (error) {
      console.error('❌ Error fetching:', error);
    }

    return this.deduplicateMatches(allMatches);
  }

  private async fetchFromLivescore(): Promise<Match[]> {
    try {
      const response = await fetch(`https://${this.RAPIDAPI_HOST_LIVESCORE}/matches/v2/list-live?Category=soccer`, {
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_LIVESCORE
        }
      });

      if (!response.ok) throw new Error(`Livescore: ${response.status}`);
      const data = await response.json();
      return this.parseLivescoreData(data);
    } catch (error) {
      console.error('Livescore error:', error);
      return [];
    }
  }

  private async fetchFromFootball(): Promise<Match[]> {
    try {
      const response = await fetch(`https://${this.RAPIDAPI_HOST_FOOTBALL}/v3/fixtures?live=all`, {
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_FOOTBALL
        }
      });

      if (!response.ok) throw new Error(`Football: ${response.status}`);
      const data = await response.json();
      return this.parseFootballData(data);
    } catch (error) {
      console.error('Football error:', error);
      return [];
    }
  }

  private async fetchBasketball(): Promise<Match[]> {
    try {
      const response = await fetch(`https://${this.RAPIDAPI_HOST_BASKETBALL}/games?live=all`, {
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_BASKETBALL
        }
      });

      if (!response.ok) throw new Error(`Basketball: ${response.status}`);
      const data = await response.json();
      return this.parseBasketballData(data);
    } catch (error) {
      console.error('Basketball error:', error);
      return [];
    }
  }

  private async fetchTennis(): Promise<Match[]> {
    try {
      // Tennis from Livescore API
      const response = await fetch(`https://${this.RAPIDAPI_HOST_LIVESCORE}/matches/v2/list-live?Category=tennis`, {
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_LIVESCORE
        }
      });

      if (!response.ok) throw new Error(`Tennis: ${response.status}`);
      const data = await response.json();
      return this.parseTennisData(data);
    } catch (error) {
      console.error('Tennis error:', error);
      return [];
    }
  }

  private parseLivescoreData(data: any): Match[] {
    const matches: Match[] = [];
    
    try {
      if (data?.Stages) {
        data.Stages.forEach((stage: any) => {
          stage.Events?.forEach((event: any) => {
            matches.push({
              id: `livescore-${event.Eid}`,
              home: event.T1?.[0]?.Nm || 'Unknown',
              away: event.T2?.[0]?.Nm || 'Unknown',
              league: stage.Snm || 'Unknown',
              country: stage.Ccd || 'Unknown',
              sport: 'football',
              status: this.mapStatus(event.Eps),
              homeScore: event.Tr1,
              awayScore: event.Tr2,
              minute: event.Epr,
              score: `${event.Tr1 || 0} - ${event.Tr2 || 0}`,
              time: new Date(event.Esd * 1000).toISOString(),
              odds: this.extractOdds(event)
            });
          });
        });
      }
    } catch (error) {
      console.error('Parse Livescore error:', error);
    }

    return matches;
  }

  private parseFootballData(data: any): Match[] {
    const matches: Match[] = [];
    
    try {
      if (data?.response) {
        data.response.forEach((fixture: any) => {
          matches.push({
            id: `football-${fixture.fixture?.id}`,
            home: fixture.teams?.home?.name || 'Unknown',
            away: fixture.teams?.away?.name || 'Unknown',
            league: fixture.league?.name || 'Unknown',
            country: fixture.league?.country || 'Unknown',
            sport: 'football',
            status: this.mapFootballStatus(fixture.fixture?.status?.short),
            homeScore: fixture.goals?.home,
            awayScore: fixture.goals?.away,
            minute: fixture.fixture?.status?.elapsed,
            score: `${fixture.goals?.home || 0} - ${fixture.goals?.away || 0}`,
            time: fixture.fixture?.date || new Date().toISOString(),
            statistics: this.extractStats(fixture),
            odds: this.extractFootballOdds(fixture)
          });
        });
      }
    } catch (error) {
      console.error('Parse Football error:', error);
    }

    return matches;
  }

  private parseBasketballData(data: any): Match[] {
    const matches: Match[] = [];
    
    try {
      if (data?.response) {
        data.response.forEach((game: any) => {
          matches.push({
            id: `basketball-${game.id}`,
            home: game.teams?.home?.name || 'Unknown',
            away: game.teams?.away?.name || 'Unknown',
            league: game.league?.name || 'Unknown',
            country: game.country?.name || 'Unknown',
            sport: 'basketball',
            status: this.mapBasketballStatus(game.status?.short),
            homeScore: game.scores?.home?.total,
            awayScore: game.scores?.away?.total,
            minute: game.status?.timer ? Math.floor(game.status.timer / 60) : undefined,
            score: `${game.scores?.home?.total || 0} - ${game.scores?.away?.total || 0}`,
            time: game.date || new Date().toISOString(),
            odds: this.extractBasketballOdds(game)
          });
        });
      }
    } catch (error) {
      console.error('Parse Basketball error:', error);
    }

    return matches;
  }

  private parseTennisData(data: any): Match[] {
    const matches: Match[] = [];
    
    try {
      if (data?.Stages) {
        data.Stages.forEach((stage: any) => {
          stage.Events?.forEach((event: any) => {
            matches.push({
              id: `tennis-${event.Eid}`,
              home: event.T1?.[0]?.Nm || 'Unknown',
              away: event.T2?.[0]?.Nm || 'Unknown',
              league: stage.Snm || 'Unknown',
              country: stage.Ccd || 'Unknown',
              sport: 'tennis',
              status: this.mapStatus(event.Eps),
              homeScore: event.Tr1,
              awayScore: event.Tr2,
              score: `${event.Tr1 || 0} - ${event.Tr2 || 0}`,
              time: new Date(event.Esd * 1000).toISOString(),
              odds: this.extractOdds(event)
            });
          });
        });
      }
    } catch (error) {
      console.error('Parse Tennis error:', error);
    }

    return matches;
  }

  private extractOdds(event: any): any {
    // Extract real odds from API if available
    if (event.odds) {
      return {
        home: event.odds.home || undefined,
        draw: event.odds.draw || undefined,
        away: event.odds.away || undefined,
        over25: event.odds.over_2_5 || undefined,
        under25: event.odds.under_2_5 || undefined
      };
    }
    return undefined;
  }

  private extractFootballOdds(fixture: any): any {
    // Check for odds in fixture
    if (fixture.odds && fixture.odds.length > 0) {
      const mainOdds = fixture.odds[0]?.values || [];
      return {
        home: mainOdds.find((o: any) => o.value === 'Home')?.odd,
        draw: mainOdds.find((o: any) => o.value === 'Draw')?.odd,
        away: mainOdds.find((o: any) => o.value === 'Away')?.odd
      };
    }
    return undefined;
  }

  private extractBasketballOdds(game: any): any {
    if (game.odds) {
      return {
        home: game.odds.home,
        away: game.odds.away
      };
    }
    return undefined;
  }

  private extractStats(fixture: any): any {
    if (!fixture.statistics) return undefined;
    
    const stats: any = {};
    fixture.statistics.forEach((team: any) => {
      team.statistics?.forEach((stat: any) => {
        if (stat.type === 'Corner Kicks') stats.corners = (stats.corners || 0) + (stat.value || 0);
        if (stat.type === 'Yellow Cards') stats.cards = (stats.cards || 0) + (stat.value || 0);
        if (stat.type === 'Total Shots') stats.shots = (stats.shots || 0) + (stat.value || 0);
        if (stat.type === 'Shots on Goal') stats.shotsOnTarget = (stats.shotsOnTarget || 0) + (stat.value || 0);
      });
    });
    
    return Object.keys(stats).length > 0 ? stats : undefined;
  }

  private mapStatus(status: string): 'live' | 'scheduled' | 'finished' {
    if (status === 'LIVE') return 'live';
    if (['FT', 'AET', 'PEN'].includes(status)) return 'finished';
    return 'scheduled';
  }

  private mapFootballStatus(status: string): 'live' | 'scheduled' | 'finished' {
    const live = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'];
    const finished = ['FT', 'AET', 'PEN'];
    if (live.includes(status)) return 'live';
    if (finished.includes(status)) return 'finished';
    return 'scheduled';
  }

  private mapBasketballStatus(status: string): 'live' | 'scheduled' | 'finished' {
    if (['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT'].includes(status)) return 'live';
    if (status === 'FT') return 'finished';
    return 'scheduled';
  }

  private deduplicateMatches(matches: Match[]): Match[] {
    const seen = new Set<string>();
    return matches.filter(match => {
      const key = `${match.home}-${match.away}-${match.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const liveDataFetcher = new LiveDataFetcher();
