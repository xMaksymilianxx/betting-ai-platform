import { supabase } from './supabase';
import type { MatchHistory } from './supabase';

class MatchArchiver {
  async archiveMatch(match: any, finalResult: any): Promise<void> {
    try {
      const matchData: Omit<MatchHistory, 'id' | 'created_at'> = {
        match_id: match.id,
        home_team: match.home,
        away_team: match.away,
        league: match.league,
        country: match.country || '',
        match_date: match.time,
        final_score_home: finalResult.homeScore,
        final_score_away: finalResult.awayScore,
        final_result: this.determineResult(finalResult.homeScore, finalResult.awayScore),
        odds_home: match.odds?.home || 0,
        odds_draw: match.odds?.draw || 0,
        odds_away: match.odds?.away || 0,
        odds_over25: match.odds?.over25,
        odds_under25: match.odds?.under25,
        odds_btts_yes: match.odds?.bttsYes,
        odds_btts_no: match.odds?.bttsNo,
        total_goals: finalResult.homeScore + finalResult.awayScore,
        btts: finalResult.homeScore > 0 && finalResult.awayScore > 0,
        corners_home: match.statistics?.corners?.home,
        corners_away: match.statistics?.corners?.away,
        cards_home: match.statistics?.cards?.home,
        cards_away: match.statistics?.cards?.away,
        shots_home: match.statistics?.shots?.home,
        shots_away: match.statistics?.shots?.away,
        possession_home: match.statistics?.possession?.home,
        possession_away: match.statistics?.possession?.away,
        data_sources: match.dataSources || [],
        data_quality: match.dataQuality || 0
      };

      const { error } = await supabase
        .from('match_history')
        .upsert([matchData], { onConflict: 'match_id' });

      if (error) {
        console.error('❌ [ARCHIVER] Error saving match:', error);
      } else {
        console.log(`✅ [ARCHIVER] Match ${match.id} archived`);
      }
    } catch (error) {
      console.error('❌ [ARCHIVER] Exception:', error);
    }
  }

  async getHistoricalMatches(filters: {
    league?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<MatchHistory[]> {
    let query = supabase
      .from('match_history')
      .select('*')
      .order('match_date', { ascending: false });

    if (filters.league) {
      query = query.eq('league', filters.league);
    }

    if (filters.team) {
      query = query.or(`home_team.eq.${filters.team},away_team.eq.${filters.team}`);
    }

    if (filters.dateFrom) {
      query = query.gte('match_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('match_date', filters.dateTo);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [ARCHIVER] Error fetching history:', error);
      return [];
    }

    return data || [];
  }

  async getTeamStats(teamName: string, league: string): Promise<any> {
    const { data, error } = await supabase
      .from('team_statistics')
      .select('*')
      .eq('team_name', teamName)
      .eq('league', league)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async getH2H(team1: string, team2: string, limit: number = 10): Promise<MatchHistory[]> {
    const { data, error } = await supabase
      .from('match_history')
      .select('*')
      .or(`and(home_team.eq.${team1},away_team.eq.${team2}),and(home_team.eq.${team2},away_team.eq.${team1})`)
      .order('match_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [ARCHIVER] Error fetching H2H:', error);
      return [];
    }

    return data || [];
  }

  async getTeamForm(teamName: string, lastN: number = 5): Promise<string[]> {
    const { data, error } = await supabase
      .from('match_history')
      .select('final_result, home_team, away_team')
      .or(`home_team.eq.${teamName},away_team.eq.${teamName}`)
      .order('match_date', { ascending: false })
      .limit(lastN);

    if (error || !data) {
      return [];
    }

    return data.map(match => {
      if (match.home_team === teamName) {
        return match.final_result === '1' ? 'W' : match.final_result === 'X' ? 'D' : 'L';
      } else {
        return match.final_result === '2' ? 'W' : match.final_result === 'X' ? 'D' : 'L';
      }
    });
  }

  private determineResult(homeScore: number, awayScore: number): '1' | 'X' | '2' {
    if (homeScore > awayScore) return '1';
    if (homeScore < awayScore) return '2';
    return 'X';
  }

  async getDatabaseStats(): Promise<any> {
    const { count: totalMatches } = await supabase
      .from('match_history')
      .select('*', { count: 'exact', head: true });

    const { count: totalPredictions } = await supabase
      .from('prediction_history')
      .select('*', { count: 'exact', head: true });

    const { data: leagues } = await supabase
      .from('match_history')
      .select('league')
      .limit(1000);

    const uniqueLeagues = new Set(leagues?.map(l => l.league) || []).size;

    return {
      totalMatches: totalMatches || 0,
      totalPredictions: totalPredictions || 0,
      uniqueLeagues: uniqueLeagues
    };
  }
}

export const matchArchiver = new MatchArchiver();
