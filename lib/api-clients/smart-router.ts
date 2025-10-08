import { apiFootballClient } from './api-football';

export interface RouterConfig {
  preferredLiveAPI: 'api-football' | 'odds-api' | 'the-odds';
  preferredPrematchAPI: 'api-football' | 'odds-api' | 'the-odds';
  fallbackEnabled: boolean;
  priorityMarkets: string[];
}

const defaultConfig: RouterConfig = {
  preferredLiveAPI: 'api-football',
  preferredPrematchAPI: 'api-football',
  fallbackEnabled: true,
  priorityMarkets: ['1X2', 'Over/Under 2.5', 'BTTS']
};

export class SmartAPIRouter {
  private config: RouterConfig;
  private callHistory: Map<string, number> = new Map();

  constructor(config?: Partial<RouterConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  async fetchMatches(params: {
    date?: string;
    status?: string;
    league?: string;
    isLive?: boolean;
  }): Promise<any> {
    const { isLive } = params;
    
    console.log(`🔀 [SMART-ROUTER] Routing ${isLive ? 'LIVE' : 'PREMATCH'} request`);
    
    try {
      // Choose API based on mode
      if (isLive) {
        return await this.fetchLiveMatches(params);
      } else {
        return await this.fetchPrematchMatches(params);
      }
    } catch (error) {
      console.error('❌ [SMART-ROUTER] Primary API failed:', error);
      
      if (this.config.fallbackEnabled) {
        console.log('🔄 [SMART-ROUTER] Trying fallback...');
        return await this.fetchWithFallback(params);
      }
      
      throw error;
    }
  }

  private async fetchLiveMatches(params: any): Promise<any> {
    const apiName = this.config.preferredLiveAPI;
    console.log(`📡 [SMART-ROUTER] Using ${apiName} for LIVE matches`);
    
    this.trackCall(apiName);
    
    switch (apiName) {
      case 'api-football':
        return await apiFootballClient.fetchLiveMatches(params);
      
      case 'odds-api':
        // TODO: Implement when ready
        console.log('⚠️ [SMART-ROUTER] Odds-API not implemented yet, falling back');
        return await apiFootballClient.fetchLiveMatches(params);
      
      case 'the-odds':
        // TODO: Implement when ready
        console.log('⚠️ [SMART-ROUTER] The-Odds-API not implemented yet, falling back');
        return await apiFootballClient.fetchLiveMatches(params);
      
      default:
        return await apiFootballClient.fetchLiveMatches(params);
    }
  }

  private async fetchPrematchMatches(params: any): Promise<any> {
    const apiName = this.config.preferredPrematchAPI;
    console.log(`📡 [SMART-ROUTER] Using ${apiName} for PREMATCH matches`);
    
    this.trackCall(apiName);
    
    switch (apiName) {
      case 'api-football':
        return await apiFootballClient.fetchMatches(params);
      
      case 'odds-api':
        // TODO: Implement when ready
        console.log('⚠️ [SMART-ROUTER] Odds-API not implemented yet, falling back');
        return await apiFootballClient.fetchMatches(params);
      
      case 'the-odds':
        // TODO: Implement when ready
        console.log('⚠️ [SMART-ROUTER] The-Odds-API not implemented yet, falling back');
        return await apiFootballClient.fetchMatches(params);
      
      default:
        return await apiFootballClient.fetchMatches(params);
    }
  }

  private async fetchWithFallback(params: any): Promise<any> {
    // Try all APIs in order
    const apis = ['api-football', 'odds-api', 'the-odds'];
    
    for (const api of apis) {
      try {
        console.log(`🔄 [SMART-ROUTER] Trying fallback: ${api}`);
        
        if (api === 'api-football') {
          return await apiFootballClient.fetchMatches(params);
        }
        // Add other APIs when implemented
        
      } catch (error) {
        console.log(`❌ [SMART-ROUTER] ${api} failed, trying next...`);
        continue;
      }
    }
    
    throw new Error('All APIs failed');
  }

  async fetchOdds(matchId: string, markets: string[]): Promise<any> {
    console.log(`📊 [SMART-ROUTER] Fetching odds for match ${matchId}`);
    console.log(`📊 [SMART-ROUTER] Markets: ${markets.join(', ')}`);
    
    try {
      // API-Football has best odds coverage
      const odds = await apiFootballClient.fetchOdds(matchId, markets);
      
      // TODO: Merge with other APIs for better coverage
      return this.mergeOdds([odds]);
      
    } catch (error) {
      console.error('❌ [SMART-ROUTER] Odds fetch failed:', error);
      throw error;
    }
  }

  private mergeOdds(oddsArray: any[]): any {
    // Merge odds from multiple sources
    // Take best (highest) odds for each market
    
    const merged: any = {};
    
    oddsArray.forEach(odds => {
      Object.keys(odds).forEach(market => {
        if (!merged[market] || odds[market] > merged[market]) {
          merged[market] = odds[market];
        }
      });
    });
    
    return merged;
  }

  private trackCall(apiName: string): void {
    const count = this.callHistory.get(apiName) || 0;
    this.callHistory.set(apiName, count + 1);
  }

  getCallStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.callHistory.forEach((count, api) => {
      stats[api] = count;
    });
    return stats;
  }

  resetStats(): void {
    this.callHistory.clear();
  }
}

export const smartRouter = new SmartAPIRouter();
