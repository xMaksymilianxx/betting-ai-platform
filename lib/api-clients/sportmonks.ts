import axios from 'axios';
import { getCache, setCache } from '../utils/cache';
import { CACHE_TTL } from '../utils/constants';

export class SportmonksAPI {
  private apiKey: string;
  private baseURL = 'https://api.sportmonks.com/v3/football';

  constructor() {
    this.apiKey = process.env.SPORTMONKS_API_KEY || '';
  }

  private async request(endpoint: string, params: any = {}): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          ...params,
          api_token: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Sportmonks API Error:', error);
      return null;
    }
  }

  async getFixtures(date?: string): Promise<any[]> {
    const cacheKey = `sportmonks:fixtures:${date || 'today'}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const fixtureDate = date || new Date().toISOString().split('T')[0];
    const data = await this.request(`/fixtures/date/${fixtureDate}`);
    
    if (data?.data) {
      await setCache(cacheKey, data.data, CACHE_TTL.FIXTURES);
      return data.data;
    }
    return [];
  }

  async getPredictions(fixtureId: string): Promise<any> {
    const data = await this.request(`/predictions/probabilities/fixture/${fixtureId}`);
    return data?.data || null;
  }

  async getValueBets(): Promise<any[]> {
    const data = await this.request('/value-bets');
    return data?.data || [];
  }

  async getExpectedGoals(fixtureId: string): Promise<any> {
    const data = await this.request(`/expected-goals/fixture/${fixtureId}`);
    return data?.data || null;
  }

  async getLiveScores(): Promise<any[]> {
    const cacheKey = 'sportmonks:live';
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const data = await this.request('/livescores/inplay');
    if (data?.data) {
      await setCache(cacheKey, data.data, CACHE_TTL.LIVE_MATCHES);
      return data.data;
    }
    return [];
  }
}
