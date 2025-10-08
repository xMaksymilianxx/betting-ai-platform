// FULL API INTEGRATION - Maximum data utilization

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
  
  // ADVANCED STATISTICS
  statistics?: {
    corners?: number;
    homeCorners?: number;
    awayCorners?: number;
    cards?: number;
    homeCards?: number;
    awayCards?: number;
    shots?: number;
    homeShots?: number;
    awayShots?: number;
    shotsOnTarget?: number;
    homeShotsOnTarget?: number;
    awayShotsOnTarget?: number;
    possession?: number;
    homePossession?: number;
    awayPossession?: number;
    attacks?: number;
    homeAttacks?: number;
    awayAttacks?: number;
    dangerousAttacks?: number;
    homeDangerousAttacks?: number;
    awayDangerousAttacks?: number;
    offsides?: number;
    fouls?: number;
    saves?: number;
  };
  
  // REAL ODDS
  odds?: {
    home?: number;
    draw?: number;
    away?: number;
    over25?: number;
    under25?: number;
    over35?: number;
    under35?: number;
    bttsYes?: number;
    bttsNo?: number;
    handicap?: any;
  };
  
  // FORM & H2H
  form?: {
    homeForm?: string[]; // ['W', 'L', 'D', 'W', 'W']
    awayForm?: string[];
    homeGoalsScored?: number;
    homeGoalsConceded?: number;
    awayGoalsScored?: number;
    awayGoalsConceded?: number;
    h2h?: {
      homeWins?: number;
      draws?: number;
      awayWins?: number;
      lastMeetings?: any[];
    };
  };
}

class LiveDataFetcher {
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'c4e98069a3msh43378e5e19d1f3fp123456jsn1234567890ab';

  async fetchAllMatches(): Promise<Match[]> {
    console.log('🌐 Fetching matches with FULL data...');
    
    try {
      // Try API first
      const apiMatches = await this.fetchFromAPIFootball();
      
      if (apiMatches.length > 0) {
        console.log(`✅ Fetched ${apiMatches.length} matches from API with FULL statistics`);
        return apiMatches;
      }
      
      // Fallback with enhanced fake data
      console.log('⚠️ API unavailable, using enhanced fallback');
      return this.getEnhancedFallbackMatches();
      
    } catch (error) {
      console.error('❌ API error:', error);
      return this.getEnhancedFallbackMatches();
    }
  }

