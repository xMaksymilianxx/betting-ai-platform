// Enhanced Live Data Fetcher with full API logging

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
  private readonly RAPIDAPI_HOST_ALLSPORTS = 'allsportsapi2.p.rapidapi.com';

  async fetchAllMatches(): Promise<Match[]> {
    const allMatches: Match[] = [];

    try {
      const [livescoreMatches, footballMatches, allsportsMatches] = await Promise.allSettled([
        this.fetchFromLivescore(),
        this.fetchFromFootball(),
        this.fetchFromAllSports()
      ]);

      if (livescoreMatches.status === 'fulfilled') {
        console.log('
🔴 ===== LIVESCORE API RESPONSE =====');
        if (livescoreMatches.value.length > 0) {
          console.log('First match structure:');
          console.log(JSON.stringify(livescoreMatches.value[0], null, 2));
          console.log(`Total matches: ${livescoreMatches.value.length}`);
        }
        allMatches.push(...livescoreMatches.value);
      }

      if (footballMatches.status === 'fulfilled') {
        console.log('
⚽ ===== FOOTBALL API RESPONSE =====');
        if (footballMatches.value.length > 0) {
          console.log('First match structure:');
          console.log(JSON.stringify(footballMatches.value[0], null, 2));
          console.log(`Total matches: ${footballMatches.value.length}`);
        }
        allMatches.push(...footballMatches.value);
      }

      if (allsportsMatches.status === 'fulfilled') {
        console.log('
🏆 ===== ALLSPORTS API RESPONSE =====');
        if (allsportsMatches.value.length > 0) {
          console.log('First match structure:');
          console.log(JSON.stringify(allsportsMatches.value[0], null, 2));
          console.log(`Total matches: ${allsportsMatches.value.length}`);
        }
        allMatches.push(...allsportsMatches.value);
      }

      console.log(`
📊 TOTAL MATCHES FETCHED: ${allMatches.length}
`);
      
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
    }

    return this.deduplicateMatches(allMatches);
  }

  private async fetchFromLivescore(): Promise<Match[]> {
    try {
      const response = await fetch(`https://${this.RAPIDAPI_HOST_LIVESCORE}/matches/v2/list-live?Category=soccer`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_LIVESCORE
        }
      });

      if (!response.ok) {
        throw new Error(`Livescore API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseLivescoreData(data);
    } catch (error) {
      console.error('Livescore API error:', error);
      return [];
    }
  }

  private async fetchFromFootball(): Promise<Match[]> {
    try {
      const response = await fetch(`https://${this.RAPIDAPI_HOST_FOOTBALL}/v3/fixtures?live=all`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_FOOTBALL
        }
      });

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseFootballData(data);
    } catch (error) {
      console.error('Football API error:', error);
      return [];
    }
  }

  private async fetchFromAllSports(): Promise<Match[]> {
    try {
      const response = await fetch(`https://${this.RAPIDAPI_HOST_ALLSPORTS}/api/basketball/matches/live`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST_ALLSPORTS
        }
      });

      if (!response.ok) {
        throw new Error(`AllSports API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAllSportsData(data);
    } catch (error) {
      console.error('AllSports API error:', error);
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
              league: stage.Snm || 'Unknown League',
              country: stage.Ccd || 'Unknown',
              sport: 'football',
              status: this.mapLivescoreStatus(event.Eps),
              homeScore: event.Tr1 || 0,
              awayScore: event.Tr2 || 0,
              minute: event.Eps === 'LIVE' ? (event.Epr || 0) : undefined,
              score: event.Eps === 'LIVE' || event.Eps === 'FT' ? `${event.Tr1 || 0} - ${event.Tr2 || 0}` : undefined,
              time: event.Esd ? new Date(event.Esd * 1000).toISOString() : new Date().toISOString(),
              statistics: event.stats ? {
                corners: event.stats.corners,
                cards: event.stats.cards,
                shots: event.stats.shots,
                shotsOnTarget: event.stats.shotsOnTarget,
                possession: event.stats.possession,
                attacks: event.stats.attacks,
                dangerousAttacks: event.stats.dangerousAttacks
              } : undefined,
              odds: event.odds ? {
                home: event.odds.home,
                draw: event.odds.draw,
                away: event.odds.away
              } : undefined
            });
          });
        });
      }
    } catch (error) {
      console.error('Error parsing Livescore data:', error);
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
            league: fixture.league?.name || 'Unknown League',
            country: fixture.league?.country || 'Unknown',
            sport: 'football',
            status: this.mapFootballStatus(fixture.fixture?.status?.short),
            homeScore: fixture.goals?.home,
            awayScore: fixture.goals?.away,
            minute: fixture.fixture?.status?.elapsed,
            score: fixture.goals?.home !== undefined ? `${fixture.goals.home} - ${fixture.goals.away}` : undefined,
            time: fixture.fixture?.date || new Date().toISOString(),
            statistics: fixture.statistics ? {
              corners: fixture.statistics.corners,
              cards: (fixture.statistics.yellow_cards || 0) + (fixture.statistics.red_cards || 0),
              shots: fixture.statistics.shots_total,
              shotsOnTarget: fixture.statistics.shots_on_target,
              possession: fixture.statistics.possession,
              attacks: fixture.statistics.attacks,
              dangerousAttacks: fixture.statistics.dangerous_attacks
            } : undefined,
            odds: fixture.odds ? {
              home: fixture.odds.home,
              draw: fixture.odds.draw,
              away: fixture.odds.away,
              over25: fixture.odds.over_2_5,
              under25: fixture.odds.under_2_5
            } : undefined
          });
        });
      }
    } catch (error) {
      console.error('Error parsing Football data:', error);
    }

    return matches;
  }

  private parseAllSportsData(data: any): Match[] {
    const matches: Match[] = [];
    
    try {
      if (data?.events) {
        data.events.forEach((event: any) => {
          matches.push({
            id: `allsports-${event.id}`,
            home: event.homeTeam?.name || 'Unknown',
            away: event.awayTeam?.name || 'Unknown',
            league: event.tournament?.name || 'Unknown League',
            country: event.tournament?.category?.name || 'Unknown',
            sport: 'basketball',
            status: this.mapAllSportsStatus(event.status?.type),
            homeScore: event.homeScore?.current,
            awayScore: event.awayScore?.current,
            minute: event.status?.type === 'inprogress' ? 20 : undefined,
            score: event.homeScore?.current !== undefined ? `${event.homeScore.current} - ${event.awayScore.current}` : undefined,
            time: event.startTimestamp ? new Date(event.startTimestamp * 1000).toISOString() : new Date().toISOString()
          });
        });
      }
    } catch (error) {
      console.error('Error parsing AllSports data:', error);
    }

    return matches;
  }

  private mapLivescoreStatus(status: string): 'live' | 'scheduled' | 'finished' {
    if (status === 'LIVE') return 'live';
    if (status === 'FT' || status === 'AET' || status === 'PEN') return 'finished';
    return 'scheduled';
  }

  private mapFootballStatus(status: string): 'live' | 'scheduled' | 'finished' {
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P'];
    const finishedStatuses = ['FT', 'AET', 'PEN'];
    
    if (liveStatuses.includes(status)) return 'live';
    if (finishedStatuses.includes(status)) return 'finished';
    return 'scheduled';
  }

  private mapAllSportsStatus(status: string): 'live' | 'scheduled' | 'finished' {
    if (status === 'inprogress') return 'live';
    if (status === 'finished') return 'finished';
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
