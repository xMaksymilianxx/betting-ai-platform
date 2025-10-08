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
  statistics?: any;
  odds?: any;
}

class LiveDataFetcher {
  // TWOJE KLUCZE API (już wpisane!)
  private readonly RAPIDAPI_KEY = 'c4e98069a3msh43378e5e19d1f3fp123456jsn1234567890ab';
  private readonly FOOTBALL_DATA_KEY = '901f0e15a0314793abaf625692082910';
  private readonly SPORTMONKS_KEY = 'GDkPEhJTHCqSscTnlGu2j87eG3Gw77ECv25j0nbnKbER9Gx6Oj7e6XRud0oh';
  private readonly LIVESCORE_KEY = 'zKgVUXAz7Qp1abRF';
  private readonly LIVESCORE_SECRET = 'FS5fjgjY6045388CSoyMm8mtZLv9WmOB';
  private readonly API_FOOTBALL_KEY = 'ac0417c6e0dcfa236b146b9585892c9a';

  async fetchAllMatches(): Promise<Match[]> {
    console.log('🌐 Fetching ONLY REAL matches from Livescore6...');
    
    try {
      const response = await fetch('https://livescore6.p.rapidapi.com/matches/v2/list-live?Category=soccer', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
        }
      });

      console.log(`📡 API Response: ${response.status}`);

      if (!response.ok) {
        console.log(`❌ API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const matches = this.parseMatches(data);

      if (matches.length === 0) {
        console.log('ℹ️ No live matches at this time');
      } else {
        console.log(`✅ Found ${matches.length} REAL live matches`);
      }

      return matches;
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
      return [];
    }
  }

  private parseMatches(data: any): Match[] {
    const matches: Match[] = [];

    try {
      if (!data.Stages) return [];

      data.Stages.forEach((stage: any) => {
        stage.Events?.forEach((event: any) => {
          if (event.Eps !== 'LIVE') return;

          const match: Match = {
            id: `live-${event.Eid}`,
            home: event.T1?.[0]?.Nm || 'Home',
            away: event.T2?.[0]?.Nm || 'Away',
            league: stage.Snm || 'Unknown',
            country: stage.Ccd || '',
            sport: 'football',
            status: 'live',
            homeScore: event.Tr1 || 0,
            awayScore: event.Tr2 || 0,
            minute: event.Epr || 0,
            score: `${event.Tr1 || 0} - ${event.Tr2 || 0}`,
            time: new Date(event.Esd * 1000).toISOString(),
            odds: this.calculateSmartOdds(event.Tr1 || 0, event.Tr2 || 0, event.Epr || 0),
            statistics: this.estimateStatistics(event.Tr1 || 0, event.Tr2 || 0, event.Epr || 0)
          };

          matches.push(match);
        });
      });
      
    } catch (error) {
      console.error('Parse error:', error);
    }

    return matches;
  }

  private calculateSmartOdds(homeScore: number, awayScore: number, minute: number): any {
    const scoreDiff = homeScore - awayScore;
    const totalGoals = homeScore + awayScore;
    const timeRemaining = 90 - minute;

    let homeOdds = 2.00;
    let drawOdds = 3.50;
    let awayOdds = 3.50;

    if (scoreDiff > 0) {
      homeOdds = Math.max(1.01, 1.10 + (timeRemaining / 90) * 0.8 - (scoreDiff * 0.15));
      drawOdds = Math.min(15.00, 5.00 + (scoreDiff * 1.5));
      awayOdds = Math.min(20.00, 7.00 + (scoreDiff * 2.0));
    } else if (scoreDiff < 0) {
      homeOdds = Math.min(20.00, 7.00 + (Math.abs(scoreDiff) * 2.0));
      drawOdds = Math.min(15.00, 5.00 + (Math.abs(scoreDiff) * 1.5));
      awayOdds = Math.max(1.01, 1.10 + (timeRemaining / 90) * 0.8 - (Math.abs(scoreDiff) * 0.15));
    } else {
      homeOdds = 2.30 - (timeRemaining / 90) * 0.3;
      drawOdds = 2.80 + (minute / 90) * 0.5;
      awayOdds = 3.00 - (timeRemaining / 90) * 0.3;
    }

    let over25 = totalGoals >= 3 ? 1.01 : (totalGoals === 2 ? 1.65 : 2.50);
    let under25 = totalGoals >= 3 ? 15.00 : (totalGoals === 2 ? 2.20 : 1.50);

    const bothScored = homeScore > 0 && awayScore > 0;
    const bttsYes = bothScored ? 1.01 : (minute >= 80 ? 8.00 : 2.20);
    const bttsNo = bothScored ? 15.00 : (minute >= 80 ? 1.12 : 1.70);

    return {
      home: parseFloat(homeOdds.toFixed(2)),
      draw: parseFloat(drawOdds.toFixed(2)),
      away: parseFloat(awayOdds.toFixed(2)),
      over25: parseFloat(over25.toFixed(2)),
      under25: parseFloat(under25.toFixed(2)),
      bttsYes: parseFloat(bttsYes.toFixed(2)),
      bttsNo: parseFloat(bttsNo.toFixed(2))
    };
  }

  private estimateStatistics(homeScore: number, awayScore: number, minute: number): any {
    const totalGoals = homeScore + awayScore;

    return {
      corners: Math.round(minute * 0.12 + Math.random() * 2),
      homeCorners: Math.round(minute * 0.07 + Math.random() * 1),
      awayCorners: Math.round(minute * 0.05 + Math.random() * 1),
      cards: Math.round(minute * 0.04 + Math.random() * 1),
      homeCards: Math.round(minute * 0.02),
      awayCards: Math.round(minute * 0.02),
      shots: Math.round(minute * 0.2 + totalGoals * 2),
      homeShots: Math.round(minute * 0.12 + homeScore * 2),
      awayShots: Math.round(minute * 0.08 + awayScore * 2),
      shotsOnTarget: totalGoals + Math.round(minute * 0.06),
      homeShotsOnTarget: homeScore + Math.round(minute * 0.04),
      awayShotsOnTarget: awayScore + Math.round(minute * 0.02),
      possession: 100,
      homePossession: 50 + (homeScore - awayScore) * 3 + Math.round(Math.random() * 10 - 5),
      awayPossession: 50 - (homeScore - awayScore) * 3 - Math.round(Math.random() * 10 - 5),
      attacks: Math.round(minute * 1.5),
      homeAttacks: Math.round(minute * 0.9 + homeScore * 5),
      awayAttacks: Math.round(minute * 0.6 + awayScore * 5),
      dangerousAttacks: Math.round(minute * 0.5 + totalGoals * 3),
      homeDangerousAttacks: Math.round(minute * 0.3 + homeScore * 2),
      awayDangerousAttacks: Math.round(minute * 0.2 + awayScore * 2)
    };
  }
}

export const liveDataFetcher = new LiveDataFetcher();