  private async fetchFromAPIFootball(): Promise<Match[]> {
    try {
      // API-Football provides the MOST complete data
      const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.RAPIDAPI_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      console.log(`📡 API-Football: ${response.status}`);

      if (!response.ok) {
        if (response.status === 429) console.log('❌ Rate limit exceeded');
        return [];
      }

      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        console.log('⚠️ No live matches from API-Football');
        return [];
      }

      console.log(`📦 Processing ${data.response.length} fixtures with full data...`);
      
      return await Promise.all(
        data.response.map(async (fixture: any) => {
          // Fetch additional data for each match
          const statistics = await this.fetchMatchStatistics(fixture.fixture.id);
          const odds = await this.fetchMatchOdds(fixture.fixture.id);
          const h2h = await this.fetchH2H(fixture.teams.home.id, fixture.teams.away.id);
          
          return this.parseAPIFootballFixture(fixture, statistics, odds, h2h);
        })
      );
      
    } catch (error) {
      console.error('API-Football error:', error);
      return [];
    }
  }

  private async fetchMatchStatistics(fixtureId: number): Promise<any> {
    try {
      const response = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, {
        headers: {
          'x-rapidapi-key': this.RAPIDAPI_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.response || [];
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
    return [];
  }

  private async fetchMatchOdds(fixtureId: number): Promise<any> {
    try {
      const response = await fetch(`https://v3.football.api-sports.io/odds?fixture=${fixtureId}`, {
        headers: {
          'x-rapidapi-key': this.RAPIDAPI_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.response?.[0]?.bookmakers || [];
      }
    } catch (error) {
      console.error('Odds fetch error:', error);
    }
    return [];
  }

  private async fetchH2H(team1Id: number, team2Id: number): Promise<any> {
    try {
      const response = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=5`, {
        headers: {
          'x-rapidapi-key': this.RAPIDAPI_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.response || [];
      }
    } catch (error) {
      console.error('H2H fetch error:', error);
    }
    return [];
  }

  private parseAPIFootballFixture(fixture: any, statistics: any, oddsData: any, h2hData: any): Match {
    // Extract detailed statistics
    const stats: any = {
      homeCorners: 0,
      awayCorners: 0,
      homeCards: 0,
      awayCards: 0,
      homeShots: 0,
      awayShots: 0,
      homeShotsOnTarget: 0,
      awayShotsOnTarget: 0,
      homePossession: 50,
      awayPossession: 50,
      homeAttacks: 0,
      awayAttacks: 0,
      homeDangerousAttacks: 0,
      awayDangerousAttacks: 0
    };

    if (statistics && statistics.length === 2) {
      const homeStats = statistics[0].statistics;
      const awayStats = statistics[1].statistics;

      homeStats?.forEach((stat: any) => {
        const value = parseInt(stat.value) || 0;
        if (stat.type === 'Corner Kicks') stats.homeCorners = value;
        if (stat.type === 'Yellow Cards') stats.homeCards += value;
        if (stat.type === 'Red Cards') stats.homeCards += value * 2;
        if (stat.type === 'Total Shots') stats.homeShots = value;
        if (stat.type === 'Shots on Goal') stats.homeShotsOnTarget = value;
        if (stat.type === 'Ball Possession') stats.homePossession = value;
        if (stat.type === 'Total attacks') stats.homeAttacks = value;
        if (stat.type === 'Dangerous attacks') stats.homeDangerousAttacks = value;
      });

      awayStats?.forEach((stat: any) => {
        const value = parseInt(stat.value) || 0;
        if (stat.type === 'Corner Kicks') stats.awayCorners = value;
        if (stat.type === 'Yellow Cards') stats.awayCards += value;
        if (stat.type === 'Red Cards') stats.awayCards += value * 2;
        if (stat.type === 'Total Shots') stats.awayShots = value;
        if (stat.type === 'Shots on Goal') stats.awayShotsOnTarget = value;
        if (stat.type === 'Ball Possession') stats.awayPossession = value;
        if (stat.type === 'Total attacks') stats.awayAttacks = value;
        if (stat.type === 'Dangerous attacks') stats.awayDangerousAttacks = value;
      });

      stats.corners = stats.homeCorners + stats.awayCorners;
      stats.cards = stats.homeCards + stats.awayCards;
      stats.shots = stats.homeShots + stats.awayShots;
      stats.shotsOnTarget = stats.homeShotsOnTarget + stats.awayShotsOnTarget;
      stats.attacks = stats.homeAttacks + stats.awayAttacks;
      stats.dangerousAttacks = stats.homeDangerousAttacks + stats.awayDangerousAttacks;
    }

    // Extract real odds
    const odds: any = {};
    if (oddsData && oddsData.length > 0) {
      const bookmaker = oddsData[0]; // First bookmaker
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
    }

    // Parse H2H
    const form: any = {};
    if (h2hData && h2hData.length > 0) {
      let homeWins = 0;
      let draws = 0;
      let awayWins = 0;

      h2hData.slice(0, 5).forEach((match: any) => {
        const homeId = fixture.teams.home.id;
        const homeGoals = match.teams.home.id === homeId ? match.goals.home : match.goals.away;
        const awayGoals = match.teams.away.id === homeId ? match.goals.away : match.goals.home;

        if (homeGoals > awayGoals) homeWins++;
        else if (homeGoals < awayGoals) awayWins++;
        else draws++;
      });

      form.h2h = { homeWins, draws, awayWins, lastMeetings: h2hData.slice(0, 3) };
    }

    return {
      id: `api-${fixture.fixture.id}`,
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
      statistics: Object.keys(stats).length > 0 ? stats : undefined,
      odds: Object.keys(odds).length > 0 ? odds : undefined,
      form: Object.keys(form).length > 0 ? form : undefined
    };
  }

  private mapStatus(status: string): 'live' | 'scheduled' | 'finished' {
    const live = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT'];
    const finished = ['FT', 'AET', 'PEN'];
    if (live.includes(status)) return 'live';
    if (finished.includes(status)) return 'finished';
    return 'scheduled';
  }

  private getEnhancedFallbackMatches(): Match[] {
    const now = new Date();
    
    return [
      {
        id: 'demo-1',
        home: 'Manchester City',
        away: 'Liverpool',
        league: 'Premier League',
        country: 'England',
        sport: 'football',
        status: 'live',
        homeScore: 2,
        awayScore: 1,
        minute: 67,
        score: '2 - 1',
        time: now.toISOString(),
        statistics: {
          corners: 8,
          homeCorners: 5,
          awayCorners: 3,
          cards: 3,
          homeCards: 2,
          awayCards: 1,
          shots: 18,
          homeShots: 11,
          awayShots: 7,
          shotsOnTarget: 9,
          homeShotsOnTarget: 6,
          awayShotsOnTarget: 3,
          possession: 100,
          homePossession: 58,
          awayPossession: 42,
          attacks: 145,
          homeAttacks: 82,
          awayAttacks: 63,
          dangerousAttacks: 48,
          homeDangerousAttacks: 28,
          awayDangerousAttacks: 20
        },
        odds: {
          home: 1.25,
          draw: 6.50,
          away: 12.00,
          over25: 1.01,
          under25: 15.00,
          bttsYes: 1.50,
          bttsNo: 2.50
        },
        form: {
          homeForm: ['W', 'W', 'W', 'D', 'W'],
          awayForm: ['W', 'L', 'W', 'W', 'D'],
          h2h: {
            homeWins: 2,
            draws: 1,
            awayWins: 2
          }
        }
      },
      // Add more enhanced fallback matches...
      {
        id: 'demo-2',
        home: 'Barcelona',
        away: 'Real Madrid',
        league: 'La Liga',
        country: 'Spain',
        sport: 'football',
        status: 'live',
        homeScore: 1,
        awayScore: 1,
        minute: 54,
        score: '1 - 1',
        time: now.toISOString(),
        statistics: {
          corners: 6,
          homeCorners: 4,
          awayCorners: 2,
          cards: 4,
          shots: 14,
          shotsOnTarget: 6,
          possession: 100,
          homePossession: 52,
          awayPossession: 48,
          dangerousAttacks: 32
        },
        odds: {
          home: 2.10,
          draw: 3.40,
          away: 3.20,
          over25: 1.65,
          under25: 2.20
        }
      }
    ];
  }
}

export const liveDataFetcher = new LiveDataFetcher();
