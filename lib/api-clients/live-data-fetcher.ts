// Real API data with smart odds calculation

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
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'c4e98069a3msh43378e5e19d1f3fp123456jsn1234567890ab';

  async fetchAllMatches(): Promise<Match[]> {
    console.log('🌐 Fetching REAL matches...');
    
    try {
      const matches = await this.fetchFromLivescore();
      
      if (matches.length > 0) {
        console.log(`✅ Fetched ${matches.length} real matches`);
        // Add smart odds to real matches
        return matches.map(m => ({
          ...m,
          odds: m.odds || this.calculateSmartOdds(m)
        }));
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
      return [];
    }
  }

  private async fetchFromLivescore(): Promise<Match[]> {
    try {
      const response = await fetch('https://livescore6.p.rapidapi.com/matches/v2/list-live?Category=soccer', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        console.log(`❌ API: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return this.parseLivescoreData(data);
      
    } catch (error) {
      console.error('API error:', error);
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
              id: `live-${event.Eid}`,
              home: event.T1?.[0]?.Nm || 'Home',
              away: event.T2?.[0]?.Nm || 'Away',
              league: stage.Snm || 'Unknown',
              country: stage.Ccd || 'Unknown',
              sport: 'football',
              status: event.Eps === 'LIVE' ? 'live' : event.Eps === 'FT' ? 'finished' : 'scheduled',
              homeScore: event.Tr1 || 0,
              awayScore: event.Tr2 || 0,
              minute: event.Epr,
              score: `${event.Tr1 || 0} - ${event.Tr2 || 0}`,
              time: new Date(event.Esd * 1000).toISOString(),
              odds: event.odds // Will be calculated if not present
            });
          });
        });
      }
    } catch (error) {
      console.error('Parse error:', error);
    }

    return matches;
  }

  // SMART ODDS CALCULATION based on match state
  private calculateSmartOdds(match: Match): any {
    if (match.status !== 'live' || match.homeScore === undefined || match.awayScore === undefined) {
      // Pre-match: balanced odds
      return {
        home: 2.10 + Math.random() * 0.8,
        draw: 3.20 + Math.random() * 0.6,
        away: 3.00 + Math.random() * 0.8,
        over25: 1.85 + Math.random() * 0.3,
        under25: 1.95 + Math.random() * 0.3
      };
    }

    const scoreDiff = match.homeScore - match.awayScore;
    const totalGoals = match.homeScore + match.awayScore;
    const minute = match.minute || 0;
    const timeRemaining = 90 - minute;

    // 1X2 Odds based on score and time
    let homeOdds = 2.00;
    let drawOdds = 3.50;
    let awayOdds = 3.50;

    if (scoreDiff > 0) {
      // Home leading
      homeOdds = 1.10 + (timeRemaining / 90) * 0.8 - (scoreDiff * 0.15);
      drawOdds = 5.00 + (scoreDiff * 1.5);
      awayOdds = 7.00 + (scoreDiff * 2.0) - (timeRemaining / 90);
    } else if (scoreDiff < 0) {
      // Away leading
      homeOdds = 7.00 + (Math.abs(scoreDiff) * 2.0) - (timeRemaining / 90);
      drawOdds = 5.00 + (Math.abs(scoreDiff) * 1.5);
      awayOdds = 1.10 + (timeRemaining / 90) * 0.8 - (Math.abs(scoreDiff) * 0.15);
    } else {
      // Draw
      homeOdds = 2.30 - (timeRemaining / 90) * 0.3;
      drawOdds = 2.80 + (minute / 90) * 0.5;
      awayOdds = 3.00 - (timeRemaining / 90) * 0.3;
    }

    // Over/Under 2.5 based on goals and time
    const goalsPerMinute = totalGoals / (minute || 1);
    const projected = goalsPerMinute * 90;

    let over25 = 1.90;
    let under25 = 1.90;

    if (totalGoals >= 3) {
      over25 = 1.01; // Over confirmed
      under25 = 15.00;
    } else if (totalGoals === 2) {
      if (minute < 60) {
        over25 = 1.40 - (minute / 90) * 0.2;
        under25 = 2.80 + (minute / 90) * 0.3;
      } else {
        over25 = 2.20 + (minute - 60) * 0.03;
        under25 = 1.65 - (minute - 60) * 0.02;
      }
    } else if (totalGoals === 1) {
      if (minute < 45) {
        over25 = 1.70 + (minute / 45) * 0.3;
        under25 = 2.10 - (minute / 45) * 0.2;
      } else {
        over25 = 2.50 + (minute - 45) * 0.04;
        under25 = 1.50 - (minute - 45) * 0.01;
      }
    } else {
      // 0 goals
      over25 = 3.00 + (minute / 90) * 2.0;
      under25 = 1.30 - (minute / 90) * 0.2;
    }

    // Ensure odds are within reasonable ranges
    homeOdds = Math.max(1.01, Math.min(20.00, homeOdds));
    drawOdds = Math.max(2.50, Math.min(15.00, drawOdds));
    awayOdds = Math.max(1.01, Math.min(20.00, awayOdds));
    over25 = Math.max(1.01, Math.min(10.00, over25));
    under25 = Math.max(1.01, Math.min(10.00, under25));

    return {
      home: parseFloat(homeOdds.toFixed(2)),
      draw: parseFloat(drawOdds.toFixed(2)),
      away: parseFloat(awayOdds.toFixed(2)),
      over25: parseFloat(over25.toFixed(2)),
      under25: parseFloat(under25.toFixed(2))
    };
  }
}

export const liveDataFetcher = new LiveDataFetcher();
