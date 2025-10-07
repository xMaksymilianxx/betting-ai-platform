import axios from 'axios';
import { getCache, setCache } from '../utils/cache';
import { CACHE_TTL } from '../utils/constants';

export class APIFootballClient {
  private apiKey: string;
  private baseURL = 'https://v3.football.api-sports.io';

  constructor() {
    this.apiKey = process.env.API_FOOTBALL_KEY || '';
  }

  async getFixtures(date?: string): Promise<any[]> {
    try {
      const cacheKey = `api-football:fixtures:${date || 'today'}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await axios.get(`${this.baseURL}/fixtures`, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
        params: { date: targetDate },
      });

      await setCache(cacheKey, response.data.response || [], CACHE_TTL.FIXTURES);
      return response.data.response || [];
    } catch (error) {
      console.error('API-Football Error:', error);
      return [];
    }
  }

  async getPredictions(fixtureId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/predictions`, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
        params: { fixture: fixtureId },
      });
      return response.data.response?.[0];
    } catch (error) {
      console.error('API-Football Error:', error);
      return null;
    }
  }

  async getStatistics(fixtureId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/fixtures/statistics`, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
        params: { fixture: fixtureId },
      });
      return response.data.response;
    } catch (error) {
      console.error('API-Football Error:', error);
      return null;
    }
  }

  async getOdds(fixtureId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/odds`, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
        params: { fixture: fixtureId },
      });
      return response.data.response?.[0];
    } catch (error) {
      console.error('API-Football Error:', error);
      return null;
    }
  }

  async getLiveMatches(): Promise<any[]> {
    try {
      const cacheKey = 'api-football:live';
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/fixtures`, {
        headers: {
          'x-apisports-key': this.apiKey,
        },
        params: { live: 'all' },
      });

      await setCache(cacheKey, response.data.response || [], CACHE_TTL.LIVE_MATCHES);
      return response.data.response || [];
    } catch (error) {
      console.error('API-Football Error:', error);
      return [];
    }
  }
}
