import { Match } from '../types';

export class OddsAPIClient {
  private readonly apiKey = process.env.ODDS_API_KEY || '';
  private readonly baseUrl = 'https://api.the-odds-api.com/v4';

  async fetchMatches(): Promise<Match[]> {
    // The Odds API is primarily for odds, not live matches
    return [];
  }

  async fetchOdds(matchId: string): Promise<any> {
    if (!this.apiKey) return null;

    try {
      // This would need match mapping logic
      const response = await fetch(
        `${this.baseUrl}/sports/soccer_epl/odds/?apiKey=${this.apiKey}&regions=uk&markets=h2h,totals,btts`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        return this.parseOdds(data);
      }
    } catch (error) {
      console.error('Odds API error:', error);
    }
    return null;
  }

  async fetchStatistics(matchId: string): Promise<any> {
    // Odds API doesn't provide statistics
    return null;
  }

  private parseOdds(data: any): any {
    if (!data || data.length === 0) return null;

    const match = data[0];
    const bookmaker = match.bookmakers?.[0];
    if (!bookmaker) return null;

    const odds: any = {};

    bookmaker.markets?.forEach((market: any) => {
      if (market.key === 'h2h') {
        odds.home = market.outcomes.find((o: any) => o.name === match.home_team)?.price;
        odds.draw = market.outcomes.find((o: any) => o.name === 'Draw')?.price;
        odds.away = market.outcomes.find((o: any) => o.name === match.away_team)?.price;
      }
      if (market.key === 'totals' && market.outcomes[0].point === 2.5) {
        odds.over25 = market.outcomes.find((o: any) => o.name === 'Over')?.price;
        odds.under25 = market.outcomes.find((o: any) => o.name === 'Under')?.price;
      }
    });

    return odds;
  }
}
