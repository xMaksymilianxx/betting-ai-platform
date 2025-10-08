import { NextRequest, NextResponse } from 'next/server';
import { matchArchiver } from '@/lib/db/match-archiver';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const team1 = searchParams.get('team1');
    const team2 = searchParams.get('team2');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!team1 || !team2) {
      return NextResponse.json({
        success: false,
        error: 'Missing team1 or team2 parameter'
      }, { status: 400 });
    }

    const h2hMatches = await matchArchiver.getH2H(team1, team2, limit);
    
    const team1Form = await matchArchiver.getTeamForm(team1, 5);
    const team2Form = await matchArchiver.getTeamForm(team2, 5);

    const team1Stats = await matchArchiver.getTeamStats(team1, searchParams.get('league') || '');
    const team2Stats = await matchArchiver.getTeamStats(team2, searchParams.get('league') || '');

    const stats = {
      totalMatches: h2hMatches.length,
      team1Wins: h2hMatches.filter(m => 
        (m.home_team === team1 && m.final_result === '1') ||
        (m.away_team === team1 && m.final_result === '2')
      ).length,
      team2Wins: h2hMatches.filter(m => 
        (m.home_team === team2 && m.final_result === '1') ||
        (m.away_team === team2 && m.final_result === '2')
      ).length,
      draws: h2hMatches.filter(m => m.final_result === 'X').length,
      avgGoalsPerMatch: h2hMatches.reduce((sum, m) => sum + m.total_goals, 0) / (h2hMatches.length || 1),
      bttsPercentage: (h2hMatches.filter(m => m.btts).length / (h2hMatches.length || 1)) * 100
    };

    return NextResponse.json({
      success: true,
      team1,
      team2,
      h2hMatches,
      stats,
      form: {
        team1: team1Form,
        team2: team2Form
      },
      teamStats: {
        team1: team1Stats,
        team2: team2Stats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] H2H error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
