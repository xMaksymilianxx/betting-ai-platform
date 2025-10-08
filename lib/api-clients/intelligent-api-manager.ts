// Intelligent API Manager with Circuit Breaker, Rate Limiting, and Data Aggregation
// This system automatically manages multiple APIs, handles failures, and enriches data

interface APIConfig {
  name: string;
  enabled: boolean;
  rateLimitPerHour: number;
  requestCount: number;
  lastReset: number;
  failureCount: number;
  lastFailure: number | null;
  circuitBreakerOpen: boolean;
  capabilities: string[];
  priority: number;
}

interface EnrichedMatch {
  id: string;
  home: string;
  away: string;
  league: string;
  country?: string;
  status: 'live' | 'scheduled' | 'finished';
  homeScore: number;
  awayScore: number;
  score: string;
  minute: number;
  time: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
    over25: number;
    under25: number;
    bttsYes: number;
    bttsNo: number;
  };
  lineups?: any;
  statistics?: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    corners: { home: number; away: number };
    cards: { home: number; away: number };
    fouls: { home: number; away: number };
  };
  form?: any;
  h2h?: any;
  injuries?: any;
  dataSources: string[];
  dataQuality: number;
}

class IntelligentAPIManager {
  private apis: Map<string, APIConfig> = new Map();
  
  private readonly keys = {
    apiFootball: 'ac0417c6e0dcfa236b146b9585892c9a',
    footballData: '901f0e15a0314793abaf625692082910',
    liveScoreAPI: {
      key: 'zKgVUXAz7Qp1abRF',
      secret: 'FS5fjgjY6045388CSoyMm8mtZLv9WmOB'
    },
    sportMonks: 'GDkPEhJTHCqSscTnlGu2j87eG3Gw77ECv25j0nbnKbER9Gx6Oj7e6XRud0oh',
    rapidAPI: 'f942cc2d34mshc014f220f64c0a5p1f720fjsn6d39c21ee6c1'
  };

  constructor() {
    this.initializeAPIs();
  }

  private initializeAPIs() {
    this.apis.set('api-football', {
      name: 'API-Football',
      enabled: true,
      rateLimitPerHour: 100,
      requestCount: 0,
      lastReset: Date.now(),
      failureCount: 0,
      lastFailure: null,
      circuitBreakerOpen: false,
      capabilities: ['live_scores', 'odds', 'lineups', 'statistics', 'h2h', 'form'],
      priority: 1
    });

    this.apis.set('football-data', {
      name: 'Football-Data.org',
      enabled: true,
      rateLimitPerHour: 10,
      requestCount: 0,
      lastReset: Date.now(),
      failureCount: 0,
      lastFailure: null,
      circuitBreakerOpen: false,
      capabilities: ['live_scores', 'statistics'],
      priority: 2
    });

    this.apis.set('livescore-api', {
      name: 'LiveScore-API',
      enabled: true,
      rateLimitPerHour: 50,
      requestCount: 0,
      lastReset: Date.now(),
      failureCount: 0,
      lastFailure: null,
      circuitBreakerOpen: false,
      capabilities: ['live_scores', 'odds'],
      priority: 3
    });
  }

  private canUseAPI(apiName: string): boolean {
    const api = this.apis.get(apiName);
    if (!api || !api.enabled) return false;

    if (api.circuitBreakerOpen) {
      const timeSinceFailure = Date.now() - (api.lastFailure || 0);
      if (timeSinceFailure < 300000) {
        console.log(`🔒 [${apiName}] Circuit breaker OPEN (retry in ${Math.ceil((300000 - timeSinceFailure) / 1000)}s)`);
        return false;
      }
      api.circuitBreakerOpen = false;
      api.failureCount = 0;
      console.log(`✅ [${apiName}] Circuit breaker CLOSED`);
    }

    const hourAgo = Date.now() - 3600000;
    if (api.lastReset < hourAgo) {
      api.requestCount = 0;
      api.lastReset = Date.now();
      console.log(`🔄 [${apiName}] Rate limit reset`);
    }

    if (api.requestCount >= api.rateLimitPerHour) {
      console.log(`⏳ [${apiName}] Rate limit exceeded (${api.requestCount}/${api.rateLimitPerHour})`);
      return false;
    }

    return true;
  }

  private trackRequest(apiName: string, success: boolean) {
    const api = this.apis.get(apiName);
    if (!api) return;

    api.requestCount++;

    if (!success) {
      api.failureCount++;
      api.lastFailure = Date.now();
      
      if (api.failureCount >= 3) {
        api.circuitBreakerOpen = true;
        console.log(`🚨 [${apiName}] Circuit breaker OPENED after ${api.failureCount} failures`);
      }
    } else {
      api.failureCount = 0;
    }
  }

