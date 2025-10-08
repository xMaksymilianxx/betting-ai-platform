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
  // ALL API KEYS
  private readonly API_FOOTBALL_KEY = 'ac0417c6e0dcfa236b146b9585892c9a';
  private readonly FOOTBALL_DATA_KEY = '901f0e15a0314793abaf625692082910';
  private readonly LIVESCORE_API_KEY = 'zKgVUXAz7Qp1abRF';
  private readonly LIVESCORE_API_SECRET = 'FS5fjgjY6045388CSoyMm8mtZLv9WmOB';
  
  async fetchAllMatches(): Promise<Match[]> {
    console.log('🚀 [MULTI-API] Starting fetch at', new Date().toISOString());
    
    // Try API-Football first (most reliable)
    let matches = await this.fetchFromAPIFootball();
    if (matches.length > 0) {
      console.log(`✅ [API-FOOTBALL] Success: ${matches.length} matches`);
      return matches;
    }
    
    // Fallback to Football-Data.org
    console.log('🔄 [FALLBACK] Trying Football-Data.org...');
    matches = await this.fetchFromFootballData();
    if (matches.length > 0) {
      console.log(`✅ [FOOTBALL-DATA] Success: ${matches.length} matches`);
      return matches;
    }
    
    // Fallback to LiveScore API
    console.log('🔄 [FALLBACK] Trying LiveScore API...');
    matches = await this.fetchFromLiveScoreAPI();
    if (matches.length > 0) {
      console.log(`✅ [LIVESCORE-API] Success: ${matches.length} matches`);
      return matches;
    }
    
    console.log('ℹ️ [RESULT] No live matches found from any API');
    return [];
  }

  // API-FOOTBALL (Best for live data)
  private async fetchFromAPIFootball(): Promise<Match[]> {
    try {
      const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
        headers: {
          'x-rapidapi-key': this.API_FOOTBALL_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      console.log(`📡 [API-FOOTBALL] Response: ${response.status}`);

      if (!response.ok) return [];

      const data = await response.json();
      const matches: Match[] = [];

      data.response?.forEach((item: any) => {
        const fixture = item.fixture;
        const teams = item.teams;
        const goals = item.goals;
        const league = item.league;

        if (fixture.status.short === 'LIVE' || fixture.status.short === '1H' || fixture.status.short === '2H') {
          matches.push({
            id: `af-${fixture.id}`,
            home: teams.home.name,
            away: teams.away.name,
            league: league.name,
            country: league.country,
            sport: 'football',
            status: 'live',
            homeScore: goals.home || 0,
            awayScore: goals.away || 0,
            minute: fixture.status.elapsed || 0,
            score: `${goals.home || 0} - ${goals.away || 0}`,
            time: fixture.date,
            odds: this.calculateSmartOdds(goals.home || 0, goals.away || 0, fixture.status.elapsed || 0),
            statistics: this.estimateStatistics(goals.home || 0, goals.away || 0, fixture.status.elapsed || 0)
          });
        }
      });

      return matches;

    } catch (error) {
      console.error('❌ [API-FOOTBALL ERROR]:', error);
      return [];
    }
  }

  // FOOTBALL-DATA.ORG (Reliable, top leagues)
  private async fetchFromFootballData(): Promise<Match[]> {
    try {
      const response = await fetch('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': this.FOOTBALL_DATA_KEY
        }
      });

      console.log(`📡 [FOOTBALL-DATA] Response: ${response.status}`);

      if (!response.ok) return [];

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

      return matches;

    } catch (error) {
      console.error('❌ [FOOTBALL-DATA ERROR]:', error);
      return [];
    }
  }

  // LIVESCORE-API.COM
  private async fetchFromLiveScoreAPI(): Promise<Match[]> {
    try {
      const response = await fetch('https://livescore-api.com/api-client/scores/live.json', {
        headers: {
          'key': this.LIVESCORE_API_KEY,
          'secret': this.LIVESCORE_API_SECRET
        }
      });

      console.log(`📡 [LIVESCORE-API] Response: ${response.status}`);

      if (!response.ok) return [];

      const data = await response.json();
      const matches: Match[] = [];

      data.data?.match?.forEach((match: any) => {
        if (match.live !== '1') return;

        matches.push({
          id: `ls-${match.id}`,
          home: match.home_name,
          away: match.away_name,
          league: match.league_name,
          country: match.country_name,
          sport: 'football',
          status: 'live',
          homeScore: parseInt(match.score?.split('-')[0]?.trim() || '0'),
          awayScore: parseInt(match.score?.split('-')[1]?.trim() || '0'),
          minute: parseInt(match.time || '0'),
          score: match.score || '0 - 0',
          time: match.added || new Date().toISOString(),
          odds: this.calculateSmartOdds(
            parseInt(match.score?.split('-')[0]?.trim() || '0'),
            parseInt(match.score?.split('-')[1]?.trim() || '0'),
            parseInt(match.time || '0')
          ),
          statistics: this.estimateStatistics(
            parseInt(match.score?.split('-')[0]?.trim() || '0'),
            parseInt(match.score?.split('-')[1]?.trim() || '0'),
            parseInt(match.time || '0')
          )
        });
      });

      return matches;

    } catch (error) {
      console.error('❌ [LIVESCORE-API ERROR]:', error);
      return [];
    }
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
