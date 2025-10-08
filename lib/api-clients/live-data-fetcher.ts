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
  // NEW WORKING API KEY
  private readonly RAPIDAPI_KEY = 'f942cc2d34mshc014f220f64c0a5p1f720fjsn6d39c21ee6c1';
  
  async fetchAllMatches(): Promise<Match[]> {
    console.log('🔍 [LIVE-DATA] Starting fetch at', new Date().toISOString());
    
    try {
      console.log('📡 [API] Calling Free API Live Football Data...');
      
      const response = await fetch('https://free-api-live-football-data.p.rapidapi.com/football-get-todays-live-football-data-requires-user-agent-header-x-r', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'free-api-live-football-data.p.rapidapi.com',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      console.log(`📊 [API] Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ [API] Error ${response.status}`);
        
        // Fallback to Football-Data.org
        console.log('🔄 [FALLBACK] Trying Football-Data.org...');
        return await this.fetchFromFootballData();
      }

      const data = await response.json();
      console.log(`📦 [DATA] Received:`, JSON.stringify(data).substring(0, 300));
      
      const matches = this.parseMatches(data);

      if (matches.length === 0) {
        console.log('ℹ️ [PARSER] No live matches found');
      } else {
        console.log(`✅ [SUCCESS] Found ${matches.length} live matches`);
      }

      return matches;
      
    } catch (error) {
      console.error('💥 [ERROR]:', error);
      
      // Fallback
      console.log('🔄 [FALLBACK] Trying Football-Data.org...');
      return await this.fetchFromFootballData();
    }
  }

  private async fetchFromFootballData(): Promise<Match[]> {
    try {
      const response = await fetch('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': '901f0e15a0314793abaf625692082910'
        }
      });

      if (!response.ok) {
        console.error(`❌ [FOOTBALL-DATA] Error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const matches: Match[] = [];

      data.matches?.forEach((match: any) => {
        if (match.status !== 'IN_PLAY') return;

        const minute = match.minute ? parseInt(match.minute.replace("'", '')) : 0;

        matches.push({
          id: `fd-${match.id}`,
          home: match.homeTeam.name,
          away: match.awayTeam.name,
          league: match.competition.name,
          country: match.competition.area.name,
          sport: 'football',
          status: 'live',
          homeScore: match.score.fullTime.home || 0,
          awayScore: match.score.fullTime.away || 0,
          minute: minute,
          score: `${match.score.fullTime.home || 0} - ${match.score.fullTime.away || 0}`,
          time: match.utcDate,
          odds: this.calculateSmartOdds(
            match.score.fullTime.home || 0,
            match.score.fullTime.away || 0,
            minute
          ),
          statistics: this.estimateStatistics(
            match.score.fullTime.home || 0,
            match.score.fullTime.away || 0,
            minute
          )
        });
      });

      console.log(`✅ [FOOTBALL-DATA] Found ${matches.length} matches`);
      return matches;

    } catch (error) {
      console.error('💥 [FOOTBALL-DATA ERROR]:', error);
      return [];
    }
  }

  private parseMatches(data: any): Match[] {
    const matches: Match[] = [];

    try {
      // Different APIs have different structures
      // Try to parse common formats
      
      if (Array.isArray(data)) {
        // Direct array of matches
        data.forEach((match: any) => {
          if (match.status === 'LIVE' || match.live) {
            matches.push(this.createMatch(match));
          }
        });
      } else if (data.matches && Array.isArray(data.matches)) {
        // { matches: [...] }
        data.matches.forEach((match: any) => {
          if (match.status === 'LIVE' || match.live) {
            matches.push(this.createMatch(match));
          }
        });
      } else if (data.data && Array.isArray(data.data)) {
        // { data: [...] }
        data.data.forEach((match: any) => {
          if (match.status === 'LIVE' || match.live) {
            matches.push(this.createMatch(match));
          }
        });
      }

    } catch (error) {
      console.error('💥 [PARSE ERROR]:', error);
    }

    return matches;
  }

  private createMatch(data: any): Match {
    return {
      id: `api-${data.id || Math.random()}`,
      home: data.homeTeam?.name || data.home_team || data.home || 'Home',
      away: data.awayTeam?.name || data.away_team || data.away || 'Away',
      league: data.league?.name || data.competition || data.tournament || 'Unknown',
      country: data.country || '',
      sport: 'football',
      status: 'live',
      homeScore: data.homeScore || data.home_score || data.score?.home || 0,
      awayScore: data.awayScore || data.away_score || data.score?.away || 0,
      minute: parseInt(data.minute || data.time || '0'),
      score: `${data.homeScore || 0} - ${data.awayScore || 0}`,
      time: data.date || data.kickoff || new Date().toISOString(),
      odds: this.calculateSmartOdds(
        data.homeScore || 0,
        data.awayScore || 0,
        parseInt(data.minute || '0')
      ),
      statistics: this.estimateStatistics(
        data.homeScore || 0,
        data.awayScore || 0,
        parseInt(data.minute || '0')
      )
    };
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

    const over25 = totalGoals >= 3 ? 1.01 : (totalGoals === 2 ? 1.65 : 2.50);
    const under25 = totalGoals >= 3 ? 15.00 : (totalGoals === 2 ? 2.20 : 1.50);
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
      shots: Math.round(minute * 0.2 + totalGoals * 2),
      shotsOnTarget: totalGoals + Math.round(minute * 0.06),
      possession: 100,
      homePossession: 50 + (homeScore - awayScore) * 3,
      awayPossession: 50 - (homeScore - awayScore) * 3
    };
  }
}

export const liveDataFetcher = new LiveDataFetcher();