  async fetchEnrichedMatches(): Promise<EnrichedMatch[]> {
    console.log('🚀 [INTELLIGENT-API] Starting multi-source fetch at', new Date().toISOString());
    
    const allMatches = new Map<string, EnrichedMatch>();

    const baseMatches = await this.fetchBaseMatches();
    baseMatches.forEach(match => allMatches.set(match.id, match));

    console.log(`📊 [BASE] Found ${allMatches.size} base matches`);

    if (allMatches.size > 0) {
      await this.enrichWithOdds(allMatches);
      await this.enrichWithStatistics(allMatches);
    }

    const enrichedMatches = Array.from(allMatches.values());
    
    enrichedMatches.forEach(match => {
      match.dataQuality = this.calculateDataQuality(match);
    });

    const avgQuality = enrichedMatches.length > 0 
      ? (enrichedMatches.reduce((sum, m) => sum + m.dataQuality, 0) / enrichedMatches.length).toFixed(1)
      : 0;

    console.log(`✅ [ENRICHED] ${enrichedMatches.length} matches with avg quality: ${avgQuality}%`);

    return enrichedMatches;
  }

  private async fetchBaseMatches(): Promise<EnrichedMatch[]> {
    const apiPriority = ['api-football', 'football-data', 'livescore-api'];

    for (const apiName of apiPriority) {
      if (!this.canUseAPI(apiName)) continue;

      console.log(`📡 [${apiName}] Fetching base matches...`);

      try {
        let matches: EnrichedMatch[] = [];

        if (apiName === 'api-football') {
          matches = await this.fetchFromAPIFootball();
        } else if (apiName === 'football-data') {
          matches = await this.fetchFromFootballData();
        } else if (apiName === 'livescore-api') {
          matches = await this.fetchFromLiveScoreAPI();
        }

        this.trackRequest(apiName, matches.length > 0);

        if (matches.length > 0) {
          console.log(`✅ [${apiName}] Success: ${matches.length} matches`);
          return matches;
        }

      } catch (error) {
        console.error(`❌ [${apiName}] Error:`, error);
        this.trackRequest(apiName, false);
      }
    }

    console.log('ℹ️ [INFO] No live matches found from any API (this is normal outside match hours)');
    return [];
  }

  private async enrichWithOdds(matches: Map<string, EnrichedMatch>) {
    console.log(`📊 [ODDS] Enriching ${matches.size} matches with odds...`);

    try {
      for (const [id, match] of matches) {
        if (!match.odds) {
          match.odds = this.calculateSmartOdds(match);
          if (!match.dataSources.includes('calculated-odds')) {
            match.dataSources.push('calculated-odds');
          }
        }
      }

      console.log(`✅ [ODDS] Enriched ${matches.size} matches`);

    } catch (error) {
      console.error(`❌ [ODDS] Error:`, error);
    }
  }

  private async enrichWithStatistics(matches: Map<string, EnrichedMatch>) {
    console.log(`📈 [STATISTICS] Enriching matches with statistics...`);

    for (const [id, match] of matches) {
      if (!match.statistics) {
        match.statistics = this.estimateStatistics(match);
        if (!match.dataSources.includes('estimated-stats')) {
          match.dataSources.push('estimated-stats');
        }
      }
    }

    console.log(`✅ [STATISTICS] Enriched ${matches.size} matches`);
  }

  private async fetchFromAPIFootball(): Promise<EnrichedMatch[]> {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-rapidapi-key': this.keys.apiFootball,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    console.log(`📡 [API-FOOTBALL] Response: ${response.status}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const matches: EnrichedMatch[] = [];

    if (!data.response || !Array.isArray(data.response)) {
      console.log('⚠️ [API-FOOTBALL] No response data');
      return matches;
    }

    data.response.forEach((item: any) => {
      const fixture = item.fixture;
      const teams = item.teams;
      const goals = item.goals;
      const league = item.league;

      const isLive = ['LIVE', '1H', '2H', 'HT'].includes(fixture.status.short);

      if (isLive) {
        matches.push({
          id: `af-${fixture.id}`,
          home: teams.home.name,
          away: teams.away.name,
          league: league.name,
          country: league.country,
          status: 'live',
          homeScore: goals.home || 0,
          awayScore: goals.away || 0,
          score: `${goals.home || 0} - ${goals.away || 0}`,
          minute: fixture.status.elapsed || 0,
          time: fixture.date,
          dataSources: ['api-football'],
          dataQuality: 0
        });
      }
    });

    return matches;
  }

