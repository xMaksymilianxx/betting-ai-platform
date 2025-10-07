import axios from 'axios';
import { getCache, setCache } from '../utils/cache';
import { CACHE_TTL } from '../utils/constants';

export class LiveScoreAPI {
  private apiKey: string;
  private apiSecret: string;
  private baseURL = 'https://api.live-score-api.com/api/v1';

  constructor() {
    this.apiKey = process.env.LIVE_SCORE_API_KEY || '';
    this.apiSecret = process.env.LIVE_SCORE_API_SECRET || '';
  }

  async getLiveMatches(): Promise<any[]> {
    try {
      const cacheKey = 'live-score:live';
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/scores/live`, {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
        },
      });

      await setCache(cacheKey, response.data.data || [], CACHE_TTL.LIVE_MATCHES);
      return response.data.data || [];
    } catch (error) {
      console.error('LiveScore API Error:', error);
      return [];
    }
  }

  async getMatchDetails(matchId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/matches/${matchId}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('LiveScore API Error:', error);
      return null;
    }
  }

  async getUpcomingMatches(date?: string): Promise<any[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await axios.get(`${this.baseURL}/fixtures/date/${targetDate}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('LiveScore API Error:', error);
      return [];
    }
  }
}
