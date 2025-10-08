import { Match, APIResponse } from './types';
import { getEnabledAPIs, getAPIConfig } from './api-config';
import { APIFootballClient } from './providers/api-football';
import { Livescore6Client } from './providers/livescore6';
import { OddsAPIClient } from './providers/odds-api';
import { FootballDataClient } from './providers/football-data';

class LiveDataFetcher {
  private clients: Map<string, any> = new Map();

  constructor() {
    // Initialize API clients
    this.clients.set('api-football', new APIFootballClient());
    this.clients.set('livescore6', new Livescore6Client());
    this.clients.set('the-odds-api', new OddsAPIClient());
    this.clients.set('football-data', new FootballDataClient());
  }

  async fetchAllMatches(): Promise<Match[]> {
    console.log('🌐 Fetching matches with modular API system...');
    
    const enabledAPIs = getEnabledAPIs();
    console.log(`📡 Enabled APIs: ${enabledAPIs.join(', ') || 'NONE'}`);

    if (enabledAPIs.length === 0) {
      console.log('⚠️ No APIs enabled. Check .env configuration.');
      return this.handleNoAPIs();
    }

    // Try each enabled API in priority order
    for (const apiName of enabledAPIs) {
      try {
        const client = this.clients.get(apiName);
        const config = getAPIConfig(apiName);

        if (!client || !config) continue;

        console.log(`🔄 Trying ${apiName}...`);
        const matches = await client.fetchMatches();

        if (matches.length > 0) {
          console.log(`✅ ${apiName}: ${matches.length} matches found`);
          
          // Enrich with additional data from other APIs
          return await this.enrichMatches(matches, apiName);
        }

        console.log(`ℹ️ ${apiName}: No matches available`);
        
      } catch (error) {
        console.error(`❌ ${apiName} failed:`, error);
        continue;
      }
    }

    console.log('⚠️ All APIs failed or returned no data');
    return this.handleNoAPIs();
  }

  private async enrichMatches(matches: Match[], primaryAPI: string): Promise<Match[]> {
    console.log('🔧 Enriching matches with additional data...');

    const enabledAPIs = getEnabledAPIs().filter(api => api !== primaryAPI);
    
    for (const match of matches) {
      // Try to get odds from odds-specific APIs
      if (!match.odds) {
        for (const apiName of enabledAPIs) {
          const config = getAPIConfig(apiName);
          if (config?.features.odds) {
            try {
              const client = this.clients.get(apiName);
              const odds = await client.fetchOdds(match.id);
              if (odds) {
                match.odds = odds;
                break;
              }
            } catch (error) {
              console.error(`Failed to get odds from ${apiName}`);
            }
          }
        }
      }

      // Try to get statistics
      if (!match.statistics) {
        for (const apiName of enabledAPIs) {
          const config = getAPIConfig(apiName);
          if (config?.features.statistics) {
            try {
              const client = this.clients.get(apiName);
              const stats = await client.fetchStatistics(match.id);
              if (stats) {
                match.statistics = stats;
                break;
              }
            } catch (error) {
              console.error(`Failed to get stats from ${apiName}`);
            }
          }
        }
      }

      // Calculate smart odds if still missing
      if (!match.odds) {
        match.odds = this.calculateSmartOdds(match);
      }

      // Estimate statistics if still missing
      if (!match.statistics && match.homeScore !== undefined) {
        match.statistics = this.estimateStatistics(match);
      }
    }

    console.log('✅ Matches enriched successfully');
    return matches;
  }

  private handleNoAPIs(): Match[] {
    const hour = new Date().getUTCHours();
    const cet = (hour + 1) % 24;
    
    if (cet >= 2 && cet <= 7) {
      console.log(`🌙 Night time (${cet}:00 CET) - no matches expected`);
    }
    
    return [];
  }

  private calculateSmartOdds(match: Match): any {
    if (match.status !== 'live' || !match.homeScore || !match.awayScore || !match.minute) {
      return {
        home: 2.10,
        draw: 3.20,
        away: 3.00,
        over25: 1.85,
        under25: 1.95
      };
    }

    const scoreDiff = match.homeScore - match.awayScore;
    const totalGoals = match.homeScore + match.awayScore;
    const minute = match.minute;
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
    }

    let over25 = totalGoals >= 3 ? 1.01 : (totalGoals === 2 ? 1.65 : 2.50);
    let under25 = totalGoals >= 3 ? 15.00 : (totalGoals === 2 ? 2.20 : 1.50);

    return {
      home: parseFloat(homeOdds.toFixed(2)),
      draw: parseFloat(drawOdds.toFixed(2)),
      away: parseFloat(awayOdds.toFixed(2)),
      over25: parseFloat(over25.toFixed(2)),
      under25: parseFloat(under25.toFixed(2))
    };
  }

  private estimateStatistics(match: Match): any {
    if (!match.homeScore || !match.awayScore || !match.minute) return undefined;

    const totalGoals = match.homeScore + match.awayScore;
    const minute = match.minute;

    return {
      corners: Math.round(minute * 0.12),
      homeCorners: Math.round(minute * 0.07),
      awayCorners: Math.round(minute * 0.05),
      cards: Math.round(minute * 0.04),
      shots: Math.round(minute * 0.2 + totalGoals * 2),
      homeShots: Math.round(minute * 0.12 + match.homeScore * 2),
      awayShots: Math.round(minute * 0.08 + match.awayScore * 2),
      shotsOnTarget: totalGoals + Math.round(minute * 0.06),
      homePossession: 50 + (match.homeScore - match.awayScore) * 3,
      awayPossession: 50 - (match.homeScore - match.awayScore) * 3,
      attacks: Math.round(minute * 1.5),
      dangerousAttacks: Math.round(minute * 0.5 + totalGoals * 3)
    };
  }
}

export const liveDataFetcher = new LiveDataFetcher();
