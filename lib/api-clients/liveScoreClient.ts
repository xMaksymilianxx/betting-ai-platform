import fetch from 'node-fetch';

export interface LiveScoreConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

export class LiveScoreClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor(config?: LiveScoreConfig) {
    this.apiKey = config?.apiKey || process.env.LIVESCORE_API_KEY || '';
    this.apiSecret = config?.apiSecret || process.env.LIVESCORE_API_SECRET || '';
    this.baseUrl = config?.baseUrl || 'https://live-score-api.com';
    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️ Brakuje klucza lub secret do Live-Score API'); // [attached_file:2]
    }
  }

  async fetchMatches(dateFrom: string, dateTo: string, status?: string): Promise<any[]> {
    const url = new URL(`${this.baseUrl}/fixtures`);
    url.searchParams.set('date_from', dateFrom);
    url.searchParams.set('date_to', dateTo);
    if (status) url.searchParams.set('status', status); // scheduled, live, finished [attached_file:2]
    const res = await fetch(url.toString(), {
      headers: {
        'x-api-key': this.apiKey,
        'x-api-secret': this.apiSecret
      }
    });
    if (!res.ok) throw new Error(`LiveScore ${res.status}`); // [attached_file:2]
    const json = await res.json();
    return json.data || [];
  }
}

export const liveScoreClient = new LiveScoreClient({
  apiKey: process.env.LIVESCORE_API_KEY,
  apiSecret: process.env.LIVESCORE_API_SECRET
}); // [attached_file:2]