  private async fetchFromFootballData(): Promise<EnrichedMatch[]> {
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': this.keys.footballData
      }
    });

    console.log(`📡 [FOOTBALL-DATA] Response: ${response.status}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const matches: EnrichedMatch[] = [];

    if (!data.matches || !Array.isArray(data.matches)) {
      console.log('⚠️ [FOOTBALL-DATA] No matches data');
      return matches;
    }

    data.matches.forEach((match: any) => {
      if (match.status !== 'IN_PLAY') return;

      const minute = match.minute ? parseInt(match.minute.replace("'", '')) : 0;

      matches.push({
        id: `fd-${match.id}`,
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        league: match.competition.name,
        country: match.competition.area.name,
        status: 'live',
        homeScore: match.score.fullTime.home || 0,
        awayScore: match.score.fullTime.away || 0,
        score: `${match.score.fullTime.home || 0} - ${match.score.fullTime.away || 0}`,
        minute: minute,
        time: match.utcDate,
        dataSources: ['football-data'],
        dataQuality: 0
      });
    });

    return matches;
  }

  private async fetchFromLiveScoreAPI(): Promise<EnrichedMatch[]> {
    const response = await fetch('https://livescore-api.com/api-client/scores/live.json', {
      headers: {
        'key': this.keys.liveScoreAPI.key,
        'secret': this.keys.liveScoreAPI.secret
      }
    });

    console.log(`📡 [LIVESCORE-API] Response: ${response.status}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const matches: EnrichedMatch[] = [];

    if (!data.data?.match || !Array.isArray(data.data.match)) {
      console.log('⚠️ [LIVESCORE-API] No match data');
      return matches;
    }

    data.data.match.forEach((match: any) => {
      if (match.live !== '1') return;

      const scores = match.score?.split('-') || ['0', '0'];
      const homeScore = parseInt(scores[0]?.trim() || '0');
      const awayScore = parseInt(scores[1]?.trim() || '0');

      matches.push({
        id: `ls-${match.id}`,
        home: match.home_name,
        away: match.away_name,
        league: match.league_name,
        country: match.country_name,
        status: 'live',
        homeScore: homeScore,
        awayScore: awayScore,
        score: match.score || '0 - 0',
        minute: parseInt(match.time || '0'),
        time: match.added || new Date().toISOString(),
        dataSources: ['livescore-api'],
        dataQuality: 0
      });
    });

    return matches;
  }

  private calculateSmartOdds(match: EnrichedMatch): any {
    const homeScore = match.homeScore;
    const awayScore = match.awayScore;
    const minute = match.minute;
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

  private estimateStatistics(match: EnrichedMatch): any {
    const homeScore = match.homeScore;
    const awayScore = match.awayScore;
    const minute = match.minute;
    const totalGoals = homeScore + awayScore;

    const homePossession = 50 + (homeScore - awayScore) * 3;
    const awayPossession = 100 - homePossession;

    return {
      possession: {
        home: Math.max(30, Math.min(70, homePossession)),
        away: Math.max(30, Math.min(70, awayPossession))
      },
      shots: {
        home: Math.round(minute * 0.12 + homeScore * 2 + Math.random() * 2),
        away: Math.round(minute * 0.08 + awayScore * 2 + Math.random() * 2)
      },
      shotsOnTarget: {
        home: homeScore + Math.round(minute * 0.04 + Math.random()),
        away: awayScore + Math.round(minute * 0.03 + Math.random())
      },
      corners: {
        home: Math.round(minute * 0.07 + Math.random() * 2),
        away: Math.round(minute * 0.05 + Math.random() * 2)
      },
      cards: {
        home: Math.round(minute * 0.02 + Math.random()),
        away: Math.round(minute * 0.02 + Math.random())
      },
      fouls: {
        home: Math.round(minute * 0.1 + Math.random() * 3),
        away: Math.round(minute * 0.1 + Math.random() * 3)
      }
    };
  }

  private calculateDataQuality(match: EnrichedMatch): number {
    let score = 0;
    if (match.dataSources.length > 0) score += 30;
    if (match.odds) score += 30;
    if (match.statistics) score += 20;
    if (match.lineups) score += 20;
    return score;
  }

  getAPIStatus(): any {
    const status: any = {};
    this.apis.forEach((api, name) => {
      status[name] = {
        name: api.name,
        enabled: api.enabled,
        available: this.canUseAPI(name),
        requestsUsed: `${api.requestCount}/${api.rateLimitPerHour}`,
        failures: api.failureCount,
        circuitBreaker: api.circuitBreakerOpen ? 'OPEN' : 'CLOSED',
        capabilities: api.capabilities
      };
    });
    return status;
  }
}

export const intelligentAPIManager = new IntelligentAPIManager();
