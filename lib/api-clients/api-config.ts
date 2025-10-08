import { APIConfig } from './types';

export const API_CONFIGS: Record<string, APIConfig> = {
  'api-football': {
    enabled: process.env.ENABLE_API_FOOTBALL === 'true',
    priority: 1,
    key: process.env.API_FOOTBALL_KEY,
    rateLimit: 100,
    features: {
      liveMatches: true,
      scheduledMatches: true,
      statistics: true,
      odds: true,
      form: true,
      h2h: true,
      lineups: true
    }
  },
  'livescore6': {
    enabled: process.env.ENABLE_LIVESCORE6 !== 'false', // Default: true
    priority: 2,
    key: process.env.RAPIDAPI_KEY,
    rateLimit: 100,
    features: {
      liveMatches: true,
      scheduledMatches: false,
      statistics: false,
      odds: false,
      form: false,
      h2h: false,
      lineups: false
    }
  },
  'the-odds-api': {
    enabled: process.env.ENABLE_ODDS_API === 'true',
    priority: 3,
    key: process.env.ODDS_API_KEY,
    rateLimit: 500,
    features: {
      liveMatches: false,
      scheduledMatches: true,
      statistics: false,
      odds: true,
      form: false,
      h2h: false,
      lineups: false
    }
  },
  'football-data': {
    enabled: process.env.ENABLE_FOOTBALL_DATA === 'true',
    priority: 4,
    key: process.env.FOOTBALL_DATA_KEY,
    rateLimit: 10,
    features: {
      liveMatches: true,
      scheduledMatches: true,
      statistics: true,
      odds: false,
      form: true,
      h2h: true,
      lineups: false
    }
  }
};

export function getEnabledAPIs(): string[] {
  return Object.entries(API_CONFIGS)
    .filter(([_, config]) => config.enabled && config.key)
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(([name]) => name);
}

export function getAPIConfig(name: string): APIConfig | undefined {
  return API_CONFIGS[name];
}
