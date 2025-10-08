import { NextRequest } from 'next/server';
import { intelligentAPIManager } from '@/lib/api-clients/intelligent-api-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🎯 [API /matches] Request received');

  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') || 'football';
    const status = searchParams.get('status') || 'all';

    console.log(`📋 [FILTERS] Sport: ${sport}, Status: ${status}`);

    // Fetch enriched matches from intelligent API manager
    const enrichedMatches = await intelligentAPIManager.fetchEnrichedMatches();

    // Filter by status if needed
    let filteredMatches = enrichedMatches;
    if (status !== 'all') {
      filteredMatches = enrichedMatches.filter(m => m.status === status);
    }

    // Convert to legacy format for compatibility with existing frontend
    const matches = filteredMatches.map(match => ({
      id: match.id,
      home: match.home,
      away: match.away,
      league: match.league,
      country: match.country,
      sport: 'football',
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      minute: match.minute,
      score: match.score,
      time: match.time,
      odds: match.odds,
      statistics: match.statistics,
      form: match.form,
      h2h: match.h2h,
      injuries: match.injuries,
      lineups: match.lineups,
      // Additional metadata
      dataSources: match.dataSources,
      dataQuality: match.dataQuality
    }));

    console.log(`✅ [API /matches] Returning ${matches.length} matches`);

    return Response.json({
      success: true,
      count: matches.length,
      matches: matches,
      timestamp: new Date().toISOString(),
      apiStatus: intelligentAPIManager.getAPIStatus()
    });

  } catch (error) {
    console.error('❌ [API /matches] Error:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to fetch matches',
      details: error instanceof Error ? error.message : 'Unknown error',
      matches: [],
      count: 0
    }, { status: 500 });
  }
}
