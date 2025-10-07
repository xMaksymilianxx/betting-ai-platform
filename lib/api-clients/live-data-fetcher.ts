// Real-time data fetcher from multiple APIs

const API_KEYS = {
  footballData: process.env.FOOTBALL_DATA_API_KEY || '901f0e15a0314793abaf625692082910',
  sportmonks: process.env.SPORTMONKS_API_KEY || 'GDkPEhJTHCqSscTnlGu2j87eG3Gw77ECv25j0nbnKbER9Gx6Oj7e6XRud0oh',
  liveScore: process.env.LIVE_SCORE_API_KEY || 'zKgVUXAz7Qp1abRF',
  liveScoreSecret: process.env.LIVE_SCORE_API_SECRET || 'FS5fjgjY6045388CSoyMm8mtZLv9WmOB',
  apiFootball: process.env.API_FOOTBALL_KEY || 'ac0417c6e0dcfa236b146b9585892c9a'
};

interface LiveMatch {
  id: string;
  home: string;
  away: string;
  league: string;
  country: string;
  sport: string;
  status: 'live' | 'scheduled' | 'finished';
  minute?: number;
  score?: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  odds?: {
    homeWin: number;
    draw?: number;
    awayWin: number;
  };
  statistics?: {
    corners?: number;
    cards?: number;
    shots?: number;
  };
}

export class LiveDataFetcher {
  
  // Football-Data.org API
  async fetchFootballDataMatches(): Promise<LiveMatch[]> {
    try {
      console.log('🌐 Fetching from Football-Data.org...');
      
      const response = await fetch('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': API_KEYS.footballData
        }
      });

      if (!response.ok) {
        console.error('❌ Football-Data API error:', response.status);
        return [];
      }

      const data = await response.json();
      console.log(`✅ Football-Data: ${data.matches?.length || 0} matches`);

      return (data.matches || []).map((match: any) => ({
        id: `fd-${match.id}`,
        home: match.homeTeam?.name || 'Unknown',
        away: match.awayTeam?.name || 'Unknown',
        league: match.competition?.name || 'Unknown',
        country: match.competition?.area?.name || 'International',
        sport: 'football',
        status: match.status === 'IN_PLAY' ? 'live' : match.status === 'FINISHED' ? 'finished' : 'scheduled',
        minute: match.minute || undefined,
        homeScore: match.score?.fullTime?.home,
        awayScore: match.score?.fullTime?.away,
        score: match.score?.fullTime?.home !== null 
          ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
          : undefined,
        time: match.utcDate,
        odds: match.odds?.homeWin ? {
          homeWin: match.odds.homeWin,
          draw: match.odds.draw,
          awayWin: match.odds.awayWin
        } : undefined
      }));
    } catch (error) {
      console.error('❌ Error fetching Football-Data:', error);
      return [];
    }
  }

  // API-Football (RapidAPI)
  async fetchAPIFootballMatches(): Promise<LiveMatch[]> {
    try {
      console.log('🌐 Fetching from API-Football...');
      
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
        headers: {
          'x-rapidapi-key': API_KEYS.apiFootball,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (!response.ok) {
        console.error('❌ API-Football error:', response.status);
        return [];
      }

      const data = await response.json();
      console.log(`✅ API-Football: ${data.response?.length || 0} matches`);

      return (data.response || []).map((item: any) => {
        const fixture = item.fixture;
        const teams = item.teams;
        const goals = item.goals;
        const league = item.league;
        const status = fixture.status;

        return {
          id: `af-${fixture.id}`,
          home: teams.home?.name || 'Unknown',
          away: teams.away?.name || 'Unknown',
          league: league.name || 'Unknown',
          country: league.country || 'Unknown',
          sport: 'football',
          status: status.long === 'Match Finished' ? 'finished' 
            : ['First Half', 'Second Half', 'Halftime', 'Extra Time', 'Penalty'].includes(status.long) ? 'live'
            : 'scheduled',
          minute: status.elapsed || undefined,
          homeScore: goals.home,
          awayScore: goals.away,
          score: goals.home !== null ? `${goals.home} - ${goals.away}` : undefined,
          time: fixture.date,
          statistics: {
            corners: item.statistics?.find((s: any) => s.type === 'Corner Kicks')?.home || 0,
            cards: (item.statistics?.find((s: any) => s.type === 'Yellow Cards')?.home || 0) + 
                   (item.statistics?.find((s: any) => s.type === 'Red Cards')?.home || 0),
          }
        };
      });
    } catch (error) {
      console.error('❌ Error fetching API-Football:', error);
      return [];
    }
  }

  // LiveScore API
  async fetchLiveScoreMatches(): Promise<LiveMatch[]> {
    try {
      console.log('🌐 Fetching from LiveScore...');
      
      const response = await fetch('https://livescore-api.com/api-client/scores/live.json', {
        headers: {
          'key': API_KEYS.liveScore,
          'secret': API_KEYS.liveScoreSecret
        }
      });

      if (!response.ok) {
        console.error('❌ LiveScore API error:', response.status);
        return [];
      }

      const data = await response.json();
      console.log(`✅ LiveScore: ${data.data?.match?.length || 0} matches`);

      return (data.data?.match || []).map((match: any) => ({
        id: `ls-${match.id}`,
        home: match.home_name || 'Unknown',
        away: match.away_name || 'Unknown',
        league: match.league_name || 'Unknown',
        country: match.country_name || 'Unknown',
        sport: 'football',
        status: match.status === '1' || match.status === '2' ? 'live' : 'scheduled',
        minute: parseInt(match.time) || undefined,
        homeScore: parseInt(match.home_score),
        awayScore: parseInt(match.away_score),
        score: `${match.home_score} - ${match.away_score}`,
        time: match.date
      }));
    } catch (error) {
      console.error('❌ Error fetching LiveScore:', error);
      return [];
    }
  }

  // Aggregate all sources
  async fetchAllMatches(): Promise<LiveMatch[]> {
    console.log('🔄 Fetching from all API sources...');
    
    const [footballData, apiFootball, liveScore] = await Promise.all([
      this.fetchFootballDataMatches(),
      this.fetchAPIFootballMatches(),
      this.fetchLiveScoreMatches()
    ]);

    const allMatches = [...footballData, ...apiFootball, ...liveScore];
    
    // Remove duplicates based on team names
    const uniqueMatches = allMatches.filter((match, index, self) => 
      index === self.findIndex(m => 
        m.home.toLowerCase() === match.home.toLowerCase() && 
        m.away.toLowerCase() === match.away.toLowerCase()
      )
    );

    console.log(`✅ Total unique matches: ${uniqueMatches.length}`);
    
    return uniqueMatches;
  }

  // Get odds from betting APIs
  async fetchOdds(matchId: string): Promise<any> {
    try {
      // You can integrate odds API here
      // For now return mock odds based on match data
      return {
        homeWin: 1.5 + Math.random() * 3,
        draw: 2.5 + Math.random() * 2,
        awayWin: 1.5 + Math.random() * 3
      };
    } catch (error) {
      console.error('Error fetching odds:', error);
      return null;
    }
  }
}

export const liveDataFetcher = new LiveDataFetcher();
