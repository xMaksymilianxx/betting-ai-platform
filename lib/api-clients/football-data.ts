import axios from 'axios';
import { getCache, setCache } from '../utils/cache';
import { CACHE_TTL } from '../utils/constants';

export class FootballDataAPI {
  private apiKey: string;
  private baseURL = 'https://api.football-data.org/v4';

  constructor() {
    this.apiKey = process.env.FOOTBALL_DATA_API_KEY || '';
  }

  async getMatches(date?: string): Promise<any[]> {
    try {
      const cacheKey = `football-data:matches:${date || 'today'}`;
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/matches`, {
        headers: { 'X-Auth-Token': this.apiKey },
        params: { date },
      });

      await setCache(cacheKey, response.data.matches, CACHE_TTL.FIXTURES);
      return response.data.matches;
    } catch (error) {
      console.error('Football-Data API Error:', error);
      return [];
    }
  }

  async getMatch(matchId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/matches/${matchId}`, {
        headers: { 'X-Auth-Token': this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error('Football-Data API Error:', error);
      return null;
    }
  }

  async getCompetitions(): Promise<any[]> {
    try {
      const cacheKey = 'football-data:competitions';
      const cached = await getCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/competitions`, {
        headers: { 'X-Auth-Token': this.apiKey },
      });

      await setCache(cacheKey, response.data.competitions, CACHE_TTL.FIXTURES);
      return response.data.competitions;
    } catch (error) {
      console.error('Football-Data API Error:', error);
      return [];
    }
  }

  async getStandings(competitionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/competitions/${competitionId}/standings`,
        { headers: { 'X-Auth-Token': this.apiKey } }
      );
      return response.data.standings;
    } catch (error) {
      console.error('Football-Data API Error:', error);
      return null;
    }
  }
}
